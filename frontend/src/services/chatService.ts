import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ── Types ───────────────────────────────────────────────────────────────────

export interface Coordinator {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  designation: string;
  level: 'ward' | 'lga' | 'state' | 'national';
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name?: string;
  sender_email?: string;
  recipient_level: 'ward' | 'lga' | 'state' | 'national';
  recipient_location: {
    state?: string;
    lga?: string;
    ward?: string;
  };
  assigned_to: string | null;
  subject: string;
  message: string;
  status: 'pending' | 'assigned' | 'delivered' | 'read' | 'responded';
  response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoordinatorChainResponse {
  coordinators: Coordinator[];
}

export interface InboxResponse {
  messages: ChatMessage[];
  total?: number;
  page?: number;
  pages?: number;
}

// ── Coordinator chain ───────────────────────────────────────────────────────

/**
 * Get the user's coordinator chain (Ward → LGA → State → National)
 */
export const getMyCoordinators = async (): Promise<CoordinatorChainResponse> => {
  const res = await axios.get(`${API_BASE}/api/chat/my-coordinators`, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * Get unread message count (for widget badge)
 */
export const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
  const res = await axios.get(`${API_BASE}/api/chat/unread-count`, {
    withCredentials: true,
  });
  return res.data;
};

// ── Member messaging (reuses existing mobile endpoints) ─────────────────────

/**
 * Send a message to a coordinator level
 */
export const sendMessage = async (data: {
  recipientLevel: 'ward' | 'lga' | 'state' | 'national';
  subject: string;
  message: string;
}): Promise<ChatMessage> => {
  const res = await axios.post(
    `${API_BASE}/mobile/messages/leadership`,
    {
      recipient_level: data.recipientLevel,
      subject: data.subject,
      message: data.message,
    },
    { withCredentials: true }
  );
  return res.data;
};

/**
 * Get user's sent messages and their responses
 */
export const getMyMessages = async (): Promise<{ messages: ChatMessage[] }> => {
  const res = await axios.get(`${API_BASE}/mobile/messages/my-messages`, {
    withCredentials: true,
  });
  return res.data;
};

// ── Coordinator inbox (reuses existing mobile endpoints) ────────────────────

/**
 * Get messages assigned to the coordinator (inbox)
 */
export const getInbox = async (params?: {
  status?: string;
}): Promise<{ messages: ChatMessage[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set('status', params.status);

  const url = `${API_BASE}/mobile/messages/leadership${queryParams.toString() ? `?${queryParams}` : ''}`;
  const res = await axios.get(url, { withCredentials: true });
  return res.data;
};

/**
 * Reply to a message
 */
export const replyToMessage = async (
  messageId: string,
  response: string
): Promise<ChatMessage> => {
  const res = await axios.post(
    `${API_BASE}/mobile/messages/${messageId}/respond`,
    { response },
    { withCredentials: true }
  );
  return res.data;
};

/**
 * Mark a message as read
 */
export const markAsRead = async (messageId: string): Promise<void> => {
  await axios.put(
    `${API_BASE}/mobile/messages/${messageId}/read`,
    {},
    { withCredentials: true }
  );
};
