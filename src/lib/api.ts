import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  const workspaceId = Cookies.get('workspaceId');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (workspaceId) {
    config.headers['X-Workspace-ID'] = workspaceId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Helpful log for debugging 401s
    if (error.response?.status === 401) {
      console.warn('Unauthorized (401) detected at:', error.config.url);
      
      const isLoginRequest = error.config.url?.includes('/api/v1/auth/login');
      
      if (!isLoginRequest) {
        Cookies.remove('token');
        Cookies.remove('workspaceId');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
