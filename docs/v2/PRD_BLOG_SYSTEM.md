# PRD: Obidient Movement v2 — Blog System (Server + Shared)

> **Version**: 1.0  
> **Date**: 26 March 2026  
> **Status**: Ready for implementation  
> **Owner**: Agent B (Admin Dashboard — server-side), shared by Agent A (Landing Page — read endpoints)  
> **Related**: PRD_LANDING_PAGE.md, PRD_ADMIN_DASHBOARD.md

---

## 1. Overview

Create a complete blog system with:
- **Server**: New database table, CRUD controller, routes, image upload via S3
- **Admin UI** (`/pbx/blog`): Create, edit, publish, manage posts (in PRD_ADMIN_DASHBOARD.md)
- **Public UI** (`/news`, `/news/:slug`): Read published posts (in PRD_LANDING_PAGE.md)
- **Shared frontend service**: `blogService.ts` (used by both admin and public)

---

## 2. Blog Categories (Predefined Constants + Freeform Tags)

### 2.1 Predefined Categories

Store as constants in a shared file. **Posts must select one category**:

```javascript
// server/config/constants.config.js (add to existing file or create)
export const BLOG_CATEGORIES = [
  'National Updates',
  'State News',
  'Press Releases',
  'Movement Stories',
  'Events',
  'Mobilisation Updates',
  'Opinion',
  'Election Updates',
];
```

```typescript
// frontend: src/constants/blogCategories.ts
export const BLOG_CATEGORIES = [
  'National Updates',
  'State News',
  'Press Releases',
  'Movement Stories',
  'Events',
  'Mobilisation Updates',
  'Opinion',
  'Election Updates',
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];
```

### 2.2 Freeform Tags

Posts can have 0–10 freeform tags (user-typed strings). Tags are stored as a text array in the database. No predefined tag list — users type what they want.

---

## 3. Database Schema

### 3.1 SQL Migration

**File**: `server/sql/create_blog_posts_table.sql`

```sql
-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    content TEXT NOT NULL DEFAULT '',
    excerpt TEXT,
    featured_image_url VARCHAR(1000),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    category VARCHAR(100) NOT NULL DEFAULT 'National Updates',
    tags TEXT[] DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_posts_updated_at();
```

### 3.2 Data Model

```typescript
interface BlogPost {
  id: string;               // UUID
  title: string;            // Required, max 500 chars
  slug: string;             // Unique, URL-friendly, auto-generated from title
  content: string;          // HTML content from TipTap editor
  excerpt: string | null;   // Optional summary (auto-generated from content if not provided)
  featuredImageUrl: string | null;  // S3 URL
  authorId: string;         // UUID of the author
  status: 'draft' | 'published' | 'archived';
  category: string;         // One of BLOG_CATEGORIES
  tags: string[];           // Freeform tags array (max 10)
  publishedAt: string | null;  // Set when first published
  createdAt: string;
  updatedAt: string;
  
  // Joined fields (returned by API, not in DB)
  authorName?: string;
  authorImage?: string;
}
```

---

## 4. Server Implementation

### 4.1 Model

**File**: `server/models/blogPost.model.js`

```javascript
import { query } from '../config/db.js';

export const BlogPost = {
  // Create
  async create({ title, slug, content, excerpt, featuredImageUrl, authorId, category, tags }) {
    const result = await query(
      `INSERT INTO blog_posts (title, slug, content, excerpt, featured_image_url, author_id, category, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, slug, content, excerpt, featuredImageUrl, authorId, category, tags || []]
    );
    return result.rows[0];
  },

  // Find by ID
  async findById(id) {
    const result = await query(
      `SELECT bp.*, u.name as author_name, u."profileImage" as author_image
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Find by slug (public)
  async findBySlug(slug) {
    const result = await query(
      `SELECT bp.*, u.name as author_name, u."profileImage" as author_image
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.slug = $1 AND bp.status = 'published'`,
      [slug]
    );
    return result.rows[0];
  },

  // List published (public)
  async listPublished({ page = 1, limit = 12, category = null }) {
    const offset = (page - 1) * limit;
    let whereClause = `WHERE bp.status = 'published'`;
    const params = [];
    
    if (category) {
      params.push(category);
      whereClause += ` AND bp.category = $${params.length}`;
    }
    
    params.push(limit, offset);
    
    const [posts, countResult] = await Promise.all([
      query(
        `SELECT bp.*, u.name as author_name, u."profileImage" as author_image
         FROM blog_posts bp
         LEFT JOIN users u ON bp.author_id = u.id
         ${whereClause}
         ORDER BY bp.published_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
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

  // List all (admin)
  async listAll({ page = 1, limit = 20, status = null }) {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];
    
    if (status) {
      params.push(status);
      whereClause = `WHERE bp.status = $${params.length}`;
    }
    
    params.push(limit, offset);
    
    const [posts, countResult] = await Promise.all([
      query(
        `SELECT bp.*, u.name as author_name, u."profileImage" as author_image
         FROM blog_posts bp
         LEFT JOIN users u ON bp.author_id = u.id
         ${whereClause}
         ORDER BY bp.updated_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
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

  // Update
  async update(id, fields) {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(fields)) {
      // Map camelCase to snake_case
      const column = key.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
      setClauses.push(`${column} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    values.push(id);
    
    const result = await query(
      `UPDATE blog_posts SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  // Delete
  async delete(id) {
    await query(`DELETE FROM blog_posts WHERE id = $1`, [id]);
  },

  // Publish
  async publish(id) {
    const result = await query(
      `UPDATE blog_posts SET status = 'published', published_at = COALESCE(published_at, NOW()) WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  // Unpublish
  async unpublish(id) {
    const result = await query(
      `UPDATE blog_posts SET status = 'draft' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  // Get categories in use
  async getCategories() {
    const result = await query(
      `SELECT DISTINCT category FROM blog_posts WHERE status = 'published' ORDER BY category`
    );
    return result.rows.map(r => r.category);
  },
};
```

### 4.2 Controller

**File**: `server/controllers/blog.controller.js`

```javascript
import { BlogPost } from '../models/blogPost.model.js';
import { uploadBufferToS3 } from '../utils/s3Upload.js';
import { BLOG_CATEGORIES } from '../config/constants.config.js';

// Slug generation utility
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/-+/g, '-')              // Remove duplicate hyphens
    .trim()
    .substring(0, 200);               // Limit length
}

// Auto-generate excerpt from content
function generateExcerpt(content, maxLength = 200) {
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s\S*$/, '') + '...';
}

// === Public endpoints (no auth) ===

export const getPublishedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category } = req.query;
    const data = await BlogPost.listPublished({
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50),  // Cap at 50
      category: category || null,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findBySlug(req.params.slug);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await BlogPost.getCategories();
    res.json({ categories, allCategories: BLOG_CATEGORIES });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// === Admin endpoints (auth required) ===

export const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featuredImageUrl } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (category && !BLOG_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    if (tags && tags.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 tags allowed' });
    }
    
    // Generate slug with uniqueness check
    let slug = generateSlug(title);
    const existing = await BlogPost.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    
    const post = await BlogPost.create({
      title: title.trim(),
      slug,
      content: content || '',
      excerpt: excerpt || generateExcerpt(content || ''),
      featuredImageUrl: featuredImageUrl || null,
      authorId: req.user.id,
      category: category || 'National Updates',
      tags: tags || [],
    });
    
    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category, tags, featuredImageUrl } = req.body;
    
    const existing = await BlogPost.findById(id);
    if (!existing) return res.status(404).json({ message: 'Post not found' });
    
    if (category && !BLOG_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    if (tags && tags.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 tags allowed' });
    }
    
    const fields = {};
    if (title !== undefined) {
      fields.title = title.trim();
      // Regenerate slug if title changed
      if (title.trim() !== existing.title) {
        let slug = generateSlug(title);
        fields.slug = slug;
      }
    }
    if (content !== undefined) {
      fields.content = content;
      if (!excerpt) fields.excerpt = generateExcerpt(content);
    }
    if (excerpt !== undefined) fields.excerpt = excerpt;
    if (category !== undefined) fields.category = category;
    if (tags !== undefined) fields.tags = tags;
    if (featuredImageUrl !== undefined) fields.featuredImageUrl = featuredImageUrl;
    
    const post = await BlogPost.update(id, fields);
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const existing = await BlogPost.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Post not found' });
    
    await BlogPost.delete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

export const publishPost = async (req, res) => {
  try {
    const post = await BlogPost.publish(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to publish post' });
  }
};

export const unpublishPost = async (req, res) => {
  try {
    const post = await BlogPost.unpublish(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unpublish post' });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const data = await BlogPost.listAll({
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
      status: status || null,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Allowed: jpeg, png, webp, gif' });
    }
    
    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File too large. Maximum 5MB.' });
    }
    
    const url = await uploadBufferToS3(
      req.file.buffer,
      req.file.originalname,
      { folder: 'blog_images', contentType: req.file.mimetype }
    );
    
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload image' });
  }
};
```

### 4.3 Routes

**File**: `server/routes/blog.route.js`

```javascript
import { Router } from 'express';
import { protect, isAdmin, authorize } from '../middlewares/auth.middleware.js';
import { parseFileUpload } from '../utils/s3Upload.js';
import {
  getPublishedPosts,
  getPostBySlug,
  getCategories,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
  getAllPosts,
  uploadBlogImage,
} from '../controllers/blog.controller.js';

const router = Router();

// Public endpoints (no auth)
router.get('/posts', getPublishedPosts);
router.get('/posts/categories', getCategories);
router.get('/posts/:slug', getPostBySlug);

// Admin/Coordinator endpoints (auth required)
router.get('/admin/posts', protect, authorize(['National Coordinator', 'State Coordinator']), getAllPosts);
router.post('/admin/posts', protect, authorize(['National Coordinator', 'State Coordinator']), createPost);
router.put('/admin/posts/:id', protect, authorize(['National Coordinator', 'State Coordinator']), updatePost);
router.delete('/admin/posts/:id', protect, isAdmin, deletePost);
router.post('/admin/posts/:id/publish', protect, authorize(['National Coordinator', 'State Coordinator']), publishPost);
router.post('/admin/posts/:id/unpublish', protect, authorize(['National Coordinator', 'State Coordinator']), unpublishPost);
router.post('/admin/upload-image', protect, authorize(['National Coordinator', 'State Coordinator']), parseFileUpload('image'), uploadBlogImage);

export default router;
```

### 4.4 Mount in Server

**File to modify**: `server/server.js`

Add:
```javascript
import blogRoutes from './routes/blog.route.js';
// ...
app.use('/api/blog', blogRoutes);
```

---

## 5. Frontend Service (Shared)

**File**: `src/services/blogService.ts`

This file is used by BOTH the public landing page (`/news`) and the admin dashboard (`/pbx/blog`). Look at existing services (e.g., `authService.ts`, `votingBlocService.ts`) for the exact axios/fetch pattern used in this project, and follow the same pattern.

```typescript
// Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pages: number;
}

// === Public (no auth) ===
export const getPublishedPosts = async (page?: number, limit?: number, category?: string): Promise<BlogListResponse> => { ... };
export const getPostBySlug = async (slug: string): Promise<{ post: BlogPost }> => { ... };
export const getCategories = async (): Promise<{ categories: string[]; allCategories: string[] }> => { ... };

// === Admin (auth required) ===
export const getAllPosts = async (page?: number, limit?: number, status?: string): Promise<BlogListResponse> => { ... };
export const createPost = async (data: Partial<BlogPost>): Promise<{ post: BlogPost }> => { ... };
export const updatePost = async (id: string, data: Partial<BlogPost>): Promise<{ post: BlogPost }> => { ... };
export const deletePost = async (id: string): Promise<void> => { ... };
export const publishPost = async (id: string): Promise<{ post: BlogPost }> => { ... };
export const unpublishPost = async (id: string): Promise<{ post: BlogPost }> => { ... };
export const uploadBlogImage = async (file: File): Promise<{ url: string }> => { ... };
```

---

## 6. Admin Blog Editor UI

**File**: `src/pages/pbx/blog/BlogEditorPage.tsx`

### Layout:
```
┌─────────────────────────────────────────────────┐
│  ← Back to Posts        [Save Draft] [Publish]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Title: [_________________________________]     │
│                                                 │
│  Category: [National Updates ▼]                 │
│                                                 │
│  Tags: [tag1] [tag2] [+ Add tag]                │
│                                                 │
│  Featured Image:                                │
│  ┌──────────────────────┐                       │
│  │  [📷 Upload Image]   │  or  [Image Preview]  │
│  └──────────────────────┘                       │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  [B] [I] [U] [H1] [H2] [📷] [🔗] ["]   │   │  ← TipTap toolbar
│  ├──────────────────────────────────────────┤   │
│  │                                          │   │
│  │  Rich text editor content area...        │   │
│  │                                          │   │
│  │                                          │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  Excerpt (optional):                            │
│  [____________________________________________] │
│  Auto-generated if left empty                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Components:
- **Title**: MUI `<TextField>` with variant="standard", large font
- **Category**: MUI `<Select>` with `BLOG_CATEGORIES` options
- **Tags**: Chip input (type tag → press Enter → chip appears, X to remove, max 10)
- **Featured Image**: Upload button → calls `uploadBlogImage()` → shows preview
- **Editor**: Reuse existing `RichTextEditor` from `src/components/inputs/RichTextEditor.tsx`
- **Excerpt**: MUI `<TextField>` multiline, helper text "Auto-generated if left empty"
- **Actions**: "Save Draft" (creates/updates with status='draft'), "Publish" (creates/updates + publishes)

### Modes:
- **Create** (`/pbx/blog/new`): Empty form, "Create" actions
- **Edit** (`/pbx/blog/edit/:id`): Pre-filled form, loads post by ID

---

## 7. Image Upload via S3

Uses the existing S3 infrastructure:
- `uploadBufferToS3()` from `server/utils/s3Upload.js`
- `parseFileUpload()` busboy middleware from same file
- Images stored in `blog_images/` folder in S3 bucket
- Returns public S3 URL
- Max 5MB, allowed types: jpeg, png, webp, gif

The featured image upload happens separately from post save — upload first, get URL, include URL in post data.

For images within blog content (TipTap editor), use the same upload endpoint. The existing RichTextEditor may already handle image uploads — check `richDescriptionImageService.ts` for existing patterns.

---

## 8. SEO Considerations (for Landing Page Agent)

Each published blog post at `/news/:slug` must have:
- `<title>{post.title} — Obidient Movement</title>`
- `<meta name="description" content="{post.excerpt}" />`
- `<meta property="og:title" content="{post.title}" />`
- `<meta property="og:description" content="{post.excerpt}" />`
- `<meta property="og:image" content="{post.featuredImageUrl}" />`
- `<meta property="og:type" content="article" />`
- `<meta property="article:published_time" content="{post.publishedAt}" />`
- `<meta property="article:author" content="{post.authorName}" />`
- `<meta property="article:section" content="{post.category}" />`
- `{post.tags.map(tag => <meta property="article:tag" content={tag} />)}`
- JSON-LD Article schema

The blog listing at `/news` should show:
- `<title>News & Updates — Obidient Movement</title>`
- Generic description about movement news

---

## 9. Implementation Order

### Server (must be done FIRST — both agents depend on this):
1. Create `server/sql/create_blog_posts_table.sql` and run migration
2. Create `server/models/blogPost.model.js`
3. Create `server/controllers/blog.controller.js`
4. Create `server/routes/blog.route.js`
5. Mount routes in `server/server.js`
6. Test endpoints with curl/Postman

### Frontend (shared service):
7. Create `src/constants/blogCategories.ts`
8. Create `src/services/blogService.ts`

### Admin UI (Agent B):
9. Create `BlogListPage.tsx`
10. Create `BlogEditorPage.tsx`

### Public UI (Agent A):
11. Create `NewsPage.tsx` (uses `getPublishedPosts()`)
12. Create `NewsPostPage.tsx` (uses `getPostBySlug()`)
