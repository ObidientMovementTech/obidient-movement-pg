import { pool } from '../config/db.js';

class VotingBlocBroadcast {
  constructor(data) {
    this.id = data?.id;
    this.votingBlocId = data?.votingBlocId;
    this.message = data?.message;
    this.messageType = data?.messageType || 'announcement';
    this.channels = data?.channels || [];
    this.sentBy = data?.sentBy;
    this.createdAt = data?.createdAt;
    this.updatedAt = data?.updatedAt;
  }

  // Create a new voting bloc broadcast
  static async create(broadcastData) {
    const {
      votingBlocId,
      message,
      messageType = 'announcement',
      channels = [],
      sentBy
    } = broadcastData;

    const query = `
      INSERT INTO "votingBlocBroadcasts" ("votingBlocId", message, "messageType", channels, "sentBy")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      votingBlocId,
      message,
      messageType,
      JSON.stringify(channels),
      sentBy
    ];

    try {
      const result = await pool.query(query, values);
      return new VotingBlocBroadcast(result.rows[0]);
    } catch (error) {
      console.error('Error creating voting bloc broadcast:', error);
      throw error;
    }
  }

  // Find broadcast by ID
  static async findById(id) {
    const query = `
      SELECT vbb.*, 
             vb.name as "votingBlocName",
             u.name as "senderName", u.email as "senderEmail"
      FROM "votingBlocBroadcasts" vbb
      LEFT JOIN "votingBlocs" vb ON vbb."votingBlocId" = vb.id
      LEFT JOIN users u ON vbb."sentBy" = u.id
      WHERE vbb.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const broadcast = new VotingBlocBroadcast(row);

      // Add related data
      broadcast.votingBlocName = row.votingBlocName;
      broadcast.senderName = row.senderName;
      broadcast.senderEmail = row.senderEmail;

      return broadcast;
    } catch (error) {
      console.error('Error finding voting bloc broadcast by ID:', error);
      throw error;
    }
  }

  // Find all broadcasts for a voting bloc
  static async findByVotingBlocId(votingBlocId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      messageType,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = options;

    let query = `
      SELECT vbb.*, 
             u.name as "senderName", u.email as "senderEmail"
      FROM "votingBlocBroadcasts" vbb
      LEFT JOIN users u ON vbb."sentBy" = u.id
      WHERE vbb."votingBlocId" = $1
    `;

    const values = [votingBlocId];
    let paramCounter = 2;

    // Add message type filter if specified
    if (messageType) {
      query += ` AND vbb."messageType" = $${paramCounter}`;
      values.push(messageType);
      paramCounter++;
    }

    // Add sorting
    const validSortColumns = ['createdAt', 'messageType', 'id'];
    const validSortOrders = ['ASC', 'DESC'];

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY vbb."${sortBy}" ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY vbb."createdAt" DESC`;
    }

    // Add pagination
    query += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);

      return result.rows.map(row => {
        const broadcast = new VotingBlocBroadcast(row);
        broadcast.senderName = row.senderName;
        broadcast.senderEmail = row.senderEmail;
        return broadcast;
      });
    } catch (error) {
      console.error('Error finding broadcasts by voting bloc ID:', error);
      throw error;
    }
  }

  // Get broadcast count for a voting bloc
  static async getCountByVotingBlocId(votingBlocId, messageType = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM "votingBlocBroadcasts"
      WHERE "votingBlocId" = $1
    `;

    const values = [votingBlocId];

    if (messageType) {
      query += ` AND "messageType" = $2`;
      values.push(messageType);
    }

    try {
      const result = await pool.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting broadcast count:', error);
      throw error;
    }
  }

  // Update a broadcast
  static async updateById(id, updateData) {
    const allowedFields = ['message', 'messageType', 'channels'];
    const setClause = [];
    const values = [];
    let paramCounter = 1;

    // Build dynamic update query
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        if (key === 'channels') {
          setClause.push(`"${key}" = $${paramCounter}`);
          values.push(JSON.stringify(value));
        } else {
          setClause.push(`"${key}" = $${paramCounter}`);
          values.push(value);
        }
        paramCounter++;
      }
    }

    if (setClause.length === 0) {
      throw new Error('No valid fields provided for update');
    }

    const query = `
      UPDATE "votingBlocBroadcasts" 
      SET ${setClause.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      return new VotingBlocBroadcast(result.rows[0]);
    } catch (error) {
      console.error('Error updating voting bloc broadcast:', error);
      throw error;
    }
  }

  // Delete a broadcast
  static async deleteById(id) {
    const query = `DELETE FROM "votingBlocBroadcasts" WHERE id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return new VotingBlocBroadcast(result.rows[0]);
    } catch (error) {
      console.error('Error deleting voting bloc broadcast:', error);
      throw error;
    }
  }

  // Delete all broadcasts for a voting bloc
  static async deleteByVotingBlocId(votingBlocId) {
    const query = `DELETE FROM "votingBlocBroadcasts" WHERE "votingBlocId" = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [votingBlocId]);
      return result.rows.map(row => new VotingBlocBroadcast(row));
    } catch (error) {
      console.error('Error deleting broadcasts by voting bloc ID:', error);
      throw error;
    }
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      votingBlocId: this.votingBlocId,
      message: this.message,
      messageType: this.messageType,
      channels: this.channels,
      sentBy: this.sentBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Include any populated fields
      ...(this.votingBlocName && { votingBlocName: this.votingBlocName }),
      ...(this.senderName && { senderName: this.senderName }),
      ...(this.senderEmail && { senderEmail: this.senderEmail })
    };
  }
}

export default VotingBlocBroadcast;
