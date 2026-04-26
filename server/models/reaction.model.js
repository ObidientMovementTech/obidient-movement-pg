import { query } from '../config/db.js';

const VALID_REACTION_TYPES = ['like', 'love', 'smile', 'meh'];
const VALID_TARGET_TYPES = ['blog_post', 'mobile_feed'];

const Reaction = {
  /**
   * Toggle a reaction: same reaction = remove, different = switch, none = add.
   * Returns { action: 'added'|'removed'|'changed', reaction?, counts }
   */
  async toggle(userId, targetType, targetId, reactionType) {
    if (!VALID_TARGET_TYPES.includes(targetType)) {
      throw new Error(`Invalid target_type: ${targetType}`);
    }
    if (!VALID_REACTION_TYPES.includes(reactionType)) {
      throw new Error(`Invalid reaction_type: ${reactionType}`);
    }

    // Check existing reaction
    const existing = await query(
      `SELECT id, reaction_type FROM reactions
       WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
      [userId, targetType, String(targetId)]
    );

    let action;
    let reaction = null;

    if (existing.rows.length > 0) {
      const current = existing.rows[0];

      if (current.reaction_type === reactionType) {
        // Same reaction → remove (un-react)
        await query('DELETE FROM reactions WHERE id = $1', [current.id]);
        action = 'removed';
      } else {
        // Different reaction → switch
        const updated = await query(
          `UPDATE reactions SET reaction_type = $1, created_at = NOW()
           WHERE id = $2 RETURNING *`,
          [reactionType, current.id]
        );
        action = 'changed';
        reaction = updated.rows[0];
      }
    } else {
      // No existing reaction → add
      const inserted = await query(
        `INSERT INTO reactions (user_id, target_type, target_id, reaction_type)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, targetType, String(targetId), reactionType]
      );
      action = 'added';
      reaction = inserted.rows[0];
    }

    // Return fresh counts
    const counts = await this.getForTarget(targetType, targetId);

    return { action, reaction, counts };
  },

  /**
   * Get aggregated reaction counts for a single target.
   * Returns { like: N, love: N, smile: N, meh: N, total: N }
   */
  async getForTarget(targetType, targetId) {
    const result = await query(
      `SELECT reaction_type, COUNT(*)::int AS count
       FROM reactions
       WHERE target_type = $1 AND target_id = $2
       GROUP BY reaction_type`,
      [targetType, String(targetId)]
    );

    const counts = { like: 0, love: 0, smile: 0, meh: 0, total: 0 };
    for (const row of result.rows) {
      counts[row.reaction_type] = row.count;
      counts.total += row.count;
    }
    return counts;
  },

  /**
   * Batch: get aggregated counts for multiple targets of the same type.
   * Returns { [targetId]: { like, love, smile, meh, total } }
   */
  async getForTargetBatch(targetType, targetIds) {
    if (!targetIds.length) return {};

    const stringIds = targetIds.map(String);
    const result = await query(
      `SELECT target_id, reaction_type, COUNT(*)::int AS count
       FROM reactions
       WHERE target_type = $1 AND target_id = ANY($2)
       GROUP BY target_id, reaction_type`,
      [targetType, stringIds]
    );

    // Initialize all targets with zero counts
    const map = {};
    for (const id of stringIds) {
      map[id] = { like: 0, love: 0, smile: 0, meh: 0, total: 0 };
    }

    for (const row of result.rows) {
      if (map[row.target_id]) {
        map[row.target_id][row.reaction_type] = row.count;
        map[row.target_id].total += row.count;
      }
    }
    return map;
  },

  /**
   * Get the current user's reaction for a single target (or null).
   */
  async getUserReaction(userId, targetType, targetId) {
    const result = await query(
      `SELECT reaction_type FROM reactions
       WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
      [userId, targetType, String(targetId)]
    );
    return result.rows[0]?.reaction_type || null;
  },

  /**
   * Batch: get the user's reactions for multiple targets.
   * Returns { [targetId]: reactionType|null }
   */
  async getUserReactionsBatch(userId, targetType, targetIds) {
    if (!targetIds.length) return {};

    const stringIds = targetIds.map(String);
    const result = await query(
      `SELECT target_id, reaction_type FROM reactions
       WHERE user_id = $1 AND target_type = $2 AND target_id = ANY($3)`,
      [userId, targetType, stringIds]
    );

    const map = {};
    for (const id of stringIds) {
      map[id] = null;
    }
    for (const row of result.rows) {
      map[row.target_id] = row.reaction_type;
    }
    return map;
  },
};

export default Reaction;
