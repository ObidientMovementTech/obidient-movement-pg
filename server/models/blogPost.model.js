import { query } from '../config/db.js';

const BlogPost = {
  /**
   * Create a new blog post
   */
  async create({ title, slug, content, excerpt, featuredImageUrl, authorId, category, tags }) {
    const result = await query(
      `INSERT INTO blog_posts (title, slug, content, excerpt, featured_image_url, author_id, category, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, slug, content || '', excerpt || null, featuredImageUrl || null, authorId, category || 'National Updates', tags || []]
    );
    return result.rows[0];
  },

  /**
   * Find a blog post by ID (with author info)
   */
  async findById(id) {
    const result = await query(
      `SELECT bp.*, u.name AS author_name, u."profileImage" AS author_image
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a published blog post by slug (public)
   */
  async findBySlug(slug) {
    const result = await query(
      `SELECT bp.*, u.name AS author_name, u."profileImage" AS author_image
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.slug = $1 AND bp.status = 'published'`,
      [slug]
    );
    return result.rows[0] || null;
  },

  /**
   * Check if a slug already exists
   */
  async slugExists(slug, excludeId = null) {
    let sql = `SELECT id FROM blog_posts WHERE slug = $1`;
    const params = [slug];

    if (excludeId) {
      sql += ` AND id != $2`;
      params.push(excludeId);
    }

    const result = await query(sql, params);
    return result.rows.length > 0;
  },

  /**
   * List published posts (public — paginated)
   */
  async listPublished({ page = 1, limit = 12, category = null }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = `WHERE bp.status = 'published'`;

    if (category) {
      params.push(category);
      whereClause += ` AND bp.category = $${params.length}`;
    }

    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;
    params.push(limit, offset);

    const [posts, countResult] = await Promise.all([
      query(
        `SELECT bp.*, u.name AS author_name, u."profileImage" AS author_image
         FROM blog_posts bp
         LEFT JOIN users u ON bp.author_id = u.id
         ${whereClause}
         ORDER BY bp.published_at DESC
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        params
      ),
      query(
        `SELECT COUNT(*) FROM blog_posts bp ${whereClause}`,
        category ? [category] : []
      ),
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      posts: posts.rows,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * List all posts (admin — paginated, filterable by status)
   */
  async listAll({ page = 1, limit = 20, status = null }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = '';

    if (status) {
      params.push(status);
      whereClause = `WHERE bp.status = $${params.length}`;
    }

    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;
    params.push(limit, offset);

    const [posts, countResult] = await Promise.all([
      query(
        `SELECT bp.*, u.name AS author_name, u."profileImage" AS author_image
         FROM blog_posts bp
         LEFT JOIN users u ON bp.author_id = u.id
         ${whereClause}
         ORDER BY bp.updated_at DESC
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        params
      ),
      query(
        `SELECT COUNT(*) FROM blog_posts bp ${whereClause}`,
        status ? [status] : []
      ),
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      posts: posts.rows,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * Update a blog post by ID
   */
  async update(id, fields) {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    // Map camelCase JS keys to snake_case DB columns
    const columnMap = {
      title: 'title',
      slug: 'slug',
      content: 'content',
      excerpt: 'excerpt',
      featuredImageUrl: 'featured_image_url',
      category: 'category',
      tags: 'tags',
      status: 'status',
      publishedAt: 'published_at',
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
      `UPDATE blog_posts SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Delete a blog post by ID
   */
  async delete(id) {
    await query(`DELETE FROM blog_posts WHERE id = $1`, [id]);
  },

  /**
   * Publish a blog post (sets status='published', sets published_at if null)
   */
  async publish(id) {
    const result = await query(
      `UPDATE blog_posts 
       SET status = 'published', published_at = COALESCE(published_at, NOW()) 
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Unpublish a blog post (sets status='draft')
   */
  async unpublish(id) {
    const result = await query(
      `UPDATE blog_posts SET status = 'draft' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get distinct categories from published posts
   */
  async getUsedCategories() {
    const result = await query(
      `SELECT DISTINCT category FROM blog_posts WHERE status = 'published' ORDER BY category`
    );
    return result.rows.map(r => r.category);
  },
};

export default BlogPost;
