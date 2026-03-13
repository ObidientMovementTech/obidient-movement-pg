import { query, getClient } from '../config/db.js';

class BroadcastEmailLog {
  constructor(data) {
    Object.assign(this, data);
  }

  // Bulk insert pending log rows for a broadcast
  static async insertBulk(broadcastId, users) {
    if (!users || users.length === 0) return 0;

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Build multi-row insert (batches of 500 to avoid param limits)
      const chunkSize = 500;
      let inserted = 0;

      for (let i = 0; i < users.length; i += chunkSize) {
        const chunk = users.slice(i, i + chunkSize);
        const values = [];
        const placeholders = [];
        let paramIdx = 1;

        for (const user of chunk) {
          placeholders.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, 'pending')`);
          values.push(broadcastId, user.id, user.email, user.name || 'Unknown');
          paramIdx += 4;
        }

        await client.query(
          `INSERT INTO "broadcastEmailLogs" ("broadcastId", "userId", email, "userName", status)
           VALUES ${placeholders.join(', ')}
           ON CONFLICT ("broadcastId", "userId") DO NOTHING`,
          values
        );
        inserted += chunk.length;
      }

      await client.query('COMMIT');
      return inserted;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update a single log row status
  static async updateStatus(logId, status, errorMessage = null) {
    const sentAt = status === 'sent' ? 'NOW()' : 'NULL';
    const result = await query(
      `UPDATE "broadcastEmailLogs" 
       SET status = $1, "errorMessage" = $2, "sentAt" = ${sentAt}
       WHERE id = $3 RETURNING *`,
      [status, errorMessage, logId]
    );
    return result.rows[0] ? new BroadcastEmailLog(result.rows[0]) : null;
  }

  // Fetch pending logs for a broadcast (paginated for worker processing)
  static async fetchPending(broadcastId, limit = 500, offset = 0) {
    const result = await query(
      `SELECT * FROM "broadcastEmailLogs" 
       WHERE "broadcastId" = $1 AND status = 'pending'
       ORDER BY "createdAt" ASC
       LIMIT $2 OFFSET $3`,
      [broadcastId, limit, offset]
    );
    return result.rows.map(row => new BroadcastEmailLog(row));
  }

  // Get stats for a broadcast
  static async getStats(broadcastId) {
    const result = await query(
      `SELECT 
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'sent') AS sent,
         COUNT(*) FILTER (WHERE status = 'failed') AS failed,
         COUNT(*) FILTER (WHERE status = 'pending') AS pending
       FROM "broadcastEmailLogs"
       WHERE "broadcastId" = $1`,
      [broadcastId]
    );
    const row = result.rows[0];
    return {
      total: parseInt(row.total),
      sent: parseInt(row.sent),
      failed: parseInt(row.failed),
      pending: parseInt(row.pending)
    };
  }

  // Get paginated logs with search & status filter
  static async findByBroadcast(broadcastId, options = {}) {
    const { limit = 50, offset = 0, status = null, search = null } = options;

    let whereClause = 'WHERE "broadcastId" = $1';
    const values = [broadcastId];
    let paramIdx = 2;

    if (status && status !== 'all') {
      whereClause += ` AND status = $${paramIdx}`;
      values.push(status);
      paramIdx++;
    }

    if (search && search.trim()) {
      whereClause += ` AND (email ILIKE $${paramIdx} OR "userName" ILIKE $${paramIdx})`;
      values.push(`%${search.trim()}%`);
      paramIdx++;
    }

    // Count total matching
    const countResult = await query(
      `SELECT COUNT(*) AS total FROM "broadcastEmailLogs" ${whereClause}`,
      values
    );

    // Fetch page
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM "broadcastEmailLogs" ${whereClause}
       ORDER BY "sentAt" DESC NULLS LAST, "createdAt" DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      values
    );

    return {
      logs: result.rows.map(row => new BroadcastEmailLog(row)),
      total: parseInt(countResult.rows[0].total),
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
    };
  }

  // Get failed logs for retry
  static async fetchFailed(broadcastId) {
    const result = await query(
      `SELECT * FROM "broadcastEmailLogs" 
       WHERE "broadcastId" = $1 AND status = 'failed'
       ORDER BY "createdAt" ASC`,
      [broadcastId]
    );
    return result.rows.map(row => new BroadcastEmailLog(row));
  }

  // Reset failed logs to pending for retry
  static async resetFailedToPending(broadcastId) {
    const result = await query(
      `UPDATE "broadcastEmailLogs" 
       SET status = 'pending', "errorMessage" = NULL, "sentAt" = NULL
       WHERE "broadcastId" = $1 AND status = 'failed'
       RETURNING id`,
      [broadcastId]
    );
    return result.rows.length;
  }
}

export default BroadcastEmailLog;
