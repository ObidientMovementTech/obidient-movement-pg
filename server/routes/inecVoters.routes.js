import express from 'express';
import {
  getINECVoters,
  getINECVotersStats,
  getLocationHierarchy
} from '../controllers/inecVoters.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

// INEC Voters routes - All require admin authentication
router.get('/', authenticateUser, getINECVoters);
router.get('/stats', authenticateUser, getINECVotersStats);
router.get('/locations', authenticateUser, getLocationHierarchy);

export default router;