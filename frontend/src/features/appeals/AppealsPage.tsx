import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DatePicker, Select, Space, Spin, Card, Tabs } from 'antd';
import { SaveOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import GlassLayout from '../../components/layout/GlassLayout';
import PermissionGate from '../../components/PermissionGate';
import EditCell from '../../components/common/EditCell';
import { useAppealsData } from './hooks/useAppealsData';
import { API_BASE_URL } from '../../config';
import { APPEALS_T1_ROWS, APPEALS_SUBJECT_ROWS } from './components/AppealsConstants';
import MasterAppealsJournal from './components/MasterAppealsJournal';
import AppealsMonitoring from './components/AppealsMonitoring';
import AppealsDashboard from './components/AppealsDashboard';


interface Organization {
    id: string;
    name: string;
}

const thStyle: React.CSSProperties = {
    background: '#f1f5f9',
    padding: '12px 0px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
    textAlign: 'center'
};

const tdStyle: React.CSSProperties = {
    padding: '8px',
    border: '1px solid #e2e8f0',
    textAlign: 'center'
};

const AppealsPage: React.FC = () => {
    const { t } = useTranslation();
    const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('journal');

    const userRole = localStorage.getItem('user_role');
    const isRegion = userRole === 'REGION_HEAD' || userRole === 'LEAD_SPECIALIST';

    const isAdmin = localStorage.getItem('user_role') === 'ADMIN' || localStorage.getItem('user_role') === 'EXECUTIVE';
    const userOrgId = localStorage.getItem('user_org_id');
    const effectiveOrgId = isAdmin ? selectedOrgId : userOrgId;

    const currYear = dayjs(month).year();
    const prevYear = currYear - 1;
    const currYearShort = currYear.toString().slice(-2);
    const prevYearShort = prevYear.toString().slice(-2);

    const {
        organizations,
        tableData,
        isLoadingTable,
        isSaving,
        saveData,
        refresh,
        recordsQuery,
        autoReportsQuery,
        monitoringQuery,
        createRecordMutation
    } = useAppealsData(month, effectiveOrgId, activeTab);
    
    // Determine if regional or district
    const currentOrg = organizations.find((o: any) => o.id === effectiveOrgId);
    // In our system, Level 2 (Region) has a parent (Republic/Root) or we can check its properties.
    // Based on seeding, Toshkent viloyati is top-level (parent is null)
    const isRegionalOrg = currentOrg ? !currentOrg.parent_id && !currentOrg.parent : false;

    const [localData, setLocalData] = useState<any[]>([]);

    useEffect(() => {
        setLocalData(tableData);
    }, [tableData]);

    const updateCell = (rowKey: string, field: string, val: number) => {
        setLocalData(prev => {
            const idx = prev.findIndex(r => r.row_key === rowKey);
            if (idx === -1) {
                return [...prev, { row_key: rowKey, [field]: val }];
            }
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: val };
            return copy;
        });
    };

    const getVal = (rowKey: string, field: string): number => {
        // UZ: Agar avtomatik hisobot ma'lumotlari bo'lsa, ularni qaytaradi (faqat joriy yil/davr uchun)
        if (activeTab !== 'journal' && autoReportsQuery.data) {
            const data = autoReportsQuery.data;
            if (activeTab === '1') return data.table1?.[rowKey]?.[field] || 0;
            if (activeTab === '2') return data.table2?.[rowKey]?.[field] || 0;
            if (activeTab === '3') return data.table3?.[field] || 0;
            if (activeTab === '4') return data.table4?.[rowKey]?.[field] || 0;
            if (activeTab === '5') return data.table5?.[field] || 0;
            if (activeTab === '6') return data.table6?.[field] || 0;
            if (activeTab === '7') return data.table7?.[field] || 0;
        }
        return localData.find(r => r.row_key === rowKey)?.[field] || 0;
    };

    const handleExportExcel = () => {
        if (!effectiveOrgId) return;
        window.open(`${API_BASE_URL}/appeals/export-excel?organizationId=${effectiveOrgId}&month=${month}`, '_blank');
    };

    const handleExportPdf = () => {
        if (!effectiveOrgId) return;
        window.open(`${API_BASE_URL}/appeals/export-pdf?organizationId=${effectiveOrgId}&month=${month}`, '_blank'); // Will implement shortly
    };

    const saveDataAction = () => saveData(localData);

    const renderTable1 = () => {
        const t1 = autoReportsQuery.data?.table1 || { head: {}, deputy_epid: {}, deputy_san: {} };
        
        const headerColors = {
            bg: '#f8fafc',
            head: '#f1f5f9',
            metrics: '#ffffff'
        };

        const thStyleWithColor = (color: string) => ({ ...thStyle, backgroundColor: color, fontSize: '11px', padding: '8px 4px' });

        const rows = [
            { key: 'head', label: 'Қўмита раиси' },
            { key: 'deputy_epid', label: 'Раиснинг биринчи ўринбосари (Эпидемиология)' },
            { key: 'deputy_san', label: 'Раис ўринбосари (Санитария)' }
        ];

        return (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px', fontWeight: 'bold' }}>
                    {currYear} йилнинг {dayjs(month).format('MMMM')} ойида келиб тушган мурожаатларнинг <span style={{ color: '#1890ff' }}>раҳбарият кесимидаги</span> таҳлили
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #000' }}>
                        <thead>
                            <tr>
                                <th style={thStyleWithColor(headerColors.head)} rowSpan={3}>№</th>
                                <th style={{ ...thStyleWithColor(headerColors.head), textAlign: 'left', minWidth: 250 }} rowSpan={3}>Раҳбарият</th>
                                <th style={thStyleWithColor(headerColors.metrics)} colSpan={2} rowSpan={2}>Жами келиб тушган</th>
                                <th style={thStyleWithColor(headerColors.metrics)} colSpan={6}>Шундан</th>
                            </tr>
                            <tr>
                                <th style={thStyleWithColor(headerColors.metrics)} colSpan={2}>Оғзаки</th>
                                <th style={thStyleWithColor(headerColors.metrics)} colSpan={2}>Ёзма</th>
                                <th style={thStyleWithColor(headerColors.metrics)} colSpan={2}>Электрон</th>
                            </tr>
                            <tr>
                                <th style={thStyleWithColor(headerColors.metrics)}>{prevYear}</th><th style={thStyleWithColor(headerColors.metrics)}>{currYear}</th>
                                <th style={thStyleWithColor(headerColors.metrics)}>{prevYear}</th><th style={thStyleWithColor(headerColors.metrics)}>{currYear}</th>
                                <th style={thStyleWithColor(headerColors.metrics)}>{prevYear}</th><th style={thStyleWithColor(headerColors.metrics)}>{currYear}</th>
                                <th style={thStyleWithColor(headerColors.metrics)}>{prevYear}</th><th style={thStyleWithColor(headerColors.metrics)}>{currYear}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, idx) => (
                                <tr key={r.key}>
                                    <td style={tdStyle}>{idx + 1}</td>
                                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>{r.label}</td>
                                    <td style={tdStyle}>{t1[r.key]?.total_prev || 0}</td>
                                    <td style={{ ...tdStyle, fontWeight: 'bold', color: '#1890ff' }}>{t1[r.key]?.total_curr || 0}</td>
                                    <td style={tdStyle}>{t1[r.key]?.oral_prev || 0}</td><td style={tdStyle}>{t1[r.key]?.oral_curr || 0}</td>
                                    <td style={tdStyle}>{t1[r.key]?.written_prev || 0}</td><td style={tdStyle}>{t1[r.key]?.written_curr || 0}</td>
                                    <td style={tdStyle}>{t1[r.key]?.electronic_prev || 0}</td><td style={tdStyle}>{t1[r.key]?.electronic_curr || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderTable2 = () => {
        const t2 = autoReportsQuery.data?.table2 || { subjects: {} };
        // We'll calculate a Total row by summing all subjects
        const subjectKeys = APPEALS_SUBJECT_ROWS.map(s => s.key);
        
        const headerColors = {
            c1_2: '#f1f5f9',
            c3_4: '#ffffff',
            c5_8: '#fff7ed',
            c9: '#f0fdf4',
            c10: '#f5f3ff',
            c11_15: '#fffaf0',
            c16_19: '#f0f9ff',
            c20_21: '#fff7ed',
            c22_23: '#f1f5f9'
        };

        const thStyleWithColor = (color: string) => ({ ...thStyle, backgroundColor: color, fontSize: '11px', padding: '8px 4px' });

        const getSubjectVal = (key: string, field: string) => t2.subjects?.[key]?.[field] || 0;

        const totalRow = subjectKeys.reduce((acc, key) => {
            const data = t2.subjects?.[key] || {};
            Object.keys(data).forEach(field => {
                if (typeof data[field] === 'number') {
                    acc[field] = (acc[field] || 0) + data[field];
                }
            });
            return acc;
        }, {} as any);

        return (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6', fontWeight: 'bold', maxWidth: '1000px', margin: '0 auto 20px' }}>
                    {currYear} йилнинг {dayjs(month).format('MMMM')} ойида Ўзбекистон Республикаси СЭОваЖС қўмитасига жисмоний ва юридик шахслардан келиб тушган мурожаатларнинг <span style={{ color: '#1890ff' }}>масалалар (соҳалар) кесимидаги</span> таҳлили тўғрисида маълумот
                </h3>
                <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1800, border: '1px solid #000' }}>
                    <thead>
                        <tr>
                            <th style={thStyleWithColor(headerColors.c1_2)} rowSpan={4}>№</th>
                            <th style={{ ...thStyleWithColor(headerColors.c1_2), textAlign: 'left', minWidth: 300 }} rowSpan={4}>Murojaatlarda ko'tarilgan masalalar</th>
                            <th style={thStyleWithColor(headerColors.c3_4)} colSpan={2}>Жами мурожаатлар сони</th>
                            <th style={thStyleWithColor(headerColors.c5_8)} colSpan={4}>Мурожаат этувчилар тоифаси</th>
                            <th style={thStyleWithColor('#f8fafc')} colSpan={11}>Шу жумлаdan {currYear} йилги мурожаатлар бўйича</th>
                            <th style={thStyleWithColor(headerColors.c20_21)} colSpan={2} rowSpan={2}>Вазирлар Маҳкамасидан келган</th>
                            <th style={thStyleWithColor(headerColors.c22_23)} colSpan={2} rowSpan={2}>Ўтказилган сайёр қабуллар сони</th>
                        </tr>
                        <tr>
                            <th style={thStyleWithColor(headerColors.c3_4)} rowSpan={3}>{prevYear}</th>
                            <th style={thStyleWithColor(headerColors.c3_4)} rowSpan={3}>{currYear}</th>
                            <th style={thStyleWithColor(headerColors.c5_8)} colSpan={2}>Жисмоний шахслар</th>
                            <th style={thStyleWithColor(headerColors.c5_8)} colSpan={2}>Юридик шахслар</th>
                            <th style={thStyleWithColor(headerColors.c9)} rowSpan={3}>Ёзма мурожаатлар</th>
                            <th style={thStyleWithColor(headerColors.c10)} rowSpan={3}>Электрон мурожаатлар</th>
                            <th style={thStyleWithColor(headerColors.c11_15)} colSpan={5}>Оғзаки мурожаатлар</th>
                            <th style={thStyleWithColor(headerColors.c16_19)} rowSpan={3}>Вазирлик аппаратида кўрилган</th>
                            <th style={thStyleWithColor(headerColors.c16_19)} rowSpan={3}>Ҳудудий идорага юборилган</th>
                            <th style={thStyleWithColor(headerColors.c16_19)} rowSpan={3}>Тегишли идора ва ҳокимиятларга юборилgan</th>
                            <th style={thStyleWithColor(headerColors.c16_19)} rowSpan={3}>Кўриб чиқилмоқда</th>
                        </tr>
                        <tr>
                            <th style={thStyleWithColor(headerColors.c5_8)} rowSpan={2}>{prevYear}</th><th style={thStyleWithColor(headerColors.c5_8)} rowSpan={2}>{currYear}</th>
                            <th style={thStyleWithColor(headerColors.c5_8)} rowSpan={2}>{prevYear}</th><th style={thStyleWithColor(headerColors.c5_8)} rowSpan={2}>{currYear}</th>
                            <th style={thStyleWithColor(headerColors.c11_15)} colSpan={4}>Раҳбарларнинг</th>
                            <th style={thStyleWithColor(headerColors.c11_15)} rowSpan={2}>ишонч телефони</th>
                            <th style={thStyleWithColor(headerColors.c20_21)} rowSpan={2}>{prevYear}</th><th style={thStyleWithColor(headerColors.c20_21)} rowSpan={2}>{currYear}</th>
                            <th style={thStyleWithColor(headerColors.c22_23)} rowSpan={2}>{prevYear}</th><th style={thStyleWithColor(headerColors.c22_23)} rowSpan={2}>{currYear}</th>
                        </tr>
                        <tr>
                            <th style={thStyleWithColor(headerColors.c11_15)}>Жами</th>
                            <th style={thStyleWithColor(headerColors.c11_15)}>шахсий қабули</th>
                            <th style={thStyleWithColor(headerColors.c11_15)}>сайёр қабули</th>
                            <th style={thStyleWithColor(headerColors.c11_15)}>масъул ходимларнинг қабули</th>
                        </tr>
                        <tr style={{ background: '#f8fafc' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(n => (
                                <th key={n} style={{ ...thStyle, fontSize: '11px', padding: '4px', border: '1px solid #000' }}>{n}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {APPEALS_SUBJECT_ROWS.map((s, idx) => (
                                <tr key={s.key}>
                                    <td style={tdStyle}>{idx + 1}</td>
                                    <td style={{ ...tdStyle, textAlign: 'left' }}>{t(s.labelKey)}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'count_prev')}</td><td style={tdStyle}>{getSubjectVal(s.key, 'count_curr')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'phys_prev')}</td><td style={tdStyle}>{getSubjectVal(s.key, 'phys_curr')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'legal_prev')}</td><td style={tdStyle}>{getSubjectVal(s.key, 'legal_curr')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'written')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'electronic')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'oral_total')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'oral_personal')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'oral_field')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'oral_staff')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'oral_phone')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'apparat_seen')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'referral_regional')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'referral_related')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'being_considered')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'vm_prev')}</td><td style={tdStyle}>{getSubjectVal(s.key, 'vm_curr')}</td>
                                    <td style={tdStyle}>{getSubjectVal(s.key, 'field_meetings_prev')}</td><td style={tdStyle}>{getSubjectVal(s.key, 'field_meetings_curr')}</td>
                                </tr>
                        ))}
                        <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                            <td style={tdStyle} colSpan={2}>Жами</td>
                            <td style={tdStyle}>{totalRow.count_prev || 0}</td><td style={tdStyle}>{totalRow.count_curr || 0}</td>
                            <td style={tdStyle}>{totalRow.phys_prev || 0}</td><td style={tdStyle}>{totalRow.phys_curr || 0}</td>
                            <td style={tdStyle}>{totalRow.legal_prev || 0}</td><td style={tdStyle}>{totalRow.legal_curr || 0}</td>
                            <td style={tdStyle}>{totalRow.written || 0}</td>
                            <td style={tdStyle}>{totalRow.electronic || 0}</td>
                            <td style={tdStyle}>{totalRow.oral_total || 0}</td>
                            <td style={tdStyle}>{totalRow.oral_personal || 0}</td>
                            <td style={tdStyle}>{totalRow.oral_field || 0}</td>
                            <td style={tdStyle}>{totalRow.oral_staff || 0}</td>
                            <td style={tdStyle}>{totalRow.oral_phone || 0}</td>
                            <td style={tdStyle}>{totalRow.apparat_seen || 0}</td>
                            <td style={tdStyle}>{totalRow.referral_regional || 0}</td>
                            <td style={tdStyle}>{totalRow.referral_related || 0}</td>
                            <td style={tdStyle}>{totalRow.being_considered || 0}</td>
                            <td style={tdStyle}>{totalRow.vm_prev || 0}</td><td style={tdStyle}>{totalRow.vm_curr || 0}</td>
                            <td style={tdStyle}>{totalRow.field_meetings_prev || 0}</td><td style={tdStyle}>{totalRow.field_meetings_curr || 0}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
            </div>
        );
    };
    const renderTable3 = () => {
        const t3 = autoReportsQuery.data?.table3 || { regional: {} };
        const regionalIds = Object.keys(t3.regional || {});
        // Identification of Total row: By key, by name, or simply the first element retrieved (usually the parent org)
        const totalId = regionalIds.find(id => id === 'total' || t3.regional[id].name === 'Жами' || regionalIds.indexOf(id) === 0);
        const regularRegions = regionalIds.filter(id => id !== totalId);

        const headerColors = {
            c1_2: '#f1f5f9',
            c3_4: '#ffffff',
            c5_8: '#fff7ed',
            c9: '#f0fdf4',
            c10: '#f5f3ff',
            c11_15: '#fffaf0',
            c16_19: '#f0f9ff',
            c20_21: '#fff7ed',
            c22_23: '#f1f5f9'
        };

        const thStyleWithColor = (color: string) => ({ ...thStyle, backgroundColor: color, fontSize: '11px', padding: '8px 4px' });

        return (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6', fontWeight: 'bold', maxWidth: '1000px', margin: '0 auto 20px' }}>
                    {currYear} йилнинг {dayjs(month).format('MMMM')} ойида Ўзбекистон Республикаси СЭОваЖС қўмитасига жисмоний ва юридик шахслардан келиб тушган мурожаатларнинг вилоятлар бўйича таққослама таҳлили тўғрисида маълумот
                </h3>
                <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1800, border: '1px solid #000' }}>
                    <thead>
                        <tr>
                            <th style={thStyleWithColor(headerColors.c1_2)} rowSpan={4}>№</th>
                            <th style={{ ...thStyleWithColor(headerColors.c1_2), textAlign: 'left', minWidth: 200 }} rowSpan={4}>Ҳудудлар</th>
                            <th style={thStyleWithColor(headerColors.c3_4)} colSpan={2}>Жами мурожаатлар сони</th>
                            <th style={thStyleWithColor(headerColors.c5_8)} colSpan={4}>Мурожаат этувчилар тоифаси</th>
                            <th style={thStyleWithColor('#f8fafc')} colSpan={11}>Шу жумладан {currYear} йилги мурожаатлар бўйича</th>
                            <th style={thStyleWithColor(headerColors.c20_21)} colSpan={2} rowSpan={2}>Вазирлар Маҳкамасидан келган</th>
                            <th style={thStyleWithColor(headerColors.c22_23)} colSpan={2} rowSpan={2}>Ўтказилган сайёр қабуллар сони</th>
                        </tr>
                        <tr>
                            <th style={thStyleWithColor(headerColors.c3_4)} rowSpan={3}>{prevYear}</th>
                            <th style={thStyleWithColor(headerColors.c3_4)} rowSpan={3}>{currYear}</th>
                            <th style={thStyleWithColor(headerColors.c5_8)} colSpan={2}>Жисмоний шахслар</th>
                            <th style={thStyleWithColor(headerColors.c5_8)} colSpan={2}>Юридик шахслар</th>
                            <th style={thStyleWithColor(headerColors.c9)} rowSpan={3}>Ёзма мурожаатлар</th>
                            <th style={thStyleWithColor(headerColors.c10)} rowSpan={3}>Электрон мурожаатлар</th>
                            <th style={thStyleWithColor(headerColors.c11_15)} colSpan={5}>Оғзаки мурожаатлар</th>
                            <th style={thStyleWithColor(headerColors.c16_19)} rowSpan={3}>Вазирлик аппаратида кўрилган</th>
                            <th style={thStyleWithColor(headerColors.c16_19)} rowSpan={3}>Ҳудудий идорага юборилган</th>
                            <th style={thStyleWithColor(headerColors.c16_19)} rowSpan={3}>Тегишли идора ва ҳокимиятларга юборилgan</th>
                            <th style={thStyleWithColor(headerColors.c16_19)} rowSpan={3}>Кўриб чиқилмоқда</th>
                        </tr>
                        <tr>
                            <th style={thStyleWithColor(headerColors.c5_8)} rowSpan={2}>{prevYear}</th><th style={thStyleWithColor(headerColors.c5_8)} rowSpan={2}>{currYear}</th>
                            <th style={thStyleWithColor(headerColors.c5_8)} rowSpan={2}>{prevYear}</th><th style={thStyleWithColor(headerColors.c5_8)} rowSpan={2}>{currYear}</th>
                            <th style={thStyleWithColor(headerColors.c11_15)} colSpan={4}>Раҳбарларнинг</th>
                            <th style={thStyleWithColor(headerColors.c11_15)} rowSpan={2}>ишонч телефони</th>
                            <th style={thStyleWithColor(headerColors.c20_21)} rowSpan={2}>{prevYear}</th><th style={thStyleWithColor(headerColors.c20_21)} rowSpan={2}>{currYear}</th>
                            <th style={thStyleWithColor(headerColors.c22_23)} rowSpan={2}>{prevYear}</th><th style={thStyleWithColor(headerColors.c22_23)} rowSpan={2}>{currYear}</th>
                        </tr>
                        <tr>
                            <th style={thStyleWithColor(headerColors.c11_15)}>Жами</th>
                            <th style={thStyleWithColor(headerColors.c11_15)}>шахсий қабули</th>
                            <th style={thStyleWithColor(headerColors.c11_15)}>сайёр қабули</th>
                            <th style={thStyleWithColor(headerColors.c11_15)}>масъул ходимларнинг қабули</th>
                        </tr>
                        <tr style={{ background: '#f8fafc' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(n => (
                                <th key={n} style={{ ...thStyle, fontSize: '11px', padding: '4px', border: '1px solid #000' }}>{n}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {regionalIds.length === 0 ? (
                            <tr><td colSpan={23} style={{ ...tdStyle, padding: '40px', color: '#94a3b8' }}>Yuklanmoqda...</td></tr>
                        ) : (
                            <>
                                {regularRegions.map((id, idx) => {
                                    const reg = t3.regional[id];
                                    return (
                                        <tr key={id}>
                                            <td style={tdStyle}>{idx + 1}</td>
                                            <td style={{ ...tdStyle, textAlign: 'left' }}>{reg.name}</td>
                                            <td style={tdStyle}>{reg.count_prev || 0}</td><td style={tdStyle}>{reg.count_curr || 0}</td>
                                            <td style={tdStyle}>{reg.phys_prev || 0}</td><td style={tdStyle}>{reg.phys_curr || 0}</td>
                                            <td style={tdStyle}>{reg.legal_prev || 0}</td><td style={tdStyle}>{reg.legal_curr || 0}</td>
                                            <td style={tdStyle}>{reg.written || 0}</td>
                                            <td style={tdStyle}>{reg.electronic || 0}</td>
                                            <td style={tdStyle}>{reg.oral_total || 0}</td>
                                            <td style={tdStyle}>{reg.oral_personal || 0}</td>
                                            <td style={tdStyle}>{reg.oral_field || 0}</td>
                                            <td style={tdStyle}>{reg.oral_staff || 0}</td>
                                            <td style={tdStyle}>{reg.oral_phone || 0}</td>
                                            <td style={tdStyle}>{reg.apparat_seen || 0}</td>
                                            <td style={tdStyle}>{reg.referral_regional || 0}</td>
                                            <td style={tdStyle}>{reg.referral_related || 0}</td>
                                            <td style={tdStyle}>{reg.being_considered || 0}</td>
                                            <td style={tdStyle}>{reg.vm_prev || 0}</td><td style={tdStyle}>{reg.vm_curr || 0}</td>
                                            <td style={tdStyle}>{reg.field_meetings_prev || 0}</td><td style={tdStyle}>{reg.field_meetings_curr || 0}</td>
                                        </tr>
                                    );
                                })}
                                {totalId && (() => {
                                    const reg = t3.regional[totalId];
                                    return (
                                        <tr key="total-row" style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                                            <td style={tdStyle} colSpan={2}>Жами</td>
                                            <td style={tdStyle}>{reg.count_prev || 0}</td><td style={tdStyle}>{reg.count_curr || 0}</td>
                                            <td style={tdStyle}>{reg.phys_prev || 0}</td><td style={tdStyle}>{reg.phys_curr || 0}</td>
                                            <td style={tdStyle}>{reg.legal_prev || 0}</td><td style={tdStyle}>{reg.legal_curr || 0}</td>
                                            <td style={tdStyle}>{reg.written || 0}</td>
                                            <td style={tdStyle}>{reg.electronic || 0}</td>
                                            <td style={tdStyle}>{reg.oral_total || 0}</td>
                                            <td style={tdStyle}>{reg.oral_personal || 0}</td>
                                            <td style={tdStyle}>{reg.oral_field || 0}</td>
                                            <td style={tdStyle}>{reg.oral_staff || 0}</td>
                                            <td style={tdStyle}>{reg.oral_phone || 0}</td>
                                            <td style={tdStyle}>{reg.apparat_seen || 0}</td>
                                            <td style={tdStyle}>{reg.referral_regional || 0}</td>
                                            <td style={tdStyle}>{reg.referral_related || 0}</td>
                                            <td style={tdStyle}>{reg.being_considered || 0}</td>
                                            <td style={tdStyle}>{reg.vm_prev || 0}</td><td style={tdStyle}>{reg.vm_curr || 0}</td>
                                            <td style={tdStyle}>{reg.field_meetings_prev || 0}</td><td style={tdStyle}>{reg.field_meetings_curr || 0}</td>
                                        </tr>
                                    );
                                })()}
                            </>
                        )}
                    </tbody>
                </table>
                </div>
            </div>
        );
    };

    const renderTable4 = () => {
        const t4 = autoReportsQuery.data?.table4 || { subjects: {}, regional: {} };
        const regionalIds = Object.keys(t4.regional || {});
        // Find the main organization (Total) and the others (Districts)
        const totalId = regionalIds.find(id => t4.regional[id].name === 'Жами' || id === 'total' || regionalIds.indexOf(id) === 0);
        const districtIds = regionalIds.filter(id => id !== totalId);
        
        const headerColors = {
            num_name: '#f1f5f9',
            total: '#ffffff',
            dist: '#f0f9ff'
        };

        const thStyleWithColor = (color: string) => ({ ...thStyle, backgroundColor: color, fontSize: '11px', padding: '8px 4px' });

        return (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px', fontWeight: 'bold' }}>
                    {currYear} йилнинг {dayjs(month).format('MMMM')} ойида келиб тушган мурожаатларнинг <span style={{ color: '#1890ff' }}>соҳалар ва туманлар</span> кесимидаги таҳлили
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1500, border: '1px solid #000' }}>
                        <thead>
                            <tr>
                                <th style={thStyleWithColor(headerColors.num_name)} rowSpan={3}>№</th>
                                <th style={{ ...thStyleWithColor(headerColors.num_name), textAlign: 'left', minWidth: 350 }} rowSpan={3}>Мурожаатларда кўтарилган масалалар</th>
                                <th style={thStyleWithColor(headerColors.total)} colSpan={2} rowSpan={2}>Жами</th>
                                {districtIds.map(id => (
                                    <th key={id} style={{ ...thStyleWithColor(headerColors.dist), minWidth: 100 }} colSpan={2}>{t4.regional[id].name}</th>
                                ))}
                            </tr>
                            <tr>
                                {districtIds.map(id => (
                                    <React.Fragment key={`h-${id}`}>
                                        <th style={thStyleWithColor(headerColors.dist)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.dist)}>{currYearShort}</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                            <tr>
                                <th style={thStyleWithColor(headerColors.total)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.total)}>{currYearShort}</th>
                                {districtIds.map(id => (
                                    <React.Fragment key={`y-${id}`}>
                                        <th style={thStyleWithColor(headerColors.dist)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.dist)}>{currYearShort}</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {APPEALS_SUBJECT_ROWS.map((s, idx) => (
                                <tr key={s.key}>
                                    <td style={tdStyle}>{idx + 1}</td>
                                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>{t(s.labelKey)}</td>
                                    <td style={tdStyle}>{t4.subjects[s.key]?.count_prev || 0}</td>
                                    <td style={{ ...tdStyle, fontWeight: 'bold', color: '#1890ff' }}>{t4.subjects[s.key]?.count_curr || 0}</td>
                                    {districtIds.map(id => {
                                        const p = t4.regional[id].data[s.key]?.prev || 0;
                                        const c = t4.regional[id].data[s.key]?.curr || 0;
                                        return (
                                            <React.Fragment key={`${s.key}-${id}`}>
                                                <td style={tdStyle}>{p}</td>
                                                <td style={{ ...tdStyle, fontWeight: c > 0 ? 'bold' : 'normal', color: c > 0 ? '#1890ff' : 'inherit' }}>{c}</td>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderTable5 = () => {
        const t5 = autoReportsQuery.data?.table5 || { regional: {} };
        const regionalIds = Object.keys(t5.regional || {});

        const headerColors = {
            num_name: '#f1f5f9',
            total: '#ffffff',
            phys: '#fff7ed',
            legal: '#f0f9ff'
        };

        const thStyleWithColor = (color: string) => ({ ...thStyle, backgroundColor: color, fontSize: '11px', padding: '8px 4px' });

        return (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px', fontWeight: 'bold' }}>
                    {currYear} йилнинг {dayjs(month).format('MMMM')} ойида келиб тушган мурожаатларнинг <span style={{ color: '#1890ff' }}>турлари ва шахс тоифаси</span> бўйича таҳлили
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1200, border: '1px solid #000' }}>
                        <thead>
                            <tr>
                                <th style={thStyleWithColor(headerColors.num_name)} rowSpan={3}>№</th>
                                <th style={{ ...thStyleWithColor(headerColors.num_name), textAlign: 'left', minWidth: 200 }} rowSpan={3}>Ҳудудлар nomi</th>
                                <th style={thStyleWithColor(headerColors.total)} colSpan={2} rowSpan={2}>Жами мурожаатлар сони</th>
                                <th style={thStyleWithColor(headerColors.phys)} colSpan={8}>Жисмоний шахслар бўйича</th>
                                <th style={thStyleWithColor(headerColors.legal)} colSpan={8}>Юридик шахслар бўйича</th>
                            </tr>
                            <tr>
                                <th style={thStyleWithColor(headerColors.phys)} colSpan={2}>Жами</th><th style={thStyleWithColor(headerColors.phys)} colSpan={2}>Ариза</th><th style={thStyleWithColor(headerColors.phys)} colSpan={2}>Шикоят</th><th style={thStyleWithColor(headerColors.phys)} colSpan={2}>Таклиф</th>
                                <th style={thStyleWithColor(headerColors.legal)} colSpan={2}>Жами</th><th style={thStyleWithColor(headerColors.legal)} colSpan={2}>Ариза</th><th style={thStyleWithColor(headerColors.legal)} colSpan={2}>Шикоят</th><th style={thStyleWithColor(headerColors.legal)} colSpan={2}>Таклиф</th>
                            </tr>
                            <tr>
                                <th style={thStyleWithColor(headerColors.total)}>{prevYear}</th><th style={thStyleWithColor(headerColors.total)}>{currYear}</th>
                                {[1, 2, 3, 4].map(i => (
                                    <React.Fragment key={`phys-${i}`}>
                                        <th style={thStyleWithColor(headerColors.phys)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.phys)}>{currYearShort}</th>
                                    </React.Fragment>
                                ))}
                                {[1, 2, 3, 4].map(i => (
                                    <React.Fragment key={`legal-${i}`}>
                                        <th style={thStyleWithColor(headerColors.legal)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.legal)}>{currYearShort}</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {regionalIds.map((id, idx) => {
                                const reg = t5.regional[id];
                                return (
                                    <tr key={id}>
                                        <td style={tdStyle}>{idx + 1}</td>
                                        <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>{reg.name}</td>
                                        <td style={tdStyle}>{reg.total.prev}</td><td style={{ ...tdStyle, fontWeight: 'bold', color: '#1890ff' }}>{reg.total.curr}</td>
                                        {/* Phys */}
                                        <td style={tdStyle}>{reg.phys.prev.total}</td><td style={tdStyle}>{reg.phys.curr.total}</td>
                                        <td style={tdStyle}>{reg.phys.prev.ariza}</td><td style={tdStyle}>{reg.phys.curr.ariza}</td>
                                        <td style={tdStyle}>{reg.phys.prev.shikoyat}</td><td style={tdStyle}>{reg.phys.curr.shikoyat}</td>
                                        <td style={tdStyle}>{reg.phys.prev.taklif}</td><td style={tdStyle}>{reg.phys.curr.taklif}</td>
                                        {/* Legal */}
                                        <td style={tdStyle}>{reg.legal.prev.total}</td><td style={tdStyle}>{reg.legal.curr.total}</td>
                                        <td style={tdStyle}>{reg.legal.prev.ariza}</td><td style={tdStyle}>{reg.legal.curr.ariza}</td>
                                        <td style={tdStyle}>{reg.legal.prev.shikoyat}</td><td style={tdStyle}>{reg.legal.curr.shikoyat}</td>
                                        <td style={tdStyle}>{reg.legal.prev.taklif}</td><td style={tdStyle}>{reg.legal.curr.taklif}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderTable6 = () => {
        const t6 = autoReportsQuery.data?.table6 || { people: { curr: {} }, virtual: { curr: {} } };

        const headerColors = {
            people: '#f0f9ff',
            virtual: '#f5f3ff',
            sub: '#ffffff'
        };

        const thStyleWithColor = (color: string) => ({ ...thStyle, backgroundColor: color, fontSize: '11px', padding: '8px 4px' });

        const renderStatusCells = (typeData: any) => [
            typeData.total || 0,
            typeData.satisfied || 0,
            typeData.explained || 0,
            typeData.referral || 0,
            typeData.rejected || 0,
            typeData.anonymous || 0,
            typeData.being_considered || 0,
            typeData.overdue || 0,
        ];

        return (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px', fontWeight: 'bold' }}>
                    Ўзбекистон Республикаси Президентининг <span style={{ color: '#1890ff' }}>Халқ ва Виртуал қабулхоналари</span> орқали келиб тушган мурожаатларнинг кўриб чиқилиши тўғрисида маълумот
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1400, border: '1px solid #000' }}>
                        <thead>
                            <tr>
                                <th style={thStyleWithColor(headerColors.people)} colSpan={8}>Халқ қабулхоналари орқали</th>
                                <th style={thStyleWithColor(headerColors.virtual)} colSpan={8}>Виртуал қаabulхона орқали</th>
                            </tr>
                            <tr style={{ height: '80px' }}>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Жами</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Қаноатлантирилди</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Тушунтирилди</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Тегишлилиги бўйича</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Рад этилди</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Кўрмасдан қолдирилди</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Кўриб чиқилмоқда</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Муддати бузилган</div></th>
                                
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Жами</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Қаноатлантирилди</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Тушунтирилди</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Тегишлилиги бўйича</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Рад этилди</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Кўрмасдан қолдирилди</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Кўриб чиқилмоқда</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">Муддати бузилган</div></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ height: '50px' }}>
                                {renderStatusCells(t6.people.curr).map((v, i) => (
                                    <td key={`p-${i}`} style={{ ...tdStyle, fontWeight: i === 0 || i === 6 ? 'bold' : 'normal', fontSize: '14px', borderRight: i === 7 ? '2px solid #000' : '1px solid #000' }}>{v}</td>
                                ))}
                                {renderStatusCells(t6.virtual.curr).map((v, i) => (
                                    <td key={`v-${i}`} style={{ ...tdStyle, fontWeight: i === 0 || i === 6 ? 'bold' : 'normal', fontSize: '14px' }}>{v}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderTable7 = () => {
        const t7 = autoReportsQuery.data?.table7 || { disciplinary: { fine: {}, reprimand: {}, dismissal: {}, total: {} }, administrative: {}, criminal: {}, grand_total: {} };

        const headerColors = {
            num_name: '#f1f5f9',
            disciplinary: '#fff7ed',
            measures: '#ffffff'
        };

        const thStyleWithColor = (color: string) => ({ ...thStyle, backgroundColor: color, fontSize: '11px', padding: '8px 4px' });

        return (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px', fontWeight: 'bold' }}>
                    {currYear} йилнинг {dayjs(month).format('MMMM')} ойида мурожаатларни кўриб чиқиш жараёнида <span style={{ color: '#1890ff' }}>қўлланилган чоралар</span> тўғрисида маълумот
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #000' }}>
                        <thead>
                            <tr>
                                <th style={thStyleWithColor(headerColors.num_name)} rowSpan={3}>№</th>
                                <th style={{ ...thStyleWithColor(headerColors.num_name), textAlign: 'left', minWidth: 200 }} rowSpan={3}>Жавобгарлик турлари</th>
                                <th style={thStyleWithColor(headerColors.disciplinary)} colSpan={8}>Интизомий жавобгарлик</th>
                                <th style={thStyleWithColor(headerColors.measures)} colSpan={2} rowSpan={2}>Маъмурий жавобгарлик</th>
                                <th style={thStyleWithColor(headerColors.measures)} colSpan={2} rowSpan={2}>Жиноий жавобгарлик</th>
                                <th style={thStyleWithColor(headerColors.measures)} colSpan={2} rowSpan={2}>Жами</th>
                            </tr>
                            <tr>
                                <th style={thStyleWithColor(headerColors.disciplinary)} colSpan={2}>Жарима</th>
                                <th style={thStyleWithColor(headerColors.disciplinary)} colSpan={2}>Ҳайфсан</th>
                                <th style={thStyleWithColor(headerColors.disciplinary)} colSpan={2}>Лавозимидан озод этиш</th>
                                <th style={thStyleWithColor(headerColors.disciplinary)} colSpan={2}>Жами</th>
                            </tr>
                            <tr>
                                <th style={thStyleWithColor(headerColors.disciplinary)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.disciplinary)}>{currYearShort}</th>
                                <th style={thStyleWithColor(headerColors.disciplinary)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.disciplinary)}>{currYearShort}</th>
                                <th style={thStyleWithColor(headerColors.disciplinary)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.disciplinary)}>{currYearShort}</th>
                                <th style={thStyleWithColor(headerColors.disciplinary)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.disciplinary)}>{currYearShort}</th>
                                <th style={thStyleWithColor(headerColors.measures)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.measures)}>{currYearShort}</th>
                                <th style={thStyleWithColor(headerColors.measures)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.measures)}>{currYearShort}</th>
                                <th style={thStyleWithColor(headerColors.measures)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.measures)}>{currYearShort}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={tdStyle}>1</td>
                                <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>Қўлланилган чоралар сони</td>
                                <td style={tdStyle}>{t7.disciplinary.fine.prev || 0}</td><td style={tdStyle}>{t7.disciplinary.fine.curr || 0}</td>
                                <td style={tdStyle}>{t7.disciplinary.reprimand.prev || 0}</td><td style={tdStyle}>{t7.disciplinary.reprimand.curr || 0}</td>
                                <td style={tdStyle}>{t7.disciplinary.dismissal.prev || 0}</td><td style={tdStyle}>{t7.disciplinary.dismissal.curr || 0}</td>
                                <td style={tdStyle}>{t7.disciplinary.total.prev || 0}</td><td style={{ ...tdStyle, fontWeight: 'bold' }}>{t7.disciplinary.total.curr || 0}</td>
                                <td style={tdStyle}>{t7.administrative.prev || 0}</td><td style={tdStyle}>{t7.administrative.curr || 0}</td>
                                <td style={tdStyle}>{t7.criminal.prev || 0}</td><td style={tdStyle}>{t7.criminal.curr || 0}</td>
                                <td style={tdStyle}>{t7.grand_total.prev || 0}</td><td style={{ ...tdStyle, fontWeight: 'bold', color: '#1890ff' }}>{t7.grand_total.curr || 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const tabItems = [
        {
            key: 'journal',
            label: <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{t('appeals.tabs.journal')}</span>,
            children: (
                <MasterAppealsJournal
                    month={month}
                    orgId={effectiveOrgId || ''}
                    records={recordsQuery.data || []}
                    autoReports={autoReportsQuery.data}
                    isLoading={recordsQuery.isLoading}
                    onCreate={(v) => createRecordMutation.mutate(v)}
                    isCreating={createRecordMutation.isPending}
                    isRegionalOrg={isRegionalOrg}
                />
            )
        },
        {
            key: 'dashboard',
            label: <span style={{ fontWeight: 'bold', color: '#52c41a' }}>Tahliliy Dashboard</span>,
            children: <AppealsDashboard 
                data={autoReportsQuery.data} 
                month={month} 
                isLoading={autoReportsQuery.isLoading} 
                orgId={effectiveOrgId} 
            />
        },
        { key: '1', label: t('appeals.tabs.t1'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable1()}</div></Spin> },
        { key: '2', label: t('appeals.tabs.t2'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable2()}</div></Spin> },
        { key: '3', label: t('appeals.tabs.t3'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable3()}</div></Spin> },
        { key: '4', label: t('appeals.tabs.t4'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable4()}</div></Spin> },
        { key: '5', label: t('appeals.tabs.t5'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable5()}</div></Spin> },
        { key: '6', label: t('appeals.tabs.t6'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable6()}</div></Spin> },
        { key: '7', label: t('appeals.tabs.t7'), children: <Spin spinning={isLoadingTable}><div className="table-container">{renderTable7()}</div></Spin> },
    ];

    if (isRegion) {
        tabItems.push({
            key: 'monitoring',
            label: <span style={{ fontWeight: 'bold', color: '#fa8c16' }}>Monitoring (Tumanlar)</span>,
            children: (
                <AppealsMonitoring 
                    data={monitoringQuery.data || []}
                    isLoading={monitoringQuery.isLoading}
                />
            )
        });
    }

    return (
        <GlassLayout title={t('appeals.title')}>
            <style dangerouslySetInnerHTML={{ __html: `.table-container { overflow-x: auto; background: #fff; border-radius: 8px; padding: 10px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }` }} />
            <Card style={{ marginBottom: 20 }} size="small" className="glass-card">
                <Space wrap>
                    <DatePicker
                        picker="month"
                        value={dayjs(month)}
                        onChange={(d) => setMonth(d ? d.format('YYYY-MM') : dayjs().format('YYYY-MM'))}
                        allowClear={false}
                    />
                    {isAdmin && (
                        <Select
                            placeholder={t('admin.organizations.select_org')}
                            style={{ width: 250 }}
                            value={selectedOrgId}
                            onChange={setSelectedOrgId}
                            options={organizations.map((o: Organization) => ({ label: o.name, value: o.id }))}
                            showSearch
                            allowClear
                        />
                    )}
                    <Space>
                    <Button icon={<ReloadOutlined />} onClick={refresh} loading={isLoadingTable}>
                        {t('common.refresh')}
                    </Button>
                    <Button icon={<FileExcelOutlined />} onClick={handleExportExcel} type="primary" ghost>Excel</Button>
                    <Button icon={<FilePdfOutlined />} onClick={handleExportPdf} danger ghost>PDF</Button>
                    {activeTab !== 'journal' && activeTab !== 'monitoring' && activeTab !== 'dashboard' && (
                        <PermissionGate permission="EDIT_APPEALS" action="edit">
                            <Button type="primary" icon={<SaveOutlined />} loading={isSaving} onClick={saveDataAction}>
                                {t('common.save')}
                            </Button>
                        </PermissionGate>
                    )}
                </Space>
                </Space>
            </Card>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="glass-tabs"
                items={tabItems}
                destroyInactiveTabPane
            />
        </GlassLayout>
    );
};

export default AppealsPage;
