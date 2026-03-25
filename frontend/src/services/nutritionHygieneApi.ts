import { api } from './api';

const BASE_URL = '/nutrition-hygiene';

export const nutritionHygieneApi = {
    getTableData: async (tableNum: number, month: string, organizationId: string) => {
        const response = await api.get(`${BASE_URL}/table`, {
            params: { tableNum, month, organizationId }
        });
        return response.data;
    },

    saveTableData: async (tableNum: number, month: string, organizationId: string, rows: any[]) => {
        const response = await api.post(`${BASE_URL}/table`, rows, {
            params: { tableNum, month, organizationId }
        });
        return response.data;
    },

    getRecords: async (month: string, organizationId: string) => {
        const response = await api.get(`${BASE_URL}/records`, {
            params: { month, organizationId }
        });
        return response.data;
    },

    createRecord: async (data: any) => {
        const response = await api.post(`${BASE_URL}/records`, data);
        return response.data;
    },

    getAutoReports: async (month: string, organizationId: string) => {
        const response = await api.get(`${BASE_URL}/auto-reports`, {
            params: { month, organizationId }
        });
        return response.data;
    },

    getOrganizations: async () => {
        const response = await api.get('/organizations');
        return response.data;
    },

    getMonitoring: async (month: string) => {
        const response = await api.get(`${BASE_URL}/monitoring`, {
            params: { month }
        });
        return response.data;
    },
};
