import 'dotenv/config';
import { Worker } from 'bullmq';
import { createRedisClient, getBullMqPrefix } from '../config/redis.js';
import { logger } from '../middlewares/security.middleware.js';
import { createEmailTransporter, sender } from '../config/email.js';
import { createAdminBroadcastEmailTemplate } from '../utils/emailTemplates.js';
import { query } from '../config/db.js';
import BroadcastEmailLog from '../models/broadcastEmailLog.model.js';
import Notification from '../models/notification.model.js';
import { sendBroadcastPush } from '../services/pushNotificationService.js';
import Redis from 'ioredis';

const QUEUE_NAME = 'email-broadcast';
const connection = createRedisClient();
const redisPublisher = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379/0', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true
});

const BATCH_SIZE = parseInt(process.env.EMAIL_BROADCAST_BATCH || '500', 10);
const DRY_RUN = process.env.EMAIL_DRY_RUN === 'true';

// Progress key helper
const progressKey = (broadcastId) => `broadcast:progress:${broadcastId}`;
// Cancel flag key — set by the cancel endpoint
const cancelKey = (broadcastId) => `broadcast:cancel:${broadcastId}`;

// Check if broadcast was cancelled
const isCancelled = async (broadcastId) => {
  const val = await redisPublisher.get(cancelKey(broadcastId));
  return val === '1';
};

// Update progress in Redis and publish SSE event
const updateProgress = async (broadcastId, data) => {
  const key = progressKey(broadcastId);
  await redisPublisher.hmset(key, {
    ...data,
    updatedAt: new Date().toISOString()
  });
  // Expire after 24 hours
  await redisPublisher.expire(key, 86400);
};

// Update broadcast status columns in DB
const updateBroadcastRecord = async (broadcastId, fields) => {
  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`"${key}" = $${idx}`);
    values.push(value);
    idx++;
  }
  values.push(broadcastId);

  await query(
    `UPDATE "adminBroadcasts" SET ${setClauses.join(', ')} WHERE id = $${idx}`,
    values
  );
};

// Fetch users in paginated batches (only id, email, name)
const fetchUsersBatch = async (excludeUserId, limit, offset) => {
  const result = await query(
    `SELECT id, email, name FROM users 
     WHERE id != $1 AND email IS NOT NULL AND email != ''
     ORDER BY id ASC
     LIMIT $2 OFFSET $3`,
    [excludeUserId, limit, offset]
  );
  return result.rows;
};

// Count total eligible users
const countEligibleUsers = async (excludeUserId) => {
  const result = await query(
    `SELECT COUNT(*) AS total FROM users 
     WHERE id != $1 AND email IS NOT NULL AND email != ''`,
    [excludeUserId]
  );
  return parseInt(result.rows[0].total);
};

// Main worker processor
const emailBroadcastWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { broadcastId, adminId, adminName, title, message, isRetry } = job.data;
    const startTime = Date.now();

    logger.info('Email broadcast job started', { broadcastId, adminName, isRetry: !!isRetry });

    try {
      // ---- Guard: check if broadcast still exists and isn't cancelled ----
      const broadcastCheck = await query(
        `SELECT status FROM "adminBroadcasts" WHERE id = $1`,
        [broadcastId]
      );
      if (broadcastCheck.rows.length === 0) {
        logger.info('Broadcast was deleted, skipping job', { broadcastId });
        return;
      }
      if (broadcastCheck.rows[0].status === 'cancelled') {
        logger.info('Broadcast was cancelled, skipping job', { broadcastId });
        return;
      }

      // Update broadcast status to processing
      await updateBroadcastRecord(broadcastId, {
        status: 'processing',
        startedAt: new Date()
      });

      // ---- Phase 1: Count & prepare recipient logs (skip if retry) ----
      let totalRecipients;

      if (isRetry) {
        // For retry, just count the pending (reset-to-pending) logs
        const stats = await BroadcastEmailLog.getStats(broadcastId);
        totalRecipients = stats.pending;
        logger.info(`Retry mode: ${totalRecipients} pending emails to resend`, { broadcastId });
      } else {
        // Guard: if logs already exist for this broadcast (e.g. stalled re-run), skip Phase 2
        const existingStats = await BroadcastEmailLog.getStats(broadcastId);
        if (existingStats.total > 0) {
          logger.info(`Logs already exist (${existingStats.total}), skipping preparation phase`, { broadcastId });
          totalRecipients = existingStats.total;
        } else {
          totalRecipients = await countEligibleUsers(adminId);
          logger.info(`Found ${totalRecipients} eligible recipients`, { broadcastId });

          await updateBroadcastRecord(broadcastId, { totalRecipients });
          await updateProgress(broadcastId, {
            status: 'preparing',
            total: totalRecipients,
            sent: 0,
            failed: 0,
            notificationsCreated: 0,
            phase: 'Creating notifications & preparing emails...'
          });

          // ---- Phase 2: Create notifications + email log rows in batches ----
          let offset = 0;
          let notificationsCreated = 0;

          while (true) {
            // Check cancel flag
            if (await isCancelled(broadcastId)) {
              logger.info('Broadcast cancelled during preparation', { broadcastId });
              await updateBroadcastRecord(broadcastId, { status: 'cancelled' });
              await updateProgress(broadcastId, { status: 'cancelled', phase: 'Cancelled by admin' });
              return;
            }

            const usersBatch = await fetchUsersBatch(adminId, BATCH_SIZE, offset);
            if (usersBatch.length === 0) break;

            // Bulk insert email log rows
            await BroadcastEmailLog.insertBulk(broadcastId, usersBatch);

            // Bulk create notifications
            const notificationData = usersBatch.map(user => ({
              recipient: user.id,
              type: 'adminBroadcast',
              title,
              message
            }));

            try {
              await Notification.createBulk(notificationData);
              notificationsCreated += usersBatch.length;
            } catch (notifError) {
              logger.error('Notification batch failed, continuing...', {
                broadcastId,
                offset,
                error: notifError.message
              });
            }

            await updateProgress(broadcastId, {
              status: 'preparing',
              total: totalRecipients,
              sent: 0,
              failed: 0,
              notificationsCreated,
              phase: `Preparing recipients... ${offset + usersBatch.length}/${totalRecipients}`
            });

            offset += usersBatch.length;
          }

          await updateBroadcastRecord(broadcastId, { notificationsCreated, totalRecipients });

          // Send push notification (once)
          try {
            await sendBroadcastPush(
              `📢 ${title}`,
              message.length > 100 ? message.substring(0, 100) + '...' : message,
              { type: 'adminBroadcast', title }
            );
            logger.info('Push notification sent', { broadcastId });
          } catch (pushError) {
            logger.error('Push notification failed (non-fatal)', { error: pushError.message });
          }
        }
      }

      // ---- Phase 3: Send emails via pool ----
      // Re-count from actual logs to be accurate
      const currentStats = await BroadcastEmailLog.getStats(broadcastId);
      totalRecipients = currentStats.total;
      let sent = currentStats.sent; // Resume from already-sent count
      let failed = currentStats.failed;

      await updateProgress(broadcastId, {
        status: 'sending',
        total: totalRecipients,
        sent,
        failed,
        phase: `Sending emails... ${sent + failed}/${totalRecipients}`
      });

      const subject = `Important Message: ${title} - Obidient Movement`;
      const html = createAdminBroadcastEmailTemplate(title, message, adminName);
      const plainText = `IMPORTANT MESSAGE FROM OBIDIENT MOVEMENT\n\n${title}\n\n${message}\n\nThis message was sent by ${adminName || 'Obidient Movement Administration'} to all members of the Obidient Movement platform.\n\nFor updates and more information, visit your dashboard at: https://member.obidients.com/dashboard\n\n— The Obidient Movement Team`;

      // Create a dedicated transporter for this job with tuned settings
      const transporter = createEmailTransporter();

      let processedInBatch = 0;

      // Process pending logs in pages
      while (true) {
        // Check cancel flag before each batch
        if (await isCancelled(broadcastId)) {
          logger.info('Broadcast cancelled during sending', { broadcastId, sent, failed });
          transporter.close();
          await updateBroadcastRecord(broadcastId, {
            status: 'cancelled',
            emailsSent: sent,
            emailsFailed: failed
          });
          await updateProgress(broadcastId, {
            status: 'cancelled',
            total: totalRecipients,
            sent,
            failed,
            phase: `Cancelled — ${sent} sent, ${failed} failed`
          });
          return;
        }

        const pendingLogs = await BroadcastEmailLog.fetchPending(broadcastId, BATCH_SIZE, 0);
        if (pendingLogs.length === 0) break;

        for (const log of pendingLogs) {
          // Check cancel every 50 emails
          if (processedInBatch % 50 === 0 && processedInBatch > 0) {
            if (await isCancelled(broadcastId)) {
              transporter.close();
              await updateBroadcastRecord(broadcastId, {
                status: 'cancelled',
                emailsSent: sent,
                emailsFailed: failed
              });
              await updateProgress(broadcastId, {
                status: 'cancelled',
                total: totalRecipients,
                sent,
                failed,
                phase: `Cancelled — ${sent} sent, ${failed} failed`
              });
              return;
            }
          }

          try {
            if (DRY_RUN) {
              logger.info(`[DRY RUN] Would send to ${log.email}`, { broadcastId });
              await new Promise(r => setTimeout(r, 20));
            } else {
              await transporter.sendMail({
                from: `"${sender.name}" <${sender.email}>`,
                to: log.email,
                subject,
                html,
                text: plainText
              });
            }

            await BroadcastEmailLog.updateStatus(log.id, 'sent');
            sent++;
          } catch (emailError) {
            const errorMsg = emailError.message || 'Unknown email error';
            await BroadcastEmailLog.updateStatus(log.id, 'failed', errorMsg);
            failed++;
            logger.error(`Email failed: ${log.email}`, { broadcastId, error: errorMsg });
          }

          processedInBatch++;

          // Update progress every 10 emails
          if (processedInBatch % 10 === 0) {
            await updateProgress(broadcastId, {
              status: 'sending',
              total: totalRecipients,
              sent,
              failed,
              phase: `Sending emails... ${sent + failed}/${totalRecipients}`
            });

            if (processedInBatch % 100 === 0) {
              await updateBroadcastRecord(broadcastId, {
                emailsSent: sent,
                emailsFailed: failed
              });
            }
          }
        }
      }

      // Close the transporter pool
      transporter.close();

      // ---- Phase 4: Finalize ----
      const finalStatus = failed > 0 && sent === 0 ? 'failed' : 'completed';
      const elapsed = Math.round((Date.now() - startTime) / 1000);

      await updateBroadcastRecord(broadcastId, {
        status: finalStatus,
        emailsSent: sent,
        emailsFailed: failed,
        completedAt: new Date()
      });

      await updateProgress(broadcastId, {
        status: finalStatus,
        total: totalRecipients,
        sent,
        failed,
        phase: finalStatus === 'completed'
          ? `Completed in ${elapsed}s — ${sent} sent, ${failed} failed`
          : `Failed — ${sent} sent, ${failed} failed`,
        completedAt: new Date().toISOString()
      });

      logger.info('Email broadcast completed', {
        broadcastId,
        sent,
        failed,
        total: totalRecipients,
        elapsedSeconds: elapsed
      });

    } catch (error) {
      logger.error('Email broadcast job crashed', {
        broadcastId,
        error: error.message,
        stack: error.stack
      });

      await updateBroadcastRecord(broadcastId, { status: 'failed' }).catch(() => {});
      await updateProgress(broadcastId, {
        status: 'failed',
        phase: `Error: ${error.message}`
      }).catch(() => {});

      throw error; // Let BullMQ retry
    }
  },
  {
    connection,
    concurrency: 1,
    lockDuration: 300000,
    lockRenewTime: 60000,
    stalledInterval: 120000, // Only check stalled after 2 min (prevents premature re-run)
    prefix: getBullMqPrefix()
  }
);

emailBroadcastWorker.on('failed', (job, error) => {
  logger.error('Email broadcast job failed permanently', {
    jobId: job?.id,
    broadcastId: job?.data?.broadcastId,
    error: error.message
  });
});

emailBroadcastWorker.on('completed', (job) => {
  logger.info('Email broadcast job completed', {
    jobId: job.id,
    broadcastId: job.data.broadcastId
  });
});

export default emailBroadcastWorker;
