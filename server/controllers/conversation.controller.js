import { query, getClient } from '../config/db.js';
import { getIO, isUserOnline } from '../config/socket.js';

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
      ORDER BY c.last_message_at DESC NULLS LAST
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await query(
      `SELECT COUNT(*) FROM conversation_participants cp
       JOIN conversations c ON c.id = cp.conversation_id
       WHERE cp.user_id = $1 AND c.type != 'room'`,
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
    const participantLevel = getCoordinatorLevel(participant.designation);

    // ── Authorization: who can initiate? ────────────
    // Coordinators cannot initiate to regular Community Members
    // (they can only reply to incoming conversations from them)
    if (senderLevel >= 0 && participantLevel < 0) {
      // Check if there's already an existing conversation (reply context)
      const existingConv = await query(
        `SELECT cp1.conversation_id
         FROM conversation_participants cp1
         JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
         JOIN conversations c ON c.id = cp1.conversation_id
         WHERE cp1.user_id = $1 AND cp2.user_id = $2 AND c.type = 'direct'
         LIMIT 1`,
        [userId, participantId]
      );

      if (existingConv.rows.length === 0) {
        return res.status(403).json({
          message: 'Coordinators can only reply to messages from community members, not initiate new conversations with them.',
        });
      }
    }

    // Members can only message coordinators in their chain
    if (senderLevel < 0 && participantLevel >= 0) {
      const isInChain = await verifyCoordinatorInChain(sender, participant);
      if (!isInChain) {
        return res.status(403).json({
          message: 'You can only message coordinators assigned to your voting location.',
        });
      }
    }

    // Coordinators messaging other coordinators — must be in the hierarchy chain
    if (senderLevel >= 0 && participantLevel >= 0) {
      const isInChain = await verifyCoordinatorsInSameChain(sender, participant);
      if (!isInChain) {
        return res.status(403).json({
          message: 'You can only message coordinators within your location hierarchy.',
        });
      }
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

    if (before) {
      messagesQuery = `
        SELECT m.id, m.content, m.message_type, m.created_at, m.edited_at,
               m.sender_id,
               u.name AS sender_name,
               u."profileImage" AS sender_image
        FROM chat_messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id = $1 AND m.created_at < $2
        ORDER BY m.created_at DESC
        LIMIT $3
      `;
      params = [conversationId, before, limit];
    } else {
      messagesQuery = `
        SELECT m.id, m.content, m.message_type, m.created_at, m.edited_at,
               m.sender_id,
               u.name AS sender_name,
               u."profileImage" AS sender_image
        FROM chat_messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at DESC
        LIMIT $2
      `;
      params = [conversationId, limit];
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
    const { content } = req.body;

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
      `INSERT INTO chat_messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, message_type, created_at, sender_id`,
      [conversationId, userId, trimmedContent]
    );

    const message = msgResult.rows[0];

    // Update conversation metadata
    await query(
      `UPDATE conversations
       SET last_message_at = $1, last_message_preview = $2
       WHERE id = $3`,
      [message.created_at, preview, conversationId]
    );

    // Increment unread count for OTHER participants
    await query(
      `UPDATE conversation_participants
       SET unread_count = unread_count + 1
       WHERE conversation_id = $1 AND user_id != $2`,
      [conversationId, userId]
    );

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
    };

    try {
      const io = getIO();

      // Send to all participants in the conversation room
      io.to(`conv:${conversationId}`).emit('message:new', messagePayload);

      // Also update conversation sidebar for other participants
      const otherParticipants = await query(
        `SELECT user_id FROM conversation_participants
         WHERE conversation_id = $1 AND user_id != $2`,
        [conversationId, userId]
      );

      for (const row of otherParticipants.rows) {
        io.to(`user:${row.user_id}`).emit('conversation:updated', {
          conversationId,
          lastMessageAt: message.created_at,
          lastMessagePreview: preview,
          senderName: req.user.name,
        });
      }
    } catch (_) {}

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
// GET /api/conversations/online — Get online status for user IDs
// ══════════════════════════════════════════════════════════════════
export const getOnlineStatus = async (req, res) => {
  try {
    const userIds = (req.query.userIds || '').split(',').filter(Boolean);

    const status = {};
    for (const id of userIds) {
      status[id] = isUserOnline(id);
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
          `SELECT id, name, email, "profileImage", designation
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
          `SELECT id, name, email, "profileImage", designation
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
          `SELECT id, name, email, "profileImage", designation
           FROM users
           WHERE designation = 'State Coordinator'
             AND "assignedState" = $1
             AND id != $2
           LIMIT 1`,
          [votingState, user.id]
        )
        : Promise.resolve({ rows: [] }),

      query(
        `SELECT id, name, email, "profileImage", designation
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
        `SELECT id, name, email, "profileImage", designation
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

// ══════════════════════════════════════════════════════════════════
// Helper: verify a coordinator is in the member's chain
// ══════════════════════════════════════════════════════════════════
async function verifyCoordinatorInChain(sender, coordinator) {
  const { votingState, votingLGA, votingWard } = sender;
  const designation = coordinator.designation;

  if (designation === 'National Coordinator') return true;

  if (designation === 'State Coordinator') {
    return coordinator.assignedState === votingState;
  }

  if (designation === 'LGA Coordinator') {
    return coordinator.assignedState === votingState &&
           coordinator.assignedLGA === votingLGA;
  }

  if (designation === 'Ward Coordinator') {
    return coordinator.assignedState === votingState &&
           coordinator.assignedLGA === votingLGA &&
           coordinator.assignedWard === votingWard;
  }

  if (designation === 'Polling Unit Agent') {
    return coordinator.assignedState === votingState &&
           coordinator.assignedLGA === votingLGA &&
           coordinator.assignedWard === votingWard;
  }

  return false;
}

// ══════════════════════════════════════════════════════════════════
// Helper: verify two coordinators are in the same hierarchy chain
// ══════════════════════════════════════════════════════════════════
async function verifyCoordinatorsInSameChain(sender, participant) {
  // National coordinators can message any coordinator
  if (sender.designation === 'National Coordinator' ||
      participant.designation === 'National Coordinator') {
    return true;
  }

  // Must share at least the same state
  const senderState = sender.assignedState || sender.votingState;
  const participantState = participant.assignedState || participant.votingState;

  if (!senderState || !participantState || senderState !== participantState) {
    return false;
  }

  // State coordinators can message any coordinator in their state
  if (sender.designation === 'State Coordinator' ||
      participant.designation === 'State Coordinator') {
    return true;
  }

  // LGA coordinators need same LGA scope
  const senderLGA = sender.assignedLGA || sender.votingLGA;
  const participantLGA = participant.assignedLGA || participant.votingLGA;

  if (senderLGA && participantLGA && senderLGA === participantLGA) {
    return true;
  }

  return false;
}
