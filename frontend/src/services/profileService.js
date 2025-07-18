import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_URL}/api/users/profile-completion`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
