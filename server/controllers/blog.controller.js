import BlogPost from '../models/blogPost.model.js';
import Reaction from '../models/reaction.model.js';
import { uploadBufferToS3 } from '../utils/s3Upload.js';

// Predefined blog categories
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

// ── Utilities ───────────────────────────────────────────────────────────────

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

function generateExcerpt(content, maxLength = 200) {
  const text = (content || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s\S*$/, '') + '...';
}

// ── Public endpoints (no auth) ──────────────────────────────────────────────

export const getPublishedPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const { category } = req.query;

    const data = await BlogPost.listPublished({ page, limit, category: category || null });

    // Attach reaction counts (and user's reaction if authenticated)
    const postIds = data.posts.map(p => String(p.id));
    const countsMap = postIds.length ? await Reaction.getForTargetBatch('blog_post', postIds) : {};
    let userReactionsMap = {};
    if (req.user && postIds.length) {
      userReactionsMap = await Reaction.getUserReactionsBatch(req.user.id, 'blog_post', postIds);
    }

    data.posts = data.posts.map(p => ({
      ...p,
      reactions: countsMap[String(p.id)] || { like: 0, love: 0, smile: 0, meh: 0, total: 0 },
      userReaction: userReactionsMap[String(p.id)] || null,
    }));

    res.json(data);
  } catch (error) {
    console.error('Error fetching published posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ message: 'Invalid slug' });
    }

    const post = await BlogPost.findBySlug(slug);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Attach reaction counts + user's reaction
    const counts = await Reaction.getForTarget('blog_post', post.id);
    let userReaction = null;
    if (req.user) {
      userReaction = await Reaction.getUserReaction(req.user.id, 'blog_post', post.id);
    }

    res.json({ post: { ...post, reactions: counts, userReaction } });
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const usedCategories = await BlogPost.getUsedCategories();
    res.json({ categories: usedCategories, allCategories: BLOG_CATEGORIES });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// ── Admin endpoints (auth required) ─────────────────────────────────────────

export const getAllPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { status } = req.query;

    if (status && !['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status filter' });
    }

    const data = await BlogPost.listAll({ page, limit, status: status || null });
    res.json(data);
  } catch (error) {
    console.error('Error fetching all posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featuredImageUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (category && !BLOG_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Invalid category. Must be one of: ${BLOG_CATEGORIES.join(', ')}` });
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags must be an array' });
    }

    if (tags && tags.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 tags allowed' });
    }

    // Generate unique slug
    let slug = generateSlug(title);
    if (await BlogPost.slugExists(slug)) {
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
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category, tags, featuredImageUrl } = req.body;

    const existing = await BlogPost.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (category && !BLOG_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Invalid category. Must be one of: ${BLOG_CATEGORIES.join(', ')}` });
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags must be an array' });
    }

    if (tags && tags.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 tags allowed' });
    }

    const fields = {};
    if (title !== undefined) {
      fields.title = title.trim();
      // Regenerate slug if title changed
      if (title.trim() !== existing.title) {
        let newSlug = generateSlug(title);
        if (await BlogPost.slugExists(newSlug, id)) {
          newSlug = `${newSlug}-${Date.now().toString(36)}`;
        }
        fields.slug = newSlug;
      }
    }
    if (content !== undefined) {
      fields.content = content;
      // Auto-update excerpt if no explicit excerpt provided
      if (excerpt === undefined) {
        fields.excerpt = generateExcerpt(content);
      }
    }
    if (excerpt !== undefined) fields.excerpt = excerpt;
    if (category !== undefined) fields.category = category;
    if (tags !== undefined) fields.tags = tags;
    if (featuredImageUrl !== undefined) fields.featuredImageUrl = featuredImageUrl;

    const post = await BlogPost.update(id, fields);
    res.json({ post });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await BlogPost.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await BlogPost.delete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

export const publishPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.publish(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ post });
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ message: 'Failed to publish post' });
  }
};

export const unpublishPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.unpublish(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ post });
  } catch (error) {
    console.error('Error unpublishing post:', error);
    res.status(500).json({ message: 'Failed to unpublish post' });
  }
};

export const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Allowed: jpeg, png, webp, gif' });
    }

    // Max 5MB
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
    console.error('Error uploading blog image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
};
