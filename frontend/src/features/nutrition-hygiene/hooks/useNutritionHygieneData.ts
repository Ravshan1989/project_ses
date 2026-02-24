import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { nutritionHygieneApi } from '../../../services/nutritionHygieneApi';

export const useNutritionHygieneData = (month: string, orgId: string | null, activeTab: string) => {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [isLoadingTable, setIsLoadingTable] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

    const fetchTableData = useCallback(async () => {
        if (!orgId) return;
        setIsLoadingTable(true);
        try {
            const data = await nutritionHygieneApi.getTableData(parseInt(activeTab), month, orgId);
            setTableData(data);
        } catch (err) {
            message.error('Ma\'lumotlarni yuklashda xatolik');
        } finally {
            setIsLoadingTable(false);
        }
    }, [activeTab, month, orgId]);

    useEffect(() => {
        fetchTableData();
    }, [fetchTableData]);

    const saveData = async (rows: any[]) => {
        if (!orgId) return;
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
        isSaving,
        saveData,
        refresh: fetchTableData
    };
};
