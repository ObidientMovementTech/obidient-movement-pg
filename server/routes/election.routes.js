import express from 'express';
import electionController from '../controllers/election.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All election routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', electionController.getElections);
router.get('/dashboard-stats', electionController.getDashboardStats);
router.get('/:id', electionController.getElectionById);
router.get('/:id/stats', electionController.getElectionStats);

// Admin-only routes
router.use(isAdmin);
router.post('/', electionController.createElection);
router.put('/:id', electionController.updateElection);
router.patch('/:id/status', electionController.updateElectionStatus);
router.delete('/:id', electionController.deleteElection);

export default router;
