import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const monitorKeyService = {
  // Admin functions
  async assignMonitorKey(userId: string, data: {
    userId: string;
    electionIds: string[];
    monitoring_location: {
      state: string;
      lga: string | null;
      ward: string | null;
    };
    assignedState: string;
    assignedLGA: string | null;
    assignedWard: string | null;
    key_status: 'active' | 'inactive';
    election_access_level: string;
  }) {
    if (!userId || !data.electionIds || !data.electionIds.length) {
      throw new Error('User ID and election IDs are required');
    }

    try {
      const response = await axios.post(`${API_BASE}/monitor-key/assign/${userId}`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Monitor key assignment error:', error.response || error);
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
    console.log('🔥 verifyMonitorKey called with key:', uniqueKey);

    try {
      const response = await axios.post(`${API_BASE}/monitor-key/verify`, {
        uniqueKey
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🎉 API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('❌ API error:', error);

      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Key verification failed');
      }
      throw new Error('Network error occurred');
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
