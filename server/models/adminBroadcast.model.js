import { query, getClient } from '../config/db.js';

class AdminBroadcast {
  constructor(broadcastData) {
    Object.assign(this, broadcastData);
  }

  // Create a new admin broadcast
  static async create(broadcastData) {
    const { title, message, sentBy } = broadcastData;

    const result = await query(
      `INSERT INTO "adminBroadcasts" (title, message, "sentBy") 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [title, message, sentBy]
    );

    return new AdminBroadcast(result.rows[0]);
  }

  // Find broadcast by ID
  static async findById(id) {
    const result = await query(
      `SELECT ab.*, u.name as "senderName", u.email as "senderEmail"
       FROM "adminBroadcasts" ab
       LEFT JOIN users u ON ab."sentBy" = u.id
       WHERE ab.id = $1`,
      [id]
    );

    return result.rows.length > 0 ? new AdminBroadcast(result.rows[0]) : null;
  }

  // Find all broadcasts with pagination
  static async findAll(options = {}) {
    const { limit = 20, offset = 0, orderBy = 'createdAt', orderDirection = 'DESC' } = options;

    const result = await query(
      `SELECT ab.*, u.name as "senderName", u.email as "senderEmail"
       FROM "adminBroadcasts" ab
       LEFT JOIN users u ON ab."sentBy" = u.id
       ORDER BY ab."${orderBy}" ${orderDirection}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows.map(row => new AdminBroadcast(row));
  }

  // Find broadcasts by sender
  static async findBySender(sentBy, options = {}) {
    const { limit = 20, offset = 0 } = options;

    const result = await query(
      `SELECT ab.*, u.name as "senderName", u.email as "senderEmail"
       FROM "adminBroadcasts" ab
       LEFT JOIN users u ON ab."sentBy" = u.id
       WHERE ab."sentBy" = $1
       ORDER BY ab."createdAt" DESC
       LIMIT $2 OFFSET $3`,
      [sentBy, limit, offset]
    );

    return result.rows.map(row => new AdminBroadcast(row));
  }

  // Find broadcasts within date range
  static async findByDateRange(startDate, endDate, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const result = await query(
      `SELECT ab.*, u.name as "senderName", u.email as "senderEmail"
       FROM "adminBroadcasts" ab
       LEFT JOIN users u ON ab."sentBy" = u.id
       WHERE ab."createdAt" BETWEEN $1 AND $2
       ORDER BY ab."createdAt" DESC
       LIMIT $3 OFFSET $4`,
      [startDate, endDate, limit, offset]
    );

    return result.rows.map(row => new AdminBroadcast(row));
  }

  // Search broadcasts by title or message content
  static async search(searchQuery, options = {}) {
    const { limit = 20, offset = 0 } = options;

    const result = await query(
      `SELECT ab.*, u.name as "senderName", u.email as "senderEmail"
       FROM "adminBroadcasts" ab
       LEFT JOIN users u ON ab."sentBy" = u.id
       WHERE ab.title ILIKE $1 OR ab.message ILIKE $1
       ORDER BY ab."createdAt" DESC
       LIMIT $2 OFFSET $3`,
      [`%${searchQuery}%`, limit, offset]
    );

    return result.rows.map(row => new AdminBroadcast(row));
  }

  // Update broadcast (findOneAndUpdate equivalent)
  static async findByIdAndUpdate(id, updateData) {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const updatableFields = ['title', 'message'];

    updatableFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields.push(`"${field}" = $${paramCount}`);
        values.push(updateData[field]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return await AdminBroadcast.findById(id);
    }

    updateFields.push(`"updatedAt" = NOW()`);
    values.push(id);

    const updateQuery = `
      UPDATE "adminBroadcasts" 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) return null;

    // Get the updated broadcast with sender info
    return await AdminBroadcast.findById(id);
  }

  // Delete broadcast
  static async deleteById(id) {
    const result = await query(
      'DELETE FROM "adminBroadcasts" WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows.length > 0 ? new AdminBroadcast(result.rows[0]) : null;
  }

  // Get total count of broadcasts
  static async getCount(filters = {}) {
    let whereClause = '';
    let values = [];

    if (filters.sentBy) {
      whereClause = 'WHERE "sentBy" = $1';
      values = [filters.sentBy];
    }

    const result = await query(
      `SELECT COUNT(*) as count FROM "adminBroadcasts" ${whereClause}`,
      values
    );

    return parseInt(result.rows[0].count);
  }

  // Get recent broadcasts (last 30 days)
  static async getRecent(options = {}) {
    const { limit = 10 } = options;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await query(
      `SELECT ab.*, u.name as "senderName", u.email as "senderEmail"
       FROM "adminBroadcasts" ab
       LEFT JOIN users u ON ab."sentBy" = u.id
       WHERE ab."createdAt" >= $1
       ORDER BY ab."createdAt" DESC
       LIMIT $2`,
      [thirtyDaysAgo, limit]
    );

    return result.rows.map(row => new AdminBroadcast(row));
  }

  // Instance method to save changes
  async save() {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const updatableFields = ['title', 'message'];

    updatableFields.forEach(field => {
      if (this[field] !== undefined) {
        updateFields.push(`"${field}" = $${paramCount}`);
        values.push(this[field]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) return this;

    updateFields.push(`"updatedAt" = NOW()`);
    values.push(this.id);

    const updateQuery = `
      UPDATE "adminBroadcasts" 
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

export default AdminBroadcast;
