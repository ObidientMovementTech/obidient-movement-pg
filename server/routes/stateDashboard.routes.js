import express from 'express';
import stateDashboardController from '../controllers/stateDashboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Add debugging middleware
router.use((req, res, next) => {
  console.log(`State Dashboard Route: ${req.method} ${req.path}`);
  next();
});

// All routes require authentication only
router.use(protect);

// Test route for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'State Dashboard routes are working!', user: req.user });
});

// Get dashboard data based on user's designation and scope
router.get('/data', (req, res) => {
  console.log('Data endpoint hit!');
  stateDashboardController.getDashboardData(req, res);
});

// Get subordinate coordinators based on user's level
router.get('/subordinates', (req, res) => {
  console.log('Subordinates endpoint hit!');
  stateDashboardController.getSubordinateCoordinators(req, res);
});

// Get Obidient voter data aggregated by voting locations
router.get('/voters', (req, res) => {
  console.log('Voters endpoint hit!');
  stateDashboardController.getObidientVoterData(req, res);
});

export default router;
