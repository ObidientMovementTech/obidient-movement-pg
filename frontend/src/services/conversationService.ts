import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ──────────── Types ────────────

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  unread_count: number;
  last_read_at: string | null;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  participant_image: string | null;
  participant_designation: string;
  participant_assigned_state: string | null;
  participant_assigned_lga: string | null;
  participant_assigned_ward: string | null;
  participant_voting_state: string | null;
  participant_voting_lga: string | null;
  participant_voting_ward: string | null;
  participant_voting_pu: string | null;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean;
  user_ids: string[];
}

export interface Message {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  edited_at: string | null;
  sender_id: string;
  sender_name: string;
  sender_image: string | null;
  reply_to_id?: string | null;
  reply_to_content?: string | null;
  reply_to_sender_name?: string | null;
  reply_to_sender_id?: string | null;
  reactions?: MessageReaction[];
  deleted_at?: string | null;
}

export interface ChatContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  designation: string;
  level?: string;
}

// ──────────── API Functions ────────────

export async function getConversations(page = 1, limit = 30) {
  const res = await axios.get(`${API_BASE}/api/conversations`, {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data;
}

export async function getOrCreateConversation(participantId: string) {
  const res = await axios.post(
    `${API_BASE}/api/conversations`,
    { participantId },
    { withCredentials: true }
  );
  return res.data;
}

export async function getMessages(
  conversationId: string,
  opts?: { before?: string; limit?: number }
) {
  const res = await axios.get(
    `${API_BASE}/api/conversations/${conversationId}/messages`,
    {
      params: opts,
      withCredentials: true,
    }
  );
  return res.data;
}

export async function sendMessage(conversationId: string, content: string, replyToId?: string) {
  const res = await axios.post(
    `${API_BASE}/api/conversations/${conversationId}/messages`,
    { content, replyToId: replyToId || undefined },
    { withCredentials: true }
  );
  return res.data;
}

export async function toggleReaction(conversationId: string, messageId: string, emoji: string) {
  const res = await axios.post(
    `${API_BASE}/api/conversations/${conversationId}/messages/${messageId}/reactions`,
    { emoji },
    { withCredentials: true }
  );
  return res.data;
}

export async function deleteMessage(conversationId: string, messageId: string, mode: 'for_me' | 'for_everyone') {
  const res = await axios.delete(
    `${API_BASE}/api/conversations/${conversationId}/messages/${messageId}`,
    {
      params: { mode },
      withCredentials: true,
    }
  );
  return res.data;
}

export async function getChatContacts() {
  const res = await axios.get(`${API_BASE}/api/conversations/contacts`, {
    withCredentials: true,
  });
  return res.data;
}

export async function getOnlineStatus(userIds: string[]) {
  const res = await axios.get(`${API_BASE}/api/conversations/online`, {
    params: { userIds: userIds.join(',') },
    withCredentials: true,
  });
  return res.data;
}
