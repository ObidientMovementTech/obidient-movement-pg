import { query } from '../config/db.js';

// ── Get coordinator chain for authenticated user ────────────────────────────
// Returns the user's coordinators from Ward level up to National level
export const getMyCoordinators = async (req, res) => {
  try {
    const { votingState, votingLGA, votingWard } = req.user;

    if (!votingState) {
      return res.status(400).json({
        message: 'Your profile is incomplete. Please set your voting location to use chat.',
        code: 'INCOMPLETE_PROFILE',
      });
    }

    const chain = [];

    // Query all coordinator levels in parallel for performance
    const [wardResult, lgaResult, stateResult, nationalResult] = await Promise.all([
      // Ward Coordinator
      votingWard
        ? query(
            `SELECT id, name, email, "profileImage", designation, "assignedWard"
             FROM users
             WHERE designation = 'Ward Coordinator'
               AND "assignedState" = $1
               AND "assignedLGA" = $2
               AND "assignedWard" = $3
             LIMIT 1`,
            [votingState, votingLGA, votingWard]
          )
        : Promise.resolve({ rows: [] }),

      // LGA Coordinator
      votingLGA
        ? query(
            `SELECT id, name, email, "profileImage", designation, "assignedLGA"
             FROM users
             WHERE designation = 'LGA Coordinator'
               AND "assignedState" = $1
               AND "assignedLGA" = $2
             LIMIT 1`,
            [votingState, votingLGA]
          )
        : Promise.resolve({ rows: [] }),

      // State Coordinator
      query(
        `SELECT id, name, email, "profileImage", designation, "assignedState"
         FROM users
         WHERE designation = 'State Coordinator'
           AND "assignedState" = $1
         LIMIT 1`,
        [votingState]
      ),

      // National Coordinator
      query(
        `SELECT id, name, email, "profileImage", designation
         FROM users
         WHERE designation = 'National Coordinator'
         LIMIT 1`
      ),
    ]);

    if (wardResult.rows[0]) {
      chain.push({ level: 'ward', ...wardResult.rows[0] });
    }
    if (lgaResult.rows[0]) {
      chain.push({ level: 'lga', ...lgaResult.rows[0] });
    }
    if (stateResult.rows[0]) {
      chain.push({ level: 'state', ...stateResult.rows[0] });
    }
    if (nationalResult.rows[0]) {
      chain.push({ level: 'national', ...nationalResult.rows[0] });
    }

    res.json({ coordinators: chain });
  } catch (error) {
    console.error('Error fetching coordinator chain:', error);
    res.status(500).json({ message: 'Failed to fetch coordinators' });
  }
};

// ── Rate limit check middleware for chat messages ───────────────────────────
// 5 messages per hour per recipient level, 60s cooldown between messages
export const checkChatRateLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recipientLevel = req.body.recipientLevel || req.body.recipient_level;

    if (!recipientLevel) {
      return next(); // Let the actual handler validate this
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check hourly limit
    const countResult = await query(
      `SELECT COUNT(*) FROM leadership_messages
       WHERE sender_id = $1
         AND recipient_level = $2
         AND created_at > $3`,
      [userId, recipientLevel, oneHourAgo]
    );

    const messageCount = parseInt(countResult.rows[0].count);
    if (messageCount >= 5) {
      return res.status(429).json({
        message: 'Message limit reached. You can send up to 5 messages per hour per coordinator level.',
        code: 'RATE_LIMIT_HOURLY',
        remaining: 0,
      });
    }

    // Check 60-second cooldown
    const lastMessageResult = await query(
      `SELECT created_at FROM leadership_messages
       WHERE sender_id = $1
         AND recipient_level = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, recipientLevel]
    );

    if (lastMessageResult.rows[0]) {
      const elapsed = Date.now() - new Date(lastMessageResult.rows[0].created_at).getTime();
      if (elapsed < 60000) {
        const waitSeconds = Math.ceil((60000 - elapsed) / 1000);
        return res.status(429).json({
          message: `Please wait ${waitSeconds} seconds before sending another message.`,
          code: 'RATE_LIMIT_COOLDOWN',
          waitSeconds,
        });
      }
    }

    // Attach remaining count for frontend display
    req.chatRateInfo = { remaining: 4 - messageCount };
    next();
  } catch (error) {
    console.error('Error checking chat rate limit:', error);
    // Don't block on rate limit errors — let the message through
    next();
  }
};

// ── Get unread message count (for widget badge) ─────────────────────────────
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // For coordinators: count unread messages assigned to them
    const coordinatorDesignations = [
      'National Coordinator',
      'State Coordinator',
      'LGA Coordinator',
      'Ward Coordinator',
    ];

    let unreadCount = 0;

    if (coordinatorDesignations.includes(req.user.designation)) {
      // Coordinator: messages assigned to them that are unread
      const result = await query(
        `SELECT COUNT(*) FROM leadership_messages
         WHERE assigned_to = $1
           AND status NOT IN ('read', 'responded')`,
        [userId]
      );
      unreadCount = parseInt(result.rows[0].count);
    } else {
      // Regular user: responses to their messages they haven't seen
      const result = await query(
        `SELECT COUNT(*) FROM leadership_messages
         WHERE sender_id = $1
           AND status = 'responded'
           AND responded_at > COALESCE(
             (SELECT MAX(created_at) FROM leadership_messages WHERE sender_id = $1 AND status = 'read'),
             '1970-01-01'
           )`,
        [userId]
      );
      unreadCount = parseInt(result.rows[0].count);
    }

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
};
