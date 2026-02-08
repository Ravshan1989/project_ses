// Use environment variable if available, otherwise use the production Railway URL as fallback
// UZ: Localhost'da bo'lsa mahalliy backend'ga, aks holda Railway'ga murojaat qiladi
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    (isLocalhost ? 'http://localhost:3000/api/v1' : 'https://projectses-production.up.railway.app/api/v1');
