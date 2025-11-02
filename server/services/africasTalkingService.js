import africastalking from 'africastalking';
import dotenv from 'dotenv';
import { logger } from '../middlewares/security.middleware.js';

dotenv.config();

const username = process.env.AT_USERNAME;
const apiKey = process.env.AT_API_KEY;

if (!username || !apiKey) {
  logger.warn('Africa\'s Talking credentials missing. SMS/Voice workers will be disabled until configured.');
}

let atClient = null;

const getClient = () => {
  if (!atClient && username && apiKey) {
    atClient = africastalking({ username, apiKey });
  }
  return atClient;
};

export const getSmsClient = () => {
  const client = getClient();
  if (!client) {
    throw new Error('Africa\'s Talking client not configured');
  }
  return client.SMS;
};

export const getVoiceClient = () => {
  const client = getClient();
  if (!client) {
    throw new Error('Africa\'s Talking client not configured');
  }
  return client.VOICE;
};

export const sendSmsMessage = async ({ to, message, senderId, enqueue = false, messageId }) => {
  const sms = getSmsClient();
  const params = {
    to,
    message,
    enqueue
  };

  if (senderId) {
    params.from = senderId;
  }

  if (messageId) {
    params.messageId = messageId;
  }

  return sms.send(params);
};

export const initiateVoiceCall = async ({ to, callerId, clientRequestId, queueName }) => {
  const voice = getVoiceClient();
  const params = {
    callFrom: callerId,
    callTo: to
  };

  if (clientRequestId) {
    params.clientRequestId = clientRequestId;
  }

  if (queueName) {
    params.queueName = queueName;
  }

  return voice.call(params);
};
