import { isUserOnline } from '../config/socket.js';
import { sendPushNotification } from '../services/pushNotificationService.js';
import { query } from '../config/db.js';

/**
 * Send FCM push notification for a new direct message to offline recipients.
 * Called after Socket.IO broadcast — only fires if recipient has no active sockets.
 *
 * @param {string} conversationId
 * @param {string} senderId
 * @param {string} senderName
 * @param {string} messagePreview - First ~100 chars of message content
 */
export async function pushDirectMessage(conversationId, senderId, senderName, messagePreview) {
  try {
    // Get other participants in this conversation
    const result = await query(
      `SELECT user_id FROM conversation_participants
       WHERE conversation_id = $1 AND user_id != $2`,
      [conversationId, senderId]
    );

    const offlineUserIds = result.rows
      .map(r => r.user_id)
      .filter(uid => !isUserOnline(uid));

    if (offlineUserIds.length === 0) return;

    await sendPushNotification(
      offlineUserIds,
      senderName,
      messagePreview,
      {
        type: 'chat_message',
        conversationId,
        senderId,
      }
    );
  } catch (err) {
    // Push failures should never break the message flow
    console.error('[ChatPush] Direct message push error:', err.message);
  }
}

/**
 * Send FCM push notification for a new room message to offline, non-muted participants.
 * Throttled: only fires if the room hasn't had a push in the last 30 seconds
 * to prevent notification storms in active rooms.
 *
 * @param {string} roomId
 * @param {string} senderId
 * @param {string} senderName
 * @param {string} roomTitle
 * @param {string} messagePreview
 */

// Simple in-memory throttle: roomId → last push timestamp
const roomPushThrottle = new Map();
const ROOM_PUSH_INTERVAL_MS = 30_000; // 30 seconds between pushes per room

export async function pushRoomMessage(roomId, senderId, senderName, roomTitle, messagePreview) {
  try {
    // Throttle: skip if this room had a push recently
    const lastPush = roomPushThrottle.get(roomId) || 0;
    if (Date.now() - lastPush < ROOM_PUSH_INTERVAL_MS) return;
    roomPushThrottle.set(roomId, Date.now());

    // Get participants who are offline AND not muted in this room
    const result = await query(
      `SELECT user_id FROM conversation_participants
       WHERE conversation_id = $1
         AND user_id != $2
         AND is_muted = false
         AND (muted_until IS NULL OR muted_until < NOW())`,
      [roomId, senderId]
    );

    const offlineUserIds = result.rows
      .map(r => r.user_id)
      .filter(uid => !isUserOnline(uid));

    if (offlineUserIds.length === 0) return;

    await sendPushNotification(
      offlineUserIds,
      roomTitle,
      `${senderName}: ${messagePreview}`,
      {
        type: 'room_message',
        roomId,
        senderId,
      }
    );
  } catch (err) {
    console.error('[ChatPush] Room message push error:', err.message);
  }
}
