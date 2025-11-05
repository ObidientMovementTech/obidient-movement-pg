import axios from 'axios';
import { statesLGAWardList } from '../utils/StateLGAWardPollingUnits';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface Election {
  id: number;
  election_id: string;
  election_name: string;
  election_type: string;
  state: string;
  lga: string;
  election_date: string;
  status: 'upcoming' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ElectionFormData {
  election_name: string;
  election_type: string;
  state: string;
  lga: string;
  election_date: string;
}

export interface ElectionStats {
  election: Election;
  stats: {
    monitorKeys: {
      total_keys: number;
      active_keys: number;
      revoked_keys: number;
    };
    submissions: {
      total_submissions: number;
      unique_monitors: number;
      verified_submissions: number;
      pending_submissions: number;
      flagged_submissions: number;
    };
    locationDistribution: Array<{
      polling_unit_location: string;
      submission_count: number;
    }>;
    recentActivity: Array<{
      created_at: string;
      status: string;
      polling_unit_location: string;
      first_name: string;
      last_name: string;
    }>;
  };
}

export interface DashboardStats {
  elections: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
  };
  monitorKeys: {
    total: number;
    active: number;
  };
  submissions: {
    total: number;
    today: number;
  };
  recentElections: Election[];
}

export interface ElectionFilters {
  status?: string;
  state?: string;
  election_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const electionService = {
  // Get all elections with optional filters
  async getElections(filters: ElectionFilters = {}) {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const url = queryString ? `${API_BASE}/elections?${queryString}` : `${API_BASE}/elections`;

      const response = await axios.get(url, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch elections');
    }
  },

  // Get a specific election by ID
  async getElectionById(id: number) {
    try {
      const response = await axios.get(`${API_BASE}/elections/${id}`, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch election');
    }
  },

  // Create a new election
  async createElection(electionData: ElectionFormData) {
    try {
      const response = await axios.post(`${API_BASE}/elections`, electionData, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create election');
    }
  },

  // Update an existing election
  async updateElection(id: number, electionData: Partial<ElectionFormData>) {
    try {
      const response = await axios.put(`${API_BASE}/elections/${id}`, electionData, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update election');
    }
  },

  // Update election status
  async updateElectionStatus(id: number, status: 'upcoming' | 'active' | 'completed') {
    try {
      const response = await axios.patch(`${API_BASE}/elections/${id}/status`, { status }, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update election status');
    }
  },

  // Delete an election
  async deleteElection(id: number) {
    try {
      const response = await axios.delete(`${API_BASE}/elections/${id}`, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete election');
    }
  },

  // Get election statistics
  async getElectionStats(id: number): Promise<ElectionStats> {
    try {
      const response = await axios.get(`${API_BASE}/elections/${id}/stats`, { withCredentials: true });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch election statistics');
    }
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${API_BASE}/elections/dashboard-stats`, { withCredentials: true });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  },

  // Get active elections for monitor key assignment
  async getActiveElections() {
    try {
      const response = await axios.get(`${API_BASE}/elections?status=active&limit=100`, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch active elections');
    }
  },

  // Get upcoming elections
  async getUpcomingElections() {
    try {
      const response = await axios.get(`${API_BASE}/elections?status=upcoming&limit=100`, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch upcoming elections');
    }
  },

  // Get elections by state
  async getElectionsByState(state: string) {
    try {
      const response = await axios.get(`${API_BASE}/elections?state=${encodeURIComponent(state)}&limit=100`, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch elections by state');
    }
  },

  // Get elections by type
  async getElectionsByType(type: string) {
    try {
      const response = await axios.get(`${API_BASE}/elections?election_type=${encodeURIComponent(type)}&limit=100`, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch elections by type');
    }
  },

  // Search elections
  async searchElections(searchTerm: string) {
    try {
      const response = await axios.get(`${API_BASE}/elections?search=${encodeURIComponent(searchTerm)}&limit=50`, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search elections');
    }
  },

  // Get election types for form dropdown
  getElectionTypes() {
    return [
      { value: 'presidential', label: 'Presidential Election' },
      { value: 'gubernatorial', label: 'Gubernatorial Election' },
      { value: 'senatorial', label: 'Senatorial Election' },
      { value: 'house_of_reps', label: 'House of Representatives' },
      { value: 'state_assembly', label: 'State House of Assembly' },
      { value: 'local_government', label: 'Local Government Election' },
      { value: 'council', label: 'Council Election' },
      { value: 'other', label: 'Other' }
    ];
  },

  // Get Nigerian states for form dropdown
  getNigerianStates() {
    return statesLGAWardList.map(stateData => stateData.state).sort();
  },

  // Get LGAs for a specific state
  getLGAsByState(state: string) {
    const stateData = statesLGAWardList.find(s => s.state === state);
    return stateData ? stateData.lgas.map(lga => ({
      value: lga.lga,
      label: lga.lga.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    })).sort((a, b) => a.label.localeCompare(b.label)) : [];
  },

  // Get wards for a specific LGA
  getWardsByLGA(state: string, lga: string) {
    const stateData = statesLGAWardList.find(s => s.state === state);
    if (!stateData) return [];

    const lgaData = stateData.lgas.find(l => l.lga === lga);
    return lgaData ? lgaData.wards.map(ward => ({
      value: ward,
      label: ward.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    })).sort((a, b) => a.label.localeCompare(b.label)) : [];
  },

  // Validate election date
  validateElectionDate(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date >= today;
  },

  // Format election date for display
  formatElectionDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Get status color class
  getStatusColor(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Check if election can be edited
  canEditElection(election: Election): boolean {
    // Allow editing for upcoming elections and active elections (with warnings)
    return election.status === 'upcoming' || election.status === 'active';
  },

  // Check if election can be deleted
  canDeleteElection(election: Election): boolean {
    // Only allow deletion for upcoming elections
    return election.status === 'upcoming';
  },

  // Check if election status can be changed
  canChangeStatus(election: Election, newStatus: string): boolean {
    const currentStatus = election.status;

    // Define allowed status transitions
    const allowedTransitions: Record<string, string[]> = {
      'upcoming': ['active', 'completed'],
      'active': ['completed', 'upcoming'], // Allow pausing
      'completed': [] // Cannot change from completed
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  },

  // Generate election ID preview
  generateElectionIdPreview(formData: Partial<ElectionFormData>): string {
    if (!formData.state || !formData.election_type || !formData.election_date) {
      return 'Please fill all fields';
    }

    const stateCode = formData.state.substring(0, 3).toUpperCase();
    const typeCode = formData.election_type === 'gubernatorial' ? 'GOV' :
      formData.election_type === 'presidential' ? 'PRES' :
        formData.election_type === 'senatorial' ? 'SEN' :
          formData.election_type === 'house_of_reps' ? 'HOR' :
            formData.election_type === 'state_assembly' ? 'SHA' :
              formData.election_type === 'local_government' ? 'LG' :
                formData.election_type === 'council' ? 'COU' : 'ELECT';
    const year = new Date(formData.election_date).getFullYear();

    return `${stateCode}-${typeCode}-${year}`;
  },

  // Get parties for an election
  async getElectionParties(electionId: string) {
    try {
      const response = await axios.get(
        `${API_BASE}/elections/${electionId}/parties`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching election parties:', error);
      throw error.response?.data || error;
    }
  }
};
