import { query, getClient } from '../config/db.js';
import { getIO, isUserOnline } from '../config/socket.js';
import { checkSpam } from '../utils/spamProtection.js';

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

// ── Room level hierarchy ────────────────────────────────────────
const ROOM_LEVELS = ['national', 'state', 'lga', 'ward', 'pu'];

const ROOM_ICONS = {
  national: '🌍',
  state: '🏛️',
  lga: '🏘️',
  ward: '📍',
  pu: '🗳️',
};

// ══════════════════════════════════════════════════════════════════
// GET /api/rooms/my-rooms — User's eligible rooms (lazy-created)
// ══════════════════════════════════════════════════════════════════
export const getMyRooms = async (req, res) => {
  try {
    const user = req.user;
    const { votingState, votingLGA, votingWard, votingPU } = user;

    // Build list of rooms this user belongs to based on voting location
    const roomDefs = [
      { level: 'national', state: null, lga: null, ward: null, pu: null },
    ];

    if (votingState) {
      roomDefs.push({ level: 'state', state: votingState, lga: null, ward: null, pu: null });
    }
    if (votingState && votingLGA) {
      roomDefs.push({ level: 'lga', state: votingState, lga: votingLGA, ward: null, pu: null });
    }
    if (votingState && votingLGA && votingWard) {
      roomDefs.push({ level: 'ward', state: votingState, lga: votingLGA, ward: votingWard, pu: null });
    }
    if (votingState && votingLGA && votingWard && votingPU) {
      roomDefs.push({ level: 'pu', state: votingState, lga: votingLGA, ward: votingWard, pu: votingPU });
    }

    const rooms = [];

    for (const def of roomDefs) {
      const room = await getOrCreateRoom(def, user);
      if (room) rooms.push(room);
    }

    res.json({ success: true, rooms });
  } catch (error) {
    console.error('getMyRooms error:', error);
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
};

/**
 * Find or lazily create a room, and ensure user is a participant.
 * Returns the room object with member count and unread info.
 */
async function getOrCreateRoom(def, user) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Try to find existing room
    let roomResult = await client.query(
      `SELECT id, title, room_level, room_state, room_lga, room_ward, room_pu,
              last_message_at, last_message_preview
       FROM conversations
       WHERE type = 'room'
         AND room_level = $1
         AND COALESCE(room_state, '') = COALESCE($2, '')
         AND COALESCE(room_lga, '') = COALESCE($3, '')
         AND COALESCE(room_ward, '') = COALESCE($4, '')
         AND COALESCE(room_pu, '') = COALESCE($5, '')
       LIMIT 1`,
      [def.level, def.state, def.lga, def.ward, def.pu]
    );

    let room;
    if (roomResult.rows.length > 0) {
      room = roomResult.rows[0];
    } else {
      // Create the room
      const title = buildRoomTitle(def);
      const insertResult = await client.query(
        `INSERT INTO conversations (type, title, room_level, room_state, room_lga, room_ward, room_pu)
         VALUES ('room', $1, $2, $3, $4, $5, $6)
         RETURNING id, title, room_level, room_state, room_lga, room_ward, room_pu,
                   last_message_at, last_message_preview`,
        [title, def.level, def.state, def.lga, def.ward, def.pu]
      );
      room = insertResult.rows[0];
    }

    // Check if user is banned
    const banCheck = await client.query(
      'SELECT 1 FROM room_bans WHERE conversation_id = $1 AND user_id = $2',
      [room.id, user.id]
    );
    if (banCheck.rows.length > 0) {
      await client.query('COMMIT');
      return null; // Don't show banned rooms
    }

    // Ensure user is a participant
    const role = determineRole(def.level, user);
    await client.query(
      `INSERT INTO conversation_participants (conversation_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (conversation_id, user_id) DO UPDATE SET role =
         CASE WHEN conversation_participants.role = 'admin' THEN 'admin'
              WHEN EXCLUDED.role = 'admin' THEN 'admin'
              ELSE conversation_participants.role
         END`,
      [room.id, user.id, role]
    );

    // Get member count and unread count
    const [countResult, unreadResult] = await Promise.all([
      client.query(
        'SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = $1',
        [room.id]
      ),
      client.query(
        'SELECT unread_count, last_read_at FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
        [room.id, user.id]
      ),
    ]);

    await client.query('COMMIT');

    return {
      id: room.id,
      title: room.title,
      room_level: room.room_level,
      room_state: room.room_state,
      room_lga: room.room_lga,
      room_ward: room.room_ward,
      room_pu: room.room_pu,
      icon: ROOM_ICONS[room.room_level] || '💬',
      member_count: parseInt(countResult.rows[0].count),
      unread_count: parseInt(unreadResult.rows[0]?.unread_count || 0),
      last_read_at: unreadResult.rows[0]?.last_read_at || null,
      last_message_at: room.last_message_at,
      last_message_preview: room.last_message_preview,
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('getOrCreateRoom error:', error);
    return null;
  } finally {
    client.release();
  }
}

/**
 * Build room title from level + location
 */
function buildRoomTitle(def) {
  switch (def.level) {
    case 'national': return 'National Community';
    case 'state':    return `${def.state} State`;
    case 'lga':      return `${def.lga} LGA`;
    case 'ward':     return `${def.ward} Ward`;
    case 'pu':       return `${def.pu}`;
    default:         return 'Community Room';
  }
}

/**
 * Determine the participant role for a user in a room.
 * Coordinators whose jurisdiction covers the room get 'admin'.
 */
function determineRole(roomLevel, user) {
  const designation = user.designation;
  const level = getCoordinatorLevel(designation);

  // National coordinators are admin everywhere
  if (level >= 4) return 'admin';

  // State coordinators: admin in their state + all sub-rooms
  if (level >= 3 && user.assignedState) {
    return 'admin';
  }

  // LGA coordinators: admin in their LGA room + ward/pu rooms below
  if (level >= 2 && user.assignedLGA) {
    if (roomLevel === 'lga' || roomLevel === 'ward' || roomLevel === 'pu') {
      return 'admin';
    }
  }

  // Ward coordinators: admin in their ward room + pu rooms below
  if (level >= 1 && user.assignedWard) {
    if (roomLevel === 'ward' || roomLevel === 'pu') {
      return 'admin';
    }
  }

  // PU agents: admin in their PU room
  if (level >= 0 && designation === 'Polling Unit Agent') {
    if (roomLevel === 'pu') {
      return 'admin';
    }
  }

  return 'member';
}

// ══════════════════════════════════════════════════════════════════
// GET /api/rooms/:id/messages — Paginated room messages
// ══════════════════════════════════════════════════════════════════
export const getRoomMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.id;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const before = req.query.before; // ISO timestamp cursor

    // Verify participant
    const pCheck = await query(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [roomId, userId]
    );
    if (pCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not a participant in this room' });
    }

    let sql, params;
    if (before) {
      sql = `
        SELECT m.id, m.content, m.message_type, m.created_at, m.sender_id,
               m.is_pinned, m.is_deleted,
               u.name AS sender_name, u."profileImage" AS sender_image,
               u.designation AS sender_designation,
               u."assignedState" AS sender_assigned_state,
               u."assignedLGA"   AS sender_assigned_lga,
               u."assignedWard"  AS sender_assigned_ward,
               u."votingState"   AS sender_voting_state,
               u."votingLGA"     AS sender_voting_lga,
               u."votingWard"    AS sender_voting_ward,
               u."votingPU"      AS sender_voting_pu
        FROM chat_messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id = $1 AND m.created_at < $2
        ORDER BY m.created_at DESC
        LIMIT $3`;
      params = [roomId, before, limit];
    } else {
      sql = `
        SELECT m.id, m.content, m.message_type, m.created_at, m.sender_id,
               m.is_pinned, m.is_deleted,
               u.name AS sender_name, u."profileImage" AS sender_image,
               u.designation AS sender_designation,
               u."assignedState" AS sender_assigned_state,
               u."assignedLGA"   AS sender_assigned_lga,
               u."assignedWard"  AS sender_assigned_ward,
               u."votingState"   AS sender_voting_state,
               u."votingLGA"     AS sender_voting_lga,
               u."votingWard"    AS sender_voting_ward,
               u."votingPU"      AS sender_voting_pu
        FROM chat_messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at DESC
        LIMIT $2`;
      params = [roomId, limit];
    }

    const result = await query(sql, params);

    // Mask deleted message content
    const messages = result.rows.map(m => ({
      ...m,
      content: m.is_deleted ? '[Message deleted]' : m.content,
    }));

    // Mark as read
    await query(
      `UPDATE conversation_participants
       SET last_read_at = NOW(), unread_count = 0
       WHERE conversation_id = $1 AND user_id = $2`,
      [roomId, userId]
    );

    res.json({
      success: true,
      messages: messages.reverse(),
      hasMore: result.rows.length === limit,
    });
  } catch (error) {
    console.error('getRoomMessages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// ══════════════════════════════════════════════════════════════════
// POST /api/rooms/:id/messages — Send message with spam protection
// ══════════════════════════════════════════════════════════════════
export const sendRoomMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.id;
    const { content } = req.body;

    // Verify this is a room
    const roomCheck = await query(
      `SELECT id, type FROM conversations WHERE id = $1 AND type = 'room'`,
      [roomId]
    );
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Run spam protection pipeline
    const spamCheck = await checkSpam(userId, roomId, content);
    if (!spamCheck.allowed) {
      const status = spamCheck.reason.includes('Not a participant') ? 403 : 429;
      return res.status(status).json({
        message: spamCheck.reason,
        retryAfter: spamCheck.retryAfter || null,
      });
    }

    // Insert message
    const trimmed = content.trim();
    const preview = trimmed.length > 100 ? trimmed.slice(0, 100) + '...' : trimmed;

    const msgResult = await query(
      `INSERT INTO chat_messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, message_type, created_at, sender_id`,
      [roomId, userId, trimmed]
    );

    const message = msgResult.rows[0];

    // Update conversation metadata
    await query(
      `UPDATE conversations SET last_message_at = $1, last_message_preview = $2 WHERE id = $3`,
      [message.created_at, preview, roomId]
    );

    // Increment unread for other participants
    await query(
      `UPDATE conversation_participants
       SET unread_count = unread_count + 1
       WHERE conversation_id = $1 AND user_id != $2`,
      [roomId, userId]
    );

    // Reset sender's unread
    await query(
      `UPDATE conversation_participants
       SET last_read_at = $1, unread_count = 0
       WHERE conversation_id = $2 AND user_id = $3`,
      [message.created_at, roomId, userId]
    );

    // Real-time delivery
    const messagePayload = {
      id: message.id,
      conversation_id: roomId,
      sender_id: userId,
      sender_name: req.user.name,
      sender_image: req.user.profileImage || null,
      sender_designation: req.user.designation || null,
      content: message.content,
      message_type: message.message_type,
      created_at: message.created_at,
      is_pinned: false,
      is_deleted: false,
    };

    try {
      const io = getIO();
      io.to(`conv:${roomId}`).emit('room:message:new', messagePayload);
    } catch (_) {}

    res.status(201).json({ success: true, message: messagePayload });
  } catch (error) {
    console.error('sendRoomMessage error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// ══════════════════════════════════════════════════════════════════
// DELETE /api/rooms/:id/messages/:msgId — Delete own message or admin delete
// ══════════════════════════════════════════════════════════════════
export const deleteRoomMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: roomId, msgId } = req.params;
    const { reason } = req.body;

    // Check if user is admin OR the message sender
    const isAdmin = await verifyRoomAdmin(roomId, userId);

    const msgCheck = await query(
      `SELECT sender_id FROM chat_messages WHERE id = $1 AND conversation_id = $2 AND is_deleted = false`,
      [msgId, roomId]
    );

    if (msgCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found or already deleted' });
    }

    const isOwnMessage = msgCheck.rows[0].sender_id === userId;

    if (!isAdmin && !isOwnMessage) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Soft-delete the message
    await query(
      `UPDATE chat_messages SET is_deleted = true, deleted_by = $1
       WHERE id = $2 AND conversation_id = $3`,
      [userId, msgId, roomId]
    );

    // Log moderation action (only for admin deleting others' messages)
    if (isAdmin && !isOwnMessage) {
      await query(
        `INSERT INTO room_moderation_log (conversation_id, moderator_id, action, target_message_id, reason)
         VALUES ($1, $2, 'delete_message', $3, $4)`,
        [roomId, userId, msgId, reason || null]
      );
    }

    // Broadcast deletion
    try {
      const io = getIO();
      io.to(`conv:${roomId}`).emit('room:message:deleted', { roomId, messageId: msgId });
    } catch (_) {}

    res.json({ success: true });
  } catch (error) {
    console.error('deleteRoomMessage error:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

// ══════════════════════════════════════════════════════════════════
// POST /api/rooms/:id/mute/:userId — Admin: mute user
// ══════════════════════════════════════════════════════════════════
export const muteUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id: roomId, userId: targetId } = req.params;
    const { duration, reason } = req.body; // duration in minutes: 60, 1440, 10080

    // Verify admin
    const adminCheck = await verifyRoomAdmin(roomId, adminId);
    if (!adminCheck) {
      return res.status(403).json({ message: 'Only room admins can mute users' });
    }

    // Cannot mute another admin
    const targetRole = await getParticipantRole(roomId, targetId);
    if (targetRole === 'admin') {
      return res.status(403).json({ message: 'Cannot mute another admin' });
    }

    const durationMin = Math.min(Math.max(parseInt(duration) || 60, 1), 10080); // 1 min to 7 days
    const mutedUntil = new Date(Date.now() + durationMin * 60 * 1000);

    await query(
      `UPDATE conversation_participants
       SET is_muted = true, muted_until = $1, muted_by = $2
       WHERE conversation_id = $3 AND user_id = $4`,
      [mutedUntil, adminId, roomId, targetId]
    );

    // Log
    await query(
      `INSERT INTO room_moderation_log (conversation_id, moderator_id, action, target_user_id, reason, duration_minutes)
       VALUES ($1, $2, 'mute_user', $3, $4, $5)`,
      [roomId, adminId, targetId, reason || null, durationMin]
    );

    // Broadcast
    try {
      const io = getIO();
      io.to(`conv:${roomId}`).emit('room:user:muted', {
        roomId, userId: targetId, mutedUntil: mutedUntil.toISOString(),
      });
      // Notify the muted user directly
      io.to(`user:${targetId}`).emit('room:you:muted', {
        roomId, mutedUntil: mutedUntil.toISOString(), reason: reason || null,
      });
    } catch (_) {}

    res.json({ success: true, mutedUntil: mutedUntil.toISOString() });
  } catch (error) {
    console.error('muteUser error:', error);
    res.status(500).json({ message: 'Failed to mute user' });
  }
};

// ══════════════════════════════════════════════════════════════════
// POST /api/rooms/:id/unmute/:userId — Admin: unmute user
// ══════════════════════════════════════════════════════════════════
export const unmuteUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id: roomId, userId: targetId } = req.params;

    const adminCheck = await verifyRoomAdmin(roomId, adminId);
    if (!adminCheck) {
      return res.status(403).json({ message: 'Only room admins can unmute users' });
    }

    await query(
      `UPDATE conversation_participants
       SET is_muted = false, muted_until = NULL, muted_by = NULL
       WHERE conversation_id = $1 AND user_id = $2`,
      [roomId, targetId]
    );

    await query(
      `INSERT INTO room_moderation_log (conversation_id, moderator_id, action, target_user_id)
       VALUES ($1, $2, 'unmute_user', $3)`,
      [roomId, adminId, targetId]
    );

    try {
      const io = getIO();
      io.to(`user:${targetId}`).emit('room:you:unmuted', { roomId });
    } catch (_) {}

    res.json({ success: true });
  } catch (error) {
    console.error('unmuteUser error:', error);
    res.status(500).json({ message: 'Failed to unmute user' });
  }
};

// ══════════════════════════════════════════════════════════════════
// POST /api/rooms/:id/pin/:msgId — Admin: pin/unpin message
// ══════════════════════════════════════════════════════════════════
export const pinMessage = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id: roomId, msgId } = req.params;

    const adminCheck = await verifyRoomAdmin(roomId, adminId);
    if (!adminCheck) {
      return res.status(403).json({ message: 'Only room admins can pin messages' });
    }

    // Toggle pin state
    const result = await query(
      `UPDATE chat_messages
       SET is_pinned = NOT is_pinned,
           pinned_by = CASE WHEN is_pinned THEN NULL ELSE $1 END
       WHERE id = $2 AND conversation_id = $3 AND is_deleted = false
       RETURNING id, is_pinned, content`,
      [adminId, msgId, roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const pinned = result.rows[0].is_pinned;
    const action = pinned ? 'pin_message' : 'unpin_message';

    await query(
      `INSERT INTO room_moderation_log (conversation_id, moderator_id, action, target_message_id)
       VALUES ($1, $2, $3, $4)`,
      [roomId, adminId, action, msgId]
    );

    try {
      const io = getIO();
      io.to(`conv:${roomId}`).emit('room:message:pinned', {
        roomId, messageId: msgId, pinned,
        content: pinned ? result.rows[0].content : null,
      });
    } catch (_) {}

    res.json({ success: true, pinned });
  } catch (error) {
    console.error('pinMessage error:', error);
    res.status(500).json({ message: 'Failed to pin message' });
  }
};

// ══════════════════════════════════════════════════════════════════
// POST /api/rooms/:id/ban/:userId — Admin: ban user from room
// ══════════════════════════════════════════════════════════════════
export const banUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id: roomId, userId: targetId } = req.params;
    const { reason } = req.body;

    const adminCheck = await verifyRoomAdmin(roomId, adminId);
    if (!adminCheck) {
      return res.status(403).json({ message: 'Only room admins can ban users' });
    }

    // Cannot ban another admin
    const targetRole = await getParticipantRole(roomId, targetId);
    if (targetRole === 'admin') {
      return res.status(403).json({ message: 'Cannot ban another admin' });
    }

    // Remove from participants
    await query(
      'DELETE FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [roomId, targetId]
    );

    // Add to bans
    await query(
      `INSERT INTO room_bans (conversation_id, user_id, banned_by, reason)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (conversation_id, user_id) DO NOTHING`,
      [roomId, targetId, adminId, reason || null]
    );

    // Log
    await query(
      `INSERT INTO room_moderation_log (conversation_id, moderator_id, action, target_user_id, reason)
       VALUES ($1, $2, 'ban_user', $3, $4)`,
      [roomId, adminId, targetId, reason || null]
    );

    // Broadcast + notify banned user
    try {
      const io = getIO();
      io.to(`conv:${roomId}`).emit('room:user:banned', { roomId, userId: targetId });
      io.to(`user:${targetId}`).emit('room:you:banned', { roomId, reason: reason || null });
    } catch (_) {}

    res.json({ success: true });
  } catch (error) {
    console.error('banUser error:', error);
    res.status(500).json({ message: 'Failed to ban user' });
  }
};

// ══════════════════════════════════════════════════════════════════
// GET /api/rooms/:id/members — Paginated member list
// ══════════════════════════════════════════════════════════════════
export const getRoomMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 30));
    const offset = (page - 1) * limit;

    // Verify participant
    const pCheck = await query(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [roomId, userId]
    );
    if (pCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not a participant in this room' });
    }

    const result = await query(
      `SELECT u.id, u.name, u."profileImage", u.designation,
              cp.role, cp.is_muted, cp.muted_until
       FROM conversation_participants cp
       JOIN users u ON u.id = cp.user_id
       WHERE cp.conversation_id = $1
       ORDER BY
         CASE cp.role WHEN 'admin' THEN 0 WHEN 'moderator' THEN 1 ELSE 2 END,
         u.name
       LIMIT $2 OFFSET $3`,
      [roomId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = $1',
      [roomId]
    );

    // Add online status
    const members = result.rows.map(m => ({
      ...m,
      online: isUserOnline(m.id),
    }));

    res.json({
      success: true,
      members,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    console.error('getRoomMembers error:', error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};

// ══════════════════════════════════════════════════════════════════
// GET /api/rooms/:id/pinned — Get pinned messages
// ══════════════════════════════════════════════════════════════════
export const getPinnedMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.id;

    // Verify participant
    const pCheck = await query(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [roomId, userId]
    );
    if (pCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not a participant in this room' });
    }

    const result = await query(
      `SELECT m.id, m.content, m.created_at, m.sender_id, m.is_pinned,
              u.name AS sender_name, u."profileImage" AS sender_image
       FROM chat_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1 AND m.is_pinned = true AND m.is_deleted = false
       ORDER BY m.created_at DESC
       LIMIT 10`,
      [roomId]
    );

    res.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('getPinnedMessages error:', error);
    res.status(500).json({ message: 'Failed to fetch pinned messages' });
  }
};

// ══════════════════════════════════════════════════════════════════
// DELETE /api/rooms/:id/cleanup — Admin: hard-delete ALL messages
// (for testing on prod — removes messages permanently)
// ══════════════════════════════════════════════════════════════════
export const cleanupRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = req.params.id;

    // Admin-only
    const isAdmin = await verifyRoomAdmin(roomId, userId);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only room admins can purge messages' });
    }

    // Hard-delete all messages in this room
    const result = await query(
      'DELETE FROM chat_messages WHERE conversation_id = $1 RETURNING id',
      [roomId]
    );

    // Reset conversation metadata
    await query(
      `UPDATE conversations SET last_message_at = NULL, last_message_preview = NULL WHERE id = $1`,
      [roomId]
    );

    // Reset unread counts
    await query(
      `UPDATE conversation_participants SET unread_count = 0, last_read_at = NULL WHERE conversation_id = $1`,
      [roomId]
    );

    // Clear spam tracking for this room
    await query(
      'DELETE FROM room_spam_tracking WHERE conversation_id = $1',
      [roomId]
    );

    res.json({ success: true, deleted: result.rowCount });
  } catch (error) {
    console.error('cleanupRoom error:', error);
    res.status(500).json({ message: 'Failed to cleanup room' });
  }
};

// ══════════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════════

async function verifyRoomAdmin(roomId, userId) {
  const result = await query(
    `SELECT role FROM conversation_participants
     WHERE conversation_id = $1 AND user_id = $2`,
    [roomId, userId]
  );
  return result.rows.length > 0 && result.rows[0].role === 'admin';
}

async function getParticipantRole(roomId, userId) {
  const result = await query(
    `SELECT role FROM conversation_participants
     WHERE conversation_id = $1 AND user_id = $2`,
    [roomId, userId]
  );
  return result.rows[0]?.role || null;
}
