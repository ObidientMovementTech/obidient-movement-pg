import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteSelectedNotifications,
  getNotificationSettings,
  updateNotificationSettings
} from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js"; // adjust to your actual middleware file

const router = express.Router();

// Get notifications for the logged-in user
router.get("/", protect, getNotifications);

// Mark a specific notification as read
router.put("/:id/read", protect, markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", protect, markAllAsRead);

// Delete a notification
router.delete("/:id", protect, deleteNotification);

// Delete multiple notifications
router.delete("/", protect, deleteSelectedNotifications);

// Get notification settings
router.get("/settings", protect, getNotificationSettings);

// Update notification settings
router.put("/settings", protect, updateNotificationSettings);

export default router;
