import React, { useState, useEffect } from 'react';
import { Typography, DatePicker, Button, Space, Tabs, notification } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { dailyReportsApi, organizationsApi } from '../../../services/api';

import HepatitisTab from './HepatitisTab';
import FluAriTab from './FluAriTab';
import CovidTab from './CovidTab';
import EpiTab from './EpiTab';

const { Title, Text } = Typography;

const DailyReportUnifiedPage: React.FC = () => {
    const { t } = useTranslation();
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
            const isTest = false;

            const payload = {
                reportDate: formattedDate,
                isTest,
                hepatitis: hepatitisData,
                flu: fluAriData,
                covid: covidData,
                epi: epiData,
            };

            await dailyReportsApi.bulkUpsertBatch(payload);

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

    // --- PREMIUM UI UPDATE ---
    // UZ: Kunlik hisobotlar uchun "Wow" dizayn: Glassmorphism + Vibrant Tabs

    const glassStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 12px 40px rgba(31, 38, 135, 0.1)',
        padding: '32px'
    };

    const gradientHeader: React.CSSProperties = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
        borderRadius: '20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#fff',
        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
    };

    return (
        <div style={{ padding: '20px', minHeight: '100vh', background: '#f0f2f5' }}>
            <style>{`
                .premium-tabs .ant-tabs-nav {
                    background: rgba(255, 255, 255, 0.6) !important;
                    border-radius: 16px;
                    padding: 8px;
                    margin-bottom: 24px !important;
                    border: 1px solid rgba(255, 255, 255, 0.4);
                }
                .premium-tabs .ant-tabs-tab {
                    border-radius: 12px !important;
                    transition: all 0.3s ease !important;
                    margin: 0 5px !important;
                    border: none !important;
                    padding: 10px 20px !important;
                }
                .premium-tabs .ant-tabs-tab-active {
                    background: #fff !important;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important;
                }
                .premium-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: #764ba2 !important;
                    font-weight: 800 !important;
                }
                .action-btn {
                    height: 48px;
                    border-radius: 14px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 24px;
                    transition: all 0.3s ease;
                }
                .period-picker { 
                    border-radius: 14px !important; 
                    height: 48px !important; 
                    background: rgba(255,255,255,0.15) !important;
                    border: 1px solid rgba(255,255,255,0.2) !important;
                    width: 180px !important;
                }
                .period-picker .ant-picker-input > input { color: #fff !important; font-weight: 700 !important; }
                .period-picker .ant-picker-suffix { color: rgba(255,255,255,0.8) !important; }

                /* Global Table Refinement for child tabs */
                .premium-table .ant-table {
                    background: transparent !important;
                    border-radius: 20px !important;
                }
                .premium-table .ant-table-thead > tr > th {
                    background: rgba(255, 255, 255, 0.5) !important;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 11px;
                    letter-spacing: 0.5px;
                    color: #4c51bf !important;
                }
                .premium-table .ant-table-tbody > tr > td {
                    padding: 12px 8px !important;
                }
                .premium-table .ant-table-row:hover > td {
                    background: rgba(118, 75, 162, 0.04) !important;
                }
            `}</style>

            <div style={gradientHeader}>
                <div>
                    <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
                        {t('reports.unified_title') || 'Yagona Kunlik Hisobotlar'}
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
                        {date.format('DD MMMM YYYY')} kungi barcha bo'limlar bo'yicha ma'lumotlar
                    </Text>
                </div>
                <Space size="middle">
                    <DatePicker
                        value={date}
                        onChange={(d) => d && setDate(d)}
                        format="DD.MM.YYYY"
                        size="large"
                        style={{ borderRadius: '10px', width: '160px' }}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchAllData}
                        className="action-btn"
                        style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: '#fff' }}
                    >
                        Yangilash
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        className="action-btn"
                        style={{ background: '#fff', color: '#764ba2' }}
                    >
                        Barchasini Saqlash
                    </Button>
                </Space>
            </div>

            <div style={glassStyle}>
                <Tabs
                    defaultActiveKey="hepatitis"
                    items={items}
                    className="premium-tabs"
                    type="card"
                />
            </div>
        </div>
    );

    /* --- ESKI DIZAYN (O'zgarmas Qoidalar asosida saqlab qolindi) ---
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
    */
};

export default DailyReportUnifiedPage;


// /* 
// ORIGINAL CODE (Append-only rule):
// import React, { useState, useEffect } from 'react';
// import { Typography, DatePicker, Button, Space, Tabs, notification } from 'antd';
// import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
// import dayjs from 'dayjs';
// import { useTranslation } from 'react-i18next';
// import { dailyReportsApi, organizationsApi } from '../../../services/api';
// 
// import HepatitisTab from './HepatitisTab';
// import FluAriTab from './FluAriTab';
// import CovidTab from './CovidTab';
// import EpiTab from './EpiTab';
// 
// const { Title, Text } = Typography;
// 
// const DailyReportUnifiedPage: React.FC = () => {
//     const { t } = useTranslation();
//     const [date, setDate] = useState(dayjs());
//     const [loading, setLoading] = useState(false);
//     const [organizations, setOrganizations] = useState<any[]>([]);
// 
//     // State for each tab
//     const [hepatitisData, setHepatitisData] = useState<any[]>([]);
//     const [fluAriData, setFluAriData] = useState<any[]>([]);
//     const [covidData, setCovidData] = useState<any[]>([]);
//     const [epiData, setEpiData] = useState<any[]>([]);
// 
//     const userRole = localStorage.getItem('user_role') || 'REGION_HEAD';
//     const isAdmin = userRole === 'REGION_HEAD';
//     const userOrgName = localStorage.getItem('user_org_name') || "";
// 
//     useEffect(() => {
//         fetchAllData();
//     }, [date]);
// 
//     const fetchAllData = async () => {
//         setLoading(true);
//         try {
//             const formattedDate = date.format('YYYY-MM-DD');
// 
//             // Fetch Orgs if needed
//             let currentOrgs = organizations;
//             if (currentOrgs.length === 0) {
//                 const orgRes = await organizationsApi.getAll();
//                 // Viloyatni (parent darajasi) hisobotdan olib tashlaymiz
//                 currentOrgs = (orgRes.data || []).filter((org: any) => !!org.parent);
//                 setOrganizations(currentOrgs);
//             }
// 
//             // Fetch all 4 reports in parallel
//             const [hepRes, fluRes, covidRes, epiRes] = await Promise.all([
//                 dailyReportsApi.getByDate(formattedDate),
//                 dailyReportsApi.getFluByDate(formattedDate),
//                 dailyReportsApi.getCovidByDate(formattedDate),
//                 dailyReportsApi.getEpidemiologyByDate(formattedDate)
//             ]);
// 
//             // Helper to map orgs to data
//             const mapper = (apiData: any[], orgs: any[], defaultFields: any) => {
//                 let tableData = orgs.map((org, idx) => {
//                     const existing = apiData.find((r: any) => r.organization?.id === org.id);
//                     return {
//                         key: String(idx + 1),
//                         district_name: org.name,
//                         organizationId: org.id,
//                         is_submitted: !!existing,
//                         ...defaultFields,
//                         ...(existing || {})
//                     };
//                 });
//                 if (!isAdmin) {
//                     tableData = tableData.filter(d => d.district_name === userOrgName);
//                 }
//                 return tableData;
//             };
// 
//             setHepatitisData(mapper(hepRes.data || [], currentOrgs, { total_cases: 0, age_under_1: 0, age_1_3: 0, age_4_6: 0, age_7_14: 0, age_15_19: 0, age_20_plus: 0 }));
//             setFluAriData(mapper(fluRes.data || [], currentOrgs, { ari_total: 0, flu_total: 0, pneu_total: 0, sari_total: 0, death_total: 0 }));
//             setCovidData(mapper(covidRes.data || [], currentOrgs, { total_cases: 0, hospitalized_count: 0 }));
//             setEpiData(mapper(epiRes.data || [], currentOrgs, { objects_inspected: 0, violations_found: 0 }));
// 
//         } catch (error) {
//             notification.error({ message: 'Xatolik', description: 'Ma\'lumotlarni yuklashda xatolik' });
//         } finally {
//             setLoading(false);
//         }
//     };
// 
//     const handleSave = async () => {
//         setLoading(true);
//         try {
//             const formattedDate = date.format('YYYY-MM-DD');
//             const promises: Promise<any>[] = [];
// 
//             // Hepatitis
//             hepatitisData.forEach(row => {
//                 promises.push(dailyReportsApi.upsert({ ...row, reportDate: formattedDate, organizationId: row.organizationId }));
//             });
//             // Flu/ARI
//             fluAriData.forEach(row => {
//                 promises.push(dailyReportsApi.upsertFlu({ ...row, reportDate: formattedDate, organizationId: row.organizationId }));
//             });
//             // Covid
//             covidData.forEach(row => {
//                 promises.push(dailyReportsApi.upsertCovid({ ...row, reportDate: formattedDate, organizationId: row.organizationId }));
//             });
//             // Epi
//             epiData.forEach(row => {
//                 promises.push(dailyReportsApi.upsertEpidemiology({ ...row, reportDate: formattedDate, organizationId: row.organizationId }));
//             });
// 
//             await Promise.all(promises);
//             notification.success({ message: 'Saqlandi', description: 'Barcha bo\'limlar muvaffaqiyatli saqlandi.' });
//             fetchAllData();
//         } catch (error) {
//             notification.error({ message: 'Xatolik', description: 'Saqlashda xatolik yuz berdi.' });
//         } finally {
//             setLoading(false);
//         }
//     };
// 
//     const handleCellChange = (setter: any, data: any[], value: number | null, rowKey: string, field: string) => {
//         const newData = [...data];
//         const index = newData.findIndex(item => item.key === rowKey);
//         if (index > -1) {
//             const updatedRow = { ...newData[index], [field]: value || 0 };
// 
//             // Auto-calc logic for Hepatitis
//             if (setter === setHepatitisData) {
//                 const ageFields = ['age_under_1', 'age_1_3', 'age_4_6', 'age_7_14', 'age_15_19', 'age_20_plus'];
//                 if (ageFields.includes(field)) {
//                     updatedRow.total_cases = ageFields.reduce((sum, f) => sum + (updatedRow[f] || 0), 0);
//                 }
//             }
// 
//             // Auto-calc logic for Flu/ARI
//             if (setter === setFluAriData) {
//                 if (field.startsWith('ari_') && field !== 'ari_total') {
//                     updatedRow.ari_total = (updatedRow.ari_0_1 || 0) + (updatedRow.ari_1_2 || 0) + (updatedRow.ari_3_6 || 0) + (updatedRow.ari_7_14 || 0) + (updatedRow.ari_adult || 0);
//                 }
//                 if (field.startsWith('pneu_') && field !== 'pneu_total') {
//                     updatedRow.pneu_total = (updatedRow.pneu_0_2 || 0) + (updatedRow.pneu_3_6 || 0) + (updatedRow.pneu_7_14 || 0) + (updatedRow.pneu_adult || 0);
//                 }
//                 if (field.startsWith('flu_') && field !== 'flu_total') {
//                     updatedRow.flu_total = (updatedRow.flu_0_1 || 0) + (updatedRow.flu_1_2 || 0) + (updatedRow.flu_3_6 || 0) + (updatedRow.flu_7_14 || 0) + (updatedRow.flu_adult || 0);
//                 }
//                 if (field.startsWith('sari_') && field !== 'sari_total') {
//                     updatedRow.sari_total = (updatedRow.sari_0_2 || 0) + (updatedRow.sari_3_6 || 0) + (updatedRow.sari_7_14 || 0) + (updatedRow.sari_adult || 0);
//                 }
//             }
// 
//             newData[index] = updatedRow;
//             setter(newData);
//         }
//     };
// 
//     const items = [
//         {
//             key: 'hepatitis',
//             label: 'Gepatit A',
//             children: <HepatitisTab data={hepatitisData} loading={loading} onChange={(v, k, f) => handleCellChange(setHepatitisData, hepatitisData, v, k, f)} />,
//         },
//         {
//             key: 'flu',
//             label: 'Gripp va O\'RVI',
//             children: <FluAriTab data={fluAriData} loading={loading} onChange={(v, k, f) => handleCellChange(setFluAriData, fluAriData, v, k, f)} />,
//         },
//         {
//             key: 'covid',
//             label: 'Koronavirus',
//             children: <CovidTab data={covidData} loading={loading} onChange={(v, k, f) => handleCellChange(setCovidData, covidData, v, k, f)} />,
//         },
//         {
//             key: 'epi',
//             label: 'Epidemiologiya',
//             children: <EpiTab data={epiData} loading={loading} onChange={(v, k, f) => handleCellChange(setEpiData, epiData, v, k, f)} />,
//         },
//     ];
// 
//     // --- PREMIUM UI UPDATE ---
//     // UZ: Kunlik hisobotlar uchun "Wow" dizayn: Glassmorphism + Vibrant Tabs
// 
//     const glassStyle: React.CSSProperties = {
//         background: 'rgba(255, 255, 255, 0.7)',
//         backdropFilter: 'blur(15px)',
//         WebkitBackdropFilter: 'blur(15px)',
//         borderRadius: '24px',
//         border: '1px solid rgba(255, 255, 255, 0.4)',
//         boxShadow: '0 12px 40px rgba(31, 38, 135, 0.1)',
//         padding: '32px'
//     };
// 
//     const gradientHeader: React.CSSProperties = {
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         padding: '24px',
//         borderRadius: '20px',
//         marginBottom: '24px',
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         color: '#fff',
//         boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
//     };
// 
//     return (
//         <div style={{ padding: '20px', minHeight: '100vh', background: '#f0f2f5' }}>
//             <style>{`
//                 .premium-tabs .ant-tabs-nav {
//                     background: rgba(255, 255, 255, 0.5);
//                     border-radius: 12px;
//                     padding: 8px;
//                     margin-bottom: 24px !important;
//                 }
//                 .premium-tabs .ant-tabs-tab {
//                     border-radius: 8px !important;
//                     transition: all 0.3s ease !important;
//                     margin: 0 4px !important;
//                     border: none !important;
//                     background: transparent !important;
//                 }
//                 .premium-tabs .ant-tabs-tab-active {
//                     background: #fff !important;
//                     box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
//                 }
//                 .premium-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
//                     color: #1677ff !important;
//                     font-weight: 700 !important;
//                 }
//                 .action-btn {
//                     height: 45px;
//                     border-radius: 10px;
//                     font-weight: 600;
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                 }
//             `}</style>
// 
//             <div style={gradientHeader}>
//                 <div>
//                     <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
//                         {t('reports.unified_title') || 'Yagona Kunlik Hisobotlar'}
//                     </Title>
//                     <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
//                         {date.format('DD MMMM YYYY')} kungi barcha bo'limlar bo'yicha ma'lumotlar
//                     </Text>
//                 </div>
//                 <Space size="middle">
//                     <DatePicker
//                         value={date}
//                         onChange={(d) => d && setDate(d)}
//                         format="DD.MM.YYYY"
//                         size="large"
//                         style={{ borderRadius: '10px', width: '160px' }}
//                     />
//                     <Button
//                         icon={<ReloadOutlined />}
//                         onClick={fetchAllData}
//                         className="action-btn"
//                         style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: '#fff' }}
//                     >
//                         Yangilash
//                     </Button>
//                     <Button
//                         type="primary"
//                         icon={<SaveOutlined />}
//                         onClick={handleSave}
//                         className="action-btn"
//                         style={{ background: '#fff', color: '#764ba2' }}
//                     >
//                         Barchasini Saqlash
//                     </Button>
//                 </Space>
//             </div>
// 
//             <div style={glassStyle}>
//                 <Tabs
//                     defaultActiveKey="hepatitis"
//                     items={items}
//                     className="premium-tabs"
//                     type="card"
//                 />
//             </div>
//         </div>
//     );
// 
//     /* --- ESKI DIZAYN (O'zgarmas Qoidalar asosida saqlab qolindi) ---
//     return (
//         <Card>
//             <Space direction="vertical" size="large" style={{ width: '100%' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div>
//                         <Title level={4} style={{ margin: 0 }}>Yagona Kunlik Kirish Oynasi (Test)</Title>
//                         <Text type="secondary">{date.format('DD.MM.YYYY')} kungi barcha operatsiyalar</Text>
//                     </div>
//                     <Space size="middle">
//                         <DatePicker value={date} onChange={(d) => d && setDate(d)} format="DD.MM.YYYY" />
//                         <Button icon={<ReloadOutlined />} onClick={fetchAllData}>Yangilash</Button>
//                         <Button type="primary" size="large" icon={<SaveOutlined />} onClick={handleSave}>Hammasini Saqlash</Button>
//                     </Space>
//                 </div>
// 
//                 <Tabs defaultActiveKey="hepatitis" items={items} type="card" />
//             </Space>
//         </Card>
//     );
//     */
// };
// 
// export default DailyReportUnifiedPage;
// 
//  
// */

