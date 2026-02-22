import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { childrenHygieneApi, organizationsApi } from '../../../services/api';
import { notification } from 'antd';
import { useTranslation } from 'react-i18next';

export const useHygieneData = (month: string, orgId: string | null, activeTab: string) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    // Organizations
    const organizationsQuery = useQuery({
        queryKey: ['organizations'],
        queryFn: () => organizationsApi.getAll().then(res => res.data),
        staleTime: 5 * 60 * 1000, // 5 min
    });

    // Regional Status
    const regionalStatusQuery = useQuery({
        queryKey: ['hygiene-regional-status', month],
        queryFn: () => childrenHygieneApi.getRegionalStatus(month).then(res => res.data),
        enabled: !!month,
    });

    // Table Data
    const tableDataQuery = useQuery({
        queryKey: ['hygiene-table', activeTab, month, orgId],
        queryFn: async () => {
            if (!orgId) return [];
            let res;
            if (activeTab === '1') res = await childrenHygieneApi.getTable1(month, orgId);
            else if (activeTab === '2') res = await childrenHygieneApi.getTable2(month, orgId);
            else if (activeTab === '3') res = await childrenHygieneApi.getTable3(month, orgId);
            else if (activeTab === '4') res = await childrenHygieneApi.getTable3_1(month, orgId);
            else if (activeTab === '5') res = await childrenHygieneApi.getTable3_2(month, orgId);
            else res = await childrenHygieneApi.getTable4(month, orgId);
            return res.data || [];
        },
        enabled: !!orgId && !!month,
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: false,
    });

    // Save Mutation
    const saveMutation = useMutation({
        mutationFn: async ({ tab, data }: { tab: string, data: any[] }) => {
            if (!orgId) return;
            const payload = { month, organizationId: orgId, rows: data };
            if (tab === '1') return childrenHygieneApi.saveTable1(payload);
            if (tab === '2') return childrenHygieneApi.saveTable2(payload);
            if (tab === '3') return childrenHygieneApi.saveTable3(payload);
            if (tab === '4') return childrenHygieneApi.saveTable3_1(payload);
            if (tab === '5') return childrenHygieneApi.saveTable3_2(payload);
            return childrenHygieneApi.saveTable4(payload);
        },
        onSuccess: () => {
            notification.success({ message: t('common.success_save') });
            queryClient.invalidateQueries({ queryKey: ['hygiene-table', activeTab, month, orgId] });
            queryClient.invalidateQueries({ queryKey: ['hygiene-regional-status', month] });
        },
        onError: () => {
            notification.error({ message: t('common.error_save') });
        }
    });

    return {
        organizations: organizationsQuery.data || [],
        isLoadingOrgs: organizationsQuery.isLoading,
        regionalStatus: regionalStatusQuery.data || { districts: [], summary: {} },
        isLoadingStatus: regionalStatusQuery.isLoading,
        tableData: tableDataQuery.data || [],
        isLoadingTable: tableDataQuery.isLoading,
        isSaving: saveMutation.isPending,
        saveData: (data: any[]) => saveMutation.mutate({ tab: activeTab, data }),
        refresh: () => {
            queryClient.invalidateQueries({ queryKey: ['hygiene-table'] });
            queryClient.invalidateQueries({ queryKey: ['hygiene-regional-status'] });
        }
    };
};
