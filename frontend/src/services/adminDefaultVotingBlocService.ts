import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface DefaultVotingBlocSettings {
  id?: string;
  descriptionTemplate: string;
  targetCandidate: string;
  scope: string;
  goals: string[];
  toolkits: Array<{
    label: string;
    url: string;
    type: string;
  }>;
  bannerImageUrl: string;
  richDescriptionTemplate: string;
  locationDefaults: {
    useUserLocation: boolean;
    defaultState: string;
    defaultLga: string;
    defaultWard: string;
  };
}

export interface DefaultSettingsResponse {
  success: boolean;
  settings: DefaultVotingBlocSettings;
  message?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  imageUrl: string;
  message?: string;
}

/**
 * Get default voting bloc settings
 */
export const getDefaultSettings = async (): Promise<DefaultSettingsResponse> => {
  try {
    const response = await axios.get(`${API_BASE}/admin/default-settings`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch default settings');
    }
    throw new Error('Failed to fetch default settings');
  }
};

/**
 * Update default voting bloc settings
 */
export const updateDefaultSettings = async (
  settings: DefaultVotingBlocSettings
): Promise<DefaultSettingsResponse> => {
  try {
    const response = await axios.put(`${API_BASE}/admin/default-settings`, settings, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to update settings');
    }
    throw new Error('Failed to update settings');
  }
};

/**
 * Upload banner image for default voting bloc settings
 */
export const uploadBannerImage = async (file: File): Promise<ImageUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${API_BASE}/admin/upload-banner`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to upload image');
    }
    throw new Error('Failed to upload image');
  }
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file' };
  }

  // Check file size (5MB limit)
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeInBytes) {
    return { isValid: false, error: 'Image must be less than 5MB' };
  }

  return { isValid: true };
};
