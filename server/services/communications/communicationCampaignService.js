import dotenv from 'dotenv';
import { getClient, query } from '../../config/db.js';
import smsQueue, { QUEUE_NAME as SMS_QUEUE_NAME } from '../../queues/smsQueue.js';
import voiceQueue, { QUEUE_NAME as VOICE_QUEUE_NAME } from '../../queues/voiceQueue.js';
import { logger } from '../../middlewares/security.middleware.js';

dotenv.config();

const SMS_BATCH_SIZE = parseInt(process.env.SMS_BATCH_SIZE || '500', 10);
const VOICE_BATCH_SIZE = parseInt(process.env.VOICE_BATCH_SIZE || '100', 10);

const chunkArray = (source = [], chunkSize = 500) => {
  const chunks = [];
  for (let i = 0; i < source.length; i += chunkSize) {
    chunks.push(source.slice(i, i + chunkSize));
  }
  return chunks;
};

const stageRecipientsForChunks = async (client, campaignId, chunks, campaignType) => {
  const batchRecords = [];

  for (let index = 0; index < chunks.length; index++) {
    const voterIds = chunks[index];
    const batchResult = await client.query(
      `INSERT INTO communication_batches (
        campaign_id,
        batch_index,
        total_recipients
      ) VALUES ($1, $2, $3)
      RETURNING id`,
      [campaignId, index, voterIds.length]
    );

    const batchId = batchResult.rows[0].id;

    const insertRecipients = await client.query(
      `INSERT INTO communication_recipients (
        campaign_id,
        batch_id,
        voter_id,
        phone_number,
        full_name,
        first_name,
        last_name,
        lga,
        ward,
        polling_unit,
        status,
        metadata
      )
      SELECT
        $1,
        $2,
        v.id,
        v.phone_number,
        COALESCE(NULLIF(v.full_name, ''), TRIM(CONCAT_WS(' ', v.first_name, v.last_name)), 'Valued Supporter'),
        NULLIF(v.first_name, ''),
        NULLIF(v.last_name, ''),
        v.lga,
        v.ward,
        v.polling_unit,
        'queued',
        jsonb_build_object('campaignType', $4)
      FROM inec_voters v
      WHERE v.id = ANY($3::int[])
        AND v.phone_number IS NOT NULL
        AND LENGTH(TRIM(v.phone_number)) > 0`,
      [campaignId, batchId, voterIds, campaignType]
    );

    batchRecords.push({
      batchId,
      totalRecipients: insertRecipients.rowCount
    });
  }

  return batchRecords;
};

export const createSmsCampaign = async ({
  lgas,
  messageTemplate,
  createdBy,
  metadata = {},
  title,
  throttledRate
}) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const campaignResult = await client.query(
      `INSERT INTO communication_campaigns (
        campaign_type,
        status,
        title,
        target_lgas,
        message_template,
        throttled_rate,
        metadata,
        created_by,
        queued_at
      ) VALUES ($1, 'queued', $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        'SMS',
        title || 'SMS Campaign',
        lgas,
        messageTemplate,
        throttledRate || null,
        metadata,
        createdBy
      ]
    );

    const campaign = campaignResult.rows[0];

    const votersResult = await client.query(
      `SELECT id FROM inec_voters
       WHERE lga = ANY($1::text[])
         AND phone_number IS NOT NULL
         AND LENGTH(TRIM(phone_number)) > 0`,
      [lgas]
    );

    if (votersResult.rowCount === 0) {
      throw new Error('No voters with phone numbers found for the selected LGAs');
    }

    const voterIds = votersResult.rows.map((row) => row.id);
    const chunks = chunkArray(voterIds, SMS_BATCH_SIZE);

    const batchRecords = await stageRecipientsForChunks(client, campaign.id, chunks, 'SMS');

    const totalRecipients = batchRecords.reduce((acc, batch) => acc + batch.totalRecipients, 0);

    if (totalRecipients === 0) {
      throw new Error('No eligible recipients found with valid phone numbers');
    }

    await client.query(
      `UPDATE communication_campaigns
       SET total_recipients = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [totalRecipients, campaign.id]
    );

    await client.query('COMMIT');

    return {
      campaign,
      batches: batchRecords,
      totalRecipients
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const createVoiceCampaign = async ({
  lgas,
  audioAssetId,
  createdBy,
  metadata = {},
  title,
  throttledRate
}) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const campaignResult = await client.query(
      `INSERT INTO communication_campaigns (
        campaign_type,
        status,
        title,
        target_lgas,
        audio_asset_id,
        throttled_rate,
        metadata,
        created_by,
        queued_at
      ) VALUES ($1, 'queued', $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        'VOICE',
        title || 'Voice Campaign',
        lgas,
        audioAssetId,
        throttledRate || null,
        metadata,
        createdBy
      ]
    );

    const campaign = campaignResult.rows[0];

    const votersResult = await client.query(
      `SELECT id FROM inec_voters
       WHERE lga = ANY($1::text[])
         AND phone_number IS NOT NULL
         AND LENGTH(TRIM(phone_number)) > 0`,
      [lgas]
    );

    if (votersResult.rowCount === 0) {
      throw new Error('No voters with phone numbers found for the selected LGAs');
    }

    const voterIds = votersResult.rows.map((row) => row.id);
    const chunks = chunkArray(voterIds, VOICE_BATCH_SIZE);

    const batchRecords = await stageRecipientsForChunks(client, campaign.id, chunks, 'VOICE');

    const totalRecipients = batchRecords.reduce((acc, batch) => acc + batch.totalRecipients, 0);

    if (totalRecipients === 0) {
      throw new Error('No eligible recipients found with valid phone numbers');
    }

    await client.query(
      `UPDATE communication_campaigns
       SET total_recipients = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [totalRecipients, campaign.id]
    );

    await client.query('COMMIT');

    return {
      campaign,
      batches: batchRecords,
      totalRecipients
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const enqueueSmsBatches = async (campaignId, batches) => {
  for (const batch of batches) {
    const jobId = `${campaignId}:${batch.batchId}`;
    await smsQueue.add(
      'send-sms-batch',
      { campaignId, batchId: batch.batchId },
      { jobId }
    );

    await query(
      `UPDATE communication_batches
       SET job_id = $1
       WHERE id = $2`,
      [jobId, batch.batchId]
    );
  }

  await query(
    `UPDATE communication_campaigns
     SET status = 'in_progress',
         updated_at = NOW()
     WHERE id = $1`,
    [campaignId]
  );

  logger.info('Enqueued SMS campaign batches', {
    campaignId,
    batches: batches.length,
    queue: SMS_QUEUE_NAME
  });
};

export const enqueueVoiceBatches = async (campaignId, batches) => {
  for (const batch of batches) {
    const jobId = `${campaignId}:${batch.batchId}`;
    await voiceQueue.add(
      'send-voice-batch',
      { campaignId, batchId: batch.batchId },
      { jobId }
    );

    await query(
      `UPDATE communication_batches
       SET job_id = $1
       WHERE id = $2`,
      [jobId, batch.batchId]
    );
  }

  await query(
    `UPDATE communication_campaigns
     SET status = 'in_progress',
         updated_at = NOW()
     WHERE id = $1`,
    [campaignId]
  );

  logger.info('Enqueued voice campaign batches', {
    campaignId,
    batches: batches.length,
    queue: VOICE_QUEUE_NAME
  });
};

export const getCampaignSummary = async (campaignId) => {
  const campaignResult = await query(
    `SELECT * FROM communication_campaigns WHERE id = $1`,
    [campaignId]
  );

  if (campaignResult.rowCount === 0) {
    return null;
  }

  const campaign = campaignResult.rows[0];

  const batchResult = await query(
    `SELECT * FROM communication_batches WHERE campaign_id = $1 ORDER BY batch_index`,
    [campaignId]
  );

  const recipientStats = await query(
    `SELECT status, COUNT(*) as count
     FROM communication_recipients
     WHERE campaign_id = $1
     GROUP BY status`,
    [campaignId]
  );

  return {
    campaign,
    batches: batchResult.rows,
    recipientStats: recipientStats.rows
  };
};
