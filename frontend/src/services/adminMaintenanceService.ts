import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Interface for cleanup duplicate auto blocs response
interface CleanupDuplicateAutoBlocsResponse {
  success: boolean;
  message: string;
  stats: {
    usersWithDuplicates: number;
    usersCleaned: number;
    blocsDeleted: number;
  };
}

export const adminMaintenanceService = {
  // Clean up duplicate auto-generated voting blocs
  async cleanupDuplicateAutoBlocs(): Promise<CleanupDuplicateAutoBlocsResponse> {
    const response = await axios.post(`${API_BASE}/admin/cleanup/duplicate-auto-blocs`, {}, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  },

  // Add more maintenance operations here as needed
  // async cleanupOrphanedData() { ... }
  // async optimizeDatabase() { ... }
  // async validateDataIntegrity() { ... }
};

export default adminMaintenanceService;
