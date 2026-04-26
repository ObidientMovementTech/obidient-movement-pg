import { query, getClient } from '../config/db.js';
import { getIO, isUserOnline } from '../config/socket.js';
import { pushDirectMessage } from '../utils/chatPushNotification.js';
import { checkBlockStatus } from './block.controller.js';

// ── Coordinator designations with hierarchy levels ──────────────
const COORDINATOR_LEVELS = {
  'National Coordinator': 4,
  'State Coordinator': 3,
  'LGA Coordinator': 2,
  'Ward Coordinator': 1,
  'Polling Unit Agent': 0,
  'Community Member': -1,
};

function getCoordinatorLevel(designation) {
  return COORDINATOR_LEVELS[designation] ?? -1;
}

// ══════════════════════════════════════════════════════════════════
// GET /api/conversations — List user's conversations
// ══════════════════════════════════════════════════════════════════
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 30));
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT
        c.id,
        c.type,
        c.last_message_at,
        c.last_message_preview,
        c.created_at,
        cp.unread_count,
        cp.last_read_at,
        -- Other participant info (for direct chats)
        other_user.id          AS participant_id,
        other_user.name        AS participant_name,
        other_user.email       AS participant_email,
        other_user."profileImage" AS participant_image,
        other_user.designation AS participant_designation,
        other_user."assignedState" AS participant_assigned_state,
        other_user."assignedLGA"   AS participant_assigned_lga,
        other_user."assignedWard"  AS participant_assigned_ward,
        other_user."votingState"  AS participant_voting_state,
        other_user."votingLGA"    AS participant_voting_lga,
        other_user."votingWard"   AS participant_voting_ward,
        other_user."votingPU"     AS participant_voting_pu
      FROM conversation_participants cp
      JOIN conversations c ON c.id = cp.conversation_id
      -- Get the OTHER participant for direct chats
      LEFT JOIN conversation_participants cp2
        ON cp2.conversation_id = c.id AND cp2.user_id != $1
      LEFT JOIN users other_user ON other_user.id = cp2.user_id
      WHERE cp.user_id = $1 AND c.type != 'room'
        AND c.last_message_at IS NOT NULL
      ORDER BY c.last_message_at DESC NULLS LAST
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await query(
      `SELECT COUNT(*) FROM conversation_participants cp
       JOIN conversations c ON c.id = cp.conversation_id
       WHERE cp.user_id = $1 AND c.type != 'room'
         AND c.last_message_at IS NOT NULL`,
      [userId]
    );

    res.json({
      success: true,
      conversations: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};

// ══════════════════════════════════════════════════════════════════
// POST /api/conversations — Get or create a direct conversation
// ══════════════════════════════════════════════════════════════════
export const getOrCreateConversation = async (req, res) => {
  const client = await getClient();

  try {
    const userId = req.user.id;
    const { participantId } = req.body;

    // ── Validation ─────────────────────────────────
    if (!participantId) {
      return res.status(400).json({ message: 'participantId is required' });
    }

    // UUID format validation
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(participantId)) {
      return res.status(400).json({ message: 'Invalid participant ID format' });
    }

    // Self-exclusion
    if (participantId === userId) {
      return res.status(400).json({ message: 'Cannot create a conversation with yourself' });
    }

    // Verify participant exists and is verified
    const participantResult = await query(
      `SELECT id, name, email, "profileImage", designation,
              "votingState", "votingLGA", "votingWard",
              "assignedState", "assignedLGA", "assignedWard"
       FROM users WHERE id = $1 AND "emailVerified" = true`,
      [participantId]
    );

    if (participantResult.rows.length === 0) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const participant = participantResult.rows[0];
    const sender = req.user;
    const senderLevel = getCoordinatorLevel(sender.designation);

    // ── Block check (both directions) ───────────────
    const blockStatus = await checkBlockStatus(userId, participantId);
    if (blockStatus.isBlocked) {
      // Generic error — don't reveal block status to either party
      return res.status(403).json({ message: 'Cannot start conversation with this user.' });
    }

    // ── Privacy check: participant's chat settings ──
    const settingsResult = await query(
      `SELECT who_can_dm, allow_message_requests
       FROM user_chat_settings WHERE user_id = $1`,
      [participantId]
    );
    // Default to 'everyone' + true if no row exists
    const participantSettings = settingsResult.rows[0] || {
      who_can_dm: 'everyone',
      allow_message_requests: true,
    };

    if (participantSettings.who_can_dm === 'nobody') {
      return res.status(403).json({ message: 'This user is not accepting messages.' });
    }

    if (participantSettings.who_can_dm === 'coordinators_only' && senderLevel < 0) {
      return res.status(403).json({ message: 'This user only accepts messages from coordinators.' });
    }

    // ── Check for existing conversation ─────────────
    const existingResult = await query(
      `SELECT cp1.conversation_id
       FROM conversation_participants cp1
       JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
       JOIN conversations c ON c.id = cp1.conversation_id
       WHERE cp1.user_id = $1 AND cp2.user_id = $2 AND c.type = 'direct'
       LIMIT 1`,
      [userId, participantId]
    );

    if (existingResult.rows.length > 0) {
      const convId = existingResult.rows[0].conversation_id;
      return res.json({
        success: true,
        conversationId: convId,
        created: false,
      });
    }

    // ── Create new conversation ─────────────────────
    await client.query('BEGIN');

    const convResult = await client.query(
      `INSERT INTO conversations (type) VALUES ('direct') RETURNING id`
    );
    const conversationId = convResult.rows[0].id;

    // Add both participants
    await client.query(
      `INSERT INTO conversation_participants (conversation_id, user_id)
       VALUES ($1, $2), ($1, $3)`,
      [conversationId, userId, participantId]
    );

    await client.query('COMMIT');

    // Join both users to the socket room
    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('conversation:created', { conversationId });
      io.to(`user:${participantId}`).emit('conversation:created', { conversationId });
    } catch (_) { /* socket may not be initialized in tests */ }

    res.status(201).json({
      success: true,
      conversationId,
      created: true,
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('getOrCreateConversation error:', error);
    res.status(500).json({ message: 'Failed to create conversation' });
  } finally {
    client.release();
  }
};

// ══════════════════════════════════════════════════════════════════
// GET /api/conversations/:id/messages — Get messages (cursor-based)
// ══════════════════════════════════════════════════════════════════
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const before = req.query.before; // ISO timestamp cursor

    // Verify user is a participant
    const participantCheck = await query(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not a participant in this conversation' });
    }

    // Fetch messages with cursor pagination
    let messagesQuery;
    let params;

    const baseSelect = `
        SELECT m.id, m.message_type, m.created_at, m.edited_at,
               m.sender_id, m.reply_to_id, m.deleted_at,
               CASE WHEN m.deleted_at IS NOT NULL THEN 'This message was deleted' ELSE m.content END AS content,
               u.name AS sender_name,
               u."profileImage" AS sender_image,
               -- Reply-to preview
               reply.content AS reply_to_content,
               reply_user.name AS reply_to_sender_name,
               reply.sender_id AS reply_to_sender_id,
               -- Reactions aggregate
               COALESCE(
                 (SELECT json_agg(r_agg ORDER BY r_agg.emoji)
                  FROM (
                    SELECT r.emoji,
                           COUNT(*)::int AS count,
                           BOOL_OR(r.user_id = $USERIDPARAM) AS reacted
                    FROM message_reactions r
                    WHERE r.message_id = m.id
                    GROUP BY r.emoji
                  ) r_agg
                 ), '[]'::json
               ) AS reactions
        FROM chat_messages m
        JOIN users u ON u.id = m.sender_id
        LEFT JOIN chat_messages reply ON reply.id = m.reply_to_id
        LEFT JOIN users reply_user ON reply_user.id = reply.sender_id
        WHERE m.conversation_id = $CONVIDPARAM
          AND NOT (m.deleted_for @> $DELETEDFILTERPARAM::jsonb)
    `;

    if (before) {
      // $1=convId, $2=userId(for deleted_for), $3=userId(for reactions), $4=before, $5=limit
      messagesQuery = baseSelect
        .replace('$CONVIDPARAM', '$1')
        .replace('$DELETEDFILTERPARAM', '$2')
        .replace('$USERIDPARAM', '$3')
        + ` AND m.created_at < $4 ORDER BY m.created_at DESC LIMIT $5`;
      params = [conversationId, JSON.stringify([userId]), userId, before, limit];
    } else {
      // $1=convId, $2=userId(for deleted_for), $3=userId(for reactions), $4=limit
      messagesQuery = baseSelect
        .replace('$CONVIDPARAM', '$1')
        .replace('$DELETEDFILTERPARAM', '$2')
        .replace('$USERIDPARAM', '$3')
        + ` ORDER BY m.created_at DESC LIMIT $4`;
      params = [conversationId, JSON.stringify([userId]), userId, limit];
    }

    const result = await query(messagesQuery, params);

    // Mark as read: update last_read_at + reset unread
    await query(
      `UPDATE conversation_participants
       SET last_read_at = NOW(), unread_count = 0
       WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, userId]
    );

    // Emit read receipt via socket
    try {
      const io = getIO();
      io.to(`conv:${conversationId}`).emit('message:read', {
        userId,
        conversationId,
        readAt: new Date().toISOString(),
      });
    } catch (_) {}

    res.json({
      success: true,
      messages: result.rows.reverse(), // Return in chronological order
      hasMore: result.rows.length === limit,
    });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// ══════════════════════════════════════════════════════════════════
// POST /api/conversations/:id/messages — Send a message
// ══════════════════════════════════════════════════════════════════
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const { content, replyToId } = req.body;

    // ── Validation ─────────────────────────────────
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: 'Message too long (max 2000 characters)' });
    }

    // Verify user is a participant
    const participantCheck = await query(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not a participant in this conversation' });
    }

    // ── Rate limit: 60-second cooldown ────────────
    const lastMsgResult = await query(
      `SELECT created_at FROM chat_messages
       WHERE conversation_id = $1 AND sender_id = $2
       ORDER BY created_at DESC LIMIT 1`,
      [conversationId, userId]
    );

    if (lastMsgResult.rows.length > 0) {
      const elapsed = Date.now() - new Date(lastMsgResult.rows[0].created_at).getTime();
      if (elapsed < 3000) { // 3-second cooldown per conversation to prevent spam
        return res.status(429).json({ message: 'Please wait before sending another message' });
      }
    }

    // ── Insert message ─────────────────────────────
    const trimmedContent = content.trim();
    const preview = trimmedContent.length > 100 ? trimmedContent.slice(0, 100) + '...' : trimmedContent;

    const msgResult = await query(
      `INSERT INTO chat_messages (conversation_id, sender_id, content, reply_to_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, message_type, created_at, sender_id, reply_to_id`,
      [conversationId, userId, trimmedContent, replyToId || null]
    );

    const message = msgResult.rows[0];

    // Fetch reply-to preview if replying
    let replyTo = null;
    if (message.reply_to_id) {
      const replyResult = await query(
        `SELECT m.id, m.content, m.sender_id, u.name AS sender_name
         FROM chat_messages m JOIN users u ON u.id = m.sender_id
         WHERE m.id = $1`,
        [message.reply_to_id]
      );
      if (replyResult.rows.length > 0) {
        const r = replyResult.rows[0];
        replyTo = {
          id: r.id,
          content: r.content.length > 100 ? r.content.slice(0, 100) + '...' : r.content,
          sender_name: r.sender_name,
          sender_id: r.sender_id,
        };
      }
    }

    // Update conversation metadata
    await query(
      `UPDATE conversations
       SET last_message_at = $1, last_message_preview = $2
       WHERE id = $3`,
      [message.created_at, preview, conversationId]
    );

    // ── Block-aware delivery for direct conversations ──
    // Get other participants and check block relationships
    const otherParticipants = await query(
      `SELECT user_id FROM conversation_participants
       WHERE conversation_id = $1 AND user_id != $2`,
      [conversationId, userId]
    );

    // For each other participant, check if there's a block between them and sender
    const deliverTo = []; // user IDs to deliver notifications to
    for (const row of otherParticipants.rows) {
      const blockStatus = await checkBlockStatus(userId, row.user_id);
      if (!blockStatus.isBlocked) {
        deliverTo.push(row.user_id);
      }
    }

    // Increment unread count only for non-blocked participants
    if (deliverTo.length > 0) {
      await query(
        `UPDATE conversation_participants
         SET unread_count = unread_count + 1
         WHERE conversation_id = $1 AND user_id = ANY($2::uuid[])`,
        [conversationId, deliverTo]
      );
    }

    // Reset sender's own unread + update last_read_at
    await query(
      `UPDATE conversation_participants
       SET last_read_at = $1, unread_count = 0
       WHERE conversation_id = $2 AND user_id = $3`,
      [message.created_at, conversationId, userId]
    );

    // ── Real-time delivery via Socket.IO ────────────
    const messagePayload = {
      id: message.id,
      conversation_id: conversationId,
      sender_id: userId,
      sender_name: req.user.name,
      sender_image: req.user.profileImage || null,
      content: message.content,
      message_type: message.message_type,
      created_at: message.created_at,
      reply_to_id: message.reply_to_id || null,
      reply_to_content: replyTo?.content || null,
      reply_to_sender_name: replyTo?.sender_name || null,
      reply_to_sender_id: replyTo?.sender_id || null,
      reactions: [],
      deleted_at: null,
    };

    try {
      const io = getIO();

      // Send socket events only to non-blocked participants
      for (const recipientId of deliverTo) {
        // Fetch this recipient's updated unread count
        const unreadRes = await query(
          `SELECT unread_count FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2`,
          [conversationId, recipientId]
        );
        const unreadCount = unreadRes.rows[0]?.unread_count ?? 1;

        io.to(`user:${recipientId}`).emit('message:new', {
          ...messagePayload,
          // Also push to the conversation room for this user
        });
        io.to(`user:${recipientId}`).emit('conversation:updated', {
          conversationId,
          lastMessageAt: message.created_at,
          lastMessagePreview: preview,
          senderName: req.user.name,
          unreadCount,
        });
      }

      // Always emit to sender's own sockets (for multi-device sync)
      io.to(`user:${userId}`).emit('message:new', messagePayload);
    } catch (_) {}

    // FCM push only for non-blocked offline recipients
    if (deliverTo.length > 0) {
      pushDirectMessage(conversationId, userId, req.user.name, preview);
    }

    res.status(201).json({
      success: true,
      message: messagePayload,
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// ══════════════════════════════════════════════════════════════════
// POST /api/conversations/:convId/messages/:msgId/reactions — Toggle reaction
// ══════════════════════════════════════════════════════════════════
export const toggleReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { convId, msgId } = req.params;
    const { emoji } = req.body;

    if (!emoji || typeof emoji !== 'string' || emoji.length > 8) {
      return res.status(400).json({ message: 'Valid emoji is required' });
    }

    // Verify user is a participant
    const participantCheck = await query(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [convId, userId]
    );
    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    // Verify message exists in this conversation and is not deleted
    const msgCheck = await query(
      'SELECT id, content FROM chat_messages WHERE id = $1 AND conversation_id = $2 AND deleted_at IS NULL',
      [msgId, convId]
    );
    if (msgCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const messageContent = msgCheck.rows[0].content;

    // Toggle: try to delete first, if nothing deleted then insert
    const deleteResult = await query(
      'DELETE FROM message_reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3 RETURNING id',
      [msgId, userId, emoji]
    );

    if (deleteResult.rows.length === 0) {
      await query(
        'INSERT INTO message_reactions (message_id, user_id, emoji) VALUES ($1, $2, $3)',
        [msgId, userId, emoji]
      );

      // Update conversation preview: "User reacted 👍 to 'message...'"
      const truncated = messageContent.length > 30
        ? messageContent.slice(0, 30) + '...'
        : messageContent;
      const preview = `${req.user.name} reacted ${emoji} to "${truncated}"`;
      await query(
        `UPDATE conversations SET last_message_at = NOW(), last_message_preview = $1 WHERE id = $2`,
        [preview, convId]
      );
    }

    // Fetch updated reactions for this message
    const reactionsResult = await query(
      `SELECT emoji, COUNT(*)::int AS count,
              ARRAY_AGG(user_id) AS user_ids
       FROM message_reactions WHERE message_id = $1 GROUP BY emoji ORDER BY emoji`,
      [msgId]
    );

    const reactions = reactionsResult.rows.map(r => ({
      emoji: r.emoji,
      count: r.count,
      user_ids: r.user_ids,
    }));

    // Emit to all participants
    try {
      const io = getIO();
      const participants = await query(
        'SELECT user_id FROM conversation_participants WHERE conversation_id = $1',
        [convId]
      );
      for (const row of participants.rows) {
        io.to(`user:${row.user_id}`).emit('reaction:updated', {
          conversationId: convId,
          messageId: msgId,
          reactions: reactions.map(r => ({
            ...r,
            reacted: r.user_ids.includes(row.user_id),
          })),
        });
      }

      // If a reaction was added, also emit conversation:updated for preview
      if (deleteResult.rows.length === 0) {
        const truncated = messageContent.length > 30
          ? messageContent.slice(0, 30) + '...'
          : messageContent;
        const preview = `${req.user.name} reacted ${emoji} to "${truncated}"`;
        for (const row of participants.rows) {
          io.to(`user:${row.user_id}`).emit('conversation:updated', {
            conversationId: convId,
            lastMessageAt: new Date().toISOString(),
            lastMessagePreview: preview,
          });
        }
      }
    } catch (_) {}

    res.json({ success: true, reactions });
  } catch (error) {
    console.error('toggleReaction error:', error);
    res.status(500).json({ message: 'Failed to toggle reaction' });
  }
};

// ══════════════════════════════════════════════════════════════════
// DELETE /api/conversations/:convId/messages/:msgId — Delete message
// ══════════════════════════════════════════════════════════════════
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { convId, msgId } = req.params;
    const mode = req.query.mode; // 'for_me' or 'for_everyone'

    if (!['for_me', 'for_everyone'].includes(mode)) {
      return res.status(400).json({ message: 'mode must be "for_me" or "for_everyone"' });
    }

    // Verify user is a participant
    const participantCheck = await query(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [convId, userId]
    );
    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    // Fetch the message
    const msgResult = await query(
      'SELECT id, sender_id, created_at, deleted_at FROM chat_messages WHERE id = $1 AND conversation_id = $2',
      [msgId, convId]
    );
    if (msgResult.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const msg = msgResult.rows[0];

    if (mode === 'for_me') {
      // Add userId to deleted_for JSONB array
      await query(
        `UPDATE chat_messages
         SET deleted_for = deleted_for || $1::jsonb
         WHERE id = $2 AND NOT (deleted_for @> $1::jsonb)`,
        [JSON.stringify([userId]), msgId]
      );
      return res.json({ success: true, mode: 'for_me' });
    }

    // for_everyone
    if (msg.sender_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own messages for everyone' });
    }

    if (msg.deleted_at) {
      return res.status(400).json({ message: 'Message already deleted' });
    }

    // 24-hour window
    const elapsed = Date.now() - new Date(msg.created_at).getTime();
    if (elapsed > 24 * 60 * 60 * 1000) {
      return res.status(403).json({ message: 'Can only delete messages within 24 hours' });
    }

    await query(
      'UPDATE chat_messages SET deleted_at = NOW() WHERE id = $1',
      [msgId]
    );

    // Emit to all participants
    try {
      const io = getIO();
      const participants = await query(
        'SELECT user_id FROM conversation_participants WHERE conversation_id = $1',
        [convId]
      );
      for (const row of participants.rows) {
        io.to(`user:${row.user_id}`).emit('message:deleted', {
          conversationId: convId,
          messageId: msgId,
        });
      }
    } catch (_) {}

    res.json({ success: true, mode: 'for_everyone' });
  } catch (error) {
    console.error('deleteMessage error:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

// ══════════════════════════════════════════════════════════════════
// GET /api/conversations/online — Get online status for user IDs
// ══════════════════════════════════════════════════════════════════
export const getOnlineStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const userIds = (req.query.userIds || '').split(',').filter(Boolean);

    // Get the requester's block list (both directions)
    const blockResult = await query(
      `SELECT blocker_id, blocked_id FROM user_blocks
       WHERE blocker_id = $1 OR blocked_id = $1`,
      [userId]
    );
    const blockedPairs = new Set();
    for (const row of blockResult.rows) {
      if (row.blocker_id === userId) blockedPairs.add(row.blocked_id);
      if (row.blocked_id === userId) blockedPairs.add(row.blocker_id);
    }

    // Also check target users' show_online_status setting
    let hiddenUsers = new Set();
    if (userIds.length > 0) {
      const settingsResult = await query(
        `SELECT user_id FROM user_chat_settings
         WHERE user_id = ANY($1::uuid[]) AND show_online_status = false`,
        [userIds]
      );
      hiddenUsers = new Set(settingsResult.rows.map(r => r.user_id));
    }

    const status = {};
    for (const id of userIds) {
      // Hide online status if blocked or if user has disabled it
      if (blockedPairs.has(id) || hiddenUsers.has(id)) {
        status[id] = false;
      } else {
        status[id] = isUserOnline(id);
      }
    }

    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get online status' });
  }
};

// ══════════════════════════════════════════════════════════════════
// GET /api/conversations/contacts — Get eligible chat contacts  
// (coordinator chain + existing conversation partners)
// ══════════════════════════════════════════════════════════════════
export const getChatContacts = async (req, res) => {
  try {
    const user = req.user;
    const { votingState, votingLGA, votingWard } = user;

    // Get coordinator chain (same logic as getMyCoordinators)
    const coordinators = [];

    const [wardResult, lgaResult, stateResult, nationalResult] = await Promise.all([
      votingWard
        ? query(
          `SELECT id, name, email, phone, "profileImage", designation
           FROM users
           WHERE designation = 'Ward Coordinator'
             AND "assignedState" = $1 AND "assignedLGA" = $2 AND "assignedWard" = $3
             AND id != $4
           LIMIT 1`,
          [votingState, votingLGA, votingWard, user.id]
        )
        : Promise.resolve({ rows: [] }),

      votingLGA
        ? query(
          `SELECT id, name, email, phone, "profileImage", designation
           FROM users
           WHERE designation = 'LGA Coordinator'
             AND "assignedState" = $1 AND "assignedLGA" = $2
             AND id != $3
           LIMIT 1`,
          [votingState, votingLGA, user.id]
        )
        : Promise.resolve({ rows: [] }),

      votingState
        ? query(
          `SELECT id, name, email, phone, "profileImage", designation
           FROM users
           WHERE designation = 'State Coordinator'
             AND "assignedState" = $1
             AND id != $2
           LIMIT 1`,
          [votingState, user.id]
        )
        : Promise.resolve({ rows: [] }),

      query(
        `SELECT id, name, email, phone, "profileImage", designation
         FROM users
         WHERE designation = 'National Coordinator'
           AND id != $1
         LIMIT 1`,
        [user.id]
      ),
    ]);

    if (wardResult.rows[0]) coordinators.push({ ...wardResult.rows[0], level: 'ward' });
    if (lgaResult.rows[0]) coordinators.push({ ...lgaResult.rows[0], level: 'lga' });
    if (stateResult.rows[0]) coordinators.push({ ...stateResult.rows[0], level: 'state' });
    if (nationalResult.rows[0]) coordinators.push({ ...nationalResult.rows[0], level: 'national' });

    // For coordinators: also get subordinate coordinators in their jurisdiction
    const senderLevel = getCoordinatorLevel(user.designation);
    let subordinates = [];

    if (senderLevel >= 1 && user.assignedState) {
      // State/LGA/Ward coordinators can message coordinators below them in their jurisdiction
      const conditions = [`u.id != $1`, `u."emailVerified" = true`];
      const params = [user.id];
      let paramIdx = 2;

      // Only get coordinators (not community members)
      conditions.push(`u.designation IN ('Ward Coordinator', 'LGA Coordinator', 'State Coordinator', 'National Coordinator', 'Polling Unit Agent')`);

      // Scope by location
      if (user.assignedState) {
        conditions.push(`u."assignedState" = $${paramIdx}`);
        params.push(user.assignedState);
        paramIdx++;
      }
      if (user.assignedLGA && senderLevel <= 2) {
        conditions.push(`u."assignedLGA" = $${paramIdx}`);
        params.push(user.assignedLGA);
        paramIdx++;
      }
      if (user.assignedWard && senderLevel <= 1) {
        conditions.push(`u."assignedWard" = $${paramIdx}`);
        params.push(user.assignedWard);
        paramIdx++;
      }

      const subResult = await query(
        `SELECT id, name, email, phone, "profileImage", designation
         FROM users u
         WHERE ${conditions.join(' AND ')}
         ORDER BY
           CASE designation
             WHEN 'National Coordinator' THEN 0
             WHEN 'State Coordinator' THEN 1
             WHEN 'LGA Coordinator' THEN 2
             WHEN 'Ward Coordinator' THEN 3
             WHEN 'Polling Unit Agent' THEN 4
           END
         LIMIT 50`,
        params
      );

      subordinates = subResult.rows;
    }

    res.json({
      success: true,
      coordinators,
      subordinates,
    });
  } catch (error) {
    console.error('getChatContacts error:', error);
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
};


