import express from 'express';
import resultsDashboardController from '../controllers/resultsDashboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * GET /api/results-dashboard/elections
 * Get all active elections for results viewing
 */
router.get('/elections', resultsDashboardController.getActiveElectionsForResults);

/**
 * GET /api/results-dashboard/elections/:electionId/hierarchy
 * Get hierarchical results structure (LGA -> Ward -> PU)
 */
router.get('/elections/:electionId/hierarchy', resultsDashboardController.getElectionResultsHierarchy);

/**
 * GET /api/results-dashboard/elections/:electionId/polling-unit/:submissionId
 * Get detailed polling unit information
 */
router.get('/elections/:electionId/polling-unit/:submissionId', resultsDashboardController.getPollingUnitDetails);

export default router;
