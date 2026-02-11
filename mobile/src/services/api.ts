import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getToken } from './auth';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// UZ: So'rov yuborishdan oldin tokenni qo'shish (Interceptor)
api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// UZ: Auth API - Login va Profil uchun
export const authApi = {
    login: (credentials: any) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
};

// UZ: Kunlik hisobotlar API
export const dailyReportsApi = {
    getByDate: (date: string, isTest = false) => api.get(`/daily-reports?date=${date}&isTest=${isTest}`),
    upsert: (data: any) => api.post('/daily-reports', data),
    upsertFlu: (data: any) => api.post('/daily-reports/flu', data),
    upsertAri: (data: any) => api.post('/daily-reports/ari', data),
    upsertCovid: (data: any) => api.post('/daily-reports/covid', data),
};

export const organizationsApi = {
    getAll: () => api.get('/organizations'),
};

export const diseasesApi = {
    getAll: () => api.get('/diseases'),
};
