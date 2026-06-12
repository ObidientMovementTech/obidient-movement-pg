import { Router } from 'express';
import { protect, isAdmin, optionalAuth } from '../middlewares/auth.middleware.js';
import { parseFileUpload } from '../utils/s3Upload.js';
import {
  getSentNewsletters,
  getNewsletterBySlug,
  unsubscribeByToken,
  getSubscriptionStatus,
  toggleSubscription,
  getAllNewsletters,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  getRecipientCount,
  sendTestEmail,
  sendNewsletter,
  publishNewsletter,
  uploadNewsletterImage,
  streamNewsletterProgress,
} from '../controllers/newsletter.controller.js';

const router = Router();

// ── Public endpoints (no auth required) ─────────────────────────────────────

// GET /api/newsletter/issues — List sent newsletters (paginated)
router.get('/issues', getSentNewsletters);

// GET /api/newsletter/issues/:slug — Get a single sent newsletter by slug
router.get('/issues/:slug', getNewsletterBySlug);

// GET /api/newsletter/unsubscribe — Unsubscribe via token (no auth)
router.get('/unsubscribe', unsubscribeByToken);

// ── User subscription endpoints (auth required) ────────────────────────────

// GET /api/newsletter/subscription — Get current user's subscription status
router.get('/subscription', protect, getSubscriptionStatus);

// PUT /api/newsletter/subscription — Toggle subscription
router.put('/subscription', protect, toggleSubscription);

// ── Admin endpoints (admin auth required) ───────────────────────────────────

// GET /api/newsletter/admin/all — List all newsletters (any status)
router.get('/admin/all', protect, isAdmin, getAllNewsletters);

// GET /api/newsletter/admin/recipient-count — Get eligible recipient count
router.get('/admin/recipient-count', protect, isAdmin, getRecipientCount);

// POST /api/newsletter/admin — Create a new newsletter
router.post('/admin', protect, isAdmin, createNewsletter);

// PUT /api/newsletter/admin/:id — Update a newsletter
router.put('/admin/:id', protect, isAdmin, updateNewsletter);

// DELETE /api/newsletter/admin/:id — Delete a newsletter (drafts only)
router.delete('/admin/:id', protect, isAdmin, deleteNewsletter);

// POST /api/newsletter/admin/:id/send-test — Send test email to admin
router.post('/admin/:id/send-test', protect, isAdmin, sendTestEmail);

// POST /api/newsletter/admin/:id/publish — Publish without sending emails
router.post('/admin/:id/publish', protect, isAdmin, publishNewsletter);

// POST /api/newsletter/admin/:id/send — Send newsletter to all eligible users
router.post('/admin/:id/send', protect, isAdmin, sendNewsletter);

// GET /api/newsletter/admin/:id/progress/stream — SSE progress stream
router.get('/admin/:id/progress/stream', protect, isAdmin, streamNewsletterProgress);

// POST /api/newsletter/admin/upload-image — Upload an image for newsletter content
router.post('/admin/upload-image', protect, isAdmin, parseFileUpload('image'), uploadNewsletterImage);

export default router;
