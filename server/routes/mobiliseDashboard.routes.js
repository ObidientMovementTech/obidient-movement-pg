import express from 'express';
import {
  getUserLevel,
  getNationalData,
  getStateData,
  getLGAData,
  getWardData,
  getPollingUnitData
} from '../controllers/mobiliseDashboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Add debugging middleware
router.use((req, res, next) => {
  console.log(`Mobilise Dashboard Route: ${req.method} ${req.path}`);
  next();
});

// All routes require authentication only
router.use(protect);

// Test route for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'Mobilise Dashboard routes are working!', user: req.user });
});

// Get user's designation level and assigned location
router.get('/user-level', getUserLevel);

// Get National level dashboard data - all states
router.get('/national', getNationalData);

// Get State level dashboard data - all LGAs in a state
router.get('/state/:stateId', getStateData);

// Get LGA level dashboard data - all Wards in an LGA
router.get('/lga/:lgaId', getLGAData);

// Get Ward level dashboard data - all Polling Units in a Ward
router.get('/ward/:wardId', getWardData);

// Get specific Polling Unit details
router.get('/polling-unit/:puId', getPollingUnitData);

export default router;