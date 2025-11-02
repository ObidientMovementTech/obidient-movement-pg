import 'dotenv/config';
import { Worker } from 'bullmq';
import { createRedisClient, getBullMqPrefix } from '../config/redis.js';
import { logger } from '../middlewares/security.middleware.js';
import { initiateVoiceCall } from '../services/africasTalkingService.js';
import {
  fetchBatchContext,
  markBatchStatus,
  updateRecipientResult,
  incrementCampaignProgress,
  refreshCampaignStatus
} from '../services/communications/batchProcessingService.js';

const queueName = 'voice-broadcast';

const limiter = {
  max: parseInt(process.env.VOICE_RATE_LIMIT_PER_SECOND || '4', 10),
  duration: 1000
};

const concurrency = parseInt(process.env.VOICE_WORKER_CONCURRENCY || '2', 10);

const callerId = process.env.AT_VOICE_CALLER_ID;

if (!callerId) {
  logger.warn('AT_VOICE_CALLER_ID is not set. Voice calls may fail.');
}

const connection = createRedisClient();

const voiceWorker = new Worker(
  queueName,
  async (job) => {
    const { campaignId, batchId } = job.data;
    logger.info('Processing voice batch', { campaignId, batchId, jobId: job.id });

    const context = await fetchBatchContext(batchId);

    if (!context) {
      logger.error('Voice batch context not found', { batchId, campaignId });
      return;
    }

    const { batch, recipients } = context;

    if (!batch.audio_url) {
      throw new Error('Voice campaign missing audio asset URL');
    }

    await markBatchStatus(batchId, 'processing', { started_at: new Date() });

    let processed = 0;
    let success = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        const clientRequestId = `recipient-${recipient.id}`;

        const response = await initiateVoiceCall({
          to: recipient.phone_number,
          callerId,
          clientRequestId
        });

        const entry = response?.entries?.[0] || response?.data?.entries?.[0];

        if (!entry) {
          throw new Error('Voice gateway returned no entry data');
        }

        const status = (entry.status || entry.statusCode || '').toLowerCase();

        if (status.includes('queued') || status.includes('success') || status.includes('initiated')) {
          await updateRecipientResult(recipient.id, {
            status: 'sending',
            provider_call_session_id: entry.sessionId || entry.callId || null,
            metadata: {
              clientRequestId,
              initialStatus: entry.status || entry.statusCode,
              queuedAt: new Date().toISOString()
            }
          });
          success += 1;
        } else {
          throw new Error(entry.status || 'Voice gateway error');
        }
      } catch (error) {
        failed += 1;
        await updateRecipientResult(recipient.id, {
          status: 'failed',
          last_error: error.message
        });
        logger.error('Voice call initiation failed', {
          campaignId,
          batchId,
          recipientId: recipient.id,
          phone: recipient.phone_number,
          error: error.message
        });
      }

      processed += 1;
      await job.updateProgress(Math.round((processed / recipients.length) * 100));
    }

    await incrementCampaignProgress(campaignId, {
      processedDelta: processed,
      successDelta: success,
      failureDelta: failed
    });

    const newProcessedCount = (batch.processed_recipients || 0) + processed;
    const newSuccessCount = (batch.success_count || 0) + success;
    const newFailureCount = (batch.failure_count || 0) + failed;
    const finalStatus = success === 0 && failed > 0 ? 'failed' : 'completed';

    await markBatchStatus(batchId, finalStatus, {
      processed_recipients: newProcessedCount,
      success_count: newSuccessCount,
      failure_count: newFailureCount,
      completed_at: new Date()
    });

    await refreshCampaignStatus(campaignId);

    logger.info('Voice batch processed', {
      campaignId,
      batchId,
      processed,
      success,
      failed
    });
  },
  {
    connection,
    concurrency,
    limiter,
    prefix: getBullMqPrefix()
  }
);

voiceWorker.on('failed', (job, error) => {
  logger.error('Voice batch job failed', {
    jobId: job?.id,
    error: error.message,
    stack: error.stack
  });
});

voiceWorker.on('completed', (job) => {
  logger.info('Voice batch job completed', { jobId: job.id });
});

export default voiceWorker;
