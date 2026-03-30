import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { getSetting, updateSetting, getAllSettings } from '../controllers/appSettings.controller.js';

const router = express.Router();

// Public: get a single setting by key
router.get('/:key', getSetting);

// Admin: get all settings
router.get('/', protect, isAdmin, getAllSettings);

// Admin: update a setting
router.put('/:key', protect, isAdmin, updateSetting);

export default router;
