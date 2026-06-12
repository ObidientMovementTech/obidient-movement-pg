import { query } from '../config/db.js';

const Newsletter = {
  /**
   * Create a new newsletter
   */
  async create({ title, slug, subject, content, previewText, featuredImageUrl, authorId }) {
    const result = await query(
      `INSERT INTO newsletters (title, slug, subject, content, preview_text, featured_image_url, author_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, slug, subject, content || '', previewText || null, featuredImageUrl || null, authorId]
    );
    return result.rows[0];
  },

  /**
   * Find a newsletter by ID (with author info)
   */
  async findById(id) {
    const result = await query(
      `SELECT n.*, u.name AS author_name, u."profileImage" AS author_image
       FROM newsletters n
       LEFT JOIN users u ON n.author_id = u.id
       WHERE n.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a sent newsletter by slug (public)
   */
  async findBySlug(slug) {
    const result = await query(
      `SELECT n.*, u.name AS author_name, u."profileImage" AS author_image
       FROM newsletters n
       LEFT JOIN users u ON n.author_id = u.id
       WHERE n.slug = $1 AND n.status IN ('published', 'sent')`,
      [slug]
    );
    return result.rows[0] || null;
  },

  /**
   * Check if a slug already exists
   */
  async slugExists(slug, excludeId = null) {
    let sql = `SELECT id FROM newsletters WHERE slug = $1`;
    const params = [slug];

    if (excludeId) {
      sql += ` AND id != $2`;
      params.push(excludeId);
    }

    const result = await query(sql, params);
    return result.rows.length > 0;
  },

  /**
   * List sent newsletters (public — paginated)
   */
  async listSent({ page = 1, limit = 12 }) {
    const offset = (page - 1) * limit;

    const [newsletters, countResult] = await Promise.all([
      query(
        `SELECT n.*, u.name AS author_name, u."profileImage" AS author_image
         FROM newsletters n
         LEFT JOIN users u ON n.author_id = u.id
         WHERE n.status IN ('published', 'sent')
         ORDER BY COALESCE(n.sent_at, n.updated_at) DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      query(`SELECT COUNT(*) FROM newsletters WHERE status IN ('published', 'sent')`),
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      newsletters: newsletters.rows,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * List all newsletters (admin — paginated, filterable by status)
   */
  async listAll({ page = 1, limit = 20, status = null }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = '';

    if (status) {
      params.push(status);
      whereClause = `WHERE n.status = $${params.length}`;
    }

    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;
    params.push(limit, offset);

    const [newsletters, countResult] = await Promise.all([
      query(
        `SELECT n.*, u.name AS author_name, u."profileImage" AS author_image
         FROM newsletters n
         LEFT JOIN users u ON n.author_id = u.id
         ${whereClause}
         ORDER BY n.updated_at DESC
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        params
      ),
      query(
        `SELECT COUNT(*) FROM newsletters n ${whereClause}`,
        status ? [status] : []
      ),
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      newsletters: newsletters.rows,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * Update a newsletter by ID
   */
  async update(id, fields) {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    const columnMap = {
      title: 'title',
      slug: 'slug',
      subject: 'subject',
      content: 'content',
      previewText: 'preview_text',
      featuredImageUrl: 'featured_image_url',
      status: 'status',
      scheduledFor: 'scheduled_for',
      sentAt: 'sent_at',
      totalRecipients: 'total_recipients',
      emailsSent: 'emails_sent',
      emailsFailed: 'emails_failed',
    };

    for (const [key, value] of Object.entries(fields)) {
      const column = columnMap[key] || key;
      setClauses.push(`"${column}" = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);

    const result = await query(
      `UPDATE newsletters SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Delete a newsletter by ID (only drafts can be deleted)
   */
  async delete(id) {
    await query(`DELETE FROM newsletters WHERE id = $1 AND status = 'draft'`, [id]);
  },

  /**
   * Mark a newsletter as sending
   */
  async markSending(id, totalRecipients) {
    const result = await query(
      `UPDATE newsletters 
       SET status = 'sending', total_recipients = $2
       WHERE id = $1 AND status IN ('draft', 'published', 'scheduled')
       RETURNING *`,
      [id, totalRecipients]
    );
    return result.rows[0] || null;
  },

  /**
   * Mark a newsletter as published (visible on public page, no emails)
   */
  async markPublished(id) {
    const result = await query(
      `UPDATE newsletters 
       SET status = 'published'
       WHERE id = $1 AND status = 'draft'
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Mark a newsletter as sent
   */
  async markSent(id, emailsSent, emailsFailed) {
    const result = await query(
      `UPDATE newsletters 
       SET status = 'sent', sent_at = NOW(), emails_sent = $2, emails_failed = $3
       WHERE id = $1
       RETURNING *`,
      [id, emailsSent, emailsFailed]
    );
    return result.rows[0] || null;
  },

  /**
   * Get eligible recipients count (users not opted out, with verified email)
   */
  async getRecipientCount() {
    const result = await query(
      `SELECT COUNT(*) FROM users 
       WHERE email IS NOT NULL 
       AND "emailVerified" = true 
       AND newsletter_opt_out = false`
    );
    return parseInt(result.rows[0].count);
  },

  /**
   * Get eligible recipients in batches for sending
   */
  async getRecipients({ limit = 500, offset = 0 }) {
    const result = await query(
      `SELECT id, name, email, unsubscribe_token FROM users 
       WHERE email IS NOT NULL 
       AND "emailVerified" = true 
       AND newsletter_opt_out = false
       ORDER BY id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  },

  /**
   * Unsubscribe a user by token
   */
  async unsubscribeByToken(token) {
    const result = await query(
      `UPDATE users SET newsletter_opt_out = true WHERE unsubscribe_token = $1 RETURNING id, email`,
      [token]
    );
    return result.rows[0] || null;
  },

  /**
   * Toggle newsletter subscription for a user
   */
  async toggleSubscription(userId, optOut) {
    const result = await query(
      `UPDATE users SET newsletter_opt_out = $2 WHERE id = $1 RETURNING id, newsletter_opt_out`,
      [userId, optOut]
    );
    return result.rows[0] || null;
  },

  /**
   * Get user's newsletter subscription status
   */
  async getSubscriptionStatus(userId) {
    const result = await query(
      `SELECT newsletter_opt_out, unsubscribe_token FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },
};

export default Newsletter;
