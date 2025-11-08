import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface Party {
  id: string;
  party_code: string;
  party_name: string;
  display_name: string;
  display_order: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface PartyFormData {
  party_code: string;
  party_name: string;
  display_name: string;
  display_order?: number;
  color?: string;
}

export interface PartyAlias {
  id: string;
  party_id: string;
  alias: string;
  created_at: string;
}

export const partyService = {
  // Get all parties for a specific election
  async getElectionParties(electionId: string) {
    try {
      const response = await axios.get(
        `${API_BASE}/elections/${electionId}/parties`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch election parties');
    }
  },

  // Get all parties (global)
  async getAllParties() {
    try {
      const response = await axios.get(`${API_BASE}/api/parties`, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch parties');
    }
  },

  // Create a new party
  async createParty(partyData: PartyFormData) {
    try {
      const response = await axios.post(
        `${API_BASE}/api/parties`,
        partyData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create party');
    }
  },

  // Update a party
  async updateParty(partyId: string, partyData: Partial<PartyFormData>) {
    try {
      const response = await axios.put(
        `${API_BASE}/api/parties/${partyId}`,
        partyData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update party');
    }
  },

  // Delete a party
  async deleteParty(partyId: string) {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/parties/${partyId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete party');
    }
  },

  // Link parties to an election
  async linkPartiesToElection(electionId: string, partyIds: string[]) {
    try {
      const response = await axios.post(
        `${API_BASE}/elections/${electionId}/parties`,
        { party_ids: partyIds },
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to link parties to election');
    }
  },

  // Remove a party from an election
  async removePartyFromElection(electionId: string, partyId: string) {
    try {
      const response = await axios.delete(
        `${API_BASE}/elections/${electionId}/parties/${partyId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove party from election');
    }
  },

  // Add alias to a party
  async addPartyAlias(partyId: string, alias: string) {
    try {
      const response = await axios.post(
        `${API_BASE}/api/parties/${partyId}/aliases`,
        { alias },
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add party alias');
    }
  },

  // Get party aliases
  async getPartyAliases(partyId: string) {
    try {
      const response = await axios.get(
        `${API_BASE}/api/parties/${partyId}/aliases`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch party aliases');
    }
  },
};
