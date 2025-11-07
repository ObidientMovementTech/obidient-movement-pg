import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface ElectionParty {
  party_code: string;
  party_name: string;
  display_name: string | null;
  color: string | null;
  display_order: number | null;
}

export interface AgentInfo {
  id: string;
  name: string;
  phone: string | null;
  photo: string | null;
  designation: string | null;
  username?: string;
  email?: string;
  location?: any;
  supportGroup?: string | null;
}

export interface PollingUnitData {
  puCode: string;
  puName: string;
  ward: string;
  lga: string;
  state: string;
  hasSetup: boolean;
  hasResults: boolean;
  setupData: any | null;
  resultData: any | null;
  partyVotes?: Array<{ party: string; votes: number }>;
  ec8aPhoto?: string;
  evidencePhotos?: string[];
  agent: AgentInfo | null;
  lastUpdated: string | null;
}

export interface WardData {
  ward: string;
  lga: string;
  state: string;
  pollingUnits: Record<string, PollingUnitData>;
  totalSubmissions: number;
  resultSubmissions: number;
  setupSubmissions: number;
  partyTotals: Record<string, number>;
}

export interface LGAData {
  lga: string;
  state: string;
  wards: Record<string, WardData>;
  totalSubmissions: number;
  resultSubmissions: number;
  setupSubmissions: number;
  partyTotals: Record<string, number>;
}

export interface StateData {
  state: string;
  lgas: Record<string, LGAData>;
  totalSubmissions: number;
  resultSubmissions: number;
  setupSubmissions: number;
}

export interface ElectionHierarchy {
  electionId: string;
  parties: ElectionParty[];
  hierarchy: Record<string, StateData>;
  summary: {
    totalStates: number;
    totalLGAs: number;
    totalWards: number;
    totalPollingUnits: number;
  };
  timestamp: string;
}

export interface ActiveElection {
  id: number;
  election_id: string;
  election_name: string;
  type: string;
  state: string | null;
  lga: string | null;
  election_date: string;
  status: string;
  total_submissions: number;
  result_submissions: number;
  setup_submissions: number;
}

export interface PollingUnitDetails {
  submission: {
    id: string;
    type: string;
    puCode: string;
    data: any;
    attachments: string[];
    scope: any;
    createdAt: string;
  };
  agent: AgentInfo;
}

// Cache for hierarchy data with timestamp
const hierarchyCache = new Map<string, { data: ElectionHierarchy; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export const resultsDashboardService = {
  /**
   * Get all active elections for results viewing
   */
  async getActiveElections(): Promise<ActiveElection[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/results-dashboard/elections`, {
        withCredentials: true
      });
      return response.data.data.elections;
    } catch (error: any) {
      console.error('Error fetching active elections:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch elections');
    }
  },

  /**
   * Get hierarchical results structure for an election
   * Uses caching to improve performance
   */
  async getElectionHierarchy(electionId: string, forceRefresh = false): Promise<ElectionHierarchy> {
    try {
      // Check cache first
      const cached = hierarchyCache.get(electionId);
      const now = Date.now();

      if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log('📦 Using cached hierarchy data for', electionId);
        return cached.data;
      }

      console.log('🌐 Fetching fresh hierarchy data for', electionId);
      const response = await axios.get(
        `${API_BASE_URL}/api/results-dashboard/elections/${electionId}/hierarchy`,
        { withCredentials: true }
      );

      const data = response.data.data;

      // Update cache
      hierarchyCache.set(electionId, {
        data,
        timestamp: now
      });

      return data;
    } catch (error: any) {
      console.error('Error fetching election hierarchy:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch election hierarchy');
    }
  },

  /**
   * Get detailed polling unit information
   */
  async getPollingUnitDetails(electionId: string, submissionId: string): Promise<PollingUnitDetails> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/results-dashboard/elections/${electionId}/polling-unit/${submissionId}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching polling unit details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch polling unit details');
    }
  },

  /**
   * Clear cache for a specific election or all elections
   */
  clearCache(electionId?: string): void {
    if (electionId) {
      hierarchyCache.delete(electionId);
      console.log('🗑️ Cache cleared for', electionId);
    } else {
      hierarchyCache.clear();
      console.log('🗑️ All cache cleared');
    }
  },

  /**
   * Get cache status
   */
  getCacheStatus(): { size: number; keys: string[] } {
    return {
      size: hierarchyCache.size,
      keys: Array.from(hierarchyCache.keys())
    };
  }
};
