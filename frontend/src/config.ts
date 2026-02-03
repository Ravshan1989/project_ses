// Use environment variable if available, otherwise use the production Railway URL as fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://projectses-production.up.railway.app/api/v1';
