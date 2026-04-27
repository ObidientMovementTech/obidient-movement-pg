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
    console.log(`[ChatPush] DM push called: convo=${conversationId}, sender=${senderId}`);

    // Get other participants in this conversation
    const result = await query(
      `SELECT user_id FROM conversation_participants
       WHERE conversation_id = $1 AND user_id != $2`,
      [conversationId, senderId]
    );

    const allRecipients = result.rows.map(r => r.user_id);
    const offlineUserIds = allRecipients.filter(uid => !isUserOnline(uid));

    console.log(`[ChatPush] Recipients: ${allRecipients.length} total, ${offlineUserIds.length} offline, ${allRecipients.length - offlineUserIds.length} online (skipped)`);

    if (offlineUserIds.length === 0) {
      console.log('[ChatPush] All recipients online — no push sent');
      return;
    }

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
    console.log(`[ChatPush] DM push sent to ${offlineUserIds.length} user(s)`);
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

// In-memory throttle: roomId → { lastPush: timestamp, messageCount: number }
const roomPushThrottle = new Map();
const ROOM_PUSH_INTERVAL_MS = 30_000; // 30 seconds between pushes per room

export async function pushRoomMessage(roomId, senderId, senderName, roomTitle, messagePreview) {
  try {
    console.log(`[ChatPush] Room push called: room=${roomId}, sender=${senderId}, title="${roomTitle}"`);
    const now = Date.now();
    const entry = roomPushThrottle.get(roomId) || { lastPush: 0, messageCount: 0 };

    // If within throttle window, just count the message
    if (now - entry.lastPush < ROOM_PUSH_INTERVAL_MS) {
      entry.messageCount++;
      roomPushThrottle.set(roomId, entry);
      console.log(`[ChatPush] Room ${roomId} throttled — ${entry.messageCount} messages queued`);
      return;
    }

    // Build push body — include summary if messages were skipped during throttle
    let body;
    if (entry.messageCount > 0) {
      body = `${entry.messageCount + 1} new messages in ${roomTitle}`;
    } else {
      body = `${senderName}: ${messagePreview}`;
    }

    // Reset throttle
    roomPushThrottle.set(roomId, { lastPush: now, messageCount: 0 });

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

    console.log(`[ChatPush] Room ${roomId}: ${result.rows.length} non-muted participants, ${offlineUserIds.length} offline`);

    if (offlineUserIds.length === 0) {
      console.log(`[ChatPush] Room ${roomId}: all participants online — no push`);
      return;
    }

    await sendPushNotification(
      offlineUserIds,
      roomTitle,
      body,
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
