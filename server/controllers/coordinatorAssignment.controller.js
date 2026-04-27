import { query, pool } from '../config/db.js';
import { sendPushNotification } from '../services/pushNotificationService.js';

// ── Designation hierarchy (higher index = higher rank) ────────────
const DESIGNATION_RANK = {
  'Community Member': 0,
  'Polling Unit Agent': 1,
  'Vote Defender': 1,
  'Field Agent': 1,
  'Ward Coordinator': 2,
  'LGA Coordinator': 3,
  'State Coordinator': 4,
  'National Coordinator': 5,
};

// What each coordinator level can assign
const CAN_ASSIGN = {
  'National Coordinator': ['State Coordinator', 'LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent'],
  'State Coordinator': ['LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent'],
  'LGA Coordinator': ['Ward Coordinator', 'Polling Unit Agent'],
  'Ward Coordinator': ['Polling Unit Agent'],
};

const COORDINATOR_DESIGNATIONS = [
  'National Coordinator',
  'State Coordinator',
  'LGA Coordinator',
  'Ward Coordinator',
];

// ── Helpers ───────────────────────────────────────────────────────

async function getCallerInfo(userId) {
  const result = await query(
    `SELECT id, designation, "assignedState", "assignedLGA", "assignedWard", role
     FROM users WHERE id = $1`,
    [userId],
  );
  return result.rows[0] || null;
}

function isCoordinatorOrAdmin(user) {
  if (user.role === 'admin') return true;
  return COORDINATOR_DESIGNATIONS.includes(user.designation);
}

/**
 * Check if the caller has jurisdiction over the given location.
 * Admin / National → always true.
 * State Coord → state must match.
 * LGA Coord  → state + LGA must match.
 * Ward Coord → state + LGA + ward must match.
 */
function hasJurisdiction(caller, state, lga, ward) {
  if (caller.role === 'admin' || caller.designation === 'National Coordinator') return true;

  const normalize = (s) => (s || '').toLowerCase().trim();

  if (caller.designation === 'State Coordinator') {
    return normalize(caller.assignedState) === normalize(state);
  }

  if (caller.designation === 'LGA Coordinator') {
    return (
      normalize(caller.assignedState) === normalize(state) &&
      normalize(caller.assignedLGA) === normalize(lga)
    );
  }

  if (caller.designation === 'Ward Coordinator') {
    return (
      normalize(caller.assignedState) === normalize(state) &&
      normalize(caller.assignedLGA) === normalize(lga) &&
      normalize(caller.assignedWard) === normalize(ward)
    );
  }

  return false;
}

// ── 1. Search users ──────────────────────────────────────────────

/**
 * GET /coordinator/search?q=...&limit=20
 * Coordinator-scoped user search by name, email, or phone.
 */
export const searchUsers = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const caller = await getCallerInfo(userId);

    if (!caller || !isCoordinatorOrAdmin(caller)) {
      return res.status(403).json({ success: false, message: 'Only coordinators can search users' });
    }

    const { q = '', limit = 20 } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: { users: [] } });
    }

    const actualLimit = Math.min(parseInt(limit) || 20, 50);

    const result = await query(
      `SELECT id, name, email, phone, "profileImage",
              designation, "assignedState", "assignedLGA", "assignedWard"
       FROM users
       WHERE (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)
         AND id != $2
       ORDER BY
         CASE WHEN name ILIKE $3 THEN 1 WHEN email ILIKE $3 THEN 2 ELSE 3 END,
         "createdAt" DESC
       LIMIT $4`,
      [`%${q}%`, userId, `${q}%`, actualLimit],
    );

    res.json({ success: true, data: { users: result.rows, query: q } });
  } catch (err) {
    console.error('Coordinator search error:', err);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

// ── 2. Assign designation ────────────────────────────────────────

/**
 * POST /coordinator/assign
 * Body: { userId, designation, assignedState?, assignedLGA?, assignedWard?, override? }
 */
export const assignDesignation = async (req, res) => {
  try {
    const callerId = req.user.userId || req.user.id;
    const caller = await getCallerInfo(callerId);

    if (!caller || !isCoordinatorOrAdmin(caller)) {
      return res.status(403).json({ success: false, message: 'Only coordinators can assign designations' });
    }

    const { userId, designation, assignedState, assignedLGA, assignedWard, override } = req.body;

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (userId === callerId) {
      return res.status(400).json({ success: false, message: 'Cannot assign designation to yourself' });
    }

    // Validate designation
    const assignable = caller.role === 'admin'
      ? [...Object.keys(CAN_ASSIGN), 'Polling Unit Agent', 'Vote Defender', 'Community Member']
      : CAN_ASSIGN[caller.designation];

    if (!assignable || !assignable.includes(designation)) {
      return res.status(403).json({
        success: false,
        message: `You cannot assign the "${designation}" role with your current designation`,
      });
    }

    // Validate required fields per designation
    if (designation === 'State Coordinator' && !assignedState) {
      return res.status(400).json({ success: false, message: 'State Coordinator requires assignedState' });
    }
    if (designation === 'LGA Coordinator' && (!assignedState || !assignedLGA)) {
      return res.status(400).json({ success: false, message: 'LGA Coordinator requires assignedState and assignedLGA' });
    }
    if (designation === 'Ward Coordinator' && (!assignedState || !assignedLGA || !assignedWard)) {
      return res.status(400).json({ success: false, message: 'Ward Coordinator requires assignedState, assignedLGA, and assignedWard' });
    }
    if (designation === 'Polling Unit Agent' && (!assignedState || !assignedLGA || !assignedWard)) {
      return res.status(400).json({ success: false, message: 'Polling Unit Agent requires assignedState, assignedLGA, and assignedWard' });
    }

    // Jurisdiction check — caller must have authority over the target location
    if (!hasJurisdiction(caller, assignedState, assignedLGA, assignedWard)) {
      return res.status(403).json({
        success: false,
        message: 'You can only assign coordinators within your jurisdiction',
      });
    }

    // Check target user exists and their current designation
    const targetResult = await query(
      `SELECT id, name, designation, "assignedState", "assignedLGA", "assignedWard"
       FROM users WHERE id = $1`,
      [userId],
    );
    if (targetResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const target = targetResult.rows[0];

    // Check if target already has a coordinator-level designation
    const targetRank = DESIGNATION_RANK[target.designation] || 0;
    const callerRank = caller.role === 'admin' ? 99 : (DESIGNATION_RANK[caller.designation] || 0);

    if (targetRank >= callerRank && !override && caller.role !== 'admin') {
      return res.status(409).json({
        success: false,
        message: `${target.name} already has the "${target.designation}" designation which is equal to or higher than yours`,
        data: {
          currentDesignation: target.designation,
          assignedState: target.assignedState,
          assignedLGA: target.assignedLGA,
          assignedWard: target.assignedWard,
        },
      });
    }

    if (targetRank > 0 && !override && target.designation !== 'Community Member') {
      return res.status(409).json({
        success: false,
        message: `${target.name} is already a "${target.designation}". Send override: true to reassign.`,
        data: {
          currentDesignation: target.designation,
          assignedState: target.assignedState,
          assignedLGA: target.assignedLGA,
          assignedWard: target.assignedWard,
        },
      });
    }

    // Perform the assignment
    const updateResult = await query(
      `UPDATE users
       SET designation = $1,
           "assignedState" = $2,
           "assignedLGA" = $3,
           "assignedWard" = $4,
           "updatedAt" = NOW()
       WHERE id = $5
       RETURNING id, name, designation, "assignedState", "assignedLGA", "assignedWard"`,
      [designation, assignedState || null, assignedLGA || null, assignedWard || null, userId],
    );

    const updatedUser = updateResult.rows[0];

    // Audit log
    await query(
      `INSERT INTO coordinator_assignment_log
         (assigned_by, assigned_to, action, designation, assigned_state, assigned_lga, assigned_ward)
       VALUES ($1, $2, 'assign', $3, $4, $5, $6)`,
      [callerId, userId, designation, assignedState || null, assignedLGA || null, assignedWard || null],
    );

    // Create notification for the assigned user
    const notifMessage = `You have been assigned as ${designation}${assignedState ? ` for ${assignedState}` : ''}${assignedLGA ? ` - ${assignedLGA}` : ''}${assignedWard ? ` - ${assignedWard}` : ''}.`;
    try {
      await query(
        `INSERT INTO notifications (id, "userId", type, title, message, "createdAt")
         VALUES (gen_random_uuid(), $1, 'designation', $2, $3, NOW())`,
        [userId, 'New Role Assigned', notifMessage],
      );
    } catch (notifErr) {
      console.error('Failed to create assignment notification:', notifErr.message);
    }

    // Send FCM push notification
    try {
      await sendPushNotification([userId], 'New Role Assigned', notifMessage, {
        type: 'designation',
        designation,
      });
    } catch (pushErr) {
      console.error('Failed to send assignment push:', pushErr.message);
    }

    res.json({
      success: true,
      message: `Successfully assigned ${updatedUser.name} as ${designation}`,
      data: { user: updatedUser },
    });
  } catch (err) {
    console.error('Assign designation error:', err);
    res.status(500).json({ success: false, message: 'Failed to assign designation' });
  }
};

// ── 3. Get subordinates ──────────────────────────────────────────

/**
 * GET /coordinator/subordinates?page=1&limit=20&designation=Ward+Coordinator
 */
export const getSubordinates = async (req, res) => {
  try {
    const callerId = req.user.userId || req.user.id;
    const caller = await getCallerInfo(callerId);

    if (!caller || !isCoordinatorOrAdmin(caller)) {
      return res.status(403).json({ success: false, message: 'Only coordinators can view subordinates' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { designation: filterDesignation, q: searchQuery } = req.query;

    // Build WHERE clause based on caller's jurisdiction
    const conditions = [`designation != 'Community Member'`, `id != $1`];
    const params = [callerId];
    let paramIdx = 2;

    if (caller.role === 'admin' || caller.designation === 'National Coordinator') {
      // See all coordinators — no location filter
    } else if (caller.designation === 'State Coordinator') {
      conditions.push(`"assignedState" ILIKE $${paramIdx}`);
      params.push(caller.assignedState);
      paramIdx++;
      // Only see below their level
      conditions.push(`designation IN ('LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent', 'Vote Defender')`);
    } else if (caller.designation === 'LGA Coordinator') {
      conditions.push(`"assignedState" ILIKE $${paramIdx}`);
      params.push(caller.assignedState);
      paramIdx++;
      conditions.push(`"assignedLGA" ILIKE $${paramIdx}`);
      params.push(caller.assignedLGA);
      paramIdx++;
      conditions.push(`designation IN ('Ward Coordinator', 'Polling Unit Agent', 'Vote Defender')`);
    } else if (caller.designation === 'Ward Coordinator') {
      conditions.push(`"assignedState" ILIKE $${paramIdx}`);
      params.push(caller.assignedState);
      paramIdx++;
      conditions.push(`"assignedLGA" ILIKE $${paramIdx}`);
      params.push(caller.assignedLGA);
      paramIdx++;
      conditions.push(`"assignedWard" ILIKE $${paramIdx}`);
      params.push(caller.assignedWard);
      paramIdx++;
      conditions.push(`designation IN ('Polling Unit Agent', 'Vote Defender')`);
    }

    // Optional designation filter
    if (filterDesignation && Object.keys(DESIGNATION_RANK).includes(filterDesignation)) {
      conditions.push(`designation = $${paramIdx}`);
      params.push(filterDesignation);
      paramIdx++;
    }

    // Optional text search (name, email, phone)
    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
      const q = `%${searchQuery.trim()}%`;
      conditions.push(`(name ILIKE $${paramIdx} OR email ILIKE $${paramIdx + 1} OR phone ILIKE $${paramIdx + 2})`);
      params.push(q, q, q);
      paramIdx += 3;
    }

    const where = conditions.join(' AND ');

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) FROM users WHERE ${where}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    // Fetch page
    const dataParams = [...params, limit, offset];
    const result = await query(
      `SELECT id, name, email, phone, "profileImage",
              designation, "assignedState", "assignedLGA", "assignedWard"
       FROM users
       WHERE ${where}
       ORDER BY designation, name
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      dataParams,
    );

    res.json({
      success: true,
      data: {
        subordinates: result.rows,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get subordinates error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch subordinates' });
  }
};

// ── 4. Remove designation ────────────────────────────────────────

/**
 * POST /coordinator/remove
 * Body: { userId }
 */
export const removeDesignation = async (req, res) => {
  try {
    const callerId = req.user.userId || req.user.id;
    const caller = await getCallerInfo(callerId);

    if (!caller || !isCoordinatorOrAdmin(caller)) {
      return res.status(403).json({ success: false, message: 'Only coordinators can remove designations' });
    }

    const { userId } = req.body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (userId === callerId) {
      return res.status(400).json({ success: false, message: 'Cannot remove your own designation' });
    }

    // Check target
    const targetResult = await query(
      `SELECT id, name, designation, "assignedState", "assignedLGA", "assignedWard"
       FROM users WHERE id = $1`,
      [userId],
    );
    if (targetResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const target = targetResult.rows[0];

    // Caller must outrank target
    const callerRank = caller.role === 'admin' ? 99 : (DESIGNATION_RANK[caller.designation] || 0);
    const targetRank = DESIGNATION_RANK[target.designation] || 0;

    if (targetRank >= callerRank && caller.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `You cannot remove a "${target.designation}" with your current designation`,
      });
    }

    // Jurisdiction check
    if (!hasJurisdiction(caller, target.assignedState, target.assignedLGA, target.assignedWard)) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove coordinators within your jurisdiction',
      });
    }

    // Demote to Community Member
    const updateResult = await query(
      `UPDATE users
       SET designation = 'Community Member',
           "assignedState" = NULL,
           "assignedLGA" = NULL,
           "assignedWard" = NULL,
           "updatedAt" = NOW()
       WHERE id = $1
       RETURNING id, name, designation`,
      [userId],
    );

    // Audit log
    await query(
      `INSERT INTO coordinator_assignment_log
         (assigned_by, assigned_to, action, designation, assigned_state, assigned_lga, assigned_ward)
       VALUES ($1, $2, 'remove', $3, $4, $5, $6)`,
      [callerId, userId, target.designation, target.assignedState, target.assignedLGA, target.assignedWard],
    );

    // Notify user
    const removalMessage = `Your "${target.designation}" designation has been removed. You are now a Community Member.`;
    try {
      await query(
        `INSERT INTO notifications (id, "userId", type, title, message, "createdAt")
         VALUES (gen_random_uuid(), $1, 'designation', $2, $3, NOW())`,
        [userId, 'Role Removed', removalMessage],
      );
    } catch (notifErr) {
      console.error('Failed to create removal notification:', notifErr.message);
    }

    // Send FCM push notification
    try {
      await sendPushNotification([userId], 'Role Removed', removalMessage, {
        type: 'designation',
      });
    } catch (pushErr) {
      console.error('Failed to send removal push:', pushErr.message);
    }

    res.json({
      success: true,
      message: `Removed "${target.designation}" designation from ${target.name}`,
      data: { user: updateResult.rows[0] },
    });
  } catch (err) {
    console.error('Remove designation error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove designation' });
  }
};
