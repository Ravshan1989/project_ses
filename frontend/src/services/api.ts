import axios from 'axios';

export const api = axios.create({
    baseURL: '/api/v1',
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
    getStatusSummary: (templateCode: string, period: string) =>
        api.get(`/submissions/status-summary?templateCode=${templateCode}&period=${period}`),
};

export const diseasesApi = {
    getAll: () => api.get('/diseases'),
    create: (data: { code: string; name: string; reportFrequency?: string[]; isActive?: boolean }) => api.post('/diseases', data),
    update: (id: string, data: any) => api.patch(`/diseases/${id}`, data),
    delete: (id: string) => api.delete(`/diseases/${id}`),
};

export const dailyReportsApi = {
    getByDate: (date: string) => api.get(`/daily-reports?date=${date}`),
    upsert: (data: any) => api.post('/daily-reports', data),
    getFluByDate: (date: string) => api.get(`/daily-reports/flu?date=${date}`),
    upsertFlu: (data: any) => api.post('/daily-reports/flu', data),
    getAriByDate: (date: string) => api.get(`/daily-reports/ari?date=${date}`),
    upsertAri: (data: any) => api.post('/daily-reports/ari', data),
    getEpidemiologyByDate: (date: string) => api.get(`/daily-reports/epidemiology?date=${date}`),
    upsertEpidemiology: (data: any) => api.post('/daily-reports/epidemiology', data),
    getWeeklySummary: (startDate: string, endDate: string) =>
        api.get(`/daily-reports/weekly-summary?startDate=${startDate}&endDate=${endDate}`),
    getCovidByDate: (date: string) => api.get(`/daily-reports/covid?date=${date}`),
    upsertCovid: (data: any) => api.post('/daily-reports/covid', data),
};

export const organizationsApi = {
    getAll: () => api.get('/organizations'),
};

export const exportsApi = {
    getFlu: (startDate: string, endDate: string) => api.get(`/exports/flu?startDate=${startDate}&endDate=${endDate}`),
    getHepatitis: (startDate: string, endDate: string) => api.get(`/exports/hepatitis?startDate=${startDate}&endDate=${endDate}`),
    getForm1: (startDate: string, endDate: string) => api.get(`/exports/form1?startDate=${startDate}&endDate=${endDate}`),
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
