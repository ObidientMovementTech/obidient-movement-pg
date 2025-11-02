import express from 'express';
import {
  getAvailableStates,
  getLgasForState,
  getVoterCount
} from '../controllers/location.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect, isAdmin);

// Get all available states
router.get('/states', getAvailableStates);

// Get LGAs for a specific state
router.get('/states/:state/lgas', getLgasForState);

// Get voter count for state and LGAs (POST because we're sending an array)
router.post('/voter-count', getVoterCount);

export default router;
