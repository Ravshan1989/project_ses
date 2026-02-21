// Use environment variable if available, otherwise use dynamic hostname for local dev
const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.'));

const localPort = 3000; // Backend port (matches Docker)
const railwayUrl = 'https://projectses-production.up.railway.app'; // Production Backend URL

export const API_BASE_URL = isLocalhost
    ? `http://${window.location.hostname}:${localPort}/api/v1`
    : `${railwayUrl}/api/v1`;

console.log('Using API_BASE_URL:', API_BASE_URL);
