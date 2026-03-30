import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ── Types ───────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_id: string;
  author_name: string;
  author_image: string | null;
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pages: number;
}

export interface CategoriesResponse {
  categories: string[];
  allCategories: string[];
}

// ── Public endpoints (no auth required) ─────────────────────────────────────

export const getPublishedPosts = async (
  page = 1,
  limit = 12,
  category?: string
): Promise<BlogListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set('category', category);

  const res = await axios.get(`${API_BASE}/api/blog/posts?${params}`, {
    withCredentials: true,
  });
  return res.data;
};

export const getPostBySlug = async (slug: string): Promise<{ post: BlogPost }> => {
  const res = await axios.get(`${API_BASE}/api/blog/posts/${encodeURIComponent(slug)}`, {
    withCredentials: true,
  });
  return res.data;
};

export const getCategories = async (): Promise<CategoriesResponse> => {
  const res = await axios.get(`${API_BASE}/api/blog/posts/categories`, {
    withCredentials: true,
  });
  return res.data;
};

// ── Admin endpoints (auth required) ─────────────────────────────────────────

export const getAllPosts = async (
  page = 1,
  limit = 20,
  status?: string
): Promise<BlogListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);

  const res = await axios.get(`${API_BASE}/api/blog/admin/posts?${params}`, {
    withCredentials: true,
  });
  return res.data;
};

export const createPost = async (data: {
  title: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  featuredImageUrl?: string;
}): Promise<{ post: BlogPost }> => {
  const res = await axios.post(`${API_BASE}/api/blog/admin/posts`, data, {
    withCredentials: true,
  });
  return res.data;
};

export const updatePost = async (
  id: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    featuredImageUrl?: string;
  }
): Promise<{ post: BlogPost }> => {
  const res = await axios.put(`${API_BASE}/api/blog/admin/posts/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

export const deletePost = async (id: string): Promise<{ message: string }> => {
  const res = await axios.delete(`${API_BASE}/api/blog/admin/posts/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const publishPost = async (id: string): Promise<{ post: BlogPost }> => {
  const res = await axios.post(`${API_BASE}/api/blog/admin/posts/${id}/publish`, {}, {
    withCredentials: true,
  });
  return res.data;
};

export const unpublishPost = async (id: string): Promise<{ post: BlogPost }> => {
  const res = await axios.post(`${API_BASE}/api/blog/admin/posts/${id}/unpublish`, {}, {
    withCredentials: true,
  });
  return res.data;
};

export const uploadBlogImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await axios.post(`${API_BASE}/api/blog/admin/upload-image`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
