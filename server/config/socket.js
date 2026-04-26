import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { query } from './db.js';
import { registerChatHandlers } from '../socket/chatHandlers.js';
import { getUserBlockList, getUserBlockedByList } from '../controllers/block.controller.js';

let io = null;

// Online presence: userId → Set<socketId>
const onlineUsers = new Map();

/**
 * Re-verify JWT token on a connected socket.
 * Returns true if still valid, disconnects the socket and returns false otherwise.
 */
export function reVerifySocket(socket) {
  try {
    let token = socket.handshake.auth?.token;
    if (!token) {
      const rawCookies = socket.handshake.headers.cookie || '';
      const cookies = cookie.parse(rawCookies);
      token = cookies['cu-auth-token'];
    }
    if (!token) {
      socket.disconnect(true);
      return false;
    }
    jwt.verify(token, process.env.JWT_SECRET); // throws if expired/invalid
    return true;
  } catch {
    socket.emit('auth:expired', { message: 'Session expired' });
    socket.disconnect(true);
    return false;
  }
}

/**
 * Initialize Socket.IO server with cookie-based JWT authentication
 */
export function initSocket(httpServer) {
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

  io = new Server(httpServer, {
    cors: {
      origin: [
        CLIENT_URL,
        'http://192.168.0.111:8081',
        'http://localhost:8081',
        'http://10.0.2.2:8081'
      ],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    transports: ['websocket', 'polling'],
  });

  // ── Authentication middleware ──────────────────────────────────
  io.use(async (socket, next) => {
    try {
      // 1. Try token from socket.handshake.auth (mobile clients)
      // 2. Fall back to cookie (web clients)
      let token = socket.handshake.auth?.token;

      if (!token) {
        const rawCookies = socket.handshake.headers.cookie || '';
        const cookies = cookie.parse(rawCookies);
        token = cookies['cu-auth-token'];
      }

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded._id || decoded.userId;

      if (!userId) {
        return next(new Error('Invalid token'));
      }

      // Lightweight user fetch — only fields needed for socket context
      const result = await query(
        `SELECT id, name, designation, "votingState", "votingLGA", "votingWard"
         FROM users WHERE id = $1 AND "emailVerified" = true`,
        [userId]
      );

      if (result.rows.length === 0) {
        return next(new Error('User not found or not verified'));
      }

      socket.userId = userId;
      socket.userData = result.rows[0];
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  // ── Connection handler ────────────────────────────────────────
  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] Connected: ${userId} (${socket.id})`);

    // Track online presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);

    // Load block lists and chat settings into socket for fast lookups
    try {
      const [blockedByMe, blockedByOthers] = await Promise.all([
        getUserBlockList(userId),
        getUserBlockedByList(userId),
      ]);
      socket.blockedByMe = blockedByMe;     // users I blocked
      socket.blockedByOthers = blockedByOthers; // users who blocked me

      // Load chat settings
      const settingsResult = await query(
        `SELECT show_online_status, show_typing_indicator, read_receipts
         FROM user_chat_settings WHERE user_id = $1`,
        [userId]
      );
      socket.chatSettings = settingsResult.rows[0] || {
        show_online_status: true,
        show_typing_indicator: true,
        read_receipts: true,
      };
    } catch (err) {
      console.error('[Socket] Error loading block/settings data:', err.message);
      socket.blockedByMe = new Set();
      socket.blockedByOthers = new Set();
      socket.chatSettings = { show_online_status: true, show_typing_indicator: true, read_receipts: true };
    }

    // Join all conversation rooms this user participates in
    try {
      const convResult = await query(
        'SELECT conversation_id FROM conversation_participants WHERE user_id = $1',
        [userId]
      );
      for (const row of convResult.rows) {
        socket.join(`conv:${row.conversation_id}`);
      }
    } catch (err) {
      console.error('[Socket] Error joining conversation rooms:', err.message);
    }

    // Broadcast online status to conversation partners (if enabled)
    if (socket.chatSettings.show_online_status) {
      broadcastPresence(userId, true);
    }

    // Register chat event handlers
    registerChatHandlers(io, socket);

    // ── Disconnect ──────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${userId} (${socket.id})`);

      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          // Only broadcast offline when ALL tabs/devices disconnected
          // Respect show_online_status setting
          if (socket.chatSettings?.show_online_status !== false) {
            broadcastPresence(userId, false);
          }
        }
      }
    });
  });

  console.log('[Socket] Socket.IO initialized');
  return io;
}

/**
 * Get the Socket.IO instance (for use in REST controllers)
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized — call initSocket first');
  }
  return io;
}

/**
 * Check if a user is currently online
 */
export function isUserOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}

/**
 * Get all online user IDs
 */
export function getOnlineUserIds() {
  return Array.from(onlineUsers.keys());
}

/**
 * Broadcast presence change to all conversation partners
 * Respects block relationships — blocked pairs don't see each other's status
 */
async function broadcastPresence(userId, isOnline) {
  try {
    // Find all users this person has conversations with
    const result = await query(
      `SELECT DISTINCT cp2.user_id
       FROM conversation_participants cp1
       JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
       WHERE cp1.user_id = $1 AND cp2.user_id != $1`,
      [userId]
    );

    // Get block relationships for this user (both directions)
    const blockResult = await query(
      `SELECT blocker_id, blocked_id FROM user_blocks
       WHERE blocker_id = $1 OR blocked_id = $1`,
      [userId]
    );
    const blockedPairs = new Set();
    for (const row of blockResult.rows) {
      if (row.blocker_id === userId) blockedPairs.add(row.blocked_id);
      if (row.blocked_id === userId) blockedPairs.add(row.blocker_id);
    }

    for (const row of result.rows) {
      // Skip blocked pairs
      if (blockedPairs.has(row.user_id)) continue;

      io.to(`user:${row.user_id}`).emit('presence:change', {
        userId,
        online: isOnline,
      });
    }
  } catch (err) {
    console.error('[Socket] Presence broadcast error:', err.message);
  }
}
