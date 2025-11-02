import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import { createRedisClient, getBullMqPrefix } from '../config/redis.js';
import { logger } from '../middlewares/security.middleware.js';

dotenv.config();

const QUEUE_NAME = 'voice-broadcast';
const prefix = getBullMqPrefix();

const buildQueueOptions = () => {
  const keepCompleted = parseInt(process.env.VOICE_KEEP_COMPLETED || '500', 10);
  const removeOnComplete = Number.isNaN(keepCompleted) ? true : keepCompleted;

  return {
    connection: createRedisClient(),
    defaultJobOptions: {
      attempts: parseInt(process.env.VOICE_JOB_ATTEMPTS || '3', 10),
      backoff: {
        type: 'exponential',
        delay: parseInt(process.env.VOICE_JOB_BACKOFF_MS || '15000', 10)
      },
      removeOnComplete,
      removeOnFail: false
    },
    prefix
  };
};

const queue = new Queue(QUEUE_NAME, buildQueueOptions());

// QueueScheduler is no longer needed in BullMQ v4+
// Job scheduling is now handled automatically by the Queue itself

queue.waitUntilReady()
  .then(() => logger.info('Voice queue ready'))
  .catch((error) => {
    logger.error('Failed to initialize voice queue', {
      message: error.message,
      stack: error.stack
    });
  });

export default queue;
export { QUEUE_NAME };
