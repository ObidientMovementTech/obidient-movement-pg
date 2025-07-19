import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const registerUser = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  countryCode?: string;
  votingState?: string;
  votingLGA?: string;
  pendingVotingBlocJoin?: {
    joinCode: string;
    votingBlocName: string;
    timestamp: string;
  };
}) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Return the full error response data which includes detailed error info
      throw {
        message: error.response.data.message || "Registration failed. Please try again.",
        field: error.response.data.field,
        errorType: error.response.data.errorType,
        success: false,
        status: error.response.status,
        ...error.response.data
      };
    }
    throw {
      message: "Registration failed. Please check your connection and try again.",
      success: false,
      errorType: 'NETWORK_ERROR'
    };
  }
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Return the full error response data which includes detailed error info
      throw {
        message: error.response.data.message || "Login failed. Please try again.",
        field: error.response.data.field,
        errorType: error.response.data.errorType,
        success: false,
        status: error.response.status,
        email: error.response.data.email, // For email not verified case
        ...error.response.data
      };
    }
    throw {
      message: "Login failed. Please check your connection and try again.",
      success: false,
      errorType: 'NETWORK_ERROR'
    };
  }
};

export const getCurrentUser = async () => {
  const res = await axios.get(`${API_BASE}/auth/me`, {
    withCredentials: true,
  });
  return res.data.user;
};

export const logoutUser = async () => {
  const response = await axios.post(`${API_BASE}/auth/logout`, {}, {
    withCredentials: true,
  });
  return response.data;
};

export const verify2FALogin = async (tempToken: string, code: string) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/verify-2fa`,
      { tempToken, code },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message);
    }
    throw new Error("2FA verification failed. Please try again.");
  }
};

export const resendVerificationEmail = async (email: string) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/resend-confirmation`,
      { email },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw {
        message: error.response.data.message || "Failed to resend verification email.",
        success: false,
        ...error.response.data
      };
    }
    throw {
      message: "Failed to resend verification email. Please try again.",
      success: false,
      errorType: 'NETWORK_ERROR'
    };
  }
};

