import { query, getClient } from '../config/db.js';

class Notification {
  constructor(notificationData) {
    Object.assign(this, notificationData);
  }

  // Create a new notification
  static async create(notificationData) {
    const {
      recipient,
      type,
      title,
      message,
      relatedCause,
      relatedVotingBloc,
      read = false
    } = notificationData;

    const result = await query(
      `INSERT INTO notifications (
        recipient, type, title, message, "relatedCause", "relatedVotingBloc", read
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [recipient, type, title, message, relatedCause, relatedVotingBloc, read]
    );

    return new Notification(result.rows[0]);
  }

  // Find notification by ID
  static async findById(id) {
    const result = await query(
      `SELECT n.*, u.name as "recipientName", u.email as "recipientEmail"
       FROM notifications n
       LEFT JOIN users u ON n.recipient = u.id
       WHERE n.id = $1`,
      [id]
    );

    return result.rows.length > 0 ? new Notification(result.rows[0]) : null;
  }

  // Find notifications by recipient with pagination
  static async findByRecipient(recipientId, options = {}) {
    const {
      limit = 20,
      offset = 0,
      unreadOnly = false,
      type = null,
      orderBy = 'createdAt',
      orderDirection = 'DESC'
    } = options;

    let whereClause = 'WHERE n.recipient = $1';
    let values = [recipientId];
    let paramCount = 2;

    if (unreadOnly) {
      whereClause += ` AND n.read = FALSE`;
    }

    if (type) {
      whereClause += ` AND n.type = $${paramCount}`;
      values.push(type);
      paramCount++;
    }

    const result = await query(
      `SELECT n.*, vb.name as "relatedVotingBlocName"
       FROM notifications n
       LEFT JOIN "votingBlocs" vb ON n."relatedVotingBloc" = vb.id
       ${whereClause}
       ORDER BY n."${orderBy}" ${orderDirection}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return result.rows.map(row => new Notification(row));
  }

  // Find unread notifications for a user
  static async findUnreadByRecipient(recipientId, options = {}) {
    const { limit = 50, type = null } = options;

    let whereClause = 'WHERE n.recipient = $1 AND n.read = FALSE';
    let values = [recipientId];
    let paramCount = 2;

    if (type) {
      whereClause += ` AND n.type = $${paramCount}`;
      values.push(type);
      paramCount++;
    }

    const result = await query(
      `SELECT n.*, vb.name as "relatedVotingBlocName"
       FROM notifications n
       LEFT JOIN "votingBlocs" vb ON n."relatedVotingBloc" = vb.id
       ${whereClause}
       ORDER BY n."createdAt" DESC
       LIMIT $${paramCount}`,
      [...values, limit]
    );

    return result.rows.map(row => new Notification(row));
  }

  // Get unread notification count for a user
  static async getUnreadCount(recipientId, type = null) {
    let whereClause = 'WHERE recipient = $1 AND read = FALSE';
    let values = [recipientId];

    if (type) {
      whereClause += ' AND type = $2';
      values.push(type);
    }

    const result = await query(
      `SELECT COUNT(*) as count FROM notifications ${whereClause}`,
      values
    );

    return parseInt(result.rows[0].count);
  }

  // Mark notification as read
  static async markAsRead(id) {
    const result = await query(
      'UPDATE notifications SET read = TRUE, "updatedAt" = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows.length > 0 ? new Notification(result.rows[0]) : null;
  }

  // Mark multiple notifications as read
  static async markMultipleAsRead(notificationIds) {
    if (!notificationIds || notificationIds.length === 0) return [];

    const placeholders = notificationIds.map((_, index) => `$${index + 1}`).join(',');

    const result = await query(
      `UPDATE notifications 
       SET read = TRUE, "updatedAt" = NOW() 
       WHERE id IN (${placeholders}) 
       RETURNING *`,
      notificationIds
    );

    return result.rows.map(row => new Notification(row));
  }

  // Mark all notifications as read for a user
  static async markAllAsReadForUser(recipientId, type = null) {
    let whereClause = 'WHERE recipient = $1 AND read = FALSE';
    let values = [recipientId];

    if (type) {
      whereClause += ' AND type = $2';
      values.push(type);
    }

    const result = await query(
      `UPDATE notifications 
       SET read = TRUE, "updatedAt" = NOW() 
       ${whereClause}
       RETURNING *`,
      values
    );

    return {
      updatedCount: result.rows.length,
      updatedNotifications: result.rows.map(row => new Notification(row))
    };
  }

  // Find notifications by type
  static async findByType(type, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const result = await query(
      `SELECT n.*, u.name as "recipientName", u.email as "recipientEmail"
       FROM notifications n
       LEFT JOIN users u ON n.recipient = u.id
       WHERE n.type = $1
       ORDER BY n."createdAt" DESC
       LIMIT $2 OFFSET $3`,
      [type, limit, offset]
    );

    return result.rows.map(row => new Notification(row));
  }

  // Find notifications related to a voting bloc
  static async findByVotingBloc(votingBlocId, options = {}) {
    const { limit = 50, offset = 0, recipientId = null } = options;

    let whereClause = 'WHERE n."relatedVotingBloc" = $1';
    let values = [votingBlocId];
    let paramCount = 2;

    if (recipientId) {
      whereClause += ` AND n.recipient = $${paramCount}`;
      values.push(recipientId);
      paramCount++;
    }

    const result = await query(
      `SELECT n.*, u.name as "recipientName", u.email as "recipientEmail",
              vb.name as "relatedVotingBlocName"
       FROM notifications n
       LEFT JOIN users u ON n.recipient = u.id
       LEFT JOIN "votingBlocs" vb ON n."relatedVotingBloc" = vb.id
       ${whereClause}
       ORDER BY n."createdAt" DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return result.rows.map(row => new Notification(row));
  }

  // Create bulk notifications (for broadcasts)
  static async createBulk(notificationsData) {
    if (!notificationsData || notificationsData.length === 0) return [];

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const createdNotifications = [];

      for (const notificationData of notificationsData) {
        const {
          recipient,
          type,
          title,
          message,
          relatedCause,
          relatedVotingBloc,
          read = false
        } = notificationData;

        const result = await client.query(
          `INSERT INTO notifications (
            recipient, type, title, message, "relatedCause", "relatedVotingBloc", read
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING *`,
          [recipient, type, title, message, relatedCause, relatedVotingBloc, read]
        );

        createdNotifications.push(new Notification(result.rows[0]));
      }

      await client.query('COMMIT');
      return createdNotifications;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete notification
  static async deleteById(id) {
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows.length > 0 ? new Notification(result.rows[0]) : null;
  }

  // Delete multiple notifications by IDs
  static async deleteMultiple(ids, recipientId = null) {
    let whereClause = 'WHERE id = ANY($1)';
    let values = [ids];

    if (recipientId) {
      whereClause += ' AND recipient = $2';
      values.push(recipientId);
    }

    const result = await query(
      `DELETE FROM notifications ${whereClause} RETURNING *`,
      values
    );

    return {
      deletedCount: result.rows.length,
      deletedNotifications: result.rows.map(row => new Notification(row))
    };
  }

  // Delete old notifications (cleanup)
  static async deleteOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await query(
      'DELETE FROM notifications WHERE "createdAt" < $1 RETURNING *',
      [cutoffDate]
    );

    return result.rows.map(row => new Notification(row));
  }

  // Get notification statistics for a user
  static async getStatsForUser(recipientId) {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN read = FALSE THEN 1 END) as unread,
        COUNT(CASE WHEN type = 'adminBroadcast' THEN 1 END) as "adminBroadcasts",
        COUNT(CASE WHEN type = 'votingBlocMessage' THEN 1 END) as "votingBlocMessages",
        COUNT(CASE WHEN type = 'invite' THEN 1 END) as invites,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system
       FROM notifications 
       WHERE recipient = $1`,
      [recipientId]
    );

    return result.rows[0];
  }

  // Get recent notifications (last 7 days)
  static async getRecent(recipientId, options = {}) {
    const { limit = 20 } = options;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await query(
      `SELECT n.*, vb.name as "relatedVotingBlocName"
       FROM notifications n
       LEFT JOIN "votingBlocs" vb ON n."relatedVotingBloc" = vb.id
       WHERE n.recipient = $1 AND n."createdAt" >= $2
       ORDER BY n."createdAt" DESC
       LIMIT $3`,
      [recipientId, sevenDaysAgo, limit]
    );

    return result.rows.map(row => new Notification(row));
  }

  // Find and update a notification (like Mongoose findOneAndUpdate)
  static async findAndUpdate(whereClause, updateData) {
    const whereKeys = Object.keys(whereClause);
    const updateKeys = Object.keys(updateData);

    if (whereKeys.length === 0 || updateKeys.length === 0) {
      return null;
    }

    let whereConditions = [];
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    // Build WHERE clause
    whereKeys.forEach(key => {
      if (key === 'relatedCause' || key === 'relatedVotingBloc') {
        whereConditions.push(`"${key}" = $${paramCount}`);
      } else {
        whereConditions.push(`${key} = $${paramCount}`);
      }
      values.push(whereClause[key]);
      paramCount++;
    });

    // Build UPDATE clause
    updateKeys.forEach(key => {
      if (key === 'relatedCause' || key === 'relatedVotingBloc') {
        updateFields.push(`"${key}" = $${paramCount}`);
      } else {
        updateFields.push(`${key} = $${paramCount}`);
      }
      values.push(updateData[key]);
      paramCount++;
    });

    updateFields.push(`"updatedAt" = NOW()`);

    const updateQuery = `
      UPDATE notifications 
      SET ${updateFields.join(', ')} 
      WHERE ${whereConditions.join(' AND ')}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    return result.rows.length > 0 ? new Notification(result.rows[0]) : null;
  }

  // Instance method to save changes
  async save() {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const updatableFields = ['type', 'title', 'message', 'relatedCause', 'relatedVotingBloc', 'read'];

    updatableFields.forEach(field => {
      if (this[field] !== undefined) {
        if (field === 'relatedCause' || field === 'relatedVotingBloc') {
          updateFields.push(`"${field}" = $${paramCount}`);
        } else {
          updateFields.push(`${field} = $${paramCount}`);
        }
        values.push(this[field]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) return this;

    updateFields.push(`"updatedAt" = NOW()`);
    values.push(this.id);

    const updateQuery = `
      UPDATE notifications 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Convert to plain object (like Mongoose toObject)
  toObject() {
    return { ...this };
  }
}

export default Notification;