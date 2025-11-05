import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { getLiveSummary, invalidateCache } from '../controllers/liveResults.controller.js';

const router = express.Router();

// ================================
// PUBLIC LIVE RESULTS (requires auth but not monitoring key)
// ================================

// Get live election summary with caching
router.get('/elections/:electionId/live-summary', protect, getLiveSummary);

// ================================
// ADMIN CACHE MANAGEMENT
// ================================

// Invalidate cache for an election (admin only)
router.post('/elections/:electionId/invalidate-cache', protect, isAdmin, invalidateCache);

export default router;
