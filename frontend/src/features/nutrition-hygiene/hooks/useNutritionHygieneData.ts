import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { nutritionHygieneApi } from '../../../services/nutritionHygieneApi';

export const useNutritionHygieneData = (month: string, orgId: string | null, activeTab: string) => {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // New states for Single Entry
    const [records, setRecords] = useState<any[]>([]);
    const [autoReports, setAutoReports] = useState<any>(null);
    const [isLoadingJournal, setIsLoadingJournal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [monitoringData, setMonitoringData] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const data = await nutritionHygieneApi.getOrganizations();
                setOrganizations(data);
            } catch (err) {
                console.error('Failed to fetch organizations', err);
            }
        };
        fetchOrgs();
    }, []);

    const fetchMonitoring = useCallback(async () => {
        try {
            const data = await nutritionHygieneApi.getMonitoring(month);
            setMonitoringData(data);
        } catch (err) {
            console.error('Failed to fetch monitoring data', err);
        }
    }, [month]);

    const fetchJournalData = useCallback(async () => {
        if (!orgId) return;
        setIsLoadingJournal(true);
        try {
            const [recs, reports] = await Promise.all([
                nutritionHygieneApi.getRecords(month, orgId),
                nutritionHygieneApi.getAutoReports(month, orgId)
            ]);
            setRecords(recs);
            setAutoReports(reports);
            fetchMonitoring();
        } catch (err) {
            console.error('Failed to fetch journal data', err);
        } finally {
            setIsLoadingJournal(false);
        }
    }, [month, orgId, fetchMonitoring]);

    const fetchTableData = useCallback(async () => {
        if (!orgId) return;
        if (activeTab === 'journal') {
            return fetchJournalData();
        }
        setIsLoadingTable(true);
        try {
            const data = await nutritionHygieneApi.getTableData(parseInt(activeTab), month, orgId);
            setTableData(data);
            fetchMonitoring();
        } catch (err) {
            message.error('Ma\'lumotlarni yuklashda xatolik');
        } finally {
            setIsLoadingTable(false);
        }
    }, [activeTab, month, orgId, fetchJournalData, fetchMonitoring]);

    useEffect(() => {
        fetchTableData();
    }, [fetchTableData]);

    const createRecord = async (data: any) => {
        setIsCreating(true);
        try {
            await nutritionHygieneApi.createRecord(data);
            message.success('Yozuv muvaffaqiyatli saqlandi');
            fetchJournalData();
        } catch (err) {
            message.error('Xatolik yuz berdi');
        } finally {
            setIsCreating(false);
        }
    };

    const saveData = async (rows: any[]) => {
        if (!orgId || activeTab === 'journal') return;
        setIsSaving(true);
        try {
            await nutritionHygieneApi.saveTableData(parseInt(activeTab), month, orgId, rows);
            message.success('Ma\'lumotlar saqlandi');
            fetchTableData();
        } catch (err) {
            message.error('Saqlashda xatolik yuz berdi');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        organizations,
        tableData,
        isLoadingTable,
        monitoringData,
        isSaving,
        saveData,
        records,
        autoReports,
        isLoadingJournal,
        isCreating,
        createRecord,
        refresh: fetchTableData
    };
};

