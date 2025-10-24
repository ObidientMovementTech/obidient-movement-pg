import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Export interfaces for use in components
export type { VoterRecord, PollingUnitStats, WardStats, LGAStats, VoterStatistics };

interface ImportStats {
  total_voters: number;
  states_count: number;
  lga_count: number;
  ward_count: number;
  polling_units_count: number;
  voters_with_names: number;
  voters_with_emails: number;
  recently_called: number;
  confirmed_voters: number;
}

interface RecentImport {
  imported_by_name: string;
  records_imported: number;
  import_date: string;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  lga: string;
  ward: string;
  polling_unit: string;
  polling_unit_code: string;
  assigned_at: string;
  is_active: boolean;
  assigned_by_name: string;
  voter_count: number;
  total_calls_made: number;
}

interface Assignment {
  id: number;
  state: string;
  lga: string;
  ward: string;
  polling_unit: string;
  polling_unit_code: string;
  total_voters: number;
  recently_called: number;
  confirmed_voters: number;
}

interface VoterRecord {
  id: string;
  vin: string;
  first_name: string;
  last_name: string;
  other_names: string;
  phone_number: string;
  email: string;
  state: string;
  lga: string;
  ward: string;
  polling_unit: string;
  polling_unit_code: string;
  address: string;
  occupation: string;
  gender: string;
  age: number;
  confirmed: boolean;
  last_called: string;
}

interface PollingUnitStats {
  polling_unit: string;
  polling_unit_code: string;
  voter_count: number;
  voters?: VoterRecord[];
}

interface WardStats {
  ward: string;
  voter_count: number;
  polling_unit_count: number;
  polling_units?: PollingUnitStats[];
}

interface LGAStats {
  lga: string;
  voter_count: number;
  ward_count: number;
  polling_unit_count: number;
  wards?: WardStats[];
}

interface VoterStatistics {
  total_voters: number;
  lga_count: number;
  lgas: LGAStats[];
}

interface Voter {
  id: number;
  phone_number: string;
  full_name: string;
  email_address: string;
  gender: string;
  age_group: string;
  called_recently: boolean;
  last_called_date: string;
  confirmed_to_vote: boolean;
  demands: string;
  notes: string;
  call_count: number;
}

interface VoterUpdateData {
  fullName?: string;
  emailAddress?: string;
  gender?: string;
  ageGroup?: string;
  confirmedToVote?: boolean | null;
  demands?: string;
  notes?: string;
}

interface ExcelPreview {
  headers: Array<{
    index: number;
    name: string;
    sample: string[];
  }>;
  sampleData: string[][];
  totalRows: number;
}

interface PollingUnit {
  state: string;
  lga: string;
  ward: string;
  polling_unit: string;
  polling_unit_code: string;
  voter_count: number;
}

interface VolunteerAssignment {
  volunteerId?: string; // For backward compatibility
  userId?: string; // For direct user assignment
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  pollingUnitCode?: string;
}

export const callCenterService = {
  // Admin endpoints

  /**
   * Get import statistics
   */
  async getImportStats() {
    const response = await axios.get(`${API_BASE}/call-center/import-stats`, {
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Get hierarchical voter statistics
   */
  async getVoterStatistics() {
    const response = await axios.get(`${API_BASE}/call-center/voter-statistics`, {
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Preview Excel file structure before import
   */
  async previewExcelFile(file: File) {
    const formData = new FormData();
    formData.append('excelFile', file);

    const response = await axios.post(`${API_BASE}/call-center/preview-excel`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Import voter data with column mapping
   */
  async importVotersWithMapping(filePath: string, columnMapping: Record<string, number>, sessionId?: string) {
    const response = await axios.post(`${API_BASE}/call-center/import-voters-with-mapping`, {
      filePath,
      columnMapping,
      sessionId: sessionId || `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }, {
      withCredentials: true
    });
    return response.data;
  },

  async getImportProgress(sessionId: string) {
    const response = await axios.get(`${API_BASE}/call-center/import-progress/${sessionId}`, {
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Get all volunteers and their assignments
   */
  async getVolunteers() {
    const response = await axios.get(`${API_BASE}/call-center/volunteers`, {
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Get available polling units (not assigned to volunteers)
   */
  async getAvailablePollingUnits() {
    const response = await axios.get(`${API_BASE}/call-center/available-polling-units`, {
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Assign a volunteer to a polling unit
   */
  async assignVolunteer(assignment: VolunteerAssignment) {
    const response = await axios.post(`${API_BASE}/call-center/assign-volunteer`, assignment, {
      withCredentials: true
    });
    return response.data;
  },

  // Volunteer endpoints

  /**
   * Get volunteer's assigned polling unit
   */
  async getMyAssignment() {
    const response = await axios.get(`${API_BASE}/call-center/my-assignment`, {
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Get voters assigned to the volunteer
   */
  async getMyVoters(params: {
    page?: number;
    limit?: number;
    filter?: 'all' | 'not_called' | 'called_recently' | 'confirmed' | 'needs_follow_up';
  } = {}) {
    const response = await axios.get(`${API_BASE}/call-center/my-voters`, {
      params: {
        page: 1,
        limit: 50,
        filter: 'all',
        ...params
      },
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Update voter information after a call
   */
  async updateVoterInfo(voterId: number, updateData: VoterUpdateData) {
    const response = await axios.put(`${API_BASE}/call-center/update-voter/${voterId}`, updateData, {
      withCredentials: true
    });
    return response.data;
  },

  // Legacy endpoint (kept for backward compatibility)
  /**
   * Import voters using legacy method (without column mapping)
   */
  async importVotersLegacy(file: File) {
    const formData = new FormData();
    formData.append('excelFile', file);

    const response = await axios.post(`${API_BASE}/call-center/import-voters`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Export types for use in components
export type {
  ImportStats,
  RecentImport,
  Volunteer,
  Assignment,
  Voter,
  VoterUpdateData,
  ExcelPreview,
  PollingUnit,
  VolunteerAssignment
};