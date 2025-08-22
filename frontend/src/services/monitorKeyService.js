import apiClient from '../lib/apiClient';

export const monitorKeyService = {
  // Admin: Assign monitor key to user
  async assignMonitorKey(userId, data) {
    try {
      const response = await apiClient.post(`/api/monitor-key/assign/${userId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to assign monitor key' };
    }
  },

  // Admin: Revoke monitor key from user
  async revokeMonitorKey(userId) {
    try {
      const response = await apiClient.put(`/api/monitor-key/revoke/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to revoke monitor key' };
    }
  },

  // Admin: Get all active elections
  async getActiveElections() {
    try {
      const response = await apiClient.get('/api/monitor-key/elections');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch active elections' };
    }
  },

  // User: Verify monitor key
  async verifyMonitorKey(uniqueKey) {
    try {
      const response = await apiClient.post('/api/monitor-key/verify', { uniqueKey });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to verify monitor key' };
    }
  },

  // User: Get monitoring access status
  async getMonitoringAccess() {
    try {
      const response = await apiClient.get('/api/monitor-key/access');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get monitoring access' };
    }
  }
};
