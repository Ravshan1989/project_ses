import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DatePicker, Select, Space, Spin, Card, Tabs } from 'antd';
import { SaveOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import GlassLayout from '../../components/layout/GlassLayout';
import PermissionGate from '../../components/PermissionGate';
import EditCell from '../../components/common/EditCell';
import * as exportService from '../../services/childrenHygieneExportService';

import { thStyle, tdStyle } from './components/HygieneStyles';
import IndicatorCards from './components/IndicatorCards';
import DistrictStatusTable from './components/DistrictStatusTable';
import { useHygieneData } from './hooks/useHygieneData';
import { childrenHygieneApi } from '../../services/api';
import { T1_ROWS } from './components/HygieneConstants';

const { TabPane } = Tabs;

interface Organization {
    id: string;
    name: string;
}

// ─── Regional Indicators Panel ───────────────────────────────────────────────
const IndicatorsPanel: React.FC<{ month: string }> = ({ month }) => {
    const { regionalStatus, isLoadingStatus } = useHygieneData(month, null, '1');
    return (
        <div>
            <IndicatorCards summary={regionalStatus.summary} />
            <Card title={useTranslation().t('children_hygiene.indicators.district_status')} bordered={false} bodyStyle={{ padding: 0 }}>
                <DistrictStatusTable
                    loading={isLoadingStatus}
                    districts={regionalStatus.districts}
                    summary={regionalStatus.summary}
                />
            </Card>
        </div>
    );
};

const ChildrenHygienePage: React.FC = () => {
    const { t } = useTranslation();
    const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('1');

    const isAdmin = localStorage.getItem('user_role') === 'ADMIN' || localStorage.getItem('user_role') === 'EXECUTIVE';
    const isRegionalAdmin = ['ADMIN', 'EXECUTIVE', 'REGIONAL_MUDIR', 'REPUBLIC_HEAD'].includes(localStorage.getItem('user_role') || '');
    const userOrgId = localStorage.getItem('user_org_id');

    const effectiveOrgId = isAdmin ? selectedOrgId : userOrgId;

    const {
        organizations,
        tableData,
        isLoadingTable,
        isSaving,
        saveData,
        refresh
    } = useHygieneData(month, effectiveOrgId, activeTab);

    // To allow editing, we need local state that syncs with tableData
    const [localData, setLocalData] = useState<any[]>([]);
    const lastSyncKey = React.useRef<string>('');

    useEffect(() => {
        const currentKey = `${activeTab}-${month}-${effectiveOrgId}`;
        if (tableData.length > 0 || lastSyncKey.current !== currentKey) {
            setLocalData(tableData);
            lastSyncKey.current = currentKey;
        }
    }, [tableData, activeTab, month, effectiveOrgId]);

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

    const hierarchy: Record<string, string[]> = {
        'total': ['1_1', '1_2', '1_3', '1_4', '1_5', '1_6'],
        '1_1': ['1_1_1', '1_1_1_outsourcing', '1_1_2', '1_1_3', '1_1_4', '1_1_5', '1_1_7', '1_1_8'],
        '1_2': ['1_2_1', '1_2_2', '1_2_3', '1_2_4'],
        '1_3': ['1_3_1', '1_3_2', '1_3_3'],
        '1_4': ['1_4_1'],
        '1_5': ['1_5_1', '1_5_2', '1_5_3'],
        '1_6': ['1_6_1', '1_6_1_pools', '1_6_2', '1_6_3'],
        '1_7': ['1_7_1', '1_7_2', '1_7_3', '1_7_4', '1_7_5', '1_7_6'],
    };

    const getVal = (rowKey: string, field: string): number => {
        if (hierarchy[rowKey]) {
            // Parent: sum its children dynamically
            return hierarchy[rowKey].reduce((sum, childKey) => sum + getVal(childKey, field), 0);
        }
        // Leaf: get from localData
        return localData.find(r => r.row_key === rowKey)?.[field] || 0;
    };

    // Table 1 Percentages
    const getPlanExecution = (rowKey: string) => {
        const total = getVal(rowKey, 'totalSupervisionsConducted');
        const plan = getVal(rowKey, 'supervisionPlan');
        if (!plan) return 0;
        return Number(((total / plan) * 100).toFixed(1));
    };

    const getLabPercent = (rowKey: string) => {
        const lab = getVal(rowKey, 'labSupervisionsCount');
        const total = getVal(rowKey, 'totalSupervisionsConducted');
        if (!total) return 0;
        return Number(((lab / total) * 100).toFixed(1));
    };

    // Table 2 Percentages
    const getT2Percent = (rowKey: string, totalField: string, nonCompliantField: string) => {
        const total = getVal(rowKey, totalField);
        const non = getVal(rowKey, nonCompliantField);
        if (!total) return 0;
        return Number(((non / total) * 100).toFixed(1));
    };

    return (
        <GlassLayout title={t('reports.ch_hygiene')}>
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
                            filterOption={(input, option) => (String(option?.label ?? '')).toLowerCase().includes(input.toLowerCase())}
                        />
                    )}
                    <Button icon={<ReloadOutlined />} onClick={refresh} loading={isLoadingTable}>
                        {t('common.refresh')}
                    </Button>

                    <PermissionGate permission="SUBMIT_REPORT">
                        <Button type="primary" icon={<SaveOutlined />} onClick={() => saveData(localData)} loading={isSaving}>
                            {t('common.save')}
                        </Button>
                    </PermissionGate>

                    <Button
                        icon={<FileExcelOutlined />}
                        onClick={() => {
                            const currentOrg = organizations.find((o: Organization) => o.id === effectiveOrgId)?.name || '---';
                            if (activeTab === '1') exportService.exportTable1Excel(localData, T1_ROWS, month, currentOrg, t);
                            else if (activeTab === '2') exportService.exportTable2Excel(localData, T1_ROWS, month, currentOrg, t);
                            else if (activeTab === '3') exportService.exportTable3Excel(localData, T1_ROWS, month, currentOrg, t);
                            else if (activeTab === '4') exportService.exportTable3_1Excel(localData, T1_ROWS, month, currentOrg, t);
                            else if (activeTab === '5') exportService.exportTable3_2Excel(localData, T1_ROWS, month, currentOrg, t);
                            else if (activeTab === '6') exportService.exportTable4Excel(localData, T1_ROWS, month, currentOrg, t);
                        }}
                        className="glass-button"
                    >
                        Excel
                    </Button>
                    <Button
                        icon={<FilePdfOutlined />}
                        onClick={() => {
                            const currentOrg = organizations.find((o: Organization) => o.id === effectiveOrgId)?.name || '---';
                            if (activeTab === '1') exportService.exportTable1PDF(localData, T1_ROWS, month, currentOrg, t);
                            else if (activeTab === '2') exportService.exportTable2PDF(localData, T1_ROWS, month, currentOrg, t);
                            else if (activeTab === '3') exportService.exportTable3PDF(localData, T1_ROWS, month, currentOrg, t);
                            else if (activeTab === '4') exportService.exportTable3_1PDF(localData, T1_ROWS, month, currentOrg, t);
                            else if (activeTab === '5') exportService.exportTable3_2PDF(localData, T1_ROWS, month, currentOrg, t);
                            else if (activeTab === '6') exportService.exportTable4PDF(localData, T1_ROWS, month, currentOrg, t);
                        }}
                        className="glass-button"
                    >
                        PDF
                    </Button>
                    {isRegionalAdmin && (
                        <Space>
                            <Button
                                icon={<FileExcelOutlined />}
                                onClick={async () => {
                                    if (!effectiveOrgId) return;
                                    const currentOrgSelection = organizations.find((o: Organization) => o.id === effectiveOrgId)?.name || '---';
                                    const allData = await childrenHygieneApi.getAllTables(month, effectiveOrgId);
                                    exportService.exportAllExcel(allData, T1_ROWS, month, currentOrgSelection, t);
                                }}
                                className="glass-button"
                                style={{ borderColor: '#10b981', color: '#059669' }}
                            >
                                {t('common.export_all')} (Excel)
                            </Button>
                            <Button
                                icon={<FilePdfOutlined />}
                                onClick={async () => {
                                    if (!effectiveOrgId) return;
                                    const currentOrgSelection = organizations.find((o: Organization) => o.id === effectiveOrgId)?.name || '---';
                                    const allData = await childrenHygieneApi.getAllTables(month, effectiveOrgId);
                                    exportService.exportAllPDF(allData, T1_ROWS, month, currentOrgSelection, t);
                                }}
                                className="glass-button"
                                style={{ borderColor: '#ef4444', color: '#dc2626' }}
                            >
                                {t('common.export_all')} (PDF)
                            </Button>
                        </Space>
                    )}
                </Space>
            </Card>

            <Tabs
                defaultActiveKey="1"
                className="glass-tabs"
                onChange={setActiveTab}
                destroyInactiveTabPane
            >
                <TabPane tab="1-jadval" key="1">
                    <Spin spinning={isLoadingTable || isSaving}>
                        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, padding: 10 }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1000 }}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>{t('children_hygiene.table1.columns.order')}</th>
                                        <th style={{ ...thStyle, textAlign: 'left', minWidth: 250 }}>{t('children_hygiene.table1.columns.institutions')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table1.columns.institutions_count')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table1.columns.supervision_plan')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table1.columns.total_supervisions')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table1.columns.planned_supervisions')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table1.columns.unplanned_supervisions')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table1.columns.plan_execution_percent')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table1.columns.lab_supervisions')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table1.columns.lab_supervisions_percent')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {T1_ROWS.map((row, ridx) => (
                                        <tr key={row.key} style={{ background: row.bgColor }}>
                                            <td style={tdStyle}>{row.key === 'total' ? 'I' : row.key.replace(/_/g, '.')}</td>
                                            <td style={{
                                                ...tdStyle,
                                                textAlign: 'left',
                                                fontWeight: row.isBold ? 700 : 400,
                                                fontStyle: row.isItalic ? 'italic' : 'normal',
                                                color: row.color,
                                                paddingLeft: row.key.split('_').length * 10
                                            }}>{t(row.labelKey)}</td>
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'institutionsCount')}
                                                    onChange={v => updateCell(row.key, 'institutionsCount', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={0}
                                                />
                                            </td>
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'supervisionPlan')}
                                                    onChange={v => updateCell(row.key, 'supervisionPlan', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={1}
                                                />
                                            </td>
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'totalSupervisionsConducted')}
                                                    onChange={v => updateCell(row.key, 'totalSupervisionsConducted', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={2}
                                                />
                                            </td>
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'plannedSupervisionsConducted')}
                                                    onChange={v => updateCell(row.key, 'plannedSupervisionsConducted', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={3}
                                                />
                                            </td>
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'unplannedSupervisionsConducted')}
                                                    onChange={v => updateCell(row.key, 'unplannedSupervisionsConducted', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={4}
                                                />
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 700, background: '#f8fafc' }}>
                                                {getPlanExecution(row.key)}%
                                            </td>
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'labSupervisionsCount')}
                                                    onChange={v => updateCell(row.key, 'labSupervisionsCount', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={5}
                                                />
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 700, background: '#f8fafc' }}>
                                                {getLabPercent(row.key)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Spin>
                </TabPane>

                <TabPane tab="2-jadval" key="2">
                    <Spin spinning={isLoadingTable || isSaving}>
                        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, padding: 10 }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1000 }}>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} style={thStyle}>{t('children_hygiene.table1.columns.order')}</th>
                                        <th rowSpan={2} style={{ ...thStyle, textAlign: 'left', minWidth: 250 }}>{t('children_hygiene.table1.columns.institutions')}</th>
                                        <th colSpan={3} style={thStyle}>{t('children_hygiene.table2.columns.chem')}</th>
                                        <th colSpan={3} style={thStyle}>{t('children_hygiene.table2.columns.bact')}</th>
                                        <th colSpan={3} style={thStyle}>{t('children_hygiene.table2.columns.para')}</th>
                                    </tr>
                                    <tr>
                                        <th style={thStyle}>{t('children_hygiene.table2.columns.total')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table2.columns.non_compliant')}</th>
                                        <th style={thStyle}>%</th>
                                        <th style={thStyle}>{t('children_hygiene.table2.columns.total')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table2.columns.non_compliant')}</th>
                                        <th style={thStyle}>%</th>
                                        <th style={thStyle}>{t('children_hygiene.table2.columns.total')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table2.columns.non_compliant')}</th>
                                        <th style={thStyle}>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {T1_ROWS.map((row, ridx) => (
                                        <tr key={row.key} style={{ background: row.bgColor }}>
                                            <td style={tdStyle}>{row.key === 'total' ? 'I' : row.key.replace(/_/g, '.')}</td>
                                            <td style={{
                                                ...tdStyle,
                                                textAlign: 'left',
                                                fontWeight: row.isBold ? 700 : 400,
                                                fontStyle: row.isItalic ? 'italic' : 'normal',
                                                color: row.color,
                                                paddingLeft: row.key.split('_').length * 10
                                            }}>{t(row.labelKey)}</td>

                                            {/* Chemical */}
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'chemTotal')}
                                                    onChange={v => updateCell(row.key, 'chemTotal', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={0}
                                                />
                                            </td>
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'chemNonCompliant')}
                                                    onChange={v => updateCell(row.key, 'chemNonCompliant', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={1}
                                                />
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 700, background: '#f8fafc' }}>
                                                {getT2Percent(row.key, 'chemTotal', 'chemNonCompliant')}%
                                            </td>

                                            {/* Bacteriology */}
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'bactTotal')}
                                                    onChange={v => updateCell(row.key, 'bactTotal', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={2}
                                                />
                                            </td>
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'bactNonCompliant')}
                                                    onChange={v => updateCell(row.key, 'bactNonCompliant', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={3}
                                                />
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 700, background: '#f8fafc' }}>
                                                {getT2Percent(row.key, 'bactTotal', 'bactNonCompliant')}%
                                            </td>

                                            {/* Parasitology */}
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'paraTotal')}
                                                    onChange={v => updateCell(row.key, 'paraTotal', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={4}
                                                />
                                            </td>
                                            <td style={tdStyle}>
                                                <EditCell
                                                    value={getVal(row.key, 'paraNonCompliant')}
                                                    onChange={v => updateCell(row.key, 'paraNonCompliant', v)}
                                                    disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                    rowIdx={ridx}
                                                    colIdx={5}
                                                />
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 700, background: '#f8fafc' }}>
                                                {getT2Percent(row.key, 'paraTotal', 'paraNonCompliant')}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Spin>
                </TabPane>
                <TabPane tab="3-jadval" key="3">
                    <Spin spinning={isLoadingTable || isSaving}>
                        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, padding: 10 }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1500 }}>
                                <thead>
                                    <tr>
                                        <th rowSpan={3} style={thStyle}>№</th>
                                        <th rowSpan={3} style={{ ...thStyle, textAlign: 'left', minWidth: 200 }}>{t('children_hygiene.table1.columns.institutions')}</th>
                                        <th colSpan={5} style={thStyle}>{t('children_hygiene.table3.columns.air')}</th>
                                        <th colSpan={3} style={thStyle}>{t('children_hygiene.table3.columns.micro')}</th>
                                        <th colSpan={3} style={thStyle}>{t('children_hygiene.table3.columns.vib')}</th>
                                        <th colSpan={3} style={thStyle}>{t('children_hygiene.table3.columns.emf')}</th>
                                        <th colSpan={3} style={thStyle}>{t('children_hygiene.table3.columns.light')}</th>
                                        <th colSpan={3} style={thStyle}>{t('children_hygiene.table3.columns.noise')}</th>
                                    </tr>
                                    <tr>
                                        {/* Air */}
                                        <th rowSpan={2} style={thStyle}>{t('children_hygiene.table3.columns.inspected_count')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3.columns.samples_total')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3.columns.rem')}</th>

                                        {/* Others */}
                                        {['micro', 'vib', 'emf', 'light', 'noise'].map(cat => (
                                            <React.Fragment key={cat}>
                                                <th rowSpan={2} style={thStyle}>{t('children_hygiene.table3.columns.inspected_count')}</th>
                                                <th rowSpan={2} style={thStyle}>{t('children_hygiene.table3.columns.samples_total')}</th>
                                                <th rowSpan={2} style={thStyle}>{t('children_hygiene.table3.columns.non_compliant')}</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                    <tr>
                                        {/* Air sub-headers */}
                                        <th style={thStyle}>{t('children_hygiene.table3.columns.total')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table3.columns.samples_12k')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table3.columns.total')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table3.columns.samples_12k')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {T1_ROWS.map((row, ridx) => (
                                        <tr key={row.key} style={{ background: row.bgColor }}>
                                            <td style={tdStyle}>{row.key === 'total' ? 'I' : row.key.replace(/_/g, '.')}</td>
                                            <td style={{
                                                ...tdStyle,
                                                textAlign: 'left',
                                                fontWeight: row.isBold ? 700 : 400,
                                                fontStyle: row.isItalic ? 'italic' : 'normal',
                                                color: row.color,
                                                paddingLeft: row.key.split('_').length * 10
                                            }}>{t(row.labelKey)}</td>

                                            {/* Air Cells */}
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'airInspectedCount')} onChange={v => updateCell(row.key, 'airInspectedCount', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={0} /></td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'airSamplesTotal')} onChange={v => updateCell(row.key, 'airSamplesTotal', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={1} /></td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'airSamples12k')} onChange={v => updateCell(row.key, 'airSamples12k', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={2} /></td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'airRemExceededTotal')} onChange={v => updateCell(row.key, 'airRemExceededTotal', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={3} /></td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'airRemExceeded12k')} onChange={v => updateCell(row.key, 'airRemExceeded12k', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={4} /></td>

                                            {/* Category Cells */}
                                            {([
                                                { p: 'micro', fields: ['microInspectedCount', 'microSamplesTotal', 'microSamplesNonCompliant'] },
                                                { p: 'vib', fields: ['vibInspectedCount', 'vibSamplesTotal', 'vibSamplesNonCompliant'] },
                                                { p: 'emf', fields: ['emfInspectedCount', 'emfSamplesTotal', 'emfSamplesNonCompliant'] },
                                                { p: 'light', fields: ['lightInspectedCount', 'lightSamplesTotal', 'lightSamplesNonCompliant'] },
                                                { p: 'noise', fields: ['noiseInspectedCount', 'noiseSamplesTotal', 'noiseSamplesNonCompliant'] }
                                            ]).map((cat, cidx) => (
                                                <React.Fragment key={cat.p}>
                                                    {cat.fields.map((f, fidx) => (
                                                        <td key={f} style={tdStyle}>
                                                            <EditCell
                                                                value={getVal(row.key, f)}
                                                                onChange={v => updateCell(row.key, f, v)}
                                                                disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                                rowIdx={ridx}
                                                                colIdx={5 + (cidx * 3) + fidx}
                                                            />
                                                        </td>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Spin>
                </TabPane>
                <TabPane tab="3.1-jadval" key="4">
                    <Spin spinning={isLoadingTable || isSaving}>
                        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, padding: 10 }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 2000 }}>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} style={thStyle}>№</th>
                                        <th rowSpan={2} style={{ ...thStyle, textAlign: 'left', minWidth: 200 }}>{t('children_hygiene.table1.columns.institutions')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3_1.columns.ration')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3_1.columns.salt')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3_1.columns.nitrate')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3_1.columns.toxic')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3_1.columns.thermal')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3_1.columns.mineral')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3_1.columns.soil')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3_1.columns.water')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3_1.columns.pesticide')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table3_1.columns.nutrition')}</th>
                                    </tr>
                                    <tr>
                                        {[...Array(10)].map((_, i) => (
                                            <React.Fragment key={i}>
                                                <th style={thStyle}>{t('children_hygiene.table3_1.columns.total')}</th>
                                                <th style={thStyle}>{t('children_hygiene.table3_1.columns.non_compliant')}</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {T1_ROWS.map((row, ridx) => (
                                        <tr key={row.key} style={{ background: row.bgColor }}>
                                            <td style={tdStyle}>{row.key === 'total' ? 'I' : row.key.replace(/_/g, '.')}</td>
                                            <td style={{
                                                ...tdStyle,
                                                textAlign: 'left',
                                                fontWeight: row.isBold ? 700 : 400,
                                                fontStyle: row.isItalic ? 'italic' : 'normal',
                                                color: row.color,
                                                paddingLeft: row.key.split('_').length * 10
                                            }}>{t(row.labelKey)}</td>

                                            {[
                                                'ration', 'salt', 'nitrate', 'toxic', 'thermal',
                                                'mineral', 'soil', 'water', 'pesticide', 'nutrition'
                                            ].map((cat, cidx) => (
                                                <React.Fragment key={cat}>
                                                    <td style={tdStyle}>
                                                        <EditCell
                                                            value={getVal(row.key, `${cat}Total`)}
                                                            onChange={v => updateCell(row.key, `${cat}Total`, v)}
                                                            disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                            rowIdx={ridx}
                                                            colIdx={cidx * 2}
                                                        />
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <EditCell
                                                            value={getVal(row.key, `${cat}NonCompliant`)}
                                                            onChange={v => updateCell(row.key, `${cat}NonCompliant`, v)}
                                                            disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                            rowIdx={ridx}
                                                            colIdx={cidx * 2 + 1}
                                                        />
                                                    </td>
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Spin>
                </TabPane>
                <TabPane tab="3.2-jadval" key="5">
                    <Spin spinning={isLoadingTable || isSaving}>
                        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, padding: 10 }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1400 }}>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} style={thStyle}>№</th>
                                        <th rowSpan={2} style={{ ...thStyle, textAlign: 'left', minWidth: 200 }}>{t('children_hygiene.table1.columns.institutions')}</th>
                                        <th colSpan={6} style={thStyle}>{t('children_hygiene.table3_2.columns.para')}</th>
                                        <th colSpan={8} style={thStyle}>{t('children_hygiene.table3_2.columns.micro')}</th>
                                    </tr>
                                    <tr>
                                        {/* Parasitological sub-columns */}
                                        {[
                                            t('children_hygiene.table3_2.columns.para_veg'),
                                            t('children_hygiene.table3_2.columns.para_water'),
                                            t('children_hygiene.table3_2.columns.para_soil'),
                                        ].map(label => (
                                            <React.Fragment key={label}>
                                                <th style={thStyle}>{label}<br />{t('children_hygiene.table3_2.columns.total')}</th>
                                                <th style={thStyle}>{label}<br />{t('children_hygiene.table3_2.columns.non_compliant')}</th>
                                            </React.Fragment>
                                        ))}
                                        {/* Microbiological sub-columns */}
                                        {[
                                            t('children_hygiene.table3_2.columns.micro_smear'),
                                            t('children_hygiene.table3_2.columns.micro_food'),
                                            t('children_hygiene.table3_2.columns.micro_water'),
                                            t('children_hygiene.table3_2.columns.micro_soil'),
                                        ].map(label => (
                                            <React.Fragment key={label}>
                                                <th style={thStyle}>{label}<br />{t('children_hygiene.table3_2.columns.total')}</th>
                                                <th style={thStyle}>{label}<br />{t('children_hygiene.table3_2.columns.non_compliant')}</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {T1_ROWS.map((row, ridx) => (
                                        <tr key={row.key} style={{ background: row.bgColor }}>
                                            <td style={tdStyle}>{row.key === 'total' ? 'I' : row.key.replace(/_/g, '.')}</td>
                                            <td style={{
                                                ...tdStyle,
                                                textAlign: 'left',
                                                fontWeight: row.isBold ? 700 : 400,
                                                fontStyle: row.isItalic ? 'italic' : 'normal',
                                                color: row.color,
                                                paddingLeft: row.key.split('_').length * 10
                                            }}>{t(row.labelKey)}</td>

                                            {[
                                                'paraVeg', 'paraWater', 'paraSoil',
                                                'microSmear', 'microFood', 'microWater', 'microSoil'
                                            ].map((cat, cidx) => (
                                                <React.Fragment key={cat}>
                                                    <td style={tdStyle}>
                                                        <EditCell
                                                            value={getVal(row.key, `${cat}Total`)}
                                                            onChange={v => updateCell(row.key, `${cat}Total`, v)}
                                                            disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                            rowIdx={ridx}
                                                            colIdx={cidx * 2}
                                                        />
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <EditCell
                                                            value={getVal(row.key, `${cat}NonCompliant`)}
                                                            onChange={v => updateCell(row.key, `${cat}NonCompliant`, v)}
                                                            disabled={isLoadingTable || isSaving || !!hierarchy[row.key]}
                                                            rowIdx={ridx}
                                                            colIdx={cidx * 2 + 1}
                                                        />
                                                    </td>
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Spin>
                </TabPane>
                <TabPane tab="4-jadval" key="6">
                    <Spin spinning={isLoadingTable || isSaving}>
                        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, padding: 10 }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1200 }}>
                                <thead>
                                    <tr>
                                        <th rowSpan={3} style={thStyle}>No</th>
                                        <th rowSpan={3} style={{ ...thStyle, textAlign: 'left', minWidth: 200 }}>{t('children_hygiene.table1.columns.institutions')}</th>
                                        <th colSpan={4} style={thStyle}>{t('children_hygiene.table4.columns.fines')}</th>
                                        <th rowSpan={3} style={thStyle}>{t('children_hygiene.table4.columns.activity_suspended')}</th>
                                        <th rowSpan={3} style={thStyle}>{t('children_hygiene.table4.columns.employees_suspended')}</th>
                                        <th rowSpan={3} style={thStyle}>{t('children_hygiene.table4.columns.referred_to_investigation')}</th>
                                        <th rowSpan={3} style={thStyle}>{t('children_hygiene.table4.columns.brakera')}</th>
                                    </tr>
                                    <tr>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table4.columns.fine_count')}</th>
                                        <th colSpan={2} style={thStyle}>{t('children_hygiene.table4.columns.fine_amount')}</th>
                                    </tr>
                                    <tr>
                                        <th style={thStyle}>{t('children_hygiene.table4.columns.imposed')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table4.columns.collected')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table4.columns.imposed')}</th>
                                        <th style={thStyle}>{t('children_hygiene.table4.columns.collected')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {T1_ROWS.map((row, ridx) => (
                                        <tr key={row.key} style={{ background: row.bgColor }}>
                                            <td style={tdStyle}>{row.key === 'total' ? '1' : row.key.replace(/_/g, '.')}</td>
                                            <td style={{
                                                ...tdStyle,
                                                textAlign: 'left',
                                                fontWeight: row.isBold ? 700 : 400,
                                                fontStyle: row.isItalic ? 'italic' : 'normal',
                                                color: row.color,
                                                paddingLeft: row.key.split('_').length * 10
                                            }}>{t(row.labelKey)}</td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'fineCountImposed')} onChange={v => updateCell(row.key, 'fineCountImposed', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={0} /></td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'fineCountCollected')} onChange={v => updateCell(row.key, 'fineCountCollected', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={1} /></td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'fineAmountImposed')} onChange={v => updateCell(row.key, 'fineAmountImposed', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={2} /></td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'fineAmountCollected')} onChange={v => updateCell(row.key, 'fineAmountCollected', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={3} /></td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'activitySuspended')} onChange={v => updateCell(row.key, 'activitySuspended', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={4} /></td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'employeesSuspended')} onChange={v => updateCell(row.key, 'employeesSuspended', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={5} /></td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'referredToInvestigation')} onChange={v => updateCell(row.key, 'referredToInvestigation', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={6} /></td>
                                            <td style={tdStyle}><EditCell value={getVal(row.key, 'brakera')} onChange={v => updateCell(row.key, 'brakera', v)} disabled={isLoadingTable || isSaving || !!hierarchy[row.key]} rowIdx={ridx} colIdx={7} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Spin>
                </TabPane>
                {isRegionalAdmin && (
                    <TabPane tab="📊 Indikatorlar" key="7">
                        <IndicatorsPanel month={month} />
                    </TabPane>
                )}
            </Tabs>
        </GlassLayout>
    );
};

export default ChildrenHygienePage;
