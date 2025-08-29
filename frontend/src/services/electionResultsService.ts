import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface Candidate {
  id: string;
  name: string;
  party: string;
  party_acronym: string;
  position: string;
  state: string;
  lga?: string;
  votes: number;
  percentage: number;
  image_url?: string;
}

export interface ElectionResult {
  election_id: string;
  election_name: string;
  election_type: string;
  state: string;
  lga?: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  election_date: string;
  total_votes: number;
  total_registered_voters?: number;
  voter_turnout_percentage?: number;
  candidates: Candidate[];
  last_updated: string;
  is_certified: boolean;
  certification_date?: string;
}

export interface ElectionSummary {
  election_id: string;
  election_name: string;
  election_type: string;
  state: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  election_date: string;
  total_votes: number;
  leading_candidate?: {
    name: string;
    party: string;
    votes: number;
    percentage: number;
  };
  voter_turnout?: number;
  is_certified: boolean;
}

export interface ResultsFilters {
  status?: 'ongoing' | 'completed' | 'upcoming';
  state?: string;
  election_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const electionResultsService = {
  // Get all election results with filters
  async getElectionResults(filters: ResultsFilters = {}) {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const url = queryString ? `${API_BASE}/election-results?${queryString}` : `${API_BASE}/election-results`;

      const response = await axios.get(url, { withCredentials: true });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination,
        total: response.data.total
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch election results');
    }
  },

  // Get detailed results for a specific election
  async getElectionResultDetails(electionId: string): Promise<ElectionResult> {
    try {
      const response = await axios.get(`${API_BASE}/election-results/${electionId}`, {
        withCredentials: true
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch election result details');
    }
  },

  // Get live results for ongoing elections
  async getLiveResults() {
    try {
      const response = await axios.get(`${API_BASE}/election-results?status=ongoing`, {
        withCredentials: true
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch live results');
    }
  },

  // Get results by state
  async getResultsByState(state: string) {
    try {
      const response = await axios.get(`${API_BASE}/election-results?state=${encodeURIComponent(state)}`, {
        withCredentials: true
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch results by state');
    }
  },

  // Get summary statistics for all elections
  async getElectionsSummary() {
    try {
      const response = await axios.get(`${API_BASE}/election-results/summary`, {
        withCredentials: true
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch elections summary');
    }
  },

  // Get trending elections (most active/viewed)
  async getTrendingElections() {
    try {
      const response = await axios.get(`${API_BASE}/election-results/trending`, {
        withCredentials: true
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trending elections');
    }
  }
};
