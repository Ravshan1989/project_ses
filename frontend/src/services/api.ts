import axios from 'axios';
import { API_BASE_URL } from '../config';
export { API_BASE_URL };

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fileApi = axios.create({
    baseURL: API_BASE_URL,
});

const setupInterceptors = (instance: any) => {
    instance.interceptors.request.use((config: any) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    });

    instance.interceptors.response.use(
        (response: any) => response,
        (error: any) => {
            if (error.response?.status === 401) {
                localStorage.clear();
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

setupInterceptors(api);
setupInterceptors(fileApi);
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
    getDiarrheaByDate: (date: string, isTest = false) => api.get(`/daily-reports/diarrhea?date=${date}&isTest=${isTest}`),
    upsertDiarrhea: (data: any) => api.post('/daily-reports/diarrhea', data),
    getSanitaryByDate: (date: string, isTest = false) => api.get(`/daily-reports/sanitary?date=${date}&isTest=${isTest}`),
    upsertSanitary: (data: any) => api.post('/daily-reports/sanitary', data),
    cleanupTest: () => api.post('/daily-reports/cleanup-test'),
    // ... rest of the dailyReportsApi
    // UZ: Tasdiqlash va Tekshirish (Verification/Approval)
    verify: (type: string, id: string) => api.patch(`/daily-reports/${type}/${id}/verify`),
    approve: (type: string, id: string) => api.patch(`/daily-reports/${type}/${id}/approve`),
    reject: (type: string, id: string, comment?: string) => api.patch(`/daily-reports/${type}/${id}/reject`, { comment }),
    submit: (type: string, id: string) => api.patch(`/daily-reports/${type}/${id}/submit`),
    bulkUpsertBatch: (payload: any) => api.post('/daily-reports/bulk-batch', payload),
};

export const organizationsApi = {
    getAll: () => api.get('/organizations'),
};

export const exportsApi = {
    getFlu: (startDate: string, endDate: string, isTest = false, districtId?: string) => api.get(`/exports/flu?startDate=${startDate}&endDate=${endDate}&isTest=${isTest}&districtId=${districtId || ''}`),
    getHepatitis: (startDate: string, endDate: string, isTest = false, districtId?: string) => api.get(`/exports/hepatitis?startDate=${startDate}&endDate=${endDate}&isTest=${isTest}&districtId=${districtId || ''}`),
    getAri: (startDate: string, endDate: string, isTest = false, districtId?: string) => api.get(`/exports/ari?startDate=${startDate}&endDate=${endDate}&isTest=${isTest}&districtId=${districtId || ''}`),
    getCovid: (startDate: string, endDate: string, isTest = false, districtId?: string) => api.get(`/exports/covid?startDate=${startDate}&endDate=${endDate}&isTest=${isTest}&districtId=${districtId || ''}`),
    getEpidemiology: (startDate: string, endDate: string, isTest = false, districtId?: string) => api.get(`/exports/epidemiology?startDate=${startDate}&endDate=${endDate}&isTest=${isTest}&districtId=${districtId || ''}`),
    getForm1: (startDate: string, endDate: string, isTest = false, districtId?: string) => api.get(`/exports/form1?startDate=${startDate}&endDate=${endDate}&isTest=${isTest}&districtId=${districtId || ''}`),
    downloadForm1Excel: (startDate: string, endDate: string, isTest = false, districtId?: string) => api.get(`/exports/form1/excel?startDate=${startDate}&endDate=${endDate}&isTest=${isTest}&districtId=${districtId || ''}`, { responseType: 'blob' }),
};

export const importsApi = {
    importGlobal: (file: File, type: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        return fileApi.post('/imports/global', formData);
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
}; export const kommunalHygieneApi = {
    getWaterByMonth: (month: string, orgId?: string) => api.get(`/kommunal-hygiene/water?month=${month}${orgId ? `&orgId=${orgId}` : ''}`),
    saveWaterRow: (data: any) => api.post('/kommunal-hygiene/water', data),
    getOpenWaterByMonth: (month: string, orgId?: string) => api.get(`/kommunal-hygiene/open-water?month=${month}${orgId ? `&orgId=${orgId}` : ''}`),
    saveOpenWaterRows: (data: { rows: any[], month: string, organizationId: string }) => api.post('/kommunal-hygiene/open-water', data),
    getWaterUsageByMonth: (month: string, orgId?: string) => api.get(`/kommunal-hygiene/water-usage?month=${month}${orgId ? `&orgId=${orgId}` : ''}`),
    saveWaterUsageRows: (data: { rows: any[], month: string, organizationId: string }) => api.post('/kommunal-hygiene/water-usage', data),
    getRegionalStatus: (month: string) => api.get(`/kommunal-hygiene/regional-status?month=${month}`),
    exportRegionalExcel: (month: string, orgId?: string) => api.get(`/kommunal-hygiene/export-excel?month=${month}${orgId ? `&orgId=${orgId}` : ''}`, { responseType: 'blob' }),
    getAllTables: async (month: string, orgId: string) => {
        const [t1, t2, t3] = await Promise.all([
            kommunalHygieneApi.getWaterByMonth(month, orgId),
            kommunalHygieneApi.getOpenWaterByMonth(month, orgId),
            kommunalHygieneApi.getWaterUsageByMonth(month, orgId),
        ]);
        return {
            table1: t1.data,
            table2: t2.data,
            table3: t3.data,
        };
    }
};

export const childrenHygieneApi = {
    getTable1: (month: string, orgId?: string) => api.get(`/children-hygiene/table1?month=${month}${orgId ? `&orgId=${orgId}` : ''}`),
    saveTable1: (data: { rows: any[], month: string, organizationId: string }) => api.post('/children-hygiene/table1', data),
    getTable2: (month: string, orgId?: string) => api.get(`/children-hygiene/table2?month=${month}${orgId ? `&orgId=${orgId}` : ''}`),
    saveTable2: (data: { rows: any[], month: string, organizationId: string }) => api.post('/children-hygiene/table2', data),
    getTable3: (month: string, orgId?: string) => api.get(`/children-hygiene/table3?month=${month}${orgId ? `&orgId=${orgId}` : ''}`),
    saveTable3: (data: { rows: any[], month: string, organizationId: string }) => api.post('/children-hygiene/table3', data),
    getTable3_1: (month: string, orgId?: string) => api.get(`/children-hygiene/table3-1?month=${month}${orgId ? `&orgId=${orgId}` : ''}`),
    saveTable3_1: (data: { rows: any[], month: string, organizationId: string }) => api.post('/children-hygiene/table3-1', data),
    getTable3_2: (month: string, orgId?: string) => api.get(`/children-hygiene/table3-2?month=${month}${orgId ? `&orgId=${orgId}` : ''}`),
    saveTable3_2: (data: { rows: any[], month: string, organizationId: string }) => api.post('/children-hygiene/table3-2', data),
    getTable4: (month: string, orgId?: string) => api.get(`/children-hygiene/table4?month=${month}${orgId ? `&orgId=${orgId}` : ''}`),
    saveTable4: (data: { rows: any[], month: string, organizationId: string }) => api.post('/children-hygiene/table4', data),
    getRegionalStatus: (month: string) => api.get(`/children-hygiene/regional-status?month=${month}`),
    getAllTables: async (month: string, orgId: string) => {
        const [t1, t2, t3, t31, t32, t4] = await Promise.all([
            childrenHygieneApi.getTable1(month, orgId),
            childrenHygieneApi.getTable2(month, orgId),
            childrenHygieneApi.getTable3(month, orgId),
            childrenHygieneApi.getTable3_1(month, orgId),
            childrenHygieneApi.getTable3_2(month, orgId),
            childrenHygieneApi.getTable4(month, orgId),
        ]);
        return {
            table1: t1.data,
            table2: t2.data,
            table3: t3.data,
            table3_1: t31.data,
            table3_2: t32.data,
            table4: t4.data,
        };
    }
};
