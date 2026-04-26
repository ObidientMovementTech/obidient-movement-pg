import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ──────────── Types ────────────

export interface BlockedUser {
  id: string;
  name: string | null;
  profile_image: string | null;
  designation: string | null;
  reason: string | null;
  blocked_at: string;
}

// ──────────── API Functions ────────────

export async function blockUser(userId: string, reason?: string) {
  const res = await axios.post(
    `${API_BASE}/users/${userId}/block`,
    reason ? { reason } : {},
    { withCredentials: true }
  );
  return res.data;
}

export async function unblockUser(userId: string) {
  const res = await axios.delete(`${API_BASE}/users/${userId}/block`, {
    withCredentials: true,
  });
  return res.data;
}

export async function getBlockedUsers(page = 1, limit = 50) {
  const res = await axios.get(`${API_BASE}/users/blocked`, {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data as { success: boolean; blocked: BlockedUser[]; total: number };
}
