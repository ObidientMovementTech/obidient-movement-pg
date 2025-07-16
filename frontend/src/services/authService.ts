import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const registerUser = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  votingState?: string;
  votingLGA?: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Registration failed. Please try again.");
  }
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const response = await axios.post(`${API_BASE}/auth/login`, data, {
    withCredentials: true,
  });
  return response.data;
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

