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

// ── Public endpoints (no auth required) ─────────────────────────────────────

// GET /api/blog/posts — List published posts (paginated)
router.get('/posts', getPublishedPosts);

// GET /api/blog/posts/categories — Get available categories
router.get('/posts/categories', getCategories);

// GET /api/blog/posts/:slug — Get a single published post by slug
router.get('/posts/:slug', getPostBySlug);

// ── Admin / Coordinator endpoints (auth required) ───────────────────────────

const blogAdminAuth = [protect, authorize(['National Coordinator', 'State Coordinator'])];
const blogDeleteAuth = [protect, isAdmin];

// GET /api/blog/admin/posts — List all posts (any status)
router.get('/admin/posts', ...blogAdminAuth, getAllPosts);

// POST /api/blog/admin/posts — Create a new post
router.post('/admin/posts', ...blogAdminAuth, createPost);

// PUT /api/blog/admin/posts/:id — Update a post
router.put('/admin/posts/:id', ...blogAdminAuth, updatePost);

// DELETE /api/blog/admin/posts/:id — Delete a post (admin only)
router.delete('/admin/posts/:id', ...blogDeleteAuth, deletePost);

// POST /api/blog/admin/posts/:id/publish — Publish a post
router.post('/admin/posts/:id/publish', ...blogAdminAuth, publishPost);

// POST /api/blog/admin/posts/:id/unpublish — Unpublish a post
router.post('/admin/posts/:id/unpublish', ...blogAdminAuth, unpublishPost);

// POST /api/blog/admin/upload-image — Upload an image for blog content
router.post('/admin/upload-image', ...blogAdminAuth, parseFileUpload('image'), uploadBlogImage);

export default router;
