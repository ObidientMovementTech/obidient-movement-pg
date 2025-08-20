import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { adminUserManagementController } from '../controllers/adminUserManagement.controller.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Get all users with pagination and filters
router.get('/users', adminUserManagementController.getAllUsers);

// Get user statistics
router.get('/users/statistics', adminUserManagementController.getUserStatistics);

// Fast search for typeahead/autocomplete
router.get('/users/search', adminUserManagementController.fastSearch);

// Get single user details
router.get('/users/:userId', adminUserManagementController.getUserDetails);

// Update user role
router.patch('/users/:userId/role', adminUserManagementController.updateUserRole);

// Update user status (email verification, suspension, etc.)
router.patch('/users/:userId/status', adminUserManagementController.updateUserStatus);

// Update user profile
router.patch('/users/:userId/profile', adminUserManagementController.updateUserProfile);

// Force password reset for a user
router.post('/users/:userId/force-password-reset', adminUserManagementController.forcePasswordReset);

// Create new user
router.post('/users', adminUserManagementController.createUser);

// Delete user (with complete cleanup)
router.delete('/users/:userId', adminUserManagementController.deleteUser);

// Bulk operations
router.post('/users/bulk', adminUserManagementController.bulkUpdateUsers);

// Email verification management
router.get('/users/unverified/stats', adminUserManagementController.getUnverifiedUsersStats);
router.post('/users/:userId/resend-verification', adminUserManagementController.resendVerificationEmail);
router.post('/users/resend-all-verification', adminUserManagementController.resendAllVerificationEmails);

// Update user designation and assignment
router.put('/users/:userId/designation', adminUserManagementController.updateUserDesignation);


export default router;
