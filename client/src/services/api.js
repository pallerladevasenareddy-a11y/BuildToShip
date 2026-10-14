import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('docusense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        !window.location.pathname.includes('/auth/callback')
      ) {
        localStorage.removeItem('docusense_token');
        localStorage.removeItem('docusense_user');
        if (supabase) {
          supabase.auth.signOut().catch(() => {});
        }
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
