import express from 'express';
import { sendBroadcast, getBroadcasts } from '../controllers/broadcast.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/send', protect, sendBroadcast);

export default router;
