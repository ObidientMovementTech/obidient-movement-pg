import 'dotenv/config';
import { Worker } from 'bullmq';
import { createRedisClient, getBullMqPrefix } from '../config/redis.js';
import { logger } from '../middlewares/security.middleware.js';
import { sendSmsMessage } from '../services/africasTalkingService.js';
import {
  fetchBatchContext,
  markBatchStatus,
  updateRecipientResult,
  incrementCampaignProgress,
  refreshCampaignStatus
} from '../services/communications/batchProcessingService.js';
import { renderTemplate } from '../utils/communications/templateRenderer.js';

const queueName = 'sms-broadcast';

const limiter = {
  max: parseInt(process.env.SMS_RATE_LIMIT_PER_SECOND || '10', 10),
  duration: 1000
};

const concurrency = parseInt(process.env.SMS_WORKER_CONCURRENCY || '5', 10);

const connection = createRedisClient();

if (!process.env.AT_SMS_SENDER_ID) {
  logger.warn('AT_SMS_SENDER_ID is not set. Africa\'s Talking will use the default sender.');
}

const smsWorker = new Worker(
  queueName,
  async (job) => {
    const { campaignId, batchId } = job.data;
    logger.info('Processing SMS batch', { campaignId, batchId, jobId: job.id });

    const context = await fetchBatchContext(batchId);

    if (!context) {
      logger.error('SMS batch context not found', { batchId, campaignId });
      return;
    }

    const { batch, recipients } = context;

    if (!batch.message_template) {
      throw new Error('SMS campaign missing message template');
    }

    await markBatchStatus(batchId, 'processing', { started_at: new Date() });

    let processed = 0;
    let success = 0;
    let failed = 0;

    const senderId = process.env.AT_SMS_SENDER_ID;

    for (const recipient of recipients) {
      const templateData = {
        full_name: recipient.full_name,
        first_name: recipient.first_name,
        last_name: recipient.last_name,
        lga: recipient.lga,
        ward: recipient.ward,
        polling_unit: recipient.polling_unit
      };

      const message = renderTemplate(batch.message_template, templateData) || batch.message_template;

      try {
        const response = await sendSmsMessage({
          to: recipient.phone_number,
          message,
          senderId,
          enqueue: true
        });

        const recipientInfo = response?.SMSMessageData?.Recipients?.[0];

        if (!recipientInfo) {
          throw new Error('SMS gateway returned no recipient data');
        }

        const status = recipientInfo.status?.toLowerCase();

        if (status === 'success') {
          await updateRecipientResult(recipient.id, {
            status: 'sent',
            provider_message_id: recipientInfo.messageId,
            last_error: null
          });
          success += 1;
        } else {
          throw new Error(recipientInfo.status || 'SMS gateway error');
        }
      } catch (error) {
        failed += 1;
        await updateRecipientResult(recipient.id, {
          status: 'failed',
          last_error: error.message
        });
        logger.error('SMS send failure', {
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

    logger.info('SMS batch completed', {
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

smsWorker.on('failed', (job, error) => {
  logger.error('SMS batch job failed', {
    jobId: job?.id,
    error: error.message,
    stack: error.stack
  });
});

smsWorker.on('completed', (job) => {
  logger.info('SMS batch job completed', { jobId: job.id });
});

export default smsWorker;
