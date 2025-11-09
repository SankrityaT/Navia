import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from './storage';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken('clerk-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const taskAPI = {
  getTasks: () => apiClient.get('/tasks'),
  createTask: (task: any) => apiClient.post('/tasks', task),
  updateTask: (id: string, task: any) => apiClient.patch(`/tasks/${id}`, task),
  deleteTask: (id: string) => apiClient.delete(`/tasks/${id}`),
};

export const chatAPI = {
  sendMessage: (message: string, category?: string) => 
    apiClient.post('/query', { query: message, category }),
  getHistory: () => apiClient.get('/chat/history'),
};

export const profileAPI = {
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (data: any) => apiClient.patch('/profile', data),
  saveOnboarding: (data: any) => apiClient.post('/onboarding', data),
};

export const peerAPI = {
  getMatches: () => apiClient.get('/peers/matches'),
  connect: (peerId: string) => apiClient.post('/peers/connect', { peerId }),
  getConnections: () => apiClient.get('/peers/connections'),
};

export default apiClient;
