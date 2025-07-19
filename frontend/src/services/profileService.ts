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

// TypeScript interfaces for username validation
interface UsernameValidationResult {
  valid: boolean;
  message: string;
  available?: boolean;
}

interface UsernameAvailabilityResult {
  valid: boolean;
  message: string;
  available: boolean;
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

// Username validation utilities
export const validateUsernameFormat = (username: string): UsernameValidationResult => {
  // Must be 3-20 characters long and contain only letters, numbers, and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  if (!username) {
    return { valid: false, message: 'Username is required' };
  }

  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long' };
  }

  if (username.length > 20) {
    return { valid: false, message: 'Username must be no more than 20 characters long' };
  }

  if (!usernameRegex.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }

  if (username.includes('__')) {
    return { valid: false, message: 'Username cannot contain consecutive underscores' };
  }

  if (username.startsWith('_') || username.endsWith('_')) {
    return { valid: false, message: 'Username cannot start or end with an underscore' };
  }

  return { valid: true, message: 'Username format is valid' };
};

// Check username availability on server
export const checkUsernameAvailability = async (username: string): Promise<UsernameAvailabilityResult> => {
  try {
    // First validate format locally
    const formatValidation = validateUsernameFormat(username);
    if (!formatValidation.valid) {
      return { ...formatValidation, available: false };
    }

    // Then check availability on server
    const response = await axios.get(
      `${API_BASE}/users/check-username?username=${encodeURIComponent(username)}`,
      { withCredentials: true }
    );

    return {
      valid: response.data.available,
      message: response.data.available ? 'Username is available' : 'Username is already taken',
      available: response.data.available
    };
  } catch (error: any) {
    console.error('Error checking username availability:', error);
    return {
      valid: false,
      message: error.response?.data?.message || 'Error checking username availability',
      available: false
    };
  }
};

// Debounced username check function
let debounceTimer: NodeJS.Timeout | null = null;

export const debouncedUsernameCheck = (
  username: string,
  callback: (result: UsernameAvailabilityResult) => void,
  delay: number = 500
): void => {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new timer
  debounceTimer = setTimeout(async () => {
    try {
      const result = await checkUsernameAvailability(username);
      callback(result);
    } catch (error) {
      callback({
        valid: false,
        message: 'Error validating username',
        available: false
      });
    }
  }, delay);
};

export default {
  getProfileCompletion,
  validateUsernameFormat,
  checkUsernameAvailability,
  debouncedUsernameCheck
};
