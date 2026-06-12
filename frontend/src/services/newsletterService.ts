import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ── Types ───────────────────────────────────────────────────────────────────

export interface Newsletter {
  id: string;
  title: string;
  slug: string;
  subject: string;
  content: string;
  preview_text: string | null;
  featured_image_url: string | null;
  author_id: string;
  author_name: string;
  author_image: string | null;
  status: 'draft' | 'published' | 'scheduled' | 'sending' | 'sent' | 'archived';
  scheduled_for: string | null;
  sent_at: string | null;
  total_recipients: number;
  emails_sent: number;
  emails_failed: number;
  created_at: string;
  updated_at: string;
}

export interface NewsletterListResponse {
  newsletters: Newsletter[];
  total: number;
  page: number;
  pages: number;
}

// ── Public endpoints (no auth required) ─────────────────────────────────────

export const getSentNewsletters = async (
  page = 1,
  limit = 12
): Promise<NewsletterListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await axios.get(`${API_BASE}/api/newsletter/issues?${params}`, {
    withCredentials: true,
  });
  return res.data;
};

export const getNewsletterBySlug = async (slug: string): Promise<{ newsletter: Newsletter }> => {
  const res = await axios.get(`${API_BASE}/api/newsletter/issues/${encodeURIComponent(slug)}`, {
    withCredentials: true,
  });
  return res.data;
};

// ── User subscription endpoints ─────────────────────────────────────────────

export const getSubscriptionStatus = async (): Promise<{ newsletterOptOut: boolean }> => {
  const res = await axios.get(`${API_BASE}/api/newsletter/subscription`, {
    withCredentials: true,
  });
  return res.data;
};

export const toggleSubscription = async (optOut: boolean): Promise<{ newsletterOptOut: boolean }> => {
  const res = await axios.put(`${API_BASE}/api/newsletter/subscription`, { optOut }, {
    withCredentials: true,
  });
  return res.data;
};

// ── Admin endpoints (auth required) ─────────────────────────────────────────

export const getAllNewsletters = async (
  page = 1,
  limit = 20,
  status?: string
): Promise<NewsletterListResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);

  const res = await axios.get(`${API_BASE}/api/newsletter/admin/all?${params}`, {
    withCredentials: true,
  });
  return res.data;
};

export const getRecipientCount = async (): Promise<{ count: number }> => {
  const res = await axios.get(`${API_BASE}/api/newsletter/admin/recipient-count`, {
    withCredentials: true,
  });
  return res.data;
};

export const createNewsletter = async (data: {
  title: string;
  subject?: string;
  content?: string;
  previewText?: string;
  featuredImageUrl?: string;
}): Promise<{ newsletter: Newsletter }> => {
  const res = await axios.post(`${API_BASE}/api/newsletter/admin`, data, {
    withCredentials: true,
  });
  return res.data;
};

export const updateNewsletter = async (
  id: string,
  data: {
    title?: string;
    subject?: string;
    content?: string;
    previewText?: string;
    featuredImageUrl?: string;
  }
): Promise<{ newsletter: Newsletter }> => {
  const res = await axios.put(`${API_BASE}/api/newsletter/admin/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

export const deleteNewsletter = async (id: string): Promise<{ message: string }> => {
  const res = await axios.delete(`${API_BASE}/api/newsletter/admin/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const sendTestEmail = async (id: string, email: string): Promise<{ message: string }> => {
  const res = await axios.post(`${API_BASE}/api/newsletter/admin/${id}/send-test`, { email }, {
    withCredentials: true,
  });
  return res.data;
};

export const sendNewsletter = async (id: string): Promise<{ message: string; newsletterId: string; totalRecipients: number }> => {
  const res = await axios.post(`${API_BASE}/api/newsletter/admin/${id}/send`, {}, {
    withCredentials: true,
  });
  return res.data;
};

export const publishNewsletter = async (id: string): Promise<{ message: string; newsletter: Newsletter }> => {
  const res = await axios.post(`${API_BASE}/api/newsletter/admin/${id}/publish`, {}, {
    withCredentials: true,
  });
  return res.data;
};

export const uploadNewsletterImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await axios.post(`${API_BASE}/api/newsletter/admin/upload-image`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// ── SSE Progress Stream ─────────────────────────────────────────────────────

export interface NewsletterProgress {
  status: string;
  total?: string;
  sent?: string;
  failed?: string;
  phase?: string;
  completedAt?: string;
}

export const streamNewsletterProgress = (
  id: string,
  onProgress: (data: NewsletterProgress) => void,
  onError?: (error: Event) => void
): EventSource => {
  const es = new EventSource(`${API_BASE}/api/newsletter/admin/${id}/progress/stream`, {
    withCredentials: true,
  } as EventSourceInit);

  es.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as NewsletterProgress;
      onProgress(data);
      if (data.status === 'stream_end' || data.status === 'completed' || data.status === 'failed') {
        es.close();
      }
    } catch (err) {
      console.error('Failed to parse SSE data:', err);
    }
  };

  es.onerror = (event) => {
    if (onError) onError(event);
    es.close();
  };

  return es;
};
