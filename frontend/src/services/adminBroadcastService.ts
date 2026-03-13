import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AdminBroadcast {
  _id: string;
  title: string;
  message: string;
  sentBy: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  status?: "pending" | "processing" | "completed" | "failed" | "cancelled";
  totalRecipients?: number;
  emailsSent?: number;
  emailsFailed?: number;
  notificationsCreated?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastProgress {
  status: string;
  total?: string;
  sent?: string;
  failed?: string;
  notificationsCreated?: string;
  phase?: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface BroadcastEmailLog {
  id: string;
  broadcastId: string;
  userId: string;
  email: string;
  userName: string;
  status: "pending" | "sent" | "failed";
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface BroadcastEmailLogsResponse {
  logs: BroadcastEmailLog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BroadcastEmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  notificationsCreated: number;
}

export const getAdminBroadcasts = async (): Promise<AdminBroadcast[]> => {
  const res = await axios.get(`${BASE_URL}/admin-broadcasts`, {
    withCredentials: true,
  });
  return res.data;
};

export const getAdminBroadcastById = async (id: string): Promise<AdminBroadcast> => {
  const res = await axios.get(`${BASE_URL}/admin-broadcasts/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const sendAdminBroadcast = async (title: string, message: string): Promise<AdminBroadcast> => {
  const res = await axios.post(
    `${BASE_URL}/admin-broadcasts/send`,
    { title, message },
    {
      withCredentials: true,
    }
  );
  return res.data.broadcast;
};

export const updateAdminBroadcast = async (id: string, title: string, message: string): Promise<AdminBroadcast> => {
  const res = await axios.put(
    `${BASE_URL}/admin-broadcasts/${id}`,
    { title, message },
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const deleteAdminBroadcast = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/admin-broadcasts/${id}`, {
    withCredentials: true,
  });
};

// ---- Email delivery tracking ----

export const getBroadcastEmailLogs = async (
  broadcastId: string,
  options: { page?: number; limit?: number; status?: string; search?: string } = {}
): Promise<BroadcastEmailLogsResponse> => {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.status) params.set("status", options.status);
  if (options.search) params.set("search", options.search);

  const res = await axios.get(
    `${BASE_URL}/admin-broadcasts/${broadcastId}/email-logs?${params.toString()}`,
    { withCredentials: true }
  );
  return res.data;
};

export const getBroadcastEmailStats = async (broadcastId: string): Promise<BroadcastEmailStats> => {
  const res = await axios.get(
    `${BASE_URL}/admin-broadcasts/${broadcastId}/email-stats`,
    { withCredentials: true }
  );
  return res.data;
};

export const retryBroadcastEmails = async (broadcastId: string): Promise<{ success: boolean; message: string; retryCount: number }> => {
  const res = await axios.post(
    `${BASE_URL}/admin-broadcasts/${broadcastId}/retry`,
    {},
    { withCredentials: true }
  );
  return res.data;
};

export const cancelBroadcast = async (broadcastId: string): Promise<{ success: boolean; message: string }> => {
  const res = await axios.post(
    `${BASE_URL}/admin-broadcasts/${broadcastId}/cancel`,
    {},
    { withCredentials: true }
  );
  return res.data;
};

/**
 * Creates an SSE EventSource for live broadcast progress.
 * The caller is responsible for closing the EventSource when done.
 */
export const streamBroadcastProgress = (broadcastId: string): EventSource => {
  // We need to pass auth cookie — EventSource sends cookies automatically for same-origin
  return new EventSource(
    `${BASE_URL}/admin-broadcasts/${broadcastId}/progress/stream`,
    { withCredentials: true } as EventSourceInit
  );
};
