import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ──────────── Types ────────────

export interface Room {
  id: string;
  title: string;
  room_level: 'national' | 'state' | 'lga' | 'ward' | 'pu';
  room_state: string | null;
  room_lga: string | null;
  room_ward: string | null;
  room_pu: string | null;
  icon: string;
  member_count: number;
  unread_count: number;
  last_read_at: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
}

export interface RoomMessage {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
  sender_image: string | null;
  sender_designation: string | null;
  sender_assigned_state: string | null;
  sender_assigned_lga: string | null;
  sender_assigned_ward: string | null;
  sender_voting_state: string | null;
  sender_voting_lga: string | null;
  sender_voting_ward: string | null;
  sender_voting_pu: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
}

export interface RoomMember {
  id: string;
  name: string;
  profileImage: string | null;
  designation: string;
  role: 'admin' | 'moderator' | 'member';
  is_muted: boolean;
  muted_until: string | null;
  online: boolean;
}

// ──────────── API Functions ────────────

export async function getMyRooms(): Promise<{ success: boolean; rooms: Room[] }> {
  const res = await axios.get(`${API_BASE}/api/rooms/my-rooms`, {
    withCredentials: true,
  });
  return res.data;
}

export async function getRoomMessages(
  roomId: string,
  opts?: { before?: string; limit?: number }
): Promise<{ success: boolean; messages: RoomMessage[]; hasMore: boolean }> {
  const res = await axios.get(`${API_BASE}/api/rooms/${roomId}/messages`, {
    params: opts,
    withCredentials: true,
  });
  return res.data;
}

export async function sendRoomMessage(
  roomId: string,
  content: string
): Promise<{ success: boolean; message: RoomMessage }> {
  const res = await axios.post(
    `${API_BASE}/api/rooms/${roomId}/messages`,
    { content },
    { withCredentials: true }
  );
  return res.data;
}

export async function deleteRoomMessage(
  roomId: string,
  msgId: string,
  reason?: string
): Promise<{ success: boolean }> {
  const res = await axios.delete(
    `${API_BASE}/api/rooms/${roomId}/messages/${msgId}`,
    { data: { reason }, withCredentials: true }
  );
  return res.data;
}

export async function muteRoomUser(
  roomId: string,
  userId: string,
  duration: number,
  reason?: string
): Promise<{ success: boolean; mutedUntil: string }> {
  const res = await axios.post(
    `${API_BASE}/api/rooms/${roomId}/mute/${userId}`,
    { duration, reason },
    { withCredentials: true }
  );
  return res.data;
}

export async function unmuteRoomUser(
  roomId: string,
  userId: string
): Promise<{ success: boolean }> {
  const res = await axios.post(
    `${API_BASE}/api/rooms/${roomId}/unmute/${userId}`,
    {},
    { withCredentials: true }
  );
  return res.data;
}

export async function pinRoomMessage(
  roomId: string,
  msgId: string
): Promise<{ success: boolean; pinned: boolean }> {
  const res = await axios.post(
    `${API_BASE}/api/rooms/${roomId}/pin/${msgId}`,
    {},
    { withCredentials: true }
  );
  return res.data;
}

export async function banRoomUser(
  roomId: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean }> {
  const res = await axios.post(
    `${API_BASE}/api/rooms/${roomId}/ban/${userId}`,
    { reason },
    { withCredentials: true }
  );
  return res.data;
}

export async function getRoomMembers(
  roomId: string,
  page = 1,
  limit = 30
): Promise<{
  success: boolean;
  members: RoomMember[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  const res = await axios.get(`${API_BASE}/api/rooms/${roomId}/members`, {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data;
}

export async function getPinnedMessages(
  roomId: string
): Promise<{ success: boolean; messages: RoomMessage[] }> {
  const res = await axios.get(`${API_BASE}/api/rooms/${roomId}/pinned`, {
    withCredentials: true,
  });
  return res.data;
}

export async function cleanupRoom(
  roomId: string
): Promise<{ success: boolean; deleted: number }> {
  const res = await axios.delete(`${API_BASE}/api/rooms/${roomId}/cleanup`, {
    withCredentials: true,
  });
  return res.data;
}
