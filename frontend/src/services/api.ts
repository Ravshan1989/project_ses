import axios from 'axios';
import { API_BASE_URL } from '../config';
export { API_BASE_URL };

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for Auth Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Mock API calls for now
export const submissionApi = {
    create: (data: any) => api.post('/submissions', data),
    getAll: () => api.get('/submissions'),
    updateStatus: (id: string, action: 'APPROVE' | 'REJECT', comment?: string) =>
        api.patch(`/submissions/${id}/status`, { action, comment }),
    getStatusSummary: (templateCode: string, period: string, isTest = false) =>
        api.get(`/submissions/status-summary?templateCode=${templateCode}&period=${period}&isTest=${isTest}`),
    aggregateDaily: (month: string, isTest = false) =>
        api.get(`/submissions/aggregate-daily?month=${month}&isTest=${isTest}`),
    cleanupTest: () => api.post('/submissions/cleanup-test'),
};

export const diseasesApi = {
    getAll: () => api.get('/diseases'),
    create: (data: { code: string; name: string; reportFrequency?: string[]; isActive?: boolean }) => api.post('/diseases', data),
    update: (id: string, data: any) => api.patch(`/diseases/${id}`, data),
    delete: (id: string) => api.delete(`/diseases/${id}`),
};

export const dailyReportsApi = {
    getByDate: (date: string, isTest = false) => api.get(`/daily-reports?date=${date}&isTest=${isTest}`),
    upsert: (data: any) => api.post('/daily-reports', data),
    getFluByDate: (date: string, isTest = false) => api.get(`/daily-reports/flu?date=${date}&isTest=${isTest}`),
    upsertFlu: (data: any) => api.post('/daily-reports/flu', data),
    getAriByDate: (date: string, isTest = false) => api.get(`/daily-reports/ari?date=${date}&isTest=${isTest}`),
    upsertAri: (data: any) => api.post('/daily-reports/ari', data),
    getEpidemiologyByDate: (date: string, isTest = false) => api.get(`/daily-reports/epidemiology?date=${date}&isTest=${isTest}`),
    upsertEpidemiology: (data: any) => api.post('/daily-reports/epidemiology', data),
    getWeeklySummary: (startDate: string, endDate: string, isTest = false) =>
        api.get(`/daily-reports/weekly-summary?startDate=${startDate}&endDate=${endDate}&isTest=${isTest}`),
    getCovidByDate: (date: string, isTest = false) => api.get(`/daily-reports/covid?date=${date}&isTest=${isTest}`),
    upsertCovid: (data: any) => api.post('/daily-reports/covid', data),
    cleanupTest: () => api.post('/daily-reports/cleanup-test'),
    // UZ: Tasdiqlash va Tekshirish (Verification/Approval)
    verify: (type: string, id: string) => api.patch(`/daily-reports/${type}/${id}/verify`),
    approve: (type: string, id: string) => api.patch(`/daily-reports/${type}/${id}/approve`),
};

export const organizationsApi = {
    getAll: () => api.get('/organizations'),
};

export const exportsApi = {
    getFlu: (startDate: string, endDate: string, isTest = false) => api.get(`/exports/flu?startDate=${startDate}&endDate=${endDate}&isTest=${isTest}`),
    getHepatitis: (startDate: string, endDate: string, isTest = false) => api.get(`/exports/hepatitis?startDate=${startDate}&endDate=${endDate}&isTest=${isTest}`),
    getForm1: (startDate: string, endDate: string, isTest = false) => api.get(`/exports/form1?startDate=${startDate}&endDate=${endDate}&isTest=${isTest}`),
};

export const importsApi = {
    importGlobal: (file: File, type: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        return api.post('/imports/global', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export const analysisApi = {
    getIncidenceRates: (params: { diseaseType: string; startDate: string; endDate: string; organizationId?: string }) =>
        api.get('/analysis/incidence-rates', { params }),
    getGlobalSummary: (params: { startDate: string; endDate: string }) =>
        api.get('/analysis/global-summary', { params }),
};

export const departmentsApi = {
    getAll: () => api.get('/departments'),
    create: (data: any) => api.post('/departments', data),
    update: (id: string, data: any) => api.patch(`/departments/${id}`, data),
    delete: (id: string) => api.delete(`/departments/${id}`),
    syncPermissions: (id: string, permissions: string[]) =>
        api.post(`/departments/${id}/permissions`, { permissions }),
};

export const permissionsApi = {
    getAll: () => api.get('/permissions'),
};

export const rolesApi = {
    getAll: () => api.get('/roles'),
    getOne: (id: string) => api.get(`/roles/${id}`),
    create: (data: any) => api.post('/roles', data),
    update: (id: string, data: any) => api.patch(`/roles/${id}`, data),
    syncPermissions: (id: string, permissions: any[]) =>
        api.post(`/roles/${id}/permissions`, { permissions }),
};


