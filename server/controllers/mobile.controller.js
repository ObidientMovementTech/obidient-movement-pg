import { query } from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendPushNotification, sendBroadcastPush } from '../services/pushNotificationService.js';
import { uploadBufferToS3 } from '../utils/s3Upload.js';
import Notification from '../models/notification.model.js';

// Mobile Authentication
const mobileLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user with mobile context
    const userResult = await query(`
      SELECT id, name, email, "passwordHash", role, designation,
             "assignedState", "assignedLGA", "assignedWard",
             push_notifications_enabled, mobile_last_seen
      FROM users 
      WHERE email = $1 AND "emailVerified" = true
    `, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or email not verified'
      });
    }

    const user = userResult.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update mobile last seen
    await query(
      'UPDATE users SET mobile_last_seen = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isMobile: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user data without password
    delete user.passwordHash;

    res.json({
      success: true,
      token,
      user: {
        ...user,
        assignedState: user.assignedState,
        assignedLGA: user.assignedLGA,
        assignedWard: user.assignedWard
      }
    });

  } catch (error) {
    console.error('Mobile login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Get Mobile Feeds/Alerts
const getMobileFeeds = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const feeds = await query(`
      SELECT 
        id, 
        title, 
        message, 
        feed_type, 
        priority, 
        image_url, 
        published_at,
        created_at
      FROM mobile_feeds 
      ORDER BY priority DESC, published_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count for pagination
    const countResult = await query('SELECT COUNT(*) FROM mobile_feeds');
    const totalFeeds = parseInt(countResult.rows[0].count);
    const hasMore = offset + feeds.rows.length < totalFeeds;

    res.json({
      success: true,
      feeds: feeds.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalFeeds,
        hasMore
      }
    });

  } catch (error) {
    console.error('Error fetching mobile feeds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feeds'
    });
  }
};

// Send Message to Leadership
const sendLeadershipMessage = async (req, res) => {
  try {
    const { recipientLevel, subject, message } = req.body;
    const senderId = req.user.id;

    // Validate recipient level
    const validLevels = ['peter_obi', 'national', 'state', 'lga', 'ward'];
    if (!validLevels.includes(recipientLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient level'
      });
    }

    // Get sender's location for routing
    const senderResult = await query(`
      SELECT "assignedState", "assignedLGA", "assignedWard"
      FROM users WHERE id = $1
    `, [senderId]);

    const senderLocation = senderResult.rows[0];
    const recipientLocation = {
      state: senderLocation.assignedState,
      lga: senderLocation.assignedLGA,
      ward: senderLocation.assignedWard
    };

    // Insert message (trigger will auto-assign if coordinator found)
    const result = await query(`
      INSERT INTO leadership_messages (
        sender_id, 
        recipient_level, 
        recipient_location, 
        subject, 
        message
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, status, assigned_to, created_at
    `, [
      senderId,
      recipientLevel,
      JSON.stringify(recipientLocation),
      subject,
      message
    ]);

    res.json({
      success: true,
      messageId: result.rows[0].id,
      status: result.rows[0].status,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error sending leadership message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Get User's Messages
const getMyMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const messages = await query(`
      SELECT 
        lm.id,
        lm.recipient_level,
        lm.subject,
        lm.message,
        lm.status,
        lm.response,
        lm.responded_at,
        lm.created_at,
        u.name as assigned_to_name
      FROM leadership_messages lm
      LEFT JOIN users u ON lm.assigned_to = u.id
      WHERE lm.sender_id = $1
      ORDER BY lm.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    res.json({
      success: true,
      messages: messages.rows
    });

  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Register Push Token
const registerPushToken = async (req, res) => {
  try {
    const { token, platform, appVersion = '1.0.0' } = req.body;
    const userId = req.user.id;

    if (!token || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Token and platform are required'
      });
    }

    await query(`
      INSERT INTO push_tokens (user_id, token, platform, app_version)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, token) 
      DO UPDATE SET 
        is_active = true, 
        app_version = $4,
        updated_at = NOW()
    `, [userId, token, platform, appVersion]);

    res.json({
      success: true,
      message: 'Push token registered successfully'
    });

  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register push token'
    });
  }
};

// Create Mobile Feed (Admin function)
const createMobileFeed = async (req, res) => {
  try {
    const { title, message, feedType = 'general', priority = 'normal', imageUrl } = req.body;
    const createdBy = req.user.id;

    // Check if user has admin permissions
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const result = await query(`
      INSERT INTO mobile_feeds (title, message, feed_type, priority, image_url, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
    `, [title, message, feedType, priority, imageUrl, createdBy]);

    const feedId = result.rows[0].id;

    // Create unified notifications for all users (web + mobile)
    try {
      const notificationTitle = `🔔 ${feedType === 'urgent' ? '🚨 URGENT' : 'New Update'}`;
      const notificationMessage = title.length > 100 ? title.substring(0, 100) + '...' : title;

      // Get all users to create notifications for
      const usersResult = await query(`
        SELECT id FROM users 
        WHERE "emailVerified" = 'true'
      `);

      console.log(`[MOBILE_FEED] Found ${usersResult.rows.length} users to notify`);

      // Create notification records for all users (simple approach like admin broadcast)
      // const notifications = await Promise.all(
      //   usersResult.rows.map((user) =>
      //     Notification.create({
      //       recipient: user.id,
      //       type: 'feed',
      //       title: notificationTitle,
      //       message: notificationMessage
      //     })
      //   )
      // );

      // console.log(`[MOBILE_FEED] Created ${notifications.length} dashboard notifications`);

      // Send push notifications to mobile users with enabled notifications
      const pushResult = await sendBroadcastPush(
        notificationTitle,
        notificationMessage,
        {
          type: 'feed',
          feedId: feedId.toString(),
          feedType,
          priority
        }
      );

      console.log(`📱 Push notification sent for feed ${feedId}:`, pushResult);
    } catch (error) {
      console.error('Error creating notifications for new feed:', error);
      // Don't fail the feed creation if notification creation fails
    }

    res.json({
      success: true,
      feedId: feedId,
      message: 'Feed created successfully and notifications sent'
    });

  } catch (error) {
    console.error('Error creating mobile feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create feed'
    });
  }
};

// Update User's Push Notification Preferences
const updatePushSettings = async (req, res) => {
  try {
    const { pushNotificationsEnabled } = req.body;
    const userId = req.user.id;

    await query(`
      UPDATE users 
      SET push_notifications_enabled = $1 
      WHERE id = $2
    `, [pushNotificationsEnabled, userId]);

    res.json({
      success: true,
      message: 'Push notification settings updated'
    });

  } catch (error) {
    console.error('Error updating push settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

// Upload image for mobile feed (Admin only)
const uploadMobileFeedImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.file.buffer) {
      return res.status(400).json({ error: 'File buffer is required' });
    }

    // Upload to S3
    const imageUrl = await uploadBufferToS3(
      req.file.buffer,
      req.file.originalname,
      {
        folder: 'mobile_feed_images',
        contentType: req.file.mimetype
      }
    );

    res.json({
      success: true,
      url: imageUrl,
      message: 'Mobile feed image uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading mobile feed image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

// Get Mobile Notifications (reuse web notification system)
const getMobileNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await Notification.findByRecipient(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      orderBy: 'createdAt',
      orderDirection: 'DESC'
    });

    // Transform for mobile response (simple approach - no need for feedId)
    const mobileNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt,
      timestamp: notification.createdAt
    }));

    res.json({
      success: true,
      notifications: mobileNotifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mobileNotifications.length
      }
    });

  } catch (error) {
    console.error('Error fetching mobile notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Mark Mobile Notification as Read
const markMobileNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Notification.findAndUpdate(
      { id: id, recipient: req.user.id },
      { read: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Update Mobile Feed (Admin function)
const updateMobileFeed = async (req, res) => {
  try {
    const { id: feedId } = req.params;
    const { title, message, feedType, priority, imageUrl } = req.body;

    // Check if user has admin permissions
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Check if feed exists
    const existingFeed = await query(
      'SELECT id, title, message FROM mobile_feeds WHERE id = $1',
      [feedId]
    );

    if (existingFeed.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feed not found'
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount}`);
      updateValues.push(title);
      paramCount++;
    }

    if (message !== undefined) {
      updateFields.push(`message = $${paramCount}`);
      updateValues.push(message);
      paramCount++;
    }

    if (feedType !== undefined) {
      updateFields.push(`feed_type = $${paramCount}`);
      updateValues.push(feedType);
      paramCount++;
    }

    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount}`);
      updateValues.push(priority);
      paramCount++;
    }

    if (imageUrl !== undefined) {
      updateFields.push(`image_url = $${paramCount}`);
      updateValues.push(imageUrl);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);

    // Add feed ID as last parameter
    updateValues.push(feedId);

    const updateQuery = `
      UPDATE mobile_feeds 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, message, feed_type, priority, image_url, updated_at
    `;

    const result = await query(updateQuery, updateValues);

    res.json({
      success: true,
      feed: result.rows[0],
      message: 'Feed updated successfully'
    });

  } catch (error) {
    console.error('Error updating mobile feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feed'
    });
  }
};

// Delete Mobile Feed (Admin function)
const deleteMobileFeed = async (req, res) => {
  try {
    const { id: feedId } = req.params;

    // Check if user has admin permissions
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Check if feed exists
    const existingFeed = await query(
      'SELECT id, title FROM mobile_feeds WHERE id = $1',
      [feedId]
    );

    if (existingFeed.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feed not found'
      });
    }

    // Delete the feed
    await query('DELETE FROM mobile_feeds WHERE id = $1', [feedId]);

    // Optional: Clean up related notifications
    try {
      await query(`
        DELETE FROM notifications 
        WHERE type = 'feed' 
        AND message LIKE '%' || $1 || '%'
      `, [existingFeed.rows[0].title]);

      console.log(`🗑️ Cleaned up notifications for deleted feed: ${existingFeed.rows[0].title}`);
    } catch (notificationError) {
      console.warn('Error cleaning up notifications for deleted feed:', notificationError);
      // Don't fail the deletion if notification cleanup fails
    }

    res.json({
      success: true,
      message: 'Feed deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting mobile feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feed'
    });
  }
};

export {
  mobileLogin,
  getMobileFeeds,
  sendLeadershipMessage,
  getMyMessages,
  registerPushToken,
  createMobileFeed,
  updateMobileFeed,
  deleteMobileFeed,
  updatePushSettings,
  uploadMobileFeedImage,
  getMobileNotifications,
  markMobileNotificationRead
};
