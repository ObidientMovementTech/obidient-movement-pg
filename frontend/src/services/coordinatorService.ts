import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface SearchedUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  designation?: string;
  assignedState?: string;
  assignedLGA?: string;
  assignedWard?: string;
}

export interface NigeriaLocation {
  id: number;
  name: string;
  abbreviation?: string;
  level?: string;
  parent_id?: number;
  source_id?: string;
  parent_name?: string;
}

export interface SubordinatesResponse {
  subordinates: SearchedUser[];
  total: number;
  page: number;
  pages: number;
}

export interface AssignDesignationPayload {
  userId: string;
  designation: string;
  assignedState?: string;
  assignedLGA?: string;
  assignedWard?: string;
  override?: boolean;
}

// What each coordinator level can assign (mirrors backend CAN_ASSIGN)
export const CAN_ASSIGN: Record<string, string[]> = {
  'National Coordinator': ['State Coordinator', 'LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent'],
  'State Coordinator': ['LGA Coordinator', 'Ward Coordinator', 'Polling Unit Agent'],
  'LGA Coordinator': ['Ward Coordinator', 'Polling Unit Agent'],
  'Ward Coordinator': ['Polling Unit Agent'],
};

export const COORDINATOR_DESIGNATIONS = [
  'National Coordinator',
  'State Coordinator',
  'LGA Coordinator',
  'Ward Coordinator',
];

export const coordinatorService = {
  searchUsers: async (query: string, limit = 20) => {
    const response = await axios.get(`${API_BASE}/api/coordinator/search`, {
      params: { q: query, limit },
      withCredentials: true,
    });
    return response.data;
  },

  assignDesignation: async (payload: AssignDesignationPayload) => {
    const response = await axios.post(`${API_BASE}/api/coordinator/assign`, payload, {
      withCredentials: true,
    });
    return response.data;
  },

  getSubordinates: async (page = 1, limit = 20, designation?: string, q?: string) => {
    const params: Record<string, any> = { page, limit };
    if (designation) params.designation = designation;
    if (q) params.q = q;
    const response = await axios.get(`${API_BASE}/api/coordinator/subordinates`, {
      params,
      withCredentials: true,
    });
    return response.data;
  },

  removeDesignation: async (userId: string) => {
    const response = await axios.post(
      `${API_BASE}/api/coordinator/remove`,
      { userId },
      { withCredentials: true },
    );
    return response.data;
  },

  // Nigeria location endpoints
  getStates: async (): Promise<NigeriaLocation[]> => {
    const response = await axios.get(`${API_BASE}/api/nigeria-locations/states`, {
      withCredentials: true,
    });
    return response.data.data || response.data;
  },

  getLGAsByState: async (stateId: number): Promise<NigeriaLocation[]> => {
    const response = await axios.get(`${API_BASE}/api/nigeria-locations/states/${stateId}/lgas`, {
      withCredentials: true,
    });
    return response.data.data || response.data;
  },

  getWardsByLGA: async (lgaId: number): Promise<NigeriaLocation[]> => {
    const response = await axios.get(`${API_BASE}/api/nigeria-locations/lgas/${lgaId}/wards`, {
      withCredentials: true,
    });
    return response.data.data || response.data;
  },
};

export default coordinatorService;
