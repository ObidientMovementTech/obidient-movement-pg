import admin from 'firebase-admin';
import { query } from '../config/db.js';

// Initialize Firebase Admin (you'll need to add your service account key to .env)
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (!firebaseInitialized && !admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      firebaseInitialized = true;
      console.log('🔥 Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error.message);
    }
  }
};

// Send push notification to specific users
export const sendPushNotification = async (userIds, title, body, data = {}) => {
  try {
    if (!firebaseInitialized) {
      initializeFirebase();
    }

    if (!firebaseInitialized) {
      console.warn('Firebase not initialized - skipping push notification');
      return { success: false, error: 'Firebase not configured' };
    }

    // Get push tokens for users
    const tokens = await query(`
      SELECT token, platform FROM push_tokens 
      WHERE user_id = ANY($1) AND is_active = true
    `, [userIds]);

    if (tokens.rows.length === 0) {
      return { success: true, sent: 0, message: 'No active tokens found' };
    }

    // Create individual messages for each token
    const messages = tokens.rows.map(row => ({
      notification: { title, body },
      data: {
        ...data,
        timestamp: Date.now().toString(),
        click_action: 'FLUTTER_NOTIFICATION_CLICK' // For React Native
      },
      token: row.token
    }));

    // Send using sendAll (available in newer versions) or sendEach (fallback)
    let response;
    try {
      response = await admin.messaging().sendAll(messages);
    } catch (error) {
      if (error.message.includes('sendAll')) {
        // Fallback to individual sends
        console.log('Using individual send method...');
        const results = await Promise.allSettled(
          messages.map(message => admin.messaging().send(message))
        );

        response = {
          responses: results.map(result => ({
            success: result.status === 'fulfilled',
            error: result.status === 'rejected' ? result.reason : null
          })),
          successCount: results.filter(r => r.status === 'fulfilled').length,
          failureCount: results.filter(r => r.status === 'rejected').length
        };
      } else {
        throw error;
      }
    }

    // Handle failed tokens (remove invalid ones)
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens.rows[idx].token);
          console.warn('Failed to send to token:', resp.error?.message || resp.error);
        }
      });

      // Deactivate failed tokens
      if (failedTokens.length > 0) {
        await query(
          'UPDATE push_tokens SET is_active = false WHERE token = ANY($1)',
          [failedTokens]
        );
        console.log(`Deactivated ${failedTokens.length} invalid tokens`);
      }
    }

    console.log(`📱 Push notification sent: ${response.successCount}/${tokens.rows.length}`);
    return { success: true, sent: response.successCount, failed: response.failureCount };
  } catch (error) {
    console.error('Push notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send broadcast to all users in specific states
export const sendBroadcastPush = async (title, message, targetStates = []) => {
  try {
    let userQuery = `
      SELECT DISTINCT u.id 
      FROM users u 
      INNER JOIN push_tokens pt ON u.id = pt.user_id 
      WHERE u.push_notifications_enabled = true 
        AND pt.is_active = true
    `;
    let queryParams = [];

    if (targetStates.length > 0) {
      userQuery += ' AND u."assignedState" = ANY($1)';
      queryParams.push(targetStates);
    }

    const users = await query(userQuery, queryParams);
    const userIds = users.rows.map(row => row.id);

    if (userIds.length === 0) {
      return { success: true, sent: 0, message: 'No eligible users found' };
    }

    // Send push notifications in batches of 500 (FCM limit)
    const batchSize = 500;
    let totalSent = 0;

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const result = await sendPushNotification(
        batch,
        title,
        message,
        { type: 'broadcast' }
      );
      if (result.success) {
        totalSent += result.sent;
      }
    }

    return { success: true, sent: totalSent, totalUsers: userIds.length };
  } catch (error) {
    console.error('Broadcast push error:', error);
    return { success: false, error: error.message };
  }
};

// Initialize Firebase on service load
initializeFirebase();
