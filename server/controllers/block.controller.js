import { query } from '../config/db.js';

// ══════════════════════════════════════════════════════════════════
// POST /api/users/:id/block — Block a user
// ══════════════════════════════════════════════════════════════════
export const blockUser = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;
    const { reason } = req.body;

    // UUID format validation
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(blockedId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    // Self-block prevention
    if (blockedId === blockerId) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself' });
    }

    // Validate reason if provided
    const validReasons = ['spam', 'harassment', 'unwanted', 'other'];
    if (reason && !validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Invalid block reason' });
    }

    // Verify target user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [blockedId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Idempotent block — ON CONFLICT DO NOTHING
    await query(
      `INSERT INTO user_blocks (blocker_id, blocked_id, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
      [blockerId, blockedId, reason || null]
    );

    res.json({ success: true, message: 'User blocked' });
  } catch (error) {
    console.error('blockUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to block user' });
  }
};

// ══════════════════════════════════════════════════════════════════
// DELETE /api/users/:id/block — Unblock a user
// ══════════════════════════════════════════════════════════════════
export const unblockUser = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(blockedId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const result = await query(
      'DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2',
      [blockerId, blockedId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Block not found' });
    }

    res.json({ success: true, message: 'User unblocked' });
  } catch (error) {
    console.error('unblockUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to unblock user' });
  }
};

// ══════════════════════════════════════════════════════════════════
// GET /api/users/blocked — List blocked users (paginated)
// ══════════════════════════════════════════════════════════════════
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 30));
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT
        u.id,
        u.name,
        u."profileImage" AS profile_image,
        u.designation,
        ub.reason,
        ub.created_at AS blocked_at
       FROM user_blocks ub
       JOIN users u ON u.id = ub.blocked_id
       WHERE ub.blocker_id = $1
       ORDER BY ub.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM user_blocks WHERE blocker_id = $1',
      [userId]
    );

    res.json({
      success: true,
      blockedUsers: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    console.error('getBlockedUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blocked users' });
  }
};

// ══════════════════════════════════════════════════════════════════
// Helper: Check block status between two users
// Used by conversation controller, socket handlers, etc.
// ══════════════════════════════════════════════════════════════════
export async function checkBlockStatus(userA, userB) {
  const result = await query(
    `SELECT blocker_id FROM user_blocks
     WHERE (blocker_id = $1 AND blocked_id = $2)
        OR (blocker_id = $2 AND blocked_id = $1)`,
    [userA, userB]
  );

  return {
    isBlocked: result.rows.length > 0,
    blockedByA: result.rows.some(r => r.blocker_id === userA),
    blockedByB: result.rows.some(r => r.blocker_id === userB),
  };
}

// ══════════════════════════════════════════════════════════════════
// Helper: Get set of user IDs blocked by a specific user
// Used for socket-level filtering (cached on connection)
// ══════════════════════════════════════════════════════════════════
export async function getUserBlockList(userId) {
  const result = await query(
    'SELECT blocked_id FROM user_blocks WHERE blocker_id = $1',
    [userId]
  );
  return new Set(result.rows.map(r => r.blocked_id));
}

// ══════════════════════════════════════════════════════════════════
// Helper: Get set of user IDs who blocked a specific user
// ══════════════════════════════════════════════════════════════════
export async function getUserBlockedByList(userId) {
  const result = await query(
    'SELECT blocker_id FROM user_blocks WHERE blocked_id = $1',
    [userId]
  );
  return new Set(result.rows.map(r => r.blocker_id));
}
