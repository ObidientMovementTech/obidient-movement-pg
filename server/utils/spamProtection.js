import { query } from '../config/db.js';

/**
 * Multi-layer spam protection engine for community rooms.
 *
 * Layers:
 *  1. Mute check        — reject if user is muted
 *  2. Ban check          — reject if user is banned
 *  3. Cooldown check     — reject if in active cooldown
 *  4. Content validation — length 1–1000
 *  5. Duplicate detection— same content within 60s
 *  6. Rate window        — max 5 messages per 30s
 *  7. Flood guard        — 3 messages in 3s → 1-min cooldown
 *  8. Escalating cooldown applied on violations
 */

// Cooldown durations per level (milliseconds)
const COOLDOWN_LEVELS = [
  0,             // Level 0: warning only
  30 * 1000,     // Level 1: 30 seconds
  2 * 60 * 1000, // Level 2: 2 minutes
  10 * 60 * 1000,// Level 3: 10 minutes
  60 * 60 * 1000,// Level 4+: 1 hour
];

const RATE_WINDOW_MS = 30_000; // 30 seconds
const RATE_WINDOW_MAX = 5;     // max messages in window
const FLOOD_WINDOW_MS = 3_000; // 3 seconds
const FLOOD_MAX = 3;           // messages triggering flood guard
const FLOOD_COOLDOWN_MS = 60_000; // 1-minute flood cooldown
const DUPLICATE_WINDOW_MS = 60_000; // 60 seconds
const MAX_ROOM_MESSAGE_LENGTH = 1000;
const COOLDOWN_RESET_MS = 60 * 60 * 1000; // 1 hour clean → reset level

function getCooldownDuration(level) {
  if (level >= COOLDOWN_LEVELS.length) return COOLDOWN_LEVELS[COOLDOWN_LEVELS.length - 1];
  return COOLDOWN_LEVELS[level];
}

/**
 * Run all spam checks. Returns { allowed: true } or { allowed: false, reason, retryAfter? }
 */
export async function checkSpam(userId, conversationId, content) {
  // ── Layer 1: Mute check ──────────────────────────────────────
  const muteResult = await query(
    `SELECT is_muted, muted_until
     FROM conversation_participants
     WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]
  );

  if (muteResult.rows.length === 0) {
    return { allowed: false, reason: 'Not a participant in this room' };
  }

  const participant = muteResult.rows[0];
  if (participant.is_muted) {
    if (participant.muted_until && new Date(participant.muted_until) > new Date()) {
      const remaining = Math.ceil((new Date(participant.muted_until) - Date.now()) / 1000);
      return {
        allowed: false,
        reason: `You are muted. Try again in ${formatDuration(remaining)}.`,
        retryAfter: remaining,
      };
    }
    // Mute expired — auto-unmute
    await query(
      `UPDATE conversation_participants
       SET is_muted = false, muted_until = NULL, muted_by = NULL
       WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, userId]
    );
  }

  // ── Layer 2: Ban check ───────────────────────────────────────
  const banResult = await query(
    'SELECT 1 FROM room_bans WHERE conversation_id = $1 AND user_id = $2',
    [conversationId, userId]
  );
  if (banResult.rows.length > 0) {
    return { allowed: false, reason: 'You have been banned from this room.' };
  }

  // ── Layer 3: Active cooldown check ───────────────────────────
  const spamResult = await query(
    `SELECT cooldown_until, cooldown_level, window_start, message_count,
            last_message_at, last_violation_at
     FROM room_spam_tracking
     WHERE user_id = $1 AND conversation_id = $2`,
    [userId, conversationId]
  );

  let spamRow = spamResult.rows[0] || null;

  if (spamRow?.cooldown_until && new Date(spamRow.cooldown_until) > new Date()) {
    const remaining = Math.ceil((new Date(spamRow.cooldown_until) - Date.now()) / 1000);
    return {
      allowed: false,
      reason: `Slow down. Try again in ${formatDuration(remaining)}.`,
      retryAfter: remaining,
    };
  }

  // ── Layer 4: Content validation ──────────────────────────────
  if (!content || typeof content !== 'string' || !content.trim()) {
    return { allowed: false, reason: 'Message content is required.' };
  }
  if (content.length > MAX_ROOM_MESSAGE_LENGTH) {
    return { allowed: false, reason: `Message too long (max ${MAX_ROOM_MESSAGE_LENGTH} characters).` };
  }

  // ── Layer 5: Duplicate detection ─────────────────────────────
  const dupeResult = await query(
    `SELECT content FROM chat_messages
     WHERE conversation_id = $1 AND sender_id = $2
       AND created_at > NOW() - INTERVAL '60 seconds'
       AND is_deleted = false
     ORDER BY created_at DESC LIMIT 5`,
    [conversationId, userId]
  );

  const trimmed = content.trim();
  for (const row of dupeResult.rows) {
    if (row.content === trimmed) {
      return { allowed: false, reason: 'Duplicate message. Please write something different.' };
    }
  }

  // ── Layer 6: Rate window (5 msgs / 30s) ──────────────────────
  const now = Date.now();

  if (!spamRow) {
    // First message — create tracking row
    await query(
      `INSERT INTO room_spam_tracking (user_id, conversation_id, window_start, message_count, last_message_at)
       VALUES ($1, $2, NOW(), 0, NOW())
       ON CONFLICT (user_id, conversation_id) DO NOTHING`,
      [userId, conversationId]
    );
    spamRow = { window_start: new Date(), message_count: 0, cooldown_level: 0, last_violation_at: null, last_message_at: null };
  }

  const windowStart = new Date(spamRow.window_start).getTime();
  let msgCount = spamRow.message_count || 0;
  let cooldownLevel = spamRow.cooldown_level || 0;

  // Reset cooldown level if 1 hour has passed since last violation
  if (spamRow.last_violation_at) {
    const sinceViolation = now - new Date(spamRow.last_violation_at).getTime();
    if (sinceViolation > COOLDOWN_RESET_MS) {
      cooldownLevel = 0;
    }
  }

  // Reset window if it's expired
  if (now - windowStart > RATE_WINDOW_MS) {
    msgCount = 0;
    await query(
      `UPDATE room_spam_tracking
       SET window_start = NOW(), message_count = 0
       WHERE user_id = $1 AND conversation_id = $2`,
      [userId, conversationId]
    );
  }

  if (msgCount >= RATE_WINDOW_MAX) {
    // Rate limit hit — escalate cooldown
    cooldownLevel = Math.min(cooldownLevel + 1, COOLDOWN_LEVELS.length - 1);
    const cooldownMs = getCooldownDuration(cooldownLevel);
    const cooldownUntil = cooldownMs > 0 ? new Date(now + cooldownMs) : null;

    await query(
      `UPDATE room_spam_tracking
       SET cooldown_level = $1, cooldown_until = $2, last_violation_at = NOW()
       WHERE user_id = $3 AND conversation_id = $4`,
      [cooldownLevel, cooldownUntil, userId, conversationId]
    );

    if (cooldownMs > 0) {
      const remaining = Math.ceil(cooldownMs / 1000);
      return {
        allowed: false,
        reason: `Rate limit reached. Try again in ${formatDuration(remaining)}.`,
        retryAfter: remaining,
        notifyAdmins: cooldownLevel >= 4,
      };
    }
  }

  // ── Layer 7: Flood guard (3 msgs in 3s) ──────────────────────
  if (spamRow.last_message_at) {
    const floodResult = await query(
      `SELECT COUNT(*) AS cnt FROM chat_messages
       WHERE conversation_id = $1 AND sender_id = $2
         AND created_at > NOW() - INTERVAL '3 seconds'`,
      [conversationId, userId]
    );

    if (parseInt(floodResult.rows[0].cnt) >= FLOOD_MAX) {
      const floodUntil = new Date(now + FLOOD_COOLDOWN_MS);
      cooldownLevel = Math.min(cooldownLevel + 1, COOLDOWN_LEVELS.length - 1);

      await query(
        `UPDATE room_spam_tracking
         SET cooldown_until = $1, cooldown_level = $2, last_violation_at = NOW()
         WHERE user_id = $3 AND conversation_id = $4`,
        [floodUntil, cooldownLevel, userId, conversationId]
      );

      return {
        allowed: false,
        reason: `Too many messages too quickly. Try again in 1 minute.`,
        retryAfter: 60,
      };
    }
  }

  // ── All checks passed — update tracking ──────────────────────
  await query(
    `UPDATE room_spam_tracking
     SET message_count = message_count + 1, last_message_at = NOW(), cooldown_level = $1
     WHERE user_id = $2 AND conversation_id = $3`,
    [cooldownLevel, userId, conversationId]
  );

  return { allowed: true };
}

/**
 * Format seconds into human-readable duration
 */
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}m`;
  return `${Math.ceil(seconds / 3600)}h`;
}
