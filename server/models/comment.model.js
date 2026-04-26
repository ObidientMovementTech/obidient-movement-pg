import { query } from '../config/db.js';

const VALID_TARGET_TYPES = ['blog_post', 'mobile_feed'];

const Comment = {
  /**
   * Create a comment (or reply if parentId provided).
   */
  async create(userId, targetType, targetId, content, parentId = null) {
    if (!VALID_TARGET_TYPES.includes(targetType)) {
      throw new Error(`Invalid target_type: ${targetType}`);
    }

    const result = await query(
      `INSERT INTO comments (user_id, target_type, target_id, content, parent_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, targetType, String(targetId), content, parentId]
    );
    return result.rows[0];
  },

  /**
   * Get comments for a target (paginated, with user info).
   * Returns top-level comments; replies can be fetched separately.
   */
  async getForTarget(targetType, targetId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;

    const [comments, countResult] = await Promise.all([
      query(
        `SELECT c.*, u.name AS user_name, u."profileImage" AS user_image
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.target_type = $1 AND c.target_id = $2
           AND c.parent_id IS NULL AND c.is_deleted = FALSE
         ORDER BY c.created_at DESC
         LIMIT $3 OFFSET $4`,
        [targetType, String(targetId), limit, offset]
      ),
      query(
        `SELECT COUNT(*)::int AS count FROM comments
         WHERE target_type = $1 AND target_id = $2
           AND parent_id IS NULL AND is_deleted = FALSE`,
        [targetType, String(targetId)]
      ),
    ]);

    return {
      comments: comments.rows,
      total: countResult.rows[0].count,
      page,
      pages: Math.ceil(countResult.rows[0].count / limit),
    };
  },

  /**
   * Get replies for a parent comment.
   */
  async getReplies(parentId, { limit = 50 } = {}) {
    const result = await query(
      `SELECT c.*, u.name AS user_name, u."profileImage" AS user_image
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.parent_id = $1 AND c.is_deleted = FALSE
       ORDER BY c.created_at ASC
       LIMIT $2`,
      [parentId, limit]
    );
    return result.rows;
  },

  /**
   * Soft-delete a comment (only the author can delete).
   */
  async softDelete(commentId, userId) {
    const result = await query(
      `UPDATE comments SET is_deleted = TRUE, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [commentId, userId]
    );
    return result.rows[0] || null;
  },

  /**
   * Get comment count for a target.
   */
  async getCount(targetType, targetId) {
    const result = await query(
      `SELECT COUNT(*)::int AS count FROM comments
       WHERE target_type = $1 AND target_id = $2 AND is_deleted = FALSE`,
      [targetType, String(targetId)]
    );
    return result.rows[0].count;
  },

  /**
   * Batch: get comment counts for multiple targets.
   */
  async getCountBatch(targetType, targetIds) {
    if (!targetIds.length) return {};

    const stringIds = targetIds.map(String);
    const result = await query(
      `SELECT target_id, COUNT(*)::int AS count
       FROM comments
       WHERE target_type = $1 AND target_id = ANY($2) AND is_deleted = FALSE
       GROUP BY target_id`,
      [targetType, stringIds]
    );

    const map = {};
    for (const id of stringIds) map[id] = 0;
    for (const row of result.rows) map[row.target_id] = row.count;
    return map;
  },
};

export default Comment;
