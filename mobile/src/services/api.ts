import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getToken } from './auth';
import { OfflineManager } from './OfflineManager';


export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// UZ: So'rov yuborishdan oldin tokenni qo'shish (Interceptor)
// UZ: Offline rejimni boshqarish uchun interceptor (ixtiyoriy, yoki bevosita chaqiriladi)
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
    upsert: (data: any) => OfflineManager.handleRequest(api, { method: 'post', url: '/daily-reports', data }),
    upsertFlu: (data: any) => OfflineManager.handleRequest(api, { method: 'post', url: '/daily-reports/flu', data }),
    upsertAri: (data: any) => OfflineManager.handleRequest(api, { method: 'post', url: '/daily-reports/ari', data }),
    upsertCovid: (data: any) => OfflineManager.handleRequest(api, { method: 'post', url: '/daily-reports/covid', data }),
    upsertHepatitis: (data: any) => OfflineManager.handleRequest(api, { method: 'post', url: '/daily-reports', data }),
    upsertEpidemiology: (data: any) => OfflineManager.handleRequest(api, { method: 'post', url: '/daily-reports/epidemiology', data }),
    upsertDiarrhea: (data: any) => OfflineManager.handleRequest(api, { method: 'post', url: '/daily-reports/diarrhea', data }),
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
        OfflineManager.handleRequest(api, { method: 'post', url: '/sos/alerts', data }),

};

export const versionApi = {
    getLatest: () => api.get('/version/latest'),
};

export const approvalApi = {
    submit: (type: string, id: string) => api.patch(`/daily-reports/${type}/${id}/submit`),
    verify: (type: string, id: string) => api.patch(`/daily-reports/${type}/${id}/verify`),
    approve: (type: string, id: string) => api.patch(`/daily-reports/${type}/${id}/approve`),
    reject: (type: string, id: string, comment?: string) => api.patch(`/daily-reports/${type}/${id}/reject`, { comment }),
};

export const analysisApi = {
    getExecutiveSummary: () => api.get('/analysis/executive/summary'),
    getDistrictDetails: (id: string) => api.get(`/analysis/executive/district/${id}`),
    getDistrictExecutiveSummary: (id: string) => api.get(`/analysis/executive/district-summary/${id}`), // UZ: Tuman svodkasi
};

// UZ: Ijro intizomi (Murojaatlar) API
export const appealsApi = {
    getRecords: (month: string, organizationId?: string) =>
        api.get(`/appeals/records?month=${month}${organizationId ? `&organizationId=${organizationId}` : ''}`),
    createRecord: (data: any) => api.post('/appeals/records', data),
    getAutoReports: (month: string, organizationId?: string) =>
        api.get(`/appeals/auto-reports?month=${month}${organizationId ? `&organizationId=${organizationId}` : ''}`),
};

export const chatApi = {
    getHistory: (user1Id: string, user2Id: string) => 
        api.get(`/chat/history?user1Id=${user1Id}&user2Id=${user2Id}`),
    markAsRead: (messageId: string) => 
        api.patch(`/chat/read/${messageId}`),
};

export const usersApi = {
    getAll: () => api.get('/users'),
};

