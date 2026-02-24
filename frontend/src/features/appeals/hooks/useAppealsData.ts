import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appealsApi } from '../../../services/appealsApi';
import { organizationsApi } from '../../../services/api';
import { notification } from 'antd';
import { useTranslation } from 'react-i18next';

export const useAppealsData = (month: string, orgId: string | null, activeTab: string) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    // Organizations
    const organizationsQuery = useQuery({
        queryKey: ['organizations'],
        queryFn: () => organizationsApi.getAll().then(res => res.data),
        staleTime: 5 * 60 * 1000,
    });

    // Table Data
    const tableDataQuery = useQuery({
        queryKey: ['appeals-table', activeTab, month, orgId],
        queryFn: async () => {
            if (!orgId) return [];
            const res = await appealsApi.getTableData(parseInt(activeTab), month, orgId);
            return res || [];
        },
        enabled: !!orgId && !!month,
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });

    // Save Mutation
    const saveMutation = useMutation({
        mutationFn: async ({ tab, data }: { tab: string, data: any[] }) => {
            if (!orgId) return;
            return appealsApi.saveTableData(parseInt(tab), month, orgId, data);
        },
        onSuccess: () => {
            notification.success({ message: t('common.success_save') });
            queryClient.invalidateQueries({ queryKey: ['appeals-table', activeTab, month, orgId] });
        },
        onError: () => {
            notification.error({ message: t('common.error_save') });
        }
    });

    return {
        organizations: organizationsQuery.data || [],
        isLoadingOrgs: organizationsQuery.isLoading,
        tableData: tableDataQuery.data || [],
        isLoadingTable: tableDataQuery.isLoading,
        isSaving: saveMutation.isPending,
        saveData: (data: any[]) => saveMutation.mutate({ tab: activeTab, data }),
        refresh: () => {
            queryClient.invalidateQueries({ queryKey: ['appeals-table'] });
        }
    };
};
