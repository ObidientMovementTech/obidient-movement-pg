import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// TypeScript interface for profile completion response
interface ProfileCompletionData {
  success: boolean;
  data: {
    dbCompletionPercentage: number | null;
    manualCompletionPercentage: number;
    completedFields: number;
    totalFields: number;
    missingFields: string[];
  };
}

// Safe service to get profile completion from backend
export const getProfileCompletion = async (): Promise<ProfileCompletionData> => {
  try {
    const response = await axios.get(`${API_BASE}/users/profile-completion`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching profile completion:', error);
    throw error;
  }
};

export default {
  getProfileCompletion
};
