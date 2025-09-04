import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your server URL - adjust the IP address as needed
const BASE_URL = 'http://10.0.2.2:5000'; // For Android emulator
// const BASE_URL = 'http://localhost:5000'; // For iOS simulator
// const BASE_URL = 'http://YOUR_COMPUTER_IP:5000'; // For physical device

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // You can add navigation to login screen here
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email, password) =>
    api.post('/mobile/auth/login', { email, password }),

  testConnection: () =>
    api.get('/mobile/test'),
};

// Mobile app endpoints
export const mobileAPI = {
  // Feeds
  getFeeds: (page = 1, limit = 20) =>
    api.get(`/mobile/feeds?page=${page}&limit=${limit}`),

  // Leadership Messaging
  sendMessage: (data) =>
    api.post('/mobile/messages/leadership', data),

  getMyMessages: () =>
    api.get('/mobile/messages/my-messages'),

  // Push notifications
  registerPushToken: (token, platform) =>
    api.post('/mobile/push/register-token', { token, platform }),

  updatePushSettings: (settings) =>
    api.put('/mobile/push/settings', settings),
};

// Storage helpers
export const storage = {
  setAuthToken: async (token) => {
    await AsyncStorage.setItem('authToken', token);
  },

  getAuthToken: async () => {
    return await AsyncStorage.getItem('authToken');
  },

  setUser: async (user) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  },

  getUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clearAuth: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },
};

export default api;
