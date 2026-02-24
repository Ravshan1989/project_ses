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

    getOrganizations: async () => {
        const response = await api.get('/organizations');
        return response.data;
    },
};
