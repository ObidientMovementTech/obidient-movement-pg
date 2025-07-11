import { query, getClient } from '../config/db.js';

class VotingBlocMessage {
  constructor(messageData) {
    Object.assign(this, messageData);
  }

  // Create a new voting bloc message
  static async create(messageData) {
    const {
      votingBlocId,
      fromUser,
      toUser,
      message,
      messageType = 'private',
      status = 'sent'
    } = messageData;

    const result = await query(
      `INSERT INTO "votingBlocMessages" (
        "votingBlocId", "fromUser", "toUser", message, "messageType", status
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [votingBlocId, fromUser, toUser, message, messageType, status]
    );

    return new VotingBlocMessage(result.rows[0]);
  }

  // Find messages by voting bloc ID
  static async findByVotingBloc(votingBlocId, options = {}) {
    const { limit = 50, offset = 0, messageType } = options;

    let whereClause = 'WHERE "votingBlocId" = $1';
    let values = [votingBlocId];
    let paramCount = 2;

    if (messageType) {
      whereClause += ` AND "messageType" = $${paramCount}`;
      values.push(messageType);
      paramCount++;
    }

    const result = await query(
      `SELECT * FROM "votingBlocMessages" 
       ${whereClause} 
       ORDER BY "createdAt" DESC 
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    return result.rows.map(row => new VotingBlocMessage(row));
  }

  // Find messages between two users in a voting bloc
  static async findBetweenUsers(votingBlocId, user1Id, user2Id, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const result = await query(
      `SELECT * FROM "votingBlocMessages" 
       WHERE "votingBlocId" = $1 
       AND (("fromUser" = $2 AND "toUser" = $3) OR ("fromUser" = $3 AND "toUser" = $2))
       ORDER BY "createdAt" ASC 
       LIMIT $4 OFFSET $5`,
      [votingBlocId, user1Id, user2Id, limit, offset]
    );

    return result.rows.map(row => new VotingBlocMessage(row));
  }

  // Find message by ID
  static async findById(id) {
    const result = await query('SELECT * FROM "votingBlocMessages" WHERE id = $1', [id]);
    return result.rows.length > 0 ? new VotingBlocMessage(result.rows[0]) : null;
  }

  // Update message status
  static async updateStatus(id, status) {
    const result = await query(
      'UPDATE "votingBlocMessages" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    return result.rows.length > 0 ? new VotingBlocMessage(result.rows[0]) : null;
  }

  // Mark messages as read for a user
  static async markAsRead(votingBlocId, userId) {
    const result = await query(
      `UPDATE "votingBlocMessages" 
       SET status = 'read', "updatedAt" = NOW() 
       WHERE "votingBlocId" = $1 AND "toUser" = $2 AND status != 'read'
       RETURNING *`,
      [votingBlocId, userId]
    );

    return result.rows.map(row => new VotingBlocMessage(row));
  }

  // Get unread message count for a user in a voting bloc
  static async getUnreadCount(votingBlocId, userId) {
    const result = await query(
      `SELECT COUNT(*) as count FROM "votingBlocMessages" 
       WHERE "votingBlocId" = $1 AND "toUser" = $2 AND status != 'read'`,
      [votingBlocId, userId]
    );

    return parseInt(result.rows[0].count);
  }

  // Delete message
  static async deleteById(id) {
    const result = await query(
      'DELETE FROM "votingBlocMessages" WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows.length > 0 ? new VotingBlocMessage(result.rows[0]) : null;
  }

  // Instance method to save changes
  async save() {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const updatableFields = ['message', 'messageType', 'status'];

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
      UPDATE "votingBlocMessages" 
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

export default VotingBlocMessage;
