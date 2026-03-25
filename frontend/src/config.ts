// Use environment variable if available, otherwise use dynamic hostname for local dev
const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.'));

// const localPort = 3000; // Backend port (matches Docker)
// UZ: Render yoki boshqa production URL ni shu yerga yozing yoki Vercel'dan VITE_API_URL o'zgaruvchisini bering
// const productionUrl = import.meta.env.VITE_API_URL || 'https://project-ses.onrender.com';

const productionUrl = import.meta.env.VITE_API_URL || 'https://project-ses.onrender.com';

// Use productionUrl if not on localhost
export const API_BASE_URL = isLocalhost 
    ? '/api/v1' 
    : `${productionUrl}/api/v1`;

export const SOCKET_URL = isLocalhost
    ? 'http://localhost:3000'
    : productionUrl;

console.log('Using API_BASE_URL:', API_BASE_URL);
