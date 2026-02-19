// Use environment variable if available, otherwise use dynamic hostname for local dev
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const port = 3007; // Backend port

export const API_BASE_URL = `http://${hostname}:${port}/api/v1`;

console.log('Using API_BASE_URL:', API_BASE_URL);
