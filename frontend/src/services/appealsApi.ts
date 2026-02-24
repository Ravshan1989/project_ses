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
};
