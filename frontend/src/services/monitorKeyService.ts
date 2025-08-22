import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const monitorKeyService = {
  // Admin functions
  async assignMonitorKey(userId: string, electionIds: string[], monitoringLocation?: any) {
    try {
      const response = await axios.post(`${API_BASE}/monitor-key/assign/${userId}`, {
        electionIds,
        monitoringLocation
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to assign monitoring key');
    }
  },

  async revokeMonitorKey(userId: string) {
    try {
      const response = await axios.put(`${API_BASE}/monitor-key/revoke/${userId}`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to revoke monitoring key');
    }
  },

  async getActiveElections() {
    try {
      const response = await axios.get(`${API_BASE}/monitor-key/elections`, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get active elections');
    }
  },

  // User functions
  async verifyMonitorKey(uniqueKey: string) {
    try {
      const response = await axios.post(`${API_BASE}/monitor-key/verify`, {
        uniqueKey
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify monitoring key');
    }
  },

  async getMonitoringAccess() {
    try {
      const response = await axios.get(`${API_BASE}/monitor-key/access`, {
        withCredentials: true
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get monitoring access');
    }
  }
};
