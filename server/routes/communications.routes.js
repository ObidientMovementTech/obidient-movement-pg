import express from 'express';
import {
  createSmsCampaignHandler,
  createVoiceCampaignHandler,
  registerAudioAsset,
  listAudioAssets,
  listCampaigns,
  getCampaignSummaryHandler,
  cancelCampaignHandler,
  smsDeliveryWebhook,
  voiceStatusWebhook
} from '../controllers/communications.controller.js';
import { authenticateUser, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/sms', authenticateUser, isAdmin, createSmsCampaignHandler);
router.post('/voice', authenticateUser, isAdmin, createVoiceCampaignHandler);
router.post('/audio-assets', authenticateUser, isAdmin, registerAudioAsset);
router.get('/audio-assets', authenticateUser, isAdmin, listAudioAssets);
router.get('/campaigns', authenticateUser, isAdmin, listCampaigns);
router.get('/campaigns/:id', authenticateUser, isAdmin, getCampaignSummaryHandler);
router.post('/campaigns/:id/cancel', authenticateUser, isAdmin, cancelCampaignHandler);

router.post('/webhooks/sms', smsDeliveryWebhook);
router.post('/webhooks/voice', voiceStatusWebhook);

export default router;
