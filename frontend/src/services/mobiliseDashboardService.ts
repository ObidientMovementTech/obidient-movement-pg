import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const mobiliseDashboardService = {
  /**
   * Get user's designation level and assigned location
   * This determines what initial data they should see
   */
  getUserLevel: async () => {
    const response = await axios.get(`${API_BASE}/mobilise-dashboard/user-level`, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Get National level dashboard data - all states
   * Only accessible to National Coordinators
   */
  getNationalData: async () => {
    const response = await axios.get(`${API_BASE}/mobilise-dashboard/national`, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Get State level dashboard data - all LGAs in a state
   * @param {string} stateId - State identifier (e.g., "abia")
   */
  getStateData: async (stateId: string) => {
    const response = await axios.get(`${API_BASE}/mobilise-dashboard/state/${stateId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Get LGA level dashboard data - all Wards in an LGA
   * @param {string} lgaId - LGA identifier (e.g., "abia-aba-north")
   */
  getLGAData: async (lgaId: string) => {
    const response = await axios.get(`${API_BASE}/mobilise-dashboard/lga/${lgaId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Get Ward level dashboard data - all Polling Units in a Ward
   * @param {string} wardId - Ward identifier (e.g., "abia-aba-north-ward-1")
   */
  getWardData: async (wardId: string) => {
    const response = await axios.get(`${API_BASE}/mobilise-dashboard/ward/${wardId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Get specific Polling Unit details
   * @param {string} puId - Polling Unit identifier (e.g., "abia-aba-north-ward-1-pu-001")
   */
  getPollingUnitData: async (puId: string) => {
    const response = await axios.get(`${API_BASE}/mobilise-dashboard/polling-unit/${puId}`, {
      withCredentials: true,
    });
    return response.data;
  }
};

export default mobiliseDashboardService;