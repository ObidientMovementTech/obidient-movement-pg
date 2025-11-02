import { query } from '../../config/db.js';

export const markBatchStatus = async (batchId, status, fields = {}) => {
  const updates = ['status = $1'];
  const values = [status];
  let index = 2;

  for (const [key, value] of Object.entries(fields)) {
    updates.push(`${key} = $${index}`);
    values.push(value);
    index += 1;
  }

  values.push(batchId);

  await query(
    `UPDATE communication_batches
     SET ${updates.join(', ')}, updated_at = NOW()
     WHERE id = $${index}`,
    values
  );
};

export const incrementBatchProgress = async (batchId, { processedDelta = 0, successDelta = 0, failureDelta = 0 }) => {
  await query(
    `UPDATE communication_batches
     SET processed_recipients = processed_recipients + $1,
         success_count = success_count + $2,
         failure_count = failure_count + $3,
         updated_at = NOW()
     WHERE id = $4`,
    [processedDelta, successDelta, failureDelta, batchId]
  );
};

export const fetchBatchContext = async (batchId) => {
  const batchResult = await query(
    `SELECT
        cb.*,
        cc.campaign_type,
        cc.status as campaign_status,
        cc.message_template,
        cc.audio_asset_id,
        cc.metadata as campaign_metadata,
        cc.throttled_rate,
        va.provider_url as audio_url,
        va.metadata as audio_metadata
     FROM communication_batches cb
     JOIN communication_campaigns cc ON cc.id = cb.campaign_id
     LEFT JOIN voice_audio_assets va ON va.id = cc.audio_asset_id
     WHERE cb.id = $1`,
    [batchId]
  );

  if (batchResult.rowCount === 0) {
    return null;
  }

  const recipientsResult = await query(
    `SELECT
        id,
        voter_id,
        phone_number,
        full_name,
        first_name,
        last_name,
        lga,
        ward,
        polling_unit,
        status,
        attempt_count,
        provider_message_id,
        provider_call_session_id,
        metadata
     FROM communication_recipients
     WHERE batch_id = $1
     ORDER BY id`,
    [batchId]
  );

  return {
    batch: batchResult.rows[0],
    recipients: recipientsResult.rows
  };
};

export const updateRecipientResult = async (recipientId, update) => {
  const updates = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(update)) {
    updates.push(`${key} = $${index}`);
    values.push(value);
    index += 1;
  }
  values.push(recipientId);

  await query(
    `UPDATE communication_recipients
     SET ${updates.join(', ')}, last_attempt_at = NOW(), attempt_count = attempt_count + 1, updated_at = NOW()
     WHERE id = $${index}`,
    values
  );
};

const buildUpdateQuery = (update) => {
  const updates = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(update)) {
    updates.push(`${key} = $${index}`);
    values.push(value);
    index += 1;
  }

  return { updates, values };
};

export const updateRecipientByProviderMessageId = async (messageId, update) => {
  const { updates, values } = buildUpdateQuery(update);
  values.push(messageId);

  await query(
    `UPDATE communication_recipients
     SET ${updates.join(', ')}, updated_at = NOW()
     WHERE provider_message_id = $${values.length}`,
    values
  );
};

export const updateRecipientByProviderSessionId = async (sessionId, update) => {
  const { updates, values } = buildUpdateQuery(update);
  values.push(sessionId);

  await query(
    `UPDATE communication_recipients
     SET ${updates.join(', ')}, updated_at = NOW()
     WHERE provider_call_session_id = $${values.length}`,
    values
  );
};

export const updateRecipientById = async (recipientId, update) => {
  const { updates, values } = buildUpdateQuery(update);
  values.push(recipientId);

  await query(
    `UPDATE communication_recipients
     SET ${updates.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length}`,
    values
  );
};

export const incrementCampaignProgress = async (campaignId, { processedDelta = 0, successDelta = 0, failureDelta = 0 }) => {
  await query(
    `UPDATE communication_campaigns
     SET processed_recipients = processed_recipients + $1,
         success_count = GREATEST(success_count + $2, 0),
         failure_count = GREATEST(failure_count + $3, 0),
         updated_at = NOW()
     WHERE id = $4`,
    [processedDelta, successDelta, failureDelta, campaignId]
  );
};

export const refreshCampaignStatus = async (campaignId) => {
  await query(
    `UPDATE communication_campaigns
     SET status = CASE
         WHEN processed_recipients >= total_recipients AND success_count = 0 AND failure_count > 0 THEN 'failed'
         WHEN processed_recipients >= total_recipients THEN 'completed'
         ELSE status
       END,
       completed_at = CASE
         WHEN processed_recipients >= total_recipients AND completed_at IS NULL THEN NOW()
         ELSE completed_at
       END
     WHERE id = $1`,
    [campaignId]
  );
};
