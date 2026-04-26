import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  searchUsers,
  assignDesignation,
  getSubordinates,
  removeDesignation,
} from '../controllers/coordinatorAssignment.controller.js';

const router = Router();

// All routes require authentication (coordinator check is inside each handler)
router.use(protect);

router.get('/search', searchUsers);
router.post('/assign', assignDesignation);
router.get('/subordinates', getSubordinates);
router.post('/remove', removeDesignation);

export default router;
