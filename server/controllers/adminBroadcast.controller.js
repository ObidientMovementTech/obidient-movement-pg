import AdminBroadcast from "../models/adminBroadcast.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { transformUser, transformBroadcast } from '../utils/mongoCompat.js';
import { sendAdminBroadcastEmail, sendAdminPrivateMessage } from '../utils/emailHandler.js';

/**
 * Send a general broadcast message to all users
 */
export const sendAdminBroadcast = async (req, res) => {
  const { title, message } = req.body;
  const sentBy = req.userId; // extracted from token via middleware

  if (!title || !message) {
    return res.status(400).json({ message: "Title and message are required" });
  }

  try {
    // Verify the user is an admin
    const admin = await User.findById(sentBy);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin privileges required" });
    }

    // Create the broadcast message
    const newBroadcast = await AdminBroadcast.create({ title, message, sentBy });

    // Get all users except the sender (PostgreSQL query)
    const users = await User.findAll({
      excludeUserId: sentBy,
      // Only send to users who have broadcast notifications enabled
      // For now, send to all users since notification preferences might not be implemented yet
    });

    // Create notifications for each user and prepare email recipients
    const notifications = await Promise.all(
      users.map((user) =>
        Notification.create({
          recipient: user.id,
          type: "adminBroadcast",
          title,
          message
        })
      )
    );

    // Send emails to all users
    const emailResult = await sendAdminBroadcastEmail(
      admin.name,
      title,
      message,
      users.map(user => ({
        name: user.name,
        email: user.email
      })),
      'announcement'
    );

    return res.status(201).json({
      success: true,
      broadcast: {
        _id: newBroadcast.id,
        title: newBroadcast.title,
        message: newBroadcast.message,
        sentBy: newBroadcast.sentBy,
        createdAt: newBroadcast.createdAt
      },
      notificationsSent: notifications.length,
      emailsSent: emailResult.successful,
      emailsFailed: emailResult.failed
    });
  } catch (error) {
    console.error("Admin broadcast error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all admin broadcasts
 */
export const getAdminBroadcasts = async (req, res) => {
  try {
    // Verify the user is an admin
    const admin = await User.findById(req.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin privileges required" });
    }

    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const broadcasts = await AdminBroadcast.findAll({
      limit,
      offset,
      orderBy: 'createdAt',
      orderDirection: 'DESC'
    });

    // Transform for frontend compatibility
    const transformedBroadcasts = broadcasts.map(broadcast => {
      const broadcastData = broadcast.toObject ? broadcast.toObject() : broadcast;
      return {
        ...transformBroadcast(broadcastData),
        sentBy: {
          _id: broadcast.sentBy,
          username: broadcast.senderName || 'Unknown',
          firstName: broadcast.senderName?.split(' ')[0] || 'Unknown',
          lastName: broadcast.senderName?.split(' ').slice(1).join(' ') || ''
        }
      };
    });

    res.status(200).json(transformedBroadcasts);
  } catch (error) {
    console.error("Error getting admin broadcasts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendPrivateMessage = async (req, res) => {
  const { userId, title, message, messageType = 'notice' } = req.body;
  const sentBy = req.userId; // extracted from token via middleware

  if (!userId || !title || !message) {
    return res.status(400).json({ message: "User ID, title, and message are required" });
  }

  try {
    // Verify the sender is an admin
    const admin = await User.findById(sentBy);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin privileges required" });
    }

    // Get the recipient user
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

    // Create a notification for the user
    const notification = await Notification.create({
      recipient: userId,
      type: "adminBroadcast", // Using adminBroadcast type since it's supported by the DB
      title,
      message
    });

    // Send the email
    const emailResult = await sendAdminPrivateMessage(
      recipient.name,
      recipient.email,
      admin.name,
      title,
      message,
      messageType
    );

    return res.status(201).json({
      success: true,
      message: "Private message sent successfully",
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt
      },
      emailSent: true
    });
  } catch (error) {
    console.error("Error sending private message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a specific admin broadcast by ID
 */
export const getAdminBroadcastById = async (req, res) => {
  try {
    // Verify the user is an admin
    const admin = await User.findById(req.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin privileges required" });
    }

    const broadcast = await AdminBroadcast.findById(req.params.id);

    if (!broadcast) {
      return res.status(404).json({ message: "Broadcast not found" });
    }

    // Transform for frontend compatibility
    const transformedBroadcast = {
      ...transformBroadcast(broadcast.toObject()),
      sentBy: {
        _id: broadcast.sentBy,
        username: broadcast.senderName || 'Unknown',
        firstName: broadcast.senderName?.split(' ')[0] || 'Unknown',
        lastName: broadcast.senderName?.split(' ').slice(1).join(' ') || ''
      }
    };

    res.status(200).json(transformedBroadcast);
  } catch (error) {
    console.error("Error getting admin broadcast:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update an admin broadcast
 */
export const updateAdminBroadcast = async (req, res) => {
  const { title, message } = req.body;

  if (!title && !message) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  try {
    // Verify the user is an admin
    const admin = await User.findById(req.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin privileges required" });
    }

    const broadcast = await AdminBroadcast.findById(req.params.id);

    if (!broadcast) {
      return res.status(404).json({ message: "Broadcast not found" });
    }

    // Update the broadcast using PostgreSQL method
    const updateData = {};
    if (title) updateData.title = title;
    if (message) updateData.message = message;

    const updatedBroadcast = await AdminBroadcast.findByIdAndUpdate(
      req.params.id,
      updateData
    );

    if (!updatedBroadcast) {
      return res.status(404).json({ message: "Broadcast not found" });
    }

    // Transform for frontend compatibility
    const transformedBroadcast = {
      ...transformBroadcast(updatedBroadcast.toObject()),
      sentBy: {
        _id: updatedBroadcast.sentBy,
        username: updatedBroadcast.senderName || 'Unknown',
        firstName: updatedBroadcast.senderName?.split(' ')[0] || 'Unknown',
        lastName: updatedBroadcast.senderName?.split(' ').slice(1).join(' ') || ''
      }
    };

    res.status(200).json(transformedBroadcast);
  } catch (error) {
    console.error("Error updating admin broadcast:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete an admin broadcast
 */
export const deleteAdminBroadcast = async (req, res) => {
  try {
    // Verify the user is an admin
    const admin = await User.findById(req.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin privileges required" });
    }

    const broadcast = await AdminBroadcast.findById(req.params.id);

    if (!broadcast) {
      return res.status(404).json({ message: "Broadcast not found" });
    }

    await AdminBroadcast.deleteById(req.params.id);

    res.status(200).json({ message: "Broadcast deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin broadcast:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
