interface SyncStatus {
  currentTemplateVersion: number;
  autoSyncEnabled: boolean;
  statistics: {
    total_auto_generated: string;
    up_to_date: string;
    outdated: string;
    last_sync: string | null;
  };
}

interface OutdatedBloc {
  id: string;
  name: string;
  templateVersion: number;
  creator: string;
}

interface SyncResponse {
  success: boolean;
  message: string;
  data?: any;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json'
});

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();

    // Check if response is HTML (404 page, etc.)
    if (errorText.includes('<!doctype') || errorText.includes('<html')) {
      throw new Error(`API endpoint not found (${response.status}). Make sure the backend server is running.`);
    }

    // Try to parse as JSON for API errors
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    } catch {
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }
  }

  return response.json();
};

export const templateSyncService = {
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sync/status`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      const result = await handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching sync status:', error);
      throw error;
    }
  },

  async getOutdatedBlocs(): Promise<OutdatedBloc[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sync/outdated-blocs`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      const result = await handleResponse(response);
      return result.data.outdatedBlocs || [];
    } catch (error) {
      console.error('Error fetching outdated blocs:', error);
      throw error;
    }
  },

  async syncVotingBloc(votingBlocId: string, syncFields?: string[]): Promise<void> {
    try {
      const body: any = {};
      if (syncFields && syncFields.length > 0) {
        body.syncFields = syncFields;
      }

      const response = await fetch(`${API_BASE_URL}/admin/sync/voting-bloc/${votingBlocId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body)
      });

      await handleResponse(response);
    } catch (error) {
      console.error('Error syncing voting bloc:', error);
      throw error;
    }
  },

  async syncAllOutdatedBlocs(syncFields?: string[]) {
    try {
      const body: any = {};
      if (syncFields && syncFields.length > 0) {
        body.syncFields = syncFields;
      }

      const response = await fetch(`${API_BASE_URL}/admin/sync/all-outdated`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const result = await handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error syncing all outdated blocs:', error);
      throw error;
    }
  },

  async updateSyncPreferences(votingBlocId: string, preferences: Record<string, boolean>) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sync/preferences/${votingBlocId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ preferences })
      });

      await handleResponse(response);
    } catch (error) {
      console.error('Error updating sync preferences:', error);
      throw error;
    }
  }
};

export type { SyncStatus, OutdatedBloc, SyncResponse };
