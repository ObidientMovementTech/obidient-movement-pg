import dotenv from 'dotenv';
import { query } from '../config/db.js';
import {
  createSmsCampaign,
  createVoiceCampaign,
  enqueueSmsBatches,
  enqueueVoiceBatches,
  getCampaignSummary
} from '../services/communications/communicationCampaignService.js';
import {
  updateRecipientByProviderMessageId,
  updateRecipientByProviderSessionId,
  updateRecipientById,
  incrementCampaignProgress,
  refreshCampaignStatus
} from '../services/communications/batchProcessingService.js';
import { logger } from '../middlewares/security.middleware.js';

dotenv.config();

const ensureAdminUser = (req) => {
  if (!req.user || req.user.role !== 'admin') {
    const error = new Error('Admin privileges required');
    error.statusCode = 403;
    throw error;
  }
};

const authorizeWebhookRequest = (req) => {
  const expectedToken = process.env.COMMUNICATIONS_WEBHOOK_TOKEN;

  if (!expectedToken) {
    return true;
  }

  const providedToken =
    req.headers['x-communications-token'] ||
    req.headers['x-webhook-token'] ||
    req.query.token ||
    (typeof req.body === 'object' && req.body ? req.body.token : undefined);

  if (providedToken !== expectedToken) {
    logger.warn('Rejected communications webhook request', {
      path: req.originalUrl,
      hasToken: Boolean(providedToken)
    });
    return false;
  }

  return true;
};

export const createSmsCampaignHandler = async (req, res) => {
  try {
    ensureAdminUser(req);

    const { lgas, messageTemplate, metadata = {}, title, throttledRate } = req.body;

    if (!Array.isArray(lgas) || lgas.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one LGA must be selected' });
    }

    if (!messageTemplate || typeof messageTemplate !== 'string') {
      return res.status(400).json({ success: false, message: 'Message template is required' });
    }

    const { campaign, batches, totalRecipients } = await createSmsCampaign({
      lgas,
      messageTemplate,
      metadata,
      title,
      throttledRate,
      createdBy: req.user.id
    });

    await enqueueSmsBatches(campaign.id, batches);

    return res.status(201).json({
      success: true,
      data: {
        campaign,
        totalRecipients,
        batches
      }
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error('Failed to create SMS campaign', {
      message: error.message,
      stack: error.stack
    });
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create SMS campaign'
    });
  }
};

export const createVoiceCampaignHandler = async (req, res) => {
  try {
    ensureAdminUser(req);

    const { lgas, audioAssetId, metadata = {}, title, throttledRate } = req.body;

    if (!Array.isArray(lgas) || lgas.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one LGA must be selected' });
    }

    if (!audioAssetId) {
      return res.status(400).json({ success: false, message: 'Audio asset is required for voice campaigns' });
    }

    const audioCheck = await query(
      'SELECT id FROM voice_audio_assets WHERE id = $1',
      [audioAssetId]
    );

    if (audioCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Audio asset not found' });
    }

    const { campaign, batches, totalRecipients } = await createVoiceCampaign({
      lgas,
      audioAssetId,
      metadata,
      title,
      throttledRate,
      createdBy: req.user.id
    });

    await enqueueVoiceBatches(campaign.id, batches);

    return res.status(201).json({
      success: true,
      data: {
        campaign,
        totalRecipients,
        batches
      }
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    logger.error('Failed to create voice campaign', {
      message: error.message,
      stack: error.stack
    });
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create voice campaign'
    });
  }
};

export const registerAudioAsset = async (req, res) => {
  try {
    ensureAdminUser(req);

    const { name, description, providerUrl, durationSeconds, metadata = {}, contentType } = req.body;

    if (!name || !providerUrl) {
      return res.status(400).json({ success: false, message: 'Name and providerUrl are required' });
    }

    const result = await query(
      `INSERT INTO voice_audio_assets (
        name,
        description,
        provider_url,
        duration_seconds,
        metadata,
        content_type,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'audio/mpeg'), $7)
      RETURNING *`,
      [
        name,
        description || null,
        providerUrl,
        durationSeconds || null,
        metadata,
        contentType,
        req.user.id
      ]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Failed to register audio asset', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: 'Failed to register audio asset' });
  }
};

export const listAudioAssets = async (_req, res) => {
  try {
    const result = await query(
      `SELECT * FROM voice_audio_assets ORDER BY created_at DESC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error('Failed to fetch audio assets', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: 'Failed to fetch audio assets' });
  }
};

export const listCampaigns = async (req, res) => {
  try {
    ensureAdminUser(req);

    const { type, status, limit = 20, offset = 0 } = req.query;

    const filters = [];
    const params = [];
    let index = 1;

    if (type) {
      filters.push(`campaign_type = $${index}`);
      params.push(type);
      index += 1;
    }

    if (status) {
      filters.push(`status = $${index}`);
      params.push(status);
      index += 1;
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const dataQuery = await query(
      `SELECT *
       FROM communication_campaigns
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${index} OFFSET $${index + 1}`,
      [...params, Number(limit), Number(offset)]
    );

    const countQuery = await query(
      `SELECT COUNT(*) AS total
       FROM communication_campaigns
       ${whereClause}`,
      params
    );

    return res.json({
      success: true,
      data: dataQuery.rows,
      pagination: {
        total: Number(countQuery.rows[0].total || 0),
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    logger.error('Failed to list campaigns', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: 'Failed to list campaigns' });
  }
};

export const getCampaignSummaryHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const summary = await getCampaignSummary(id);

    if (!summary) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    return res.json({ success: true, data: summary });
  } catch (error) {
    logger.error('Failed to fetch campaign summary', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: 'Failed to fetch campaign summary' });
  }
};

export const cancelCampaignHandler = async (req, res) => {
  try {
    ensureAdminUser(req);

    const { id } = req.params;

    await query(
      `UPDATE communication_campaigns
       SET status = 'cancelled',
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    return res.json({ success: true });
  } catch (error) {
    logger.error('Failed to cancel campaign', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: 'Failed to cancel campaign' });
  }
};

const mapSmsStatus = (status) => {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'success':
    case 'sent':
    case 'submitted':
    case 'delivered':
    case 'deliveredtoterminal':
      return 'delivered';
    case 'failed':
    case 'rejected':
    case 'undeliverable':
      return 'failed';
    default:
      return 'sent';
  }
};

export const smsDeliveryWebhook = async (req, res) => {
  try {
    if (!authorizeWebhookRequest(req)) {
      return res.status(403).json({ success: false, message: 'Invalid webhook token' });
    }

    const payload = req.body || {};
    const messageId = payload.id || payload.messageId || payload.message_id;

    if (!messageId) {
      logger.warn('SMS webhook missing messageId', { payload });
      return res.status(200).json({ success: true });
    }

    const recipientResult = await query(
      `SELECT id, status, campaign_id FROM communication_recipients WHERE provider_message_id = $1`,
      [messageId]
    );

    if (recipientResult.rowCount === 0) {
      logger.warn('SMS webhook could not map messageId to recipient', { messageId });
      return res.status(200).json({ success: true });
    }

    const recipient = recipientResult.rows[0];
    const previousStatus = recipient.status;
    const status = mapSmsStatus(payload.status || payload.deliveryStatus);
    const lastError = status === 'failed' ? (payload.failureReason || payload.reason) : null;

    await updateRecipientByProviderMessageId(messageId, {
      status,
      delivered_at: status === 'delivered' ? new Date() : null,
      last_error: lastError
    });

    if (status !== previousStatus) {
      let successDelta = 0;
      let failureDelta = 0;

      if (status === 'failed' && previousStatus !== 'failed') {
        failureDelta = 1;
        if (previousStatus === 'sent' || previousStatus === 'delivered') {
          successDelta = -1;
        }
      } else if (status === 'delivered' && previousStatus !== 'delivered') {
        if (previousStatus === 'failed') {
          failureDelta = -1;
          successDelta = 1;
        }
      }

      if (successDelta !== 0 || failureDelta !== 0) {
        await incrementCampaignProgress(recipient.campaign_id, {
          processedDelta: 0,
          successDelta,
          failureDelta
        });
        await refreshCampaignStatus(recipient.campaign_id);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error('SMS webhook processing failed', {
      message: error.message,
      stack: error.stack
    });
    return res.status(200).json({ success: true });
  }
};

const buildVoiceXmlResponse = (audioUrl) => {
  const safeUrl = audioUrl || '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Play url="${safeUrl}"/>\n</Response>`;
};

const parseRecipientId = (clientRequestId) => {
  if (!clientRequestId) return null;
  const parts = String(clientRequestId).split('-');
  const maybeId = parts[parts.length - 1];
  const parsed = parseInt(maybeId, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const voiceStatusWebhook = async (req, res) => {
  try {
    if (!authorizeWebhookRequest(req)) {
      return res.status(403).send('Forbidden');
    }

    const payload = req.body || {};
    const { isActive } = payload;
    const sessionId = payload.sessionId || payload.callSessionState || payload.callSessionId;
    const clientRequestId = payload.clientRequestId;
    const recipientId = parseRecipientId(clientRequestId);

    if (isActive === '1') {
      if (!recipientId) {
        logger.warn('Voice webhook missing recipient reference', { clientRequestId });
        res.set('Content-Type', 'application/xml');
        return res.send(buildVoiceXmlResponse(process.env.AT_VOICE_FALLBACK_AUDIO_URL || ''));
      }

      const audioResult = await query(
        `SELECT va.provider_url
         FROM communication_recipients cr
         JOIN communication_campaigns cc ON cc.id = cr.campaign_id
         LEFT JOIN voice_audio_assets va ON va.id = cc.audio_asset_id
         WHERE cr.id = $1`,
        [recipientId]
      );

      const audioUrl = audioResult.rows[0]?.provider_url || process.env.AT_VOICE_FALLBACK_AUDIO_URL || '';

      if (sessionId) {
        await updateRecipientById(recipientId, {
          provider_call_session_id: sessionId,
          status: 'sending'
        });
      }

      res.set('Content-Type', 'application/xml');
      return res.send(buildVoiceXmlResponse(audioUrl));
    }

    // Call has ended
    if (sessionId) {
      const status = (payload.status || '').toLowerCase();
      const duration = parseInt(payload.durationInSeconds || '0', 10);
      const delivered = duration > 0 || status.includes('completed');

      const recipientResult = await query(
        `SELECT id, status, campaign_id FROM communication_recipients WHERE provider_call_session_id = $1`,
        [sessionId]
      );

      if (recipientResult.rowCount > 0) {
        const recipient = recipientResult.rows[0];
        const previousStatus = recipient.status;
        const newStatus = delivered ? 'delivered' : 'failed';

        await updateRecipientByProviderSessionId(sessionId, {
          status: newStatus,
          delivered_at: delivered ? new Date() : null,
          last_error: delivered ? null : (payload.status || payload.reason || null)
        });

        if (newStatus !== previousStatus) {
          let successDelta = 0;
          let failureDelta = 0;

          if (newStatus === 'failed' && previousStatus !== 'failed') {
            failureDelta = 1;
            if (previousStatus === 'sending' || previousStatus === 'sent' || previousStatus === 'delivered') {
              successDelta = -1;
            }
          } else if (newStatus === 'delivered' && previousStatus !== 'delivered') {
            if (previousStatus === 'failed') {
              failureDelta = -1;
              successDelta = 1;
            }
          }

          if (successDelta !== 0 || failureDelta !== 0) {
            await incrementCampaignProgress(recipient.campaign_id, {
              processedDelta: 0,
              successDelta,
              failureDelta
            });
            await refreshCampaignStatus(recipient.campaign_id);
          }
        }
      }
    } else if (recipientId) {
      const recipientResult = await query(
        `SELECT id, status, campaign_id FROM communication_recipients WHERE id = $1`,
        [recipientId]
      );

      if (recipientResult.rowCount > 0) {
        const recipient = recipientResult.rows[0];
        if (recipient.status !== 'failed') {
          await updateRecipientById(recipientId, {
            status: 'failed',
            last_error: payload.status || 'Unknown voice callback status'
          });

          await incrementCampaignProgress(recipient.campaign_id, {
            processedDelta: 0,
            successDelta: (recipient.status === 'sending' || recipient.status === 'sent' || recipient.status === 'delivered') ? -1 : 0,
            failureDelta: 1
          });
          await refreshCampaignStatus(recipient.campaign_id);
        }
      }
    }

    return res.status(200).send('OK');
  } catch (error) {
    logger.error('Voice webhook processing failed', {
      message: error.message,
      stack: error.stack
    });
    return res.status(200).send('OK');
  }
};
