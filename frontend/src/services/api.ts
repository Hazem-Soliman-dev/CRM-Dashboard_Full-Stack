import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Determine API base URL based on environment
// Production: Use relative path for Vercel deployment (/api/v1)
// Development: Use localhost or env variable
const getApiBaseURL = (): string => {
  // If explicitly set via env variable, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Production: use relative path (works with Vercel routing)
  if (import.meta.env.MODE === 'production' || import.meta.env.PROD) {
    return '/api/v1';
  }
  
  // Development: use localhost
  return 'http://localhost:5000/api/v1';
};

const apiBaseURL = getApiBaseURL();

if (import.meta.env.MODE === 'development' && !import.meta.env.VITE_API_BASE_URL) {
  console.log('🔧 API Base URL:', apiBaseURL);
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Enhance error with user-friendly messages
    const enhancedError = error;
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';
      
      // Add user-friendly error messages
      if (status === 403) {
        enhancedError.userMessage = 'You don\'t have permission to perform this action.';
        enhancedError.toastTitle = 'Access Denied';
      } else if (status === 404) {
        enhancedError.userMessage = 'The requested resource was not found.';
        enhancedError.toastTitle = 'Not Found';
      } else if (status >= 500) {
        enhancedError.userMessage = 'Server error. Please try again later.';
        enhancedError.toastTitle = 'Server Error';
      } else if (status === 400) {
        enhancedError.userMessage = message || 'Invalid request. Please check your input.';
        enhancedError.toastTitle = 'Validation Error';
      } else {
        enhancedError.userMessage = message;
        enhancedError.toastTitle = 'Error';
      }
      
      console.error(`API Error [${status}]:`, message);
    } else if (error.request) {
      // Request was made but no response received
      enhancedError.userMessage = 'Connection failed. Please check your internet connection.';
      enhancedError.toastTitle = 'Connection Error';
      console.error('Network error:', error.message);
    } else {
      // Something else happened
      enhancedError.userMessage = 'An unexpected error occurred. Please try again.';
      enhancedError.toastTitle = 'Error';
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(enhancedError);
  }
);

export default api;
