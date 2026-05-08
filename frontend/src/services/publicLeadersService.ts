import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface PublicLeader {
  id: string;
  name: string;
  phone: string | null;
  designation: string;
  assignedState: string | null;
  assignedLGA: string | null;
  assignedWard: string | null;
  profileImage: string | null;
}

export interface PublicLeadersResponse {
  leaders: PublicLeader[];
  total: number;
  page: number;
  pages: number;
}

export interface LeaderStatsResponse {
  totalCoordinators: number;
  byDesignation: Record<string, number>;
  statesWithCoordinators: number;
  totalMembers: number;
}

export interface LeadersQuery {
  designation?: string;
  state?: string;
  lga?: string;
  page?: number;
  limit?: number;
}

export const getPublicLeaders = async (params?: LeadersQuery): Promise<PublicLeadersResponse> => {
  const res = await axios.get(`${API_BASE}/api/public/leaders`, { params });
  return res.data;
};

export const getLeaderStats = async (): Promise<LeaderStatsResponse> => {
  const res = await axios.get(`${API_BASE}/api/public/leaders/stats`);
  return res.data;
};
