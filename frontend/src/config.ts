// Use environment variable if available, otherwise use dynamic hostname for local dev
const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.'));

const localPort = 3000; // Backend port (matches Docker)
// UZ: Render yoki boshqa production URL ni shu yerga yozing yoki Vercel'dan VITE_API_URL o'zgaruvchisini bering
const productionUrl = import.meta.env.VITE_API_URL || 'https://project-ses.onrender.com';

export const API_BASE_URL = isLocalhost
    ? `http://${window.location.hostname}:${localPort}/api/v1`
    : `${productionUrl}/api/v1`;

console.log('Using API_BASE_URL:', API_BASE_URL);
