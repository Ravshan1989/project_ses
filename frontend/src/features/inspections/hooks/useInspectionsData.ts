import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    inspectionsApi,
    CreateInspectionRecordPayload,
    UpdateInspectionRecordPayload,
    InspectionTable2Row,
    InspectionTable3Row,
} from '../../../services/inspectionsApi';
import { organizationsApi } from '../../../services/api';
import { notification } from 'antd';
import { useTranslation } from 'react-i18next';

export const useInspectionsData = (month: string, orgId: string | null, activeTab: string) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const organizationsQuery = useQuery({
        queryKey: ['organizations'],
        queryFn: () => organizationsApi.getAll().then(res => res.data),
        staleTime: 5 * 60 * 1000,
    });

    // Умумий ─────────────────────────────────────────────────────────────
    const recordsQuery = useQuery({
        queryKey: ['inspection-records', month, orgId],
        queryFn: async () => { if (!orgId) return []; return inspectionsApi.getRecords(month, orgId); },
        enabled: !!orgId && !!month && activeTab === '1',
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateInspectionRecordPayload) => inspectionsApi.createRecord(payload),
        onSuccess: () => {
            notification.success({ message: t('common.success_save') });
            queryClient.invalidateQueries({ queryKey: ['inspection-records', month, orgId] });
        },
        onError: () => notification.error({ message: t('common.error_save') }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateInspectionRecordPayload }) =>
            inspectionsApi.updateRecord(id, payload),
        onSuccess: () => {
            notification.success({ message: t('common.success_save') });
            queryClient.invalidateQueries({ queryKey: ['inspection-records', month, orgId] });
        },
        onError: () => notification.error({ message: t('common.error_save') }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => inspectionsApi.deleteRecord(id),
        onSuccess: () => {
            notification.success({ message: t('common.deleted') || "O'chirildi" });
            queryClient.invalidateQueries({ queryKey: ['inspection-records', month, orgId] });
        },
        onError: () => notification.error({ message: t('common.error_save') }),
    });

    // ─── 2-жадвал ───────────────────────────────────────────────────────────
    const table2Query = useQuery({
        queryKey: ['inspection-table2', month, orgId],
        queryFn: async () => { if (!orgId) return []; return inspectionsApi.getTable2Data(month, orgId); },
        enabled: !!orgId && !!month && activeTab === '2',
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });

    const saveTable2Mutation = useMutation({
        mutationFn: (rows: InspectionTable2Row[]) => {
            if (!orgId) throw new Error('No org');
            return inspectionsApi.saveTable2Data(month, orgId, rows);
        },
        onSuccess: () => {
            notification.success({ message: t('common.success_save') });
            queryClient.invalidateQueries({ queryKey: ['inspection-table2', month, orgId] });
        },
        onError: () => notification.error({ message: t('common.error_save') }),
    });

    // ─── 3-жадвал ───────────────────────────────────────────────────────────
    const table3Query = useQuery({
        queryKey: ['inspection-table3', month, orgId],
        queryFn: async () => { if (!orgId) return []; return inspectionsApi.getTable3Data(month, orgId); },
        enabled: !!orgId && !!month && activeTab === '3',
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });

    const saveTable3Mutation = useMutation({
        mutationFn: (rows: InspectionTable3Row[]) => {
            if (!orgId) throw new Error('No org');
            return inspectionsApi.saveTable3Data(month, orgId, rows);
        },
        onSuccess: () => {
            notification.success({ message: t('common.success_save') });
            queryClient.invalidateQueries({ queryKey: ['inspection-table3', month, orgId] });
        },
        onError: () => notification.error({ message: t('common.error_save') }),
    });

    // ─── 4-жадвал ───────────────────────────────────────────────────────────
    const table4Query = useQuery({
        queryKey: ['inspection-table4', month, orgId],
        queryFn: async () => { if (!orgId) return []; return inspectionsApi.getTable4Data(month, orgId); },
        enabled: !!orgId && !!month && activeTab === '4',
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });

    const saveTable4Mutation = useMutation({
        mutationFn: (rows: InspectionTable3Row[]) => {
            if (!orgId) throw new Error('No org');
            return inspectionsApi.saveTable4Data(month, orgId, rows);
        },
        onSuccess: () => {
            notification.success({ message: t('common.success_save') });
            queryClient.invalidateQueries({ queryKey: ['inspection-table4', month, orgId] });
        },
        onError: () => notification.error({ message: t('common.error_save') }),
    });

    return {
        organizations: organizationsQuery.data || [],
        // Table 1
        records: recordsQuery.data || [],
        isLoadingRecords: recordsQuery.isLoading,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        createRecord: (payload: CreateInspectionRecordPayload) => createMutation.mutate(payload),
        updateRecord: (id: string, payload: UpdateInspectionRecordPayload) => updateMutation.mutate({ id, payload }),
        deleteRecord: (id: string) => deleteMutation.mutate(id),
        // Table 2
        table2Data: table2Query.data || [],
        isLoadingTable2: table2Query.isLoading,
        isSavingTable2: saveTable2Mutation.isPending,
        saveTable2: (rows: InspectionTable2Row[]) => saveTable2Mutation.mutate(rows),
        // Table 3
        table3Data: table3Query.data || [],
        isLoadingTable3: table3Query.isLoading,
        isSavingTable3: saveTable3Mutation.isPending,
        saveTable3: (rows: InspectionTable3Row[]) => saveTable3Mutation.mutate(rows),
        // Table 4
        table4Data: table4Query.data || [],
        isLoadingTable4: table4Query.isLoading,
        isSavingTable4: saveTable4Mutation.isPending,
        saveTable4: (rows: InspectionTable3Row[]) => saveTable4Mutation.mutate(rows),
        // Common
        refresh: () => {
            queryClient.invalidateQueries({ queryKey: ['inspection-records'] });
            queryClient.invalidateQueries({ queryKey: ['inspection-table2'] });
            queryClient.invalidateQueries({ queryKey: ['inspection-table3'] });
            queryClient.invalidateQueries({ queryKey: ['inspection-table4'] });
        },
    };
};
