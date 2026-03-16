import { api } from "./api";

export interface AppealsRow {
    row_key: string;
    [key: string]: any;
}

export const appealsApi = {
    getTableData: async (tableNum: number, month: string, organizationId: string) => {
        const response = await api.get(`/appeals/table`, {
            params: { tableNum, month, organizationId },
        });
        return response.data;
    },

    saveTableData: async (tableNum: number, month: string, organizationId: string, rows: AppealsRow[]) => {
        const response = await api.post(`/appeals/table`, {
            tableNum,
            month,
            organizationId,
            rows,
        });
        return response.data;
    },

    // --- NEW SINGLE ENTRY SYSTEM ---
    getRecords: async (organizationId: string, month: string) => {
        const response = await api.get(`/appeals/records`, {
            params: { organizationId, month },
        });
        return response.data;
    },

    createRecord: async (data: any) => {
        const response = await api.post(`/appeals/records`, data);
        return response.data;
    },

    getAutoReports: async (organizationId: string, month: string) => {
        const response = await api.get(`/appeals/auto-reports`, {
            params: { organizationId, month },
        });
        return response.data;
    },

    getMonitoring: async (organizationId: string, month: string) => {
        const response = await api.get(`/appeals/monitoring`, {
            params: { organizationId, month },
        });
        return response.data;
    },

    closeRecord: async (id: string, data: { status: any; closureDate: string; consequence?: any }) => {
        const response = await api.post(`/appeals/records/${id}/close`, data);
        return response.data;
    },

    extendRecord: async (id: string, data: { newDeadline: string; reason: string }) => {
        const response = await api.post(`/appeals/records/${id}/extend`, data);
        return response.data;
    },
};

