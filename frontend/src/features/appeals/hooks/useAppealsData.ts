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
            if (!orgId || activeTab === 'journal') return [];
            const res = await appealsApi.getTableData(parseInt(activeTab), month, orgId);
            return res || [];
        },
        enabled: !!orgId && !!month && activeTab !== 'journal',
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });

    // Save Mutation
    const saveMutation = useMutation({
        mutationFn: async ({ tab, data }: { tab: string, data: any[] }) => {
            if (!orgId || tab === 'journal') return;
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

        // --- NEW SINGLE ENTRY SYSTEM ---
        recordsQuery: useQuery({
            queryKey: ['appeals-records', month, orgId],
            queryFn: () => appealsApi.getRecords(orgId!, month),
            enabled: !!orgId && orgId !== 'undefined' && orgId !== 'null' && !!month,
        }),

        autoReportsQuery: useQuery({
            queryKey: ['appeals-auto-reports', month, orgId],
            queryFn: () => appealsApi.getAutoReports(orgId!, month),
            enabled: !!orgId && orgId !== 'undefined' && orgId !== 'null' && !!month,
        }),

        monitoringQuery: useQuery({
            queryKey: ['appeals-monitoring', month, orgId],
            queryFn: () => appealsApi.getMonitoring(orgId!, month),
            enabled: !!orgId && !!month && activeTab === 'monitoring',
        }),

        createRecordMutation: useMutation({
            mutationFn: (data: any) => appealsApi.createRecord(data),
            onSuccess: () => {
                notification.success({ message: t('common.success_save') });
                queryClient.invalidateQueries({ queryKey: ['appeals-records'] });
                queryClient.invalidateQueries({ queryKey: ['appeals-auto-reports'] });
            },
            onError: () => {
                notification.error({ message: t('common.error_save') });
            }
        }),

        refresh: () => {

            queryClient.invalidateQueries({ queryKey: ['appeals-table'] });
        }
    };
};
