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
    const { recipientLevel, subject, message, priority = 'normal' } = req.body;
    const senderId = req.user.id;

    // Validate recipient level
    const validLevels = ['peter_obi', 'national', 'state', 'lga', 'ward'];
    if (!validLevels.includes(recipientLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient level'
      });
    }

    // Get sender's information including location and designation
    const senderResult = await query(`
      SELECT 
        name, 
        designation,
        "assignedState", 
        "assignedLGA", 
        "assignedWard",
        "votingState",
        "votingLGA", 
        "votingWard"
      FROM users WHERE id = $1
    `, [senderId]);

    if (senderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    const sender = senderResult.rows[0];

    // Determine recipient location based on sender's voting location (prioritized over assigned location)
    const recipientLocation = {
      state: sender.votingState || sender.assignedState,
      lga: sender.votingLGA || sender.assignedLGA,
      ward: sender.votingWard || sender.assignedWard
    };

    // Find appropriate recipient based on level and location with hierarchical fallback
    let assignedTo = null;
    let actualRecipientLevel = recipientLevel;
    let fallbackMessage = '';

    // Define hierarchy for fallback routing
    const hierarchyFallback = {
      'ward': ['ward', 'lga', 'state', 'national'],
      'lga': ['lga', 'state', 'national'],
      'state': ['state', 'national'],
      'national': ['national'],
      'peter_obi': ['peter_obi']
    };

    const levelsToTry = hierarchyFallback[recipientLevel] || [recipientLevel];

    // Try each level in the hierarchy until we find an available coordinator
    for (const levelToTry of levelsToTry) {
      let recipientQuery = '';
      let queryParams = [];

      switch (levelToTry) {
        case 'peter_obi':
          recipientQuery = `
            SELECT id FROM users 
            WHERE designation = 'Peter Obi' 
            LIMIT 1
          `;
          break;

        case 'national':
          recipientQuery = `
            SELECT id FROM users 
            WHERE designation = 'National Coordinator' 
            LIMIT 1
          `;
          break;

        case 'state':
          recipientQuery = `
            SELECT id FROM users 
            WHERE designation = 'State Coordinator' 
            AND ("votingState" = $1 OR "assignedState" = $1)
            LIMIT 1
          `;
          queryParams = [recipientLocation.state];
          break;

        case 'lga':
          recipientQuery = `
            SELECT id FROM users 
            WHERE designation = 'LGA Coordinator' 
            AND ("votingState" = $1 OR "assignedState" = $1)
            AND ("votingLGA" = $2 OR "assignedLGA" = $2)
            LIMIT 1
          `;
          queryParams = [recipientLocation.state, recipientLocation.lga];
          break;

        case 'ward':
          recipientQuery = `
            SELECT id FROM users 
            WHERE designation = 'Ward Coordinator' 
            AND ("votingState" = $1 OR "assignedState" = $1)
            AND ("votingLGA" = $2 OR "assignedLGA" = $2)
            AND ("votingWard" = $3 OR "assignedWard" = $3)
            LIMIT 1
          `;
          queryParams = [recipientLocation.state, recipientLocation.lga, recipientLocation.ward];
          break;
      }

      // Try to find recipient at this level
      if (recipientQuery) {
        const recipientResult = await query(recipientQuery, queryParams);
        if (recipientResult.rows.length > 0) {
          assignedTo = recipientResult.rows[0].id;
          actualRecipientLevel = levelToTry;

          // Set fallback message if we had to route up the hierarchy
          if (levelToTry !== recipientLevel) {
            const levelNames = {
              'ward': 'Ward Coordinator',
              'lga': 'LGA Coordinator',
              'state': 'State Coordinator',
              'national': 'National Coordinator',
              'peter_obi': 'Peter Obi'
            };
            fallbackMessage = `Note: ${levelNames[recipientLevel]} not available for your location. Message routed to ${levelNames[levelToTry]}.`;
          }
          break;
        }
      }
    }

    // Insert message with actual recipient level (may be different from requested if fallback occurred)
    const result = await query(`
      INSERT INTO leadership_messages (
        sender_id, 
        recipient_level, 
        recipient_location, 
        subject, 
        message,
        assigned_to,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, status, assigned_to, created_at
    `, [
      senderId,
      actualRecipientLevel, // Use the actual level where message was routed
      JSON.stringify(recipientLocation),
      subject,
      message,
      assignedTo,
      assignedTo ? 'delivered' : 'pending'
    ]);

    const messageData = result.rows[0];

    // Send push notification if recipient found
    if (assignedTo) {
      try {
        // Get recipient's push tokens
        const pushTokenResult = await query(`
          SELECT expo_push_token, fcm_token 
          FROM user_push_tokens 
          WHERE user_id = $1 AND is_active = true
        `, [assignedTo]);

        if (pushTokenResult.rows.length > 0) {
          for (const tokenData of pushTokenResult.rows) {
            if (tokenData.expo_push_token) {
              await sendPushNotification(
                tokenData.expo_push_token,
                'New Leadership Message',
                `${subject} - from ${sender.name}`,
                {
                  type: 'leadership_message',
                  messageId: messageData.id,
                  senderId: senderId
                }
              );
            }
          }
        }
      } catch (pushError) {
        console.error('Error sending push notification:', pushError);
        // Don't fail the message if push notification fails
      }
    }

    // Determine response message
    let responseMessage = '';
    if (assignedTo) {
      responseMessage = fallbackMessage
        ? `Message sent successfully. ${fallbackMessage}`
        : 'Message sent successfully';
    } else {
      responseMessage = 'Message could not be delivered - no coordinators available in the hierarchy for your location. Please contact support.';
    }

    res.json({
      success: true,
      messageId: messageData.id,
      status: messageData.status,
      assignedTo: messageData.assigned_to,
      originalLevel: recipientLevel,
      actualLevel: actualRecipientLevel,
      fallbackApplied: recipientLevel !== actualRecipientLevel,
      message: responseMessage
    });

  } catch (error) {
    console.error('Error sending leadership message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Get messages for leadership (received messages)
const getLeadershipMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let statusFilter = '';
    let queryParams = [userId, limit, offset];

    if (status !== 'all') {
      statusFilter = 'AND lm.status = $4';
      queryParams.push(status);
    }

    // Get messages assigned to this user (as recipient)
    const messagesResult = await query(`
      SELECT 
        lm.id,
        lm.subject,
        lm.message,
        lm.status,
        lm.recipient_level,
        lm.recipient_location,
        lm.response,
        lm.responded_at,
        lm.created_at,
        u.name as sender_name,
        u.email as sender_email,
        u.designation as sender_designation
      FROM leadership_messages lm
      JOIN users u ON u.id = lm.sender_id
      WHERE lm.assigned_to = $1 ${statusFilter}
      ORDER BY lm.created_at DESC
      LIMIT $2 OFFSET $3
    `, queryParams);

    // Get total count
    let countParams = [userId];
    if (status !== 'all') {
      countParams.push(status);
    }

    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM leadership_messages lm
      WHERE assigned_to = $1 ${status !== 'all' ? 'AND status = $2' : ''}
    `, countParams);

    res.json({
      success: true,
      messages: messagesResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalItems: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit),
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching leadership messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Respond to a leadership message
const respondToLeadershipMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { response } = req.body;
    const userId = req.user.id;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response cannot be empty'
      });
    }

    // Verify message belongs to this user and update
    const result = await query(`
      UPDATE leadership_messages 
      SET 
        response = $1,
        responded_at = NOW(),
        status = 'responded'
      WHERE id = $2 AND assigned_to = $3
      RETURNING id, sender_id, subject
    `, [response, messageId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or not authorized'
      });
    }

    const messageData = result.rows[0];

    // Send push notification to original sender
    try {
      const senderTokenResult = await query(`
        SELECT expo_push_token, fcm_token 
        FROM user_push_tokens 
        WHERE user_id = $1 AND is_active = true
      `, [messageData.sender_id]);

      const responderResult = await query(`
        SELECT name, designation FROM users WHERE id = $1
      `, [userId]);

      if (senderTokenResult.rows.length > 0 && responderResult.rows.length > 0) {
        const responder = responderResult.rows[0];

        for (const tokenData of senderTokenResult.rows) {
          if (tokenData.expo_push_token) {
            await sendPushNotification(
              tokenData.expo_push_token,
              'Message Response Received',
              `${responder.name} (${responder.designation}) responded to: ${messageData.subject}`,
              {
                type: 'message_response',
                messageId: messageData.id,
                responderId: userId
              }
            );
          }
        }
      }
    } catch (pushError) {
      console.error('Error sending response notification:', pushError);
    }

    res.json({
      success: true,
      message: 'Response sent successfully'
    });

  } catch (error) {
    console.error('Error responding to message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send response'
    });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const result = await query(`
      UPDATE leadership_messages 
      SET status = 'read'
      WHERE id = $1 AND assigned_to = $2 AND status = 'delivered'
      RETURNING id
    `, [messageId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or already read'
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
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

// Get Unread Message Count
const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count unread messages assigned to this user
    const result = await query(`
      SELECT COUNT(*) as unread_count
      FROM leadership_messages 
      WHERE assigned_to = $1 AND status = 'delivered'
    `, [userId]);

    const unreadCount = parseInt(result.rows[0].unread_count) || 0;

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Error getting unread message count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      unreadCount: 0
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

// Get comprehensive current user profile for mobile app
const getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Get complete user data with all fields from users table
    const userResult = await query(`
      SELECT 
        id,
        name,
        email,
        phone,
        "profileImage",
        "emailVerified",
        role,
        "kycStatus",
        "twoFactorEnabled",
        otp,
        "otpExpiry",
        "otpPurpose",
        "pendingEmail",
        "kycRejectionReason",
        "hasTakenCauseSurvey",
        "countryOfResidence",
        "createdAt",
        "updatedAt",
        "votingState",
        "votingLGA",
        "votingWard",
        gender,
        "ageRange",
        citizenship,
        "isVoter",
        "willVote",
        "userName",
        "countryCode",
        "stateOfOrigin",
        lga,
        ward,
        "votingEngagementState",
        "profileCompletionPercentage",
        designation,
        "assignedState",
        "assignedLGA",
        "assignedWard",
        monitor_unique_key,
        key_assigned_by,
        key_assigned_date,
        key_status,
        election_access_level,
        monitoring_location,
        mobile_last_seen,
        push_notifications_enabled
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Update mobile last seen
    await query(
      'UPDATE users SET mobile_last_seen = NOW() WHERE id = $1',
      [userId]
    );

    // Format response with proper data structure and naming
    const userProfile = {
      // Basic Identity
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userName: user.userName,
      profileImage: user.profileImage,

      // Authentication & Security
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled || false,
      role: user.role,

      // Personal Information
      gender: user.gender,
      ageRange: user.ageRange,
      citizenship: user.citizenship,
      countryCode: user.countryCode,
      stateOfOrigin: user.stateOfOrigin,
      countryOfResidence: user.countryOfResidence,

      // Location Information
      lga: user.lga,
      ward: user.ward,

      // Voting Information
      votingState: user.votingState,
      votingLGA: user.votingLGA,
      votingWard: user.votingWard,
      isVoter: user.isVoter,
      willVote: user.willVote,
      votingEngagementState: user.votingEngagementState,

      // Role & Assignment
      designation: user.designation,
      assignedState: user.assignedState,
      assignedLGA: user.assignedLGA,
      assignedWard: user.assignedWard,

      // Election & Monitoring
      monitorUniqueKey: user.monitor_unique_key,
      keyAssignedBy: user.key_assigned_by,
      keyAssignedDate: user.key_assigned_date,
      keyStatus: user.key_status,
      electionAccessLevel: user.election_access_level,
      monitoringLocation: user.monitoring_location,

      // KYC & Verification
      kycStatus: user.kycStatus,
      kycRejectionReason: user.kycRejectionReason,

      // Profile & Surveys
      profileCompletionPercentage: user.profileCompletionPercentage || 0,
      hasTakenCauseSurvey: user.hasTakenCauseSurvey,

      // Mobile Specific
      mobileLastSeen: user.mobile_last_seen,
      pushNotificationsEnabled: user.push_notifications_enabled || true,

      // Timestamps
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('Error fetching user profile for mobile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

export {
  mobileLogin,
  getMobileFeeds,
  sendLeadershipMessage,
  getLeadershipMessages,
  respondToLeadershipMessage,
  markMessageAsRead,
  getMyMessages,
  getUnreadMessageCount,
  registerPushToken,
  createMobileFeed,
  updateMobileFeed,
  deleteMobileFeed,
  updatePushSettings,
  uploadMobileFeedImage,
  getMobileNotifications,
  markMobileNotificationRead,
  getCurrentUserProfile
};
