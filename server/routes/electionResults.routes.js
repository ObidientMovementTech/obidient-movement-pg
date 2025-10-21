import express from 'express';
import electionResultsController from '../controllers/electionResults.controller.js';

const router = express.Router();

// Public routes - no authentication required for viewing results
// GET /api/election-results/live - All active elections with live results
router.get('/live', electionResultsController.getLiveResults);

// GET /api/election-results/live/:electionId - Specific election live results
router.get('/live/:electionId', electionResultsController.getLiveElectionResults);

// GET /api/election-results/recent - Recent result submissions
router.get('/recent', electionResultsController.getRecentSubmissions);

// GET /api/election-results/state/:state - Results by state
router.get('/state/:state', electionResultsController.getResultsByState);

// GET /api/election-results/:electionId/summary - Quick election summary
router.get('/:electionId/summary', electionResultsController.getElectionSummary);

// GET /api/election-results/:electionId/polling-units - All polling unit results
router.get('/:electionId/polling-units', electionResultsController.getElectionPollingUnitResults);

export default router;
