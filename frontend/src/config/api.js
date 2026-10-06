// Centralized API Base URL configuration
// In local development: defaults to http://localhost:5000
// In production on Vercel: uses VITE_API_URL configured in Vercel environment variables

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }

  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
