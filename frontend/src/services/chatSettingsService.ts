import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ──────────── Types ────────────

export interface ChatSettings {
  who_can_dm: 'everyone' | 'coordinators_only' | 'nobody';
  read_receipts: boolean;
  show_online_status: boolean;
  show_typing_indicator: boolean;
  allow_message_requests: boolean;
}

// ──────────── API Functions ────────────

export async function getChatSettings(): Promise<ChatSettings> {
  const res = await axios.get(`${API_BASE}/users/chat-settings`, {
    withCredentials: true,
  });
  return res.data.data;
}

export async function updateChatSettings(
  updates: Partial<ChatSettings>
): Promise<ChatSettings> {
  const res = await axios.patch(
    `${API_BASE}/users/chat-settings`,
    updates,
    { withCredentials: true }
  );
  return res.data.data;
}
