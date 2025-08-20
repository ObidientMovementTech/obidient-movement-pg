import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const stateDashboardService = {
  // Get dashboard data based on user's designation and assignment
  getDashboardData: async () => {
    const response = await axios.get(`${API_BASE}/state-dashboard/data`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Get subordinate coordinators
  getSubordinateCoordinators: async () => {
    const response = await axios.get(`${API_BASE}/state-dashboard/subordinates`, {
      withCredentials: true,
    });
    return response.data;
  }
};

export default stateDashboardService;
