import { query } from '../config/db.js';

// Typing throttle: Map<`${convId}:${userId}`, lastEmitTimestamp>
const typingThrottle = new Map();
const THROTTLE_MS = 2000;

/**
 * Register all chat-related socket event handlers for a connected socket
 */
export function registerChatHandlers(io, socket) {
  const userId = socket.userId;

  // ── Join a conversation room (when user opens a chat) ─────────
  socket.on('conversation:join', async (conversationId) => {
    if (!conversationId || typeof conversationId !== 'string') return;

    // Verify user is a participant before allowing room join
    try {
      const result = await query(
        'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
        [conversationId, userId]
      );
      if (result.rows.length > 0) {
        socket.join(`conv:${conversationId}`);
      }
    } catch (err) {
      console.error('[Socket] conversation:join error:', err.message);
    }
  });

  // ── Leave a conversation room (when user closes a chat) ───────
  socket.on('conversation:leave', (conversationId) => {
    if (!conversationId || typeof conversationId !== 'string') return;
    socket.leave(`conv:${conversationId}`);
  });

  // ── Typing start (throttled server-side) ──────────────────────
  socket.on('typing:start', (conversationId) => {
    if (!conversationId || typeof conversationId !== 'string') return;

    const key = `${conversationId}:${userId}`;
    const now = Date.now();
    const last = typingThrottle.get(key) || 0;

    if (now - last < THROTTLE_MS) return; // Throttled — skip
    typingThrottle.set(key, now);

    // Broadcast to other participants in this conversation
    socket.to(`conv:${conversationId}`).emit('typing:start', {
      userId,
      conversationId,
    });
  });

  // ── Typing stop ───────────────────────────────────────────────
  socket.on('typing:stop', (conversationId) => {
    if (!conversationId || typeof conversationId !== 'string') return;

    // Clear throttle entry
    typingThrottle.delete(`${conversationId}:${userId}`);

    socket.to(`conv:${conversationId}`).emit('typing:stop', {
      userId,
      conversationId,
    });
  });

  // ── Mark messages as read ─────────────────────────────────────
  socket.on('message:read', async (conversationId) => {
    if (!conversationId || typeof conversationId !== 'string') return;

    try {
      const now = new Date().toISOString();

      // Update last_read_at and reset unread count
      await query(
        `UPDATE conversation_participants
         SET last_read_at = $1, unread_count = 0
         WHERE conversation_id = $2 AND user_id = $3`,
        [now, conversationId, userId]
      );

      // Notify other participants that messages have been read
      socket.to(`conv:${conversationId}`).emit('message:read', {
        userId,
        conversationId,
        readAt: now,
      });
    } catch (err) {
      console.error('[Socket] message:read error:', err.message);
    }
  });

  // ══════════════════════════════════════════════════════════════
  // Community Room Events
  // ══════════════════════════════════════════════════════════════

  // ── Join a room (when user opens a community room) ────────────
  socket.on('room:join', async (roomId) => {
    if (!roomId || typeof roomId !== 'string') return;

    try {
      const result = await query(
        'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
        [roomId, userId]
      );
      if (result.rows.length > 0) {
        socket.join(`conv:${roomId}`);
      }
    } catch (err) {
      console.error('[Socket] room:join error:', err.message);
    }
  });

  // ── Leave a room ──────────────────────────────────────────────
  socket.on('room:leave', (roomId) => {
    if (!roomId || typeof roomId !== 'string') return;
    socket.leave(`conv:${roomId}`);
  });

  // ── Room mark as read ─────────────────────────────────────────
  socket.on('room:read', async (roomId) => {
    if (!roomId || typeof roomId !== 'string') return;

    try {
      await query(
        `UPDATE conversation_participants
         SET last_read_at = NOW(), unread_count = 0
         WHERE conversation_id = $1 AND user_id = $2`,
        [roomId, userId]
      );
    } catch (err) {
      console.error('[Socket] room:read error:', err.message);
    }
  });
}
