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
import { APPEALS_T1_ROWS, APPEALS_SUBJECT_ROWS, APPEALS_T7_ROWS } from './components/AppealsConstants';
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

    const renderTable1 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>{t('appeals.table1.columns.no')}</th>
                    <th style={{ ...thStyle, textAlign: 'left', minWidth: 200 }} rowSpan={2}>{t('appeals.table1.columns.rahbar')}</th>
                    <th style={thStyle} colSpan={2}>{t('appeals.table1.columns.jami')}</th>
                    <th style={thStyle} colSpan={2}>Shaxsiy va sayyyor qabullar (Og'zaki)</th>
                    <th style={thStyle} colSpan={2}>{t('appeals.table1.columns.written')}</th>
                    <th style={thStyle} colSpan={2}>{t('appeals.table1.columns.electronic')}</th>
                </tr>
                <tr>
                    <th style={thStyle}>{prevYear}</th><th style={thStyle}>{currYear}</th>
                    <th style={thStyle}>{prevYear}</th><th style={thStyle}>{currYear}</th>
                    <th style={thStyle}>{prevYear}</th><th style={thStyle}>{currYear}</th>
                    <th style={thStyle}>{prevYear}</th><th style={thStyle}>{currYear}</th>
                </tr>
            </thead>
            <tbody>
                {APPEALS_T1_ROWS.map((row, ridx) => {
                    let labelKey = row.labelKey;
                    if (isRegionalOrg) {
                        labelKey = `appeals.table1.rows.${row.key}_reg`;
                    }
                    
                    return (
                        <tr key={row.key}>
                            <td style={tdStyle}>{ridx + 1}</td>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{t(labelKey)}</td>
                            {/* UZ: Kelgusida barcha ustunlarni avtomatlashtirish mumkin, hozircha faqat _curr bilan tugaydiganlar avtomat */}
                            {['total_prev', 'total_curr', 'oral_prev', 'oral_curr', 'written_prev', 'written_curr', 'electronic_prev', 'electronic_curr'].map((f, fidx) => (
                                <td key={f} style={tdStyle}>
                                    {f.endsWith('_curr') ? (
                                        <span style={{ fontWeight: 600, color: '#1890ff' }}>{getVal(row.key, f)}</span>
                                    ) : (
                                        <EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx} disabled={isSaving} />
                                    )}
                                </td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    const renderTable2 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>№</th>
                    <th style={{ ...thStyle, textAlign: 'left', minWidth: 200 }} rowSpan={2}>Murojaatlarda ko'tarilgan masalalar</th>
                    <th style={thStyle} colSpan={2}>Jami</th>
                    <th style={thStyle} colSpan={2}>Yozma</th>
                    <th style={thStyle} colSpan={2}>Elektron</th>
                    <th style={thStyle} colSpan={2}>Og'zaki</th>
                    <th style={thStyle} rowSpan={2}>Nazorat.</th>
                    <th style={thStyle} colSpan={4}>Natijalar ({currYear})</th>
                    <th style={thStyle} rowSpan={2}>Takror.</th>
                    <th style={thStyle} rowSpan={2}>Muddati.</th>
                </tr>
                <tr>
                    <th style={thStyle}>{prevYear}</th><th style={thStyle}>{currYear}</th>
                    <th style={thStyle}>{prevYear}</th><th style={thStyle}>{currYear}</th>
                    <th style={thStyle}>{prevYear}</th><th style={thStyle}>{currYear}</th>
                    <th style={thStyle}>{prevYear}</th><th style={thStyle}>{currYear}</th>
                    <th style={thStyle}>Chora</th><th style={thStyle}>Tushun.</th>
                    <th style={thStyle}>Rad</th><th style={thStyle}>Ko'ril.</th>
                </tr>
            </thead>
            <tbody>
                {APPEALS_SUBJECT_ROWS.map((row, ridx) => (
                        <tr key={row.key}>
                            <td style={tdStyle}>{ridx + 1}</td>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{t(row.labelKey)}</td>
                            {[
                                'total_prev', 'total_curr', 
                                'written_prev', 'written_curr', 
                                'electronic_prev', 'electronic_curr', 
                                'oral_prev', 'oral_curr',
                                'under_control',
                                'measures_taken', 'explained', 'rejected', 'being_considered',
                                'repeated', 'overdue'
                            ].map((f, fidx) => (
                                <td key={f} style={tdStyle}>
                                    {!f.endsWith('_prev') && f !== 'under_control' && f !== 'measures_taken' && f !== 'explained' && f !== 'rejected' && f !== 'being_considered' && f !== 'repeated' && f !== 'overdue' ? (
                                        <span style={{ fontWeight: 600, color: '#1890ff' }}>{getVal(row.key, f)}</span>
                                    ) : (
                                        <EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx} disabled={isSaving} />
                                    )}
                                </td>
                            ))}
                        </tr>
                ))}
            </tbody>
        </table>
    );

    const renderTable3 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>Hudud</th>
                    <th style={thStyle} colSpan={2}>Jami</th>
                    <th style={thStyle} colSpan={2}>Jismoniy</th>
                    <th style={thStyle} colSpan={2}>Yuridik</th>
                    <th style={thStyle}>Yozma</th><th style={thStyle}>Elek.</th>
                    <th style={thStyle} colSpan={4}>Og'zaki</th>
                </tr>
                <tr>
                    <th style={thStyle}>{prevYearShort}</th><th style={thStyle}>{currYearShort}</th>
                    <th style={thStyle}>{prevYearShort}</th><th style={thStyle}>{currYearShort}</th>
                    <th style={thStyle}>{prevYearShort}</th><th style={thStyle}>{currYearShort}</th>
                    <th style={thStyle}>{currYearShort}</th><th style={thStyle}>{currYearShort}</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Rahbar</th><th style={thStyle}>Xodim</th><th style={thStyle}>Tel</th>
                </tr>
            </thead>
            <tbody>
                <tr key="total">
                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>Tuman hisoboti</td>
                    {['total_prev', 'total_curr', 'phys_prev', 'phys_curr', 'legal_prev', 'legal_curr', 'written', 'electronic', 'oral_total', 'oral_leader', 'oral_staff', 'oral_phone'].map((f, fidx) => (
                        <td key={f} style={tdStyle}>
                            {!f.endsWith('_prev') ? (
                                <span style={{ fontWeight: 600, color: '#1890ff' }}>{getVal('total', f)}</span>
                            ) : (
                                <EditCell value={getVal('total', f)} onChange={v => updateCell('total', f, v)} rowIdx={0} colIdx={fidx} disabled={isSaving} />
                            )}
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    );

    const renderTable4 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle}>Mavzular</th>
                    <th style={thStyle}>{prevYear}</th>
                    <th style={thStyle}>{currYear}</th>
                </tr>
            </thead>
            <tbody>
                {APPEALS_SUBJECT_ROWS.map((row, ridx) => (
                    <tr key={row.key}>
                        <td style={{ ...tdStyle, textAlign: 'left' }}>{t(row.labelKey)}</td>
                        <td style={tdStyle}><EditCell value={getVal(row.key, 'count_prev')} onChange={v => updateCell(row.key, 'count_prev', v)} rowIdx={ridx} colIdx={0} disabled={isSaving} /></td>
                        <td style={tdStyle}>
                            <span style={{ fontWeight: 600, color: '#1890ff' }}>{getVal(row.key, 'count_curr')}</span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderTable5 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>Ko'rsatkich</th>
                    <th style={thStyle} colSpan={2}>Jami</th>
                    <th style={thStyle} colSpan={4}>Jismoniy ({currYear})</th>
                    <th style={thStyle} colSpan={4}>Yuridik ({currYear})</th>
                </tr>
                <tr>
                    <th style={thStyle}>{prevYearShort}</th><th style={thStyle}>{currYearShort}</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Ariza</th><th style={thStyle}>Shikoyat</th><th style={thStyle}>Taklif</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Ariza</th><th style={thStyle}>Shikoyat</th><th style={thStyle}>Taklif</th>
                </tr>
            </thead>
            <tbody>
                <tr key="total">
                    <td style={tdStyle}>Murojaat turlari</td>
                    {['total_prev', 'total_curr', 'phys_total_curr', 'phys_ariza_curr', 'phys_shikoyat_curr', 'phys_taklif_curr', 'legal_total_curr', 'legal_ariza_curr', 'legal_shikoyat_curr', 'legal_taklif_curr'].map((f, fidx) => (
                        <td key={f} style={tdStyle}>
                            {!f.endsWith('_prev') ? (
                                <span style={{ fontWeight: 600, color: '#1890ff' }}>{getVal('total', f)}</span>
                            ) : (
                                <EditCell value={getVal('total', f)} onChange={v => updateCell('total', f, v)} rowIdx={0} colIdx={fidx} disabled={isSaving} />
                            )}
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    );

    const renderTable6 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>Kanal</th>
                    <th style={thStyle} colSpan={4}>Xalq qabulxonasi</th>
                    <th style={thStyle} colSpan={4}>Virtual qabulxona</th>
                </tr>
                <tr>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Qanoat.</th><th style={thStyle}>Tushun.</th><th style={thStyle}>Rad</th>
                    <th style={thStyle}>Jami</th><th style={thStyle}>Qanoat.</th><th style={thStyle}>Tushun.</th><th style={thStyle}>Rad</th>
                </tr>
            </thead>
            <tbody>
                <tr key="total">
                    <td style={tdStyle}>Soni</td>
                    {['people_total', 'people_satisfied', 'people_explained', 'people_rejected', 'virtual_total', 'virtual_satisfied', 'virtual_explained', 'virtual_rejected'].map((f) => (
                        <td key={f} style={tdStyle}>
                            <span style={{ fontWeight: 600, color: '#1890ff' }}>{getVal('total', f)}</span>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    );

    const renderTable7 = () => (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={2}>№</th>
                    <th style={{ ...thStyle, textAlign: 'left' }} rowSpan={2}>{t('appeals.table7.columns.action_type')}</th>
                    <th style={thStyle} colSpan={2}>{t('appeals.table7.columns.fine')}</th>
                    <th style={thStyle} colSpan={2}>{t('appeals.table7.columns.reprimand')}</th>
                    <th style={thStyle} colSpan={2}>{t('appeals.table7.columns.dismissal')}</th>
                </tr>
                <tr>
                    <th style={thStyle}>{prevYearShort}</th><th style={thStyle}>{currYearShort}</th>
                    <th style={thStyle}>{prevYearShort}</th><th style={thStyle}>{currYearShort}</th>
                    <th style={thStyle}>{prevYearShort}</th><th style={thStyle}>{currYearShort}</th>
                </tr>
            </thead>
            <tbody>
                {APPEALS_T7_ROWS.map((row, ridx) => (
                        <tr key={row.key}>
                            <td style={tdStyle}>{ridx + 1}</td>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{t(row.labelKey)}</td>
                            {['fine_prev', 'fine_curr', 'reprimand_prev', 'reprimand_curr', 'dismissal_prev', 'dismissal_curr'].map((f, fidx) => (
                                <td key={f} style={tdStyle}>
                                    {f.endsWith('_curr') ? (
                                        <span style={{ fontWeight: 600, color: '#1890ff' }}>{getVal(row.key, f)}</span>
                                    ) : (
                                        <EditCell value={getVal(row.key, f)} onChange={v => updateCell(row.key, f, v)} rowIdx={ridx} colIdx={fidx} disabled={isSaving} />
                                    )}
                                </td>
                            ))}
                        </tr>
                ))}
            </tbody>
        </table>
    );

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
