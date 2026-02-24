import { api } from "./api";

export interface InspectionRecord {
    id: string;
    organization_id: string;
    period_month: string;
    object_name: string;
    transfer_date: string | null;
    reason: string | null;
    measures_taken: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreateInspectionRecordPayload {
    organization_id: string;
    period_month: string;
    object_name: string;
    transfer_date?: string;
    reason?: string;
    measures_taken?: string;
}

export interface UpdateInspectionRecordPayload {
    object_name?: string;
    transfer_date?: string;
    reason?: string;
    measures_taken?: string;
}

export interface InspectionTable2Row {
    row_key: string;
    prev_total: number;
    prev_notified: number;
    prev_agreed: number;
    curr_total: number;
    curr_notified: number;
    curr_notified_24h: number;
}

export interface InspectionTable3Row {
    row_key: string;
    inspections_count: number;
    defects_count: number;
    measure_suspend: number;
    measure_admin: number;
    measure_license: number;
    measure_tavdinaoma: number;
    measure_warning: number;
    measure_conclusion: number;
    measure_tmb: number;
    others: number;
    fine_count: number;
    fine_amount: number;
    court_economic: number;
    court_civil: number;
    court_admin: number;
}

export const inspectionsApi = {
    // ─── Table 1: Prosecutor records (CRUD) ───────────────────────────────
    getRecords: async (month: string, organizationId: string): Promise<InspectionRecord[]> => {
        const response = await api.get("/inspections/records", {
            params: { month, organizationId },
        });
        return response.data;
    },

    createRecord: async (payload: CreateInspectionRecordPayload): Promise<InspectionRecord> => {
        const response = await api.post("/inspections/records", payload);
        return response.data;
    },

    updateRecord: async (id: string, payload: UpdateInspectionRecordPayload): Promise<InspectionRecord> => {
        const response = await api.patch(`/inspections/records/${id}`, payload);
        return response.data;
    },

    deleteRecord: async (id: string): Promise<{ success: boolean }> => {
        const response = await api.delete(`/inspections/records/${id}`);
        return response.data;
    },

    // ─── Table 2: Business inspections by district ────────────────────────
    getTable2Data: async (month: string, organizationId: string): Promise<InspectionTable2Row[]> => {
        const response = await api.get("/inspections/table2", {
            params: { month, organizationId },
        });
        return response.data;
    },

    saveTable2Data: async (
        month: string,
        organizationId: string,
        rows: InspectionTable2Row[],
    ): Promise<{ success: boolean }> => {
        const response = await api.post("/inspections/table2", { month, organizationId, rows });
        return response.data;
    },

    // ─── Table 3: Measures against business entities ──────────────────────
    getTable3Data: async (month: string, organizationId: string): Promise<InspectionTable3Row[]> => {
        const response = await api.get("/inspections/table3", {
            params: { month, organizationId },
        });
        return response.data;
    },

    saveTable3Data: async (
        month: string,
        organizationId: string,
        rows: InspectionTable3Row[],
    ): Promise<{ success: boolean }> => {
        const response = await api.post("/inspections/table3", { month, organizationId, rows });
        return response.data;
    },
};
