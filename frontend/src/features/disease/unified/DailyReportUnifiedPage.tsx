import React, { useState, useEffect } from 'react';
import { Card, Typography, DatePicker, Button, Space, Tabs, notification } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../../services/api';

import HepatitisTab from './HepatitisTab';
import FluAriTab from './FluAriTab';
import CovidTab from './CovidTab';
import EpiTab from './EpiTab';

const { Title, Text } = Typography;

const DailyReportUnifiedPage: React.FC = () => {
    const [date, setDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);

    // State for each tab
    const [hepatitisData, setHepatitisData] = useState<any[]>([]);
    const [fluAriData, setFluAriData] = useState<any[]>([]);
    const [covidData, setCovidData] = useState<any[]>([]);
    const [epiData, setEpiData] = useState<any[]>([]);

    const userRole = localStorage.getItem('user_role') || 'REGION_HEAD';
    const isAdmin = userRole === 'REGION_HEAD';
    const userOrgName = localStorage.getItem('user_org_name') || "";

    useEffect(() => {
        fetchAllData();
    }, [date]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');

            // Fetch Orgs if needed
            let currentOrgs = organizations;
            if (currentOrgs.length === 0) {
                const orgRes = await organizationsApi.getAll();
                // Viloyatni (parent darajasi) hisobotdan olib tashlaymiz
                currentOrgs = (orgRes.data || []).filter((org: any) => !!org.parent);
                setOrganizations(currentOrgs);
            }

            // Fetch all 4 reports in parallel
            const [hepRes, fluRes, covidRes, epiRes] = await Promise.all([
                dailyReportsApi.getByDate(formattedDate),
                dailyReportsApi.getFluByDate(formattedDate),
                dailyReportsApi.getCovidByDate(formattedDate),
                dailyReportsApi.getEpidemiologyByDate(formattedDate)
            ]);

            // Helper to map orgs to data
            const mapper = (apiData: any[], orgs: any[], defaultFields: any) => {
                let tableData = orgs.map((org, idx) => {
                    const existing = apiData.find((r: any) => r.organization?.id === org.id);
                    return {
                        key: String(idx + 1),
                        district_name: org.name,
                        organizationId: org.id,
                        is_submitted: !!existing,
                        ...defaultFields,
                        ...(existing || {})
                    };
                });
                if (!isAdmin) {
                    tableData = tableData.filter(d => d.district_name === userOrgName);
                }
                return tableData;
            };

            setHepatitisData(mapper(hepRes.data || [], currentOrgs, { total_cases: 0, age_under_1: 0, age_1_3: 0, age_4_6: 0, age_7_14: 0, age_15_19: 0, age_20_plus: 0 }));
            setFluAriData(mapper(fluRes.data || [], currentOrgs, { ari_total: 0, flu_total: 0, pneu_total: 0, sari_total: 0, death_total: 0 }));
            setCovidData(mapper(covidRes.data || [], currentOrgs, { total_cases: 0, hospitalized_count: 0 }));
            setEpiData(mapper(epiRes.data || [], currentOrgs, { objects_inspected: 0, violations_found: 0 }));

        } catch (error) {
            notification.error({ message: 'Xatolik', description: 'Ma\'lumotlarni yuklashda xatolik' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            const promises: Promise<any>[] = [];

            // Hepatitis
            hepatitisData.forEach(row => {
                promises.push(dailyReportsApi.upsert({ ...row, reportDate: formattedDate, organizationId: row.organizationId }));
            });
            // Flu/ARI
            fluAriData.forEach(row => {
                promises.push(dailyReportsApi.upsertFlu({ ...row, reportDate: formattedDate, organizationId: row.organizationId }));
            });
            // Covid
            covidData.forEach(row => {
                promises.push(dailyReportsApi.upsertCovid({ ...row, reportDate: formattedDate, organizationId: row.organizationId }));
            });
            // Epi
            epiData.forEach(row => {
                promises.push(dailyReportsApi.upsertEpidemiology({ ...row, reportDate: formattedDate, organizationId: row.organizationId }));
            });

            await Promise.all(promises);
            notification.success({ message: 'Saqlandi', description: 'Barcha bo\'limlar muvaffaqiyatli saqlandi.' });
            fetchAllData();
        } catch (error) {
            notification.error({ message: 'Xatolik', description: 'Saqlashda xatolik yuz berdi.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCellChange = (setter: any, data: any[], value: number | null, rowKey: string, field: string) => {
        const newData = [...data];
        const index = newData.findIndex(item => item.key === rowKey);
        if (index > -1) {
            const updatedRow = { ...newData[index], [field]: value || 0 };

            // Auto-calc logic for Hepatitis
            if (setter === setHepatitisData) {
                const ageFields = ['age_under_1', 'age_1_3', 'age_4_6', 'age_7_14', 'age_15_19', 'age_20_plus'];
                if (ageFields.includes(field)) {
                    updatedRow.total_cases = ageFields.reduce((sum, f) => sum + (updatedRow[f] || 0), 0);
                }
            }

            // Auto-calc logic for Flu/ARI
            if (setter === setFluAriData) {
                if (field.startsWith('ari_') && field !== 'ari_total') {
                    updatedRow.ari_total = (updatedRow.ari_0_1 || 0) + (updatedRow.ari_1_2 || 0) + (updatedRow.ari_3_6 || 0) + (updatedRow.ari_7_14 || 0) + (updatedRow.ari_adult || 0);
                }
                if (field.startsWith('pneu_') && field !== 'pneu_total') {
                    updatedRow.pneu_total = (updatedRow.pneu_0_2 || 0) + (updatedRow.pneu_3_6 || 0) + (updatedRow.pneu_7_14 || 0) + (updatedRow.pneu_adult || 0);
                }
                if (field.startsWith('flu_') && field !== 'flu_total') {
                    updatedRow.flu_total = (updatedRow.flu_0_1 || 0) + (updatedRow.flu_1_2 || 0) + (updatedRow.flu_3_6 || 0) + (updatedRow.flu_7_14 || 0) + (updatedRow.flu_adult || 0);
                }
                if (field.startsWith('sari_') && field !== 'sari_total') {
                    updatedRow.sari_total = (updatedRow.sari_0_2 || 0) + (updatedRow.sari_3_6 || 0) + (updatedRow.sari_7_14 || 0) + (updatedRow.sari_adult || 0);
                }
            }

            newData[index] = updatedRow;
            setter(newData);
        }
    };

    const items = [
        {
            key: 'hepatitis',
            label: 'Gepatit A',
            children: <HepatitisTab data={hepatitisData} loading={loading} onChange={(v, k, f) => handleCellChange(setHepatitisData, hepatitisData, v, k, f)} />,
        },
        {
            key: 'flu',
            label: 'Gripp va O\'RVI',
            children: <FluAriTab data={fluAriData} loading={loading} onChange={(v, k, f) => handleCellChange(setFluAriData, fluAriData, v, k, f)} />,
        },
        {
            key: 'covid',
            label: 'Koronavirus',
            children: <CovidTab data={covidData} loading={loading} onChange={(v, k, f) => handleCellChange(setCovidData, covidData, v, k, f)} />,
        },
        {
            key: 'epi',
            label: 'Epidemiologiya',
            children: <EpiTab data={epiData} loading={loading} onChange={(v, k, f) => handleCellChange(setEpiData, epiData, v, k, f)} />,
        },
    ];

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>Yagona Kunlik Kirish Oynasi (Test)</Title>
                        <Text type="secondary">{date.format('DD.MM.YYYY')} kungi barcha operatsiyalar</Text>
                    </div>
                    <Space size="middle">
                        <DatePicker value={date} onChange={(d) => d && setDate(d)} format="DD.MM.YYYY" />
                        <Button icon={<ReloadOutlined />} onClick={fetchAllData}>Yangilash</Button>
                        <Button type="primary" size="large" icon={<SaveOutlined />} onClick={handleSave}>Hammasini Saqlash</Button>
                    </Space>
                </div>

                <Tabs defaultActiveKey="hepatitis" items={items} type="card" />
            </Space>
        </Card>
    );
};

export default DailyReportUnifiedPage;
