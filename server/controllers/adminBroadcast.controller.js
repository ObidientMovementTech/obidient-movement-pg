import AdminBroadcast from "../models/adminBroadcast.model.js";
import User from "../models/user.model.js";
import BroadcastEmailLog from "../models/broadcastEmailLog.model.js";
import { transformUser, transformBroadcast } from '../utils/mongoCompat.js';
import emailBroadcastQueue from '../queues/emailBroadcastQueue.js';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379/0', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true
});

/**
 * Send a general broadcast message to all users.
 * Creates the broadcast record and enqueues a background job for
 * notifications + email delivery. Returns immediately.
 */
export const sendAdminBroadcast = async (req, res) => {
  const { title, message } = req.body;
  const sentBy = req.userId;

  if (!title || !message) {
    return res.status(400).json({ message: "Title and message are required" });
  }

  try {
    const admin = await User.findById(sentBy);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized - admin privileges required" });
    }

    // Create the broadcast record (status = pending)
    const newBroadcast = await AdminBroadcast.create({ title, message, sentBy });

    const adminName = admin.name || admin.userName || 'Obidient Movement Administration';

    // Enqueue background job — returns immediately
    await emailBroadcastQueue.add('send-broadcast', {
      broadcastId: newBroadcast.id,
      adminId: sentBy,
      adminName,
      title,
      message,
      isRetry: false
    }, {
      jobId: `broadcast-${newBroadcast.id}`
    });

    console.log(`[ADMIN_BROADCAST] Broadcast ${newBroadcast.id} created and queued for processing`);

    return res.status(201).json({
      success: true,
      broadcast: {
        _id: newBroadcast.id,
        title: newBroadcast.title,
        message: newBroadcast.message,
        sentBy: newBroadcast.sentBy,
        status: 'pending',
        createdAt: newBroadcast.createdAt
      }
    });
  } catch (error) {
    console.error("Admin broadcast error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * SSE endpoint — streams real-time progress of a broadcast job.
 */
export const streamBroadcastProgress = async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable nginx buffering
    });

    res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

    const progressKey = `broadcast:progress:${id}`;

    const sendProgress = async () => {
      try {
        const data = await redis.hgetall(progressKey);
        if (data && Object.keys(data).length > 0) {
          res.write(`data: ${JSON.stringify(data)}\n\n`);

          // Close stream if completed, failed, or cancelled
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
            clearInterval(interval);
            res.write(`data: ${JSON.stringify({ status: 'stream_end' })}\n\n`);
            res.end();
          }
        } else {
          // No progress data yet — check if broadcast even exists
          const broadcast = await AdminBroadcast.findById(id);
          if (broadcast) {
            res.write(`data: ${JSON.stringify({
              status: broadcast.status || 'pending',
              total: broadcast.totalRecipients || 0,
              sent: broadcast.emailsSent || 0,
              failed: broadcast.emailsFailed || 0,
              phase: broadcast.status === 'completed' ? 'Completed' : 'Waiting to start...'
            })}\n\n`);

            if (broadcast.status === 'completed' || broadcast.status === 'failed' || broadcast.status === 'cancelled') {
              clearInterval(interval);
              res.write(`data: ${JSON.stringify({ status: 'stream_end' })}\n\n`);
              res.end();
            }
          }
        }
      } catch (err) {
        console.error('SSE progress read error:', err.message);
      }
    };

    // Poll Redis every 2 seconds
    const interval = setInterval(sendProgress, 2000);
    sendProgress(); // Send immediately

    // Cleanup on client disconnect
    req.on('close', () => {
      clearInterval(interval);
    });

  } catch (error) {
    console.error("SSE progress error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

/**
 * Get email delivery logs for a broadcast (paginated, searchable)
 */
export const getBroadcastEmailLogs = async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const status = req.query.status || null;
    const search = req.query.search || null;

    const result = await BroadcastEmailLog.findByBroadcast(id, {
      limit,
      offset,
      status,
      search
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting email logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get email stats summary for a broadcast
 */
export const getBroadcastEmailStats = async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const stats = await BroadcastEmailLog.getStats(id);

    // Also get broadcast-level info
    const broadcast = await AdminBroadcast.findById(id);

    res.status(200).json({
      ...stats,
      status: broadcast?.status || 'unknown',
      startedAt: broadcast?.startedAt,
      completedAt: broadcast?.completedAt,
      notificationsCreated: broadcast?.notificationsCreated || 0
    });
  } catch (error) {
    console.error("Error getting email stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Retry failed emails for a broadcast
 */
export const retryBroadcastEmails = async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const broadcast = await AdminBroadcast.findById(id);

    if (!broadcast) {
      return res.status(404).json({ message: "Broadcast not found" });
    }

    // Reset failed logs to pending
    const resetCount = await BroadcastEmailLog.resetFailedToPending(id);

    if (resetCount === 0) {
      return res.status(400).json({ message: "No failed emails to retry" });
    }

    const adminName = admin.name || admin.userName || 'Obidient Movement Administration';

    // Enqueue a retry job
    await emailBroadcastQueue.add('send-broadcast', {
      broadcastId: id,
      adminId: req.userId,
      adminName,
      title: broadcast.title,
      message: broadcast.message,
      isRetry: true
    }, {
      jobId: `broadcast-retry-${id}-${Date.now()}`
    });

    console.log(`[ADMIN_BROADCAST] Retry queued for broadcast ${id}: ${resetCount} emails reset to pending`);

    res.status(200).json({
      success: true,
      message: `Retrying ${resetCount} failed emails`,
      retryCount: resetCount
    });
  } catch (error) {
    console.error("Error retrying broadcast emails:", error);
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
        status: broadcast.status || 'pending',
        totalRecipients: broadcast.totalRecipients || 0,
        emailsSent: broadcast.emailsSent || 0,
        emailsFailed: broadcast.emailsFailed || 0,
        notificationsCreated: broadcast.notificationsCreated || 0,
        startedAt: broadcast.startedAt,
        completedAt: broadcast.completedAt,
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
      status: broadcast.status || 'pending',
      totalRecipients: broadcast.totalRecipients || 0,
      emailsSent: broadcast.emailsSent || 0,
      emailsFailed: broadcast.emailsFailed || 0,
      notificationsCreated: broadcast.notificationsCreated || 0,
      startedAt: broadcast.startedAt,
      completedAt: broadcast.completedAt,
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
 * Cancel a running broadcast
 */
export const cancelBroadcast = async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const broadcast = await AdminBroadcast.findById(id);

    if (!broadcast) {
      return res.status(404).json({ message: "Broadcast not found" });
    }

    if (broadcast.status === 'completed' || broadcast.status === 'cancelled') {
      return res.status(400).json({ message: `Broadcast is already ${broadcast.status}` });
    }

    // Set cancel flag in Redis — the worker checks this flag during processing
    await redis.set(`broadcast:cancel:${id}`, '1', 'EX', 86400);

    // Also try to remove the BullMQ job if it's still waiting
    try {
      const job = await emailBroadcastQueue.getJob(`broadcast-${id}`);
      if (job) {
        const state = await job.getState();
        if (state === 'waiting' || state === 'delayed') {
          await job.remove();
          console.log(`[ADMIN_BROADCAST] Removed waiting job for broadcast ${id}`);
        }
        // If active, the worker will pick up the cancel flag
      }
    } catch (jobErr) {
      console.error('Error removing job from queue:', jobErr.message);
    }

    // Update broadcast status
    await AdminBroadcast.findByIdAndUpdate(id, { status: 'cancelled' });

    // Update Redis progress
    await redis.hmset(`broadcast:progress:${id}`, {
      status: 'cancelled',
      phase: 'Cancelled by admin',
      updatedAt: new Date().toISOString()
    });

    console.log(`[ADMIN_BROADCAST] Broadcast ${id} cancelled by admin ${admin.name || admin.userName}`);

    res.status(200).json({ success: true, message: "Broadcast cancelled" });
  } catch (error) {
    console.error("Error cancelling broadcast:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete an admin broadcast (cancels running job + cleans Redis + CASCADE deletes logs)
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

    const broadcastId = req.params.id;

    // Cancel any running job first
    await redis.set(`broadcast:cancel:${broadcastId}`, '1', 'EX', 300);
    try {
      const job = await emailBroadcastQueue.getJob(`broadcast-${broadcastId}`);
      if (job) {
        const state = await job.getState();
        if (state === 'waiting' || state === 'delayed') {
          await job.remove();
        }
      }
    } catch (jobErr) {
      console.error('Error cleaning up job:', jobErr.message);
    }

    // Clean Redis progress key
    await redis.del(`broadcast:progress:${broadcastId}`);
    await redis.del(`broadcast:cancel:${broadcastId}`);

    // Delete broadcast — ON DELETE CASCADE removes all broadcastEmailLogs rows
    await AdminBroadcast.deleteById(broadcastId);

    res.status(200).json({ message: "Broadcast deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin broadcast:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
