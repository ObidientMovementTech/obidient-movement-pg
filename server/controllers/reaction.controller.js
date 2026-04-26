import Reaction from '../models/reaction.model.js';

const VALID_TARGET_TYPES = ['blog_post', 'mobile_feed'];
const VALID_REACTION_TYPES = ['like', 'love', 'smile', 'meh'];

/**
 * POST /api/reactions — Toggle a reaction (auth required)
 * Body: { targetType, targetId, reactionType }
 */
export const toggleReaction = async (req, res) => {
  try {
    const { targetType, targetId, reactionType } = req.body;

    if (!targetType || !targetId || !reactionType) {
      return res.status(400).json({
        success: false,
        message: 'targetType, targetId, and reactionType are required',
      });
    }

    if (!VALID_TARGET_TYPES.includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: `targetType must be one of: ${VALID_TARGET_TYPES.join(', ')}`,
      });
    }

    if (!VALID_REACTION_TYPES.includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: `reactionType must be one of: ${VALID_REACTION_TYPES.join(', ')}`,
      });
    }

    const result = await Reaction.toggle(
      req.user.id,
      targetType,
      String(targetId),
      reactionType
    );

    res.json({
      success: true,
      action: result.action,
      reaction: result.reaction,
      counts: result.counts,
    });
  } catch (error) {
    console.error('Error toggling reaction:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle reaction' });
  }
};

/**
 * GET /api/reactions/:targetType/:targetId — Get reaction counts + user's reaction
 */
export const getReactions = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    if (!VALID_TARGET_TYPES.includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: `targetType must be one of: ${VALID_TARGET_TYPES.join(', ')}`,
      });
    }

    const counts = await Reaction.getForTarget(targetType, targetId);

    // If user is authenticated, include their reaction
    let userReaction = null;
    if (req.user) {
      userReaction = await Reaction.getUserReaction(req.user.id, targetType, targetId);
    }

    res.json({ success: true, counts, userReaction });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reactions' });
  }
};

/**
 * POST /api/reactions/batch — Batch get counts + user reactions for multiple targets
 * Body: { targetType, targetIds: string[] }
 */
export const getReactionsBatch = async (req, res) => {
  try {
    const { targetType, targetIds } = req.body;

    if (!targetType || !Array.isArray(targetIds) || !targetIds.length) {
      return res.status(400).json({
        success: false,
        message: 'targetType and targetIds (array) are required',
      });
    }

    if (!VALID_TARGET_TYPES.includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: `targetType must be one of: ${VALID_TARGET_TYPES.join(', ')}`,
      });
    }

    // Cap batch size to prevent abuse
    const ids = targetIds.slice(0, 100).map(String);

    const countsMap = await Reaction.getForTargetBatch(targetType, ids);

    // If user is authenticated, include their reactions
    let userReactionsMap = {};
    if (req.user) {
      userReactionsMap = await Reaction.getUserReactionsBatch(req.user.id, targetType, ids);
    }

    // Merge into response
    const reactions = {};
    for (const id of ids) {
      reactions[id] = {
        counts: countsMap[id] || { like: 0, love: 0, smile: 0, meh: 0, total: 0 },
        userReaction: userReactionsMap[id] || null,
      };
    }

    res.json({ success: true, reactions });
  } catch (error) {
    console.error('Error fetching reactions batch:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reactions' });
  }
};
