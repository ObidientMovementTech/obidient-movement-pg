import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { transformNotification, transformUser } from '../utils/mongoCompat.js';

/**
 * Get notifications for the authenticated user.
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findByRecipient(req.userId, {
      limit: 50,
      offset: 0,
      orderBy: 'createdAt',
      orderDirection: 'DESC'
    });

    return res.status(200).json(transformNotification(notifications));
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/**
 * Mark a specific notification as read.
 */
export const markAsRead = async (req, res) => {
  try {
    const updated = await Notification.findAndUpdate(
      { id: req.params.id, recipient: req.userId },
      { read: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification not found or unauthorized" });
    }

    res.status(200).json({
      message: "Marked as read",
      notification: transformNotification(updated)
    });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};


export const deleteNotification = async (req, res) => {
  try {
    // First check if notification exists and belongs to user
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.recipient !== req.userId) {
      return res.status(404).json({ message: "Notification not found or unauthorized" });
    }

    const deleted = await Notification.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

/**
 * Mark all user notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.markAllAsReadForUser(req.userId);

    res.status(200).json({
      message: "All notifications marked as read",
      updated: result.updatedCount
    });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

/**
 * Get user notification settings
 */
export const getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get notification settings or return defaults
    const settings = await User.getNotificationSettings(req.userId);

    res.status(200).json(transformUser(settings));
  } catch (err) {
    console.error("Get notification settings error:", err);
    res.status(500).json({ message: "Failed to get notification settings" });
  }
};

/**
 * Update user notification settings
 */
export const updateNotificationSettings = async (req, res) => {
  try {
    const { email, push, website } = req.body;

    if (!email || !push || !website) {
      return res.status(400).json({
        message: "Invalid request. Please provide email, push, and website settings."
      });
    }

    const updated = await User.updateNotificationSettings(req.userId, {
      email,
      push,
      website
    });

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Notification settings updated successfully",
      settings: transformUser(updated)
    });
  } catch (err) {
    console.error("Update notification settings error:", err);
    res.status(500).json({ message: "Failed to update notification settings" });
  }
};

/**
 * Delete multiple notifications by IDs
 */
export const deleteSelectedNotifications = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No notification IDs provided" });
    }

    const result = await Notification.deleteMultiple(ids, req.userId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No notifications found or authorized to delete" });
    }

    res.status(200).json({
      message: "Notifications deleted successfully",
      count: result.deletedCount
    });
  } catch (err) {
    console.error("Delete selected notifications error:", err);
    res.status(500).json({ message: "Failed to delete notifications" });
  }
};
