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
    getFluByDate: (date: string, isTest = false) => api.get(`/daily-reports/flu?date=${date}&isTest=${isTest}`),
    getAriByDate: (date: string, isTest = false) => api.get(`/daily-reports/ari?date=${date}&isTest=${isTest}`),
    getCovidByDate: (date: string, isTest = false) => api.get(`/daily-reports/covid?date=${date}&isTest=${isTest}`),
    getEpidemiologyByDate: (date: string, isTest = false) => api.get(`/daily-reports/epidemiology?date=${date}&isTest=${isTest}`),
    getDiarrheaByDate: (date: string, isTest = false) => api.get(`/daily-reports/diarrhea?date=${date}&isTest=${isTest}`),
    upsert: (data: any) => api.post('/daily-reports', data), // Hepatitis (default)
    upsertFlu: (data: any) => api.post('/daily-reports/flu', data),
    upsertAri: (data: any) => api.post('/daily-reports/ari', data),
    upsertCovid: (data: any) => api.post('/daily-reports/covid', data),
    upsertHepatitis: (data: any) => api.post('/daily-reports', data), // Alias for clarity
    upsertEpidemiology: (data: any) => api.post('/daily-reports/epidemiology', data),
    upsertDiarrhea: (data: any) => api.post('/daily-reports/diarrhea', data),
    getWeeklySummary: (startDate: string, endDate: string) =>
        api.get(`/daily-reports/weekly-summary?startDate=${startDate}&endDate=${endDate}`),
};

export const organizationsApi = {
    getAll: () => api.get('/organizations'),
};

export const diseasesApi = {
    getAll: () => api.get('/diseases'),
};

// UZ: SOS (Favqulodda xabar) API
export const sosApi = {
    getDiseases: () => api.get('/sos/diseases'),
    createAlert: (data: { diseaseName: string; status: string; comment?: string; latitude?: number; longitude?: number }) =>
        api.post('/sos/alerts', data),
};

export const versionApi = {
    getLatest: () => api.get('/version/latest'),
};

export const approvalApi = {
    submit: (type: string, id: string) => api.patch(`/daily-reports/${type}/${id}/submit`),
    verify: (type: string, id: string) => api.patch(`/daily-reports/${type}/${id}/verify`),
    approve: (type: string, id: string) => api.patch(`/daily-reports/${type}/${id}/approve`),
};
