import express from 'express';
import {
  createVotingBloc,
  joinVotingBloc,
  getOwnedVotingBlocs,
  getJoinedVotingBlocs,
  deleteVotingBloc,
  updateVotingBloc,
  getVotingBlocById,
  uploadVotingBlocBannerImage,
  getVotingBlocByJoinCode,
  uploadRichDescriptionImage,
  getAllVotingBlocs,
  sendInvitation,
  getLeaderboard,
  leaveVotingBloc,
  getVotingBlocInvitations,
  sendMemberInvitation,
  sendBroadcastMessage,
  removeMember,
  getMemberEngagement,
  sendPrivateMessage,
  resendInvitation,
  updateMemberTags,
  getMemberMetadata,
  clearRespondedInvitations,
} from '../controllers/votingBloc.controller.js';

import { protect } from '../middlewares/auth.middleware.js';
import { parseFileUpload } from '../utils/s3Upload.js';

const router = express.Router();

// Get all voting blocs in the platform
router.get('/', getAllVotingBlocs);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Create new voting bloc (KYC protected)
router.post('/', protect, createVotingBloc);

// Get all voting blocs owned by current user
router.get('/owned', protect, getOwnedVotingBlocs);

// Get all voting blocs user has joined
router.get('/joined', protect, getJoinedVotingBlocs);

// Upload banner image
router.post('/upload-banner', protect, parseFileUpload('file'), uploadVotingBlocBannerImage);

// Upload rich description image
router.post('/upload-rich-description-image', protect, parseFileUpload('file'), uploadRichDescriptionImage);

// Join voting bloc
router.post('/join', protect, joinVotingBloc);

// Send invitation
router.post('/invite', protect, sendInvitation);

// Get voting bloc by join code (more specific route)
router.get('/join-code/:joinCode', getVotingBlocByJoinCode);

// Get voting bloc by ID (public route for viewing)
router.get('/:id', getVotingBlocById);

// Update voting bloc
router.put('/:id', protect, updateVotingBloc);

// Delete voting bloc
router.delete('/:id', protect, deleteVotingBloc);

// Leave voting bloc
router.post('/:id/leave', protect, leaveVotingBloc);

// Get voting bloc invitations with status
router.get('/:id/invitations', protect, getVotingBlocInvitations);

// Send member invitation via email/phone
router.post('/:id/invite-member', protect, sendMemberInvitation);

// Resend invitation
router.post('/:id/resend-invitation', protect, resendInvitation);

// Clear responded invitations from history
router.delete('/:id/invitations/clear-history', protect, clearRespondedInvitations);

// Send broadcast message to all members
router.post('/:id/broadcast', protect, sendBroadcastMessage);

// Remove member from voting bloc
router.delete('/:id/members/:memberId', protect, removeMember);

// Get member engagement analytics
router.get('/:id/engagement', protect, getMemberEngagement);

// Get member metadata with tags
router.get('/:id/member-metadata', protect, getMemberMetadata);

// Update member tags (decision and contact tags)
router.put('/:id/members/:memberId/tags', protect, updateMemberTags);

// Send private message to a member
router.post('/:id/members/:memberId/message', protect, sendPrivateMessage);

export default router;
