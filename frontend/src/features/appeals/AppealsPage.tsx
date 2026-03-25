import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SaveOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Select, Space, Spin, Card, Tabs, Modal, Upload, message, notification } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/uz-latn';
import GlassLayout from '../../components/layout/GlassLayout';
import PermissionGate from '../../components/PermissionGate';
import { useAppealsData } from './hooks/useAppealsData';
import { APPEALS_SUBJECT_ROWS } from './components/AppealsConstants';
import MasterAppealsJournal from './components/MasterAppealsJournal';
import AppealsMonitoring from './components/AppealsMonitoring';
import AppealsDashboard from './components/AppealsDashboard';
import { api, fileApi } from '../../services/api';



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
    const { t, i18n } = useTranslation();
    const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('journal');
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        if (i18n.language === 'uz') {
            dayjs.locale('uz-latn');
        } else {
            dayjs.locale(i18n.language);
        }
    }, [i18n.language]);

    const userRole = localStorage.getItem('user_role');
    const isRepublicUser = userRole === 'REPUBLIC_HEAD' || userRole === 'ADMIN';
    const isRegionUser = userRole === 'REGION_HEAD' || userRole === 'LEAD_SPECIALIST';

    const isAdmin = userRole === 'ADMIN' || userRole === 'EXECUTIVE' || userRole === 'REPUBLIC_HEAD';
    const userOrgId = localStorage.getItem('user_org_id');
    const effectiveOrgId = isAdmin 
        ? selectedOrgId 
        : (userOrgId === 'undefined' || userOrgId === 'null' ? null : userOrgId);

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
    
    // Determine if republic, regional or district
    const currentOrg = organizations.find((o: any) => o.id === effectiveOrgId);
    
    // Republic: No parent
    const isRepublicOrg = currentOrg ? !currentOrg.parent_id && !currentOrg.parent : false;
    
    // Region: Parent is Republic (Check parent name or if parent is republic)
    // For simplicity, if it has a parent but itself has children, it's a Region. 
    // Or check if its parent is the Republic org.
    const isRegionalOrg = currentOrg ? 
        (currentOrg.parent_id || currentOrg.parent) && (currentOrg.children?.length > 0 || currentOrg.name.includes('viloyat') || currentOrg.name.includes('shahar')) : false;


    const [localData, setLocalData] = useState<any[]>([]);

    useEffect(() => {
        setLocalData(tableData);
    }, [tableData]);

    const handleExportExcel = async () => {
        if (!effectiveOrgId) return;
        try {
            const response = await api.get(`/appeals/export-excel?organizationId=${effectiveOrgId}&month=${month}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Appeals_Report_${month}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            message.error(t('common.export_error') || 'Eksportda xatolik');
        }
    };

    const handleExportPdf = async () => {
        if (!effectiveOrgId) return;
        try {
            const response = await api.get(`/appeals/export-pdf?organizationId=${effectiveOrgId}&month=${month}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Appeals_Report_${month}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            message.error(t('common.export_error') || 'Eksportda xatolik');
        }
    };

    const saveDataAction = () => saveData(localData);

    const handleBulkUpload = async () => {
        if (fileList.length === 0) {
            message.warning('Iltimos, fayllarni tanlang');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        fileList.forEach((file: any) => {
            formData.append('files', file.originFileObj || file);
        });

        try {
            await fileApi.post(`/appeals/import-bulk?month=${month}&parentId=${effectiveOrgId}`, formData);

            notification.success({
                message: "Muvaffaqiyatli",
                description: "Tumanlar ma'lumotlari yuklandi va yig'ma hisobot yangilandi."
            });
            setIsUploadModalVisible(false);
            setFileList([]);
            refresh();
        } catch (error: any) {
            console.error('Bulk upload error:', error);
            if (error.response?.status === 401) {
                message.error("Sessiya eskirgan. Iltimos, chiqib qaytadan kiring.");
            } else {
                message.error(`Xatolik: ${error.message}`);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleAggregateManual = async () => {
        try {
            await api.post('/appeals/aggregate', { organizationId: effectiveOrgId, month });
            message.success("Yig'ma hisobot muvaffaqiyatli shakllantirildi");
            refresh();
        } catch (error: any) {
            message.error(`Xatolik: ${error.message}`);
        }
    };

    const getUzMonth = (m: string) => {
        const uzMonths = [
            'Yanvar', 'Fevral', 'Mart', 'Aprel',
            'May', 'Iyun', 'Iyul', 'Avgust',
            'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
        ];
        return uzMonths[dayjs(m).month()] || '';
    };

    const formatRegionName = (name: string) => {
        if (!name) return name;
        if (name === 'Жами' || name === 'Jami') return name;
        return name
            .replace(/\s+t\.?$/i, ' tumani')
            .replace(/\s+sh\.?$/i, ' shahri');
    };

    const orgName = currentOrg?.name || (isRepublicOrg ? "Respublika" : isRegionalOrg ? "Viloyat boshqarmasi" : "Tuman (shahar) bo'limi");

    const renderTable1 = () => {
        const t1 = autoReportsQuery.data?.table1 || { head: {}, deputy_epid: {}, deputy_san: {} };
        
        const headerColors = {
            bg: '#f8fafc',
            head: '#f1f5f9',
            metrics: '#ffffff'
        };

        const thStyleWithColor = (color: string) => ({ ...thStyle, backgroundColor: color, fontSize: '11px', padding: '8px 4px' });

        const rows = (isRegionalOrg || isRepublicOrg)
            ? [
                { key: 'head', label: t('appeals.table1.rows.head_reg') },
                { key: 'deputy_epid', label: t('appeals.table1.rows.deputy_epid_reg') },
                { key: 'deputy_san', label: t('appeals.table1.rows.deputy_san_reg') }
              ]
            : [
                { key: 'head', label: t('appeals.table1.rows.head') }
              ];

        return (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px', fontWeight: 'bold' }}>
                    {t('appeals.table1.title', { 
                        year: currYear, 
                        month: getUzMonth(month), 
                        org: orgName 
                    })}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #000' }}>
                        <thead>
                            <tr>
                                <th style={thStyleWithColor(headerColors.head)} rowSpan={3}>{t('appeals.table1.columns.no')}</th>
                                <th style={{ ...thStyleWithColor(headerColors.head), textAlign: 'left', minWidth: 250 }} rowSpan={3}>{t('appeals.table1.columns.rahbar')}</th>
                                <th style={thStyleWithColor(headerColors.metrics)} colSpan={2} rowSpan={2}>{t('appeals.table1.columns.jami')}</th>
                                <th style={thStyleWithColor(headerColors.metrics)} colSpan={6}>{t('appeals.table1.columns.shundan')}</th>
                            </tr>
                            <tr>
                                <th style={thStyleWithColor(headerColors.metrics)} colSpan={2}>{t('appeals.table1.columns.oral')}</th>
                                <th style={thStyleWithColor(headerColors.metrics)} colSpan={2}>{t('appeals.table1.columns.written')}</th>
                                <th style={thStyleWithColor(headerColors.metrics)} colSpan={2}>{t('appeals.table1.columns.electronic')}</th>
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
            num_name: '#f1f5f9',
            total: '#ffffff',
            channels: '#fff7ed',
            consideration: '#fffaf0',
            repeated: '#f0f9ff',
            expired: '#f1f5f9'
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
                    {t('appeals.table2.title', { 
                        year: currYear,
                        month: getUzMonth(month), 
                        org: orgName 
                    })}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1600, border: '1px solid #000' }}>
                    <thead>
                        {/* Row 1 */}
                        <tr>
                            <th style={thStyleWithColor(headerColors.num_name)} rowSpan={3}>№</th>
                            <th style={{ ...thStyleWithColor(headerColors.num_name), textAlign: 'left', minWidth: 300 }} rowSpan={3}>{t('appeals.table2.columns.subjects')}</th>
                            <th style={thStyleWithColor(headerColors.total)} colSpan={2} rowSpan={2}>{t('appeals.table2.columns.jami')}</th>
                            <th style={thStyleWithColor(headerColors.channels)} colSpan={6}>{t('appeals.table2.columns.shakllari')}</th>
                            <th style={thStyleWithColor(headerColors.consideration)} colSpan={5}>{t('appeals.table2.columns.consideration_2026')}</th>
                            <th style={thStyleWithColor(headerColors.repeated)} rowSpan={3}>{t('appeals.table2.columns.repeated')}</th>
                            <th style={thStyleWithColor(headerColors.expired)} rowSpan={3}>{t('appeals.table2.columns.expired')}</th>
                        </tr>
                        {/* Row 2 */}
                        <tr>
                            <th style={thStyleWithColor(headerColors.channels)} colSpan={2}>{t('appeals.table2.columns.written')}</th>
                            <th style={thStyleWithColor(headerColors.channels)} colSpan={2}>{t('appeals.table2.columns.electronic')}</th>
                            <th style={thStyleWithColor(headerColors.channels)} colSpan={2}>{t('appeals.table2.columns.oral')}</th>
                            <th style={thStyleWithColor(headerColors.consideration)} rowSpan={2}>{t('appeals.table2.columns.monitored')}</th>
                            <th style={thStyleWithColor(headerColors.consideration)} colSpan={4}>Жумладан</th>
                        </tr>
                        {/* Row 3 */}
                        <tr>
                            <th style={thStyleWithColor(headerColors.total)}>{prevYear}</th><th style={thStyleWithColor(headerColors.total)}>{currYear}</th>
                            <th style={thStyleWithColor(headerColors.channels)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.channels)}>{currYearShort}</th>
                            <th style={thStyleWithColor(headerColors.channels)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.channels)}>{currYearShort}</th>
                            <th style={thStyleWithColor(headerColors.channels)}>{prevYearShort}</th><th style={thStyleWithColor(headerColors.channels)}>{currYearShort}</th>
                            <th style={thStyleWithColor(headerColors.consideration)}>{t('appeals.table2.columns.satisfied')}</th>
                            <th style={thStyleWithColor(headerColors.consideration)}>{t('appeals.table2.columns.explained')}</th>
                            <th style={thStyleWithColor(headerColors.consideration)}>{t('appeals.table2.columns.rejected')}</th>
                            <th style={thStyleWithColor(headerColors.consideration)}>{t('appeals.table2.columns.pending')}</th>
                        </tr>
                        {/* Row Indices */}
                        <tr>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(n => (
                                <th key={n} style={{ ...thStyle, fontSize: '10px', height: '20px', padding: 0 }}>{n}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {APPEALS_SUBJECT_ROWS.map((s, idx) => (
                            <tr key={s.key}>
                                <td style={tdStyle}>{idx + 1}</td>
                                <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>{t(s.labelKey)}</td>
                                <td style={tdStyle}>{getSubjectVal(s.key, 'count_prev')}</td>
                                <td style={{ ...tdStyle, fontWeight: 'bold', color: '#1890ff' }}>{getSubjectVal(s.key, 'count_curr')}</td>
                                
                                <td style={tdStyle}>{getSubjectVal(s.key, 'written_prev')}</td>
                                <td style={tdStyle}>{getSubjectVal(s.key, 'written_curr')}</td>
                                
                                <td style={tdStyle}>{getSubjectVal(s.key, 'electronic_prev')}</td>
                                <td style={tdStyle}>{getSubjectVal(s.key, 'electronic_curr')}</td>
                                
                                <td style={tdStyle}>{getSubjectVal(s.key, 'oral_prev')}</td>
                                <td style={tdStyle}>{getSubjectVal(s.key, 'oral_curr')}</td>
                                
                                <td style={tdStyle}>{getSubjectVal(s.key, 'monitored')}</td>
                                <td style={tdStyle}>{getSubjectVal(s.key, 'satisfied')}</td>
                                <td style={tdStyle}>{getSubjectVal(s.key, 'explained')}</td>
                                <td style={tdStyle}>{getSubjectVal(s.key, 'rejected')}</td>
                                <td style={tdStyle}>{getSubjectVal(s.key, 'pending')}</td>
                                
                                <td style={tdStyle}>{getSubjectVal(s.key, 'repeated')}</td>
                                <td style={tdStyle}>{getSubjectVal(s.key, 'expired')}</td>
                            </tr>
                        ))}
                        {/* Total Row */}
                        <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                            <td style={tdStyle} colSpan={2}>Жами:</td>
                            <td style={tdStyle}>{totalRow.count_prev || 0}</td>
                            <td style={{ ...tdStyle, color: '#1890ff' }}>{totalRow.count_curr || 0}</td>
                            
                            <td style={tdStyle}>{totalRow.written_prev || 0}</td>
                            <td style={tdStyle}>{totalRow.written_curr || 0}</td>
                            
                            <td style={tdStyle}>{totalRow.electronic_prev || 0}</td>
                            <td style={tdStyle}>{totalRow.electronic_curr || 0}</td>
                            
                            <td style={tdStyle}>{totalRow.oral_prev || 0}</td>
                            <td style={tdStyle}>{totalRow.oral_curr || 0}</td>
                            
                            <td style={tdStyle}>{totalRow.monitored || 0}</td>
                            <td style={tdStyle}>{totalRow.satisfied || 0}</td>
                            <td style={tdStyle}>{totalRow.explained || 0}</td>
                            <td style={tdStyle}>{totalRow.rejected || 0}</td>
                            <td style={tdStyle}>{totalRow.pending || 0}</td>
                            
                            <td style={tdStyle}>{totalRow.repeated || 0}</td>
                            <td style={tdStyle}>{totalRow.expired || 0}</td>
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
        const totalId = regionalIds.find(id => id === 'total' || t3.regional[id]?.name === 'Жами' || regionalIds.indexOf(id) === 0);
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
                    {currYear} yilning {getUzMonth(month)} oyida {orgName}ga kelib tushgan murojaatlarning viloyatlar bo'yicha taqqoslama tahlili to'g'risida ma'lumot
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
                                            <td style={{ ...tdStyle, textAlign: 'left' }}>{formatRegionName(reg.name)}</td>
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
                    {t('appeals.table4.title', { 
                        year: currYear, 
                        month: getUzMonth(month), 
                        org: orgName 
                    })}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1500, border: '1px solid #000' }}>
                        <thead>
                            <tr>
                                <th style={thStyleWithColor(headerColors.num_name)} rowSpan={3}>{t('appeals.table4.columns.no')}</th>
                                <th style={{ ...thStyleWithColor(headerColors.num_name), textAlign: 'left', minWidth: 350 }} rowSpan={3}>{t('appeals.table4.columns.subject')}</th>
                                <th style={thStyleWithColor(headerColors.total)} colSpan={2} rowSpan={2}>{t('appeals.table4.columns.jami')}</th>
                                {districtIds.map(id => (
                                    <th key={id} style={{ ...thStyleWithColor(headerColors.dist), minWidth: 100 }} colSpan={2}>{formatRegionName(t4.regional[id].name)}</th>
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
                    {t('appeals.table5.title', { 
                        year: currYear, 
                        month: getUzMonth(month) 
                    })}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1200, border: '1px solid #000' }}>
                        <thead>
                            <tr>
                                <th style={thStyleWithColor(headerColors.num_name)} rowSpan={3}>{t('appeals.table5.columns.no')}</th>
                                <th style={{ ...thStyleWithColor(headerColors.num_name), textAlign: 'left', minWidth: 200 }} rowSpan={3}>{t('appeals.table5.columns.regions')}</th>
                                <th style={thStyleWithColor(headerColors.total)} colSpan={2} rowSpan={2}>{t('appeals.table5.columns.jami')}</th>
                                <th style={thStyleWithColor(headerColors.phys)} colSpan={8}>{t('appeals.table5.columns.phys')}</th>
                                <th style={thStyleWithColor(headerColors.legal)} colSpan={8}>{t('appeals.table5.columns.legal')}</th>
                            </tr>
                            <tr>
                                <th style={thStyleWithColor(headerColors.phys)} colSpan={2}>{t('common.total')}</th><th style={thStyleWithColor(headerColors.phys)} colSpan={2}>{t('appeals.table5.columns.ariza')}</th><th style={thStyleWithColor(headerColors.phys)} colSpan={2}>{t('appeals.table5.columns.shikoyat')}</th><th style={thStyleWithColor(headerColors.phys)} colSpan={2}>{t('appeals.table5.columns.taklif')}</th>
                                <th style={thStyleWithColor(headerColors.legal)} colSpan={2}>{t('common.total')}</th><th style={thStyleWithColor(headerColors.legal)} colSpan={2}>{t('appeals.table5.columns.ariza')}</th><th style={thStyleWithColor(headerColors.legal)} colSpan={2}>{t('appeals.table5.columns.shikoyat')}</th><th style={thStyleWithColor(headerColors.legal)} colSpan={2}>{t('appeals.table5.columns.taklif')}</th>
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
                                        <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>{formatRegionName(reg.name)}</td>
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
        const t6 = autoReportsQuery.data?.table6 || { people: { curr: {} }, virtual: { curr: {} }, telegram: { curr: {} } };

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
                    {t('appeals.table6.title', { 
                        year: currYear, 
                        month: getUzMonth(month) 
                    })}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1400, border: '1px solid #000' }}>
                        <thead>
                            <tr>
                                <th style={thStyleWithColor(headerColors.people)} colSpan={8}>{t('appeals.table6.columns.people')}</th>
                                <th style={thStyleWithColor(headerColors.virtual)} colSpan={8}>{t('appeals.table6.columns.virtual')}</th>
                            </tr>
                            <tr style={{ height: '80px' }}>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('common.total')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.satisfied')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.explained')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.referral')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.rejected')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.ignored')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.pending')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.overdue')}</div></th>
                                
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('common.total')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.satisfied')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.explained')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.referral')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.rejected')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.ignored')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.pending')}</div></th>
                                <th style={thStyleWithColor(headerColors.sub)}><div className="vertical-text">{t('appeals.table6.columns.overdue')}</div></th>
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
        const t7 = autoReportsQuery.data?.table7 || { summary: { disciplinary: { fine: {}, reprimand: {}, dismissal: {}, total: {} }, administrative: {}, criminal: {}, grand_total: {} }, regional: {} };
        const regionalIds = Object.keys(t7.regional || {});

        const headerColors = {
            num_name: '#f1f5f9',
            disciplinary: '#fff7ed',
            measures: '#ffffff'
        };

        const thStyleWithColor = (color: string) => ({ ...thStyle, backgroundColor: color, fontSize: '11px', padding: '8px 4px' });

        return (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '20px', fontWeight: 'bold' }}>
                    {t('appeals.table7.title', { 
                        year: currYear, 
                        month: getUzMonth(month) 
                    })}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #000' }}>
                        <thead>
                            <tr>
                                <th style={thStyleWithColor(headerColors.num_name)} rowSpan={3}>№</th>
                                <th style={{ ...thStyleWithColor(headerColors.num_name), textAlign: 'left', minWidth: 200 }} rowSpan={3}>Hududlar</th>
                                <th style={thStyleWithColor(headerColors.disciplinary)} colSpan={8}>Intizomiy javobgarlik</th>
                                <th style={thStyleWithColor(headerColors.measures)} colSpan={2} rowSpan={2}>Ma'muriy javobgarlik</th>
                                <th style={thStyleWithColor(headerColors.measures)} colSpan={2} rowSpan={2}>Jinoiy javobgarlik</th>
                                <th style={thStyleWithColor(headerColors.measures)} colSpan={2} rowSpan={2}>Jami</th>
                            </tr>
                            <tr>
                                <th style={thStyleWithColor(headerColors.disciplinary)} colSpan={2}>Jarima</th>
                                <th style={thStyleWithColor(headerColors.disciplinary)} colSpan={2}>Hayfsan</th>
                                <th style={thStyleWithColor(headerColors.disciplinary)} colSpan={2}>Lavozimidan ozod etish</th>
                                <th style={thStyleWithColor(headerColors.disciplinary)} colSpan={2}>Jami</th>
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
                            {regionalIds.map((id, idx) => {
                                const reg = t7.regional[id];
                                return (
                                    <tr key={id}>
                                        <td style={tdStyle}>{idx + 1}</td>
                                        <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 'bold' }}>{reg.name}</td>
                                        <td style={tdStyle}>{reg.disciplinary.fine.prev || 0}</td><td style={tdStyle}>{reg.disciplinary.fine.curr || 0}</td>
                                        <td style={tdStyle}>{reg.disciplinary.reprimand.prev || 0}</td><td style={tdStyle}>{reg.disciplinary.reprimand.curr || 0}</td>
                                        <td style={tdStyle}>{reg.disciplinary.dismissal.prev || 0}</td><td style={tdStyle}>{reg.disciplinary.dismissal.curr || 0}</td>
                                        <td style={tdStyle}>{reg.disciplinary.total.prev || 0}</td><td style={{ ...tdStyle, fontWeight: 'bold' }}>{reg.disciplinary.total.curr || 0}</td>
                                        <td style={tdStyle}>{reg.administrative.prev || 0}</td><td style={tdStyle}>{reg.administrative.curr || 0}</td>
                                        <td style={tdStyle}>{reg.criminal.prev || 0}</td><td style={tdStyle}>{reg.criminal.curr || 0}</td>
                                        <td style={tdStyle}>{reg.grand_total.prev || 0}</td><td style={{ ...tdStyle, fontWeight: 'bold', color: '#1890ff' }}>{reg.grand_total.curr || 0}</td>
                                    </tr>
                                );
                            })}
                            <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                                <td style={tdStyle} colSpan={2}>Jami</td>
                                <td style={tdStyle}>{t7.summary.disciplinary.fine.prev || 0}</td><td style={tdStyle}>{t7.summary.disciplinary.fine.curr || 0}</td>
                                <td style={tdStyle}>{t7.summary.disciplinary.reprimand.prev || 0}</td><td style={tdStyle}>{t7.summary.disciplinary.reprimand.curr || 0}</td>
                                <td style={tdStyle}>{t7.summary.disciplinary.dismissal.prev || 0}</td><td style={tdStyle}>{t7.summary.disciplinary.dismissal.curr || 0}</td>
                                <td style={tdStyle}>{t7.summary.disciplinary.total.prev || 0}</td><td style={tdStyle}>{t7.summary.disciplinary.total.curr || 0}</td>
                                <td style={tdStyle}>{t7.summary.administrative.prev || 0}</td><td style={tdStyle}>{t7.summary.administrative.curr || 0}</td>
                                <td style={tdStyle}>{t7.summary.criminal.prev || 0}</td><td style={tdStyle}>{t7.summary.criminal.curr || 0}</td>
                                <td style={tdStyle}>{t7.summary.grand_total.prev || 0}</td><td style={{ ...tdStyle, color: '#1890ff' }}>{t7.summary.grand_total.curr || 0}</td>
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
            label: <span style={{ fontWeight: 'bold', color: '#52c41a' }}>{t('appeals.tabs.analytics')}</span>,
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

    if (isRegionUser || isRepublicUser) {
        tabItems.push({
            key: 'monitoring',
            label: <span style={{ fontWeight: 'bold', color: '#fa8c16' }}>{t('appeals.tabs.monitoring')}</span>,
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
                            style={{ width: 300 }}
                            value={selectedOrgId}
                            onChange={setSelectedOrgId}
                            options={organizations.map((o: any) => {
                                let label = o.name;
                                if (!o.parent_id && !o.parent) {
                                    label = `🏢 ${o.name} (Respublika)`;
                                } else if (o.children?.length > 0 || o.name.includes('viloyat') || o.name.includes('shahar')) {
                                    label = `📍 ${o.name}`;
                                } else {
                                    const parentName = o.parent?.name || organizations.find((parent: any) => parent.id === o.parent_id)?.name;
                                    label = parentName ? `🏘️ ${parentName}, ${o.name}` : `🏘️ ${o.name}`;
                                }
                                
                                return { label, value: o.id };
                            })}
                            showSearch
                            allowClear
                        />
                    )}
                    <Space>
                    <Button icon={<ReloadOutlined />} onClick={refresh} loading={isLoadingTable}>
                        {t('common.refresh')}
                    </Button>
                    
                    {(isRegionalOrg || isRepublicOrg) && (
                        <>
                            <Button 
                                type="primary" 
                                icon={<UploadOutlined />} 
                                onClick={() => setIsUploadModalVisible(true)}
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            >
                                {isRepublicOrg ? "Viloyatlar bo'yicha yuklash" : "Tumanlar ma'lumotini yuklash"}
                            </Button>
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={handleAggregateManual}
                            >
                                {isRepublicOrg ? "Respublika yig'masini hisoblash" : "Viloyat yig'masini hisoblash"}
                            </Button>
                        </>
                    )}

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

                <Modal
                    title="Tumanlar ma'lumotlarini yuklash"
                    open={isUploadModalVisible}
                    onOk={handleBulkUpload}
                    onCancel={() => setIsUploadModalVisible(false)}
                    confirmLoading={uploading}
                    okText="Yuklash va Hisoblash"
                    cancelText="Bekor qilish"
                    width={600}
                >
                    <p>22 ta tumandan kelgan Excel/PDF fayllarini tanlang. Tizim ularni nomi bo'yicha tumanlarga biriktiradi.</p>
                    <Upload.Dragger
                        multiple
                        beforeUpload={(file) => {
                            setFileList(prev => [...prev, file]);
                            return false;
                        }}
                        onRemove={(file) => {
                            setFileList(prev => prev.filter(f => f.uid !== file.uid));
                        }}
                        fileList={fileList}
                    >
                        <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                        <p className="ant-upload-text">Fayllarni shu yerga tashlang yoki bosing</p>
                        <p className="ant-upload-hint">Excel (.xlsx, .xls) fayllari qo'llab-quvvatlanadi.</p>
                    </Upload.Dragger>
                </Modal>
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
