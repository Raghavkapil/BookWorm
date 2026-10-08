import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bookstore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Parse Standard Format & Handle Global Auth Expiry
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized on a protected call
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('bookstore_token');
        localStorage.removeItem('bookstore_user');
      }
    }
    const errData = error.response?.data || {
      success: false,
      message: error.message || 'Network error occurred',
      code: 'NETWORK_ERROR'
    };
    return Promise.reject(errData);
  }
);

export default api;
