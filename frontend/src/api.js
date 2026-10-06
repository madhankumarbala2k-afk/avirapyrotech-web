import axios from 'axios';

// In production (Vercel), uses VITE_API_URL or defaults directly to live Railway URL
// In development, falls back to '/api' which vite.config.js proxies locally
const defaultBaseUrl = import.meta.env.DEV 
  ? '/api' 
  : 'https://avirapyrotech-production.up.railway.app/api';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || defaultBaseUrl).replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout: 15 seconds — prevents requests hanging under high traffic
  timeout: 15000,
});


// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // If request payload is FormData, remove default Content-Type so Axios/browser
    // automatically appends multipart/form-data WITH the correct boundary parameter
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global 401 handling + timeout messaging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      // Clear token and redirect to login if session expired or unauthorized on protected routes
      if (!isLoginRequest && !window.location.pathname.includes('/admin/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/admin/login?expired=true';
      }
    }

    // Friendly message for timeout / network errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.warn('[API] Server is busy or unreachable. Please try again.');
    }

    return Promise.reject(error);
  }
);

/**
 * Resolves an uploaded image path to a full URL pointing to Railway backend in production,
 * while allowing relative paths in development via the Vite proxy.
 */
export function getImageUrl(path) {
  if (!path) return '';
  // Return absolute URLs, blob URLs, or base64 data URIs as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  const rawApiUrl = import.meta.env.VITE_API_URL || defaultBaseUrl;

  // In local development, the Vite dev proxy handles /api -> localhost:8081
  if (import.meta.env.DEV) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  // In production (Vercel), resolve against Railway backend origin
  const backendOrigin = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${backendOrigin}${cleanPath}`;
}

export default api;
