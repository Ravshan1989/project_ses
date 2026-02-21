import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DatePicker, notification, Select, Space, Spin, Card, Tabs, Input, Tooltip } from 'antd';
import { SaveOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { kommunalHygieneApi, organizationsApi } from '../../services/api';
import GlassLayout from '../../components/layout/GlassLayout';
import PermissionGate from '../../components/PermissionGate';

const { TabPane } = Tabs;

// ─── Shared styles ────────────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
    border: '1px solid #d1d5db',
    padding: '4px 6px',
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'center',
    verticalAlign: 'middle',
    background: '#f8fafc',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    lineHeight: 1.3,
};

const tdStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    padding: '2px 4px',
    fontSize: 10,
    textAlign: 'center',
    verticalAlign: 'middle',
    minWidth: 38,
};

// ─── Helper: text that wraps inside a fixed-width cell ────────────────────────
const TW = ({ label, width }: { label: string; width: number }) => (
    <div style={{ width, wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: 1.3, margin: '0 auto' }}>{label}</div>
);

// ─── EditCell: click to edit number ──────────────────────────────────────────
const EditCell = ({ value, onChange, readOnly }: { value: number; onChange: (v: number) => void; readOnly: boolean }) => {
    const [editing, setEditing] = useState(false);
    const [local, setLocal] = useState(String(value));
    useEffect(() => { setLocal(String(value)); }, [value]);
    if (readOnly) return <span style={{ fontSize: 10 }}>{value}</span>;
    if (editing) return (
        <input
            autoFocus
            value={local}
            onChange={e => setLocal(e.target.value)}
            onBlur={() => { setEditing(false); onChange(Number(local) || 0); }}
            onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); onChange(Number(local) || 0); } }}
            style={{ width: 48, fontSize: 10, textAlign: 'center', border: '1px solid #3b82f6', borderRadius: 2, outline: 'none' }}
        />
    );
    return (
        <span onClick={() => setEditing(true)} style={{ cursor: 'pointer', fontSize: 10, display: 'block', minWidth: 28, minHeight: 16, color: value === 0 ? '#94a3b8' : '#111' }}>
            {value}
        </span>
    );
};

const EditTextCell = ({ value, onChange, readOnly, textAlign = 'left' }: { value: string; onChange: (v: string) => void; readOnly: boolean, textAlign?: 'left' | 'center' | 'right' }) => {
    const [editing, setEditing] = useState(false);
    const [local, setLocal] = useState(value);
    useEffect(() => { setLocal(value); }, [value]);
    if (readOnly) return <span style={{ fontSize: 10 }}>{value}</span>;
    if (editing) return (
        <Input
            autoFocus
            size="small"
            value={local}
            onChange={e => setLocal(e.target.value)}
            onBlur={() => { setEditing(false); onChange(local); }}
            onPressEnter={() => { setEditing(false); onChange(local); }}
            style={{ fontSize: 10, textAlign }}
        />
    );
    return (
        <span onClick={() => setEditing(true)} style={{ cursor: 'pointer', fontSize: 10, display: 'block', minHeight: 16, color: !value ? '#94a3b8' : '#111', textAlign, padding: '0 4px' }}>
            {value || '...'}
        </span>
    );
};

// ─── Table 1 ─────────────────────────────────────────────────────────────────
const ROW_TYPES = [
    { key: 'kommunal', labelKey: 'kommunal_hygiene.rows.kommunal' },
    { key: 'kommunal_norm', labelKey: 'kommunal_hygiene.rows.kommunal_norm' },
    { key: 'departmental', labelKey: 'kommunal_hygiene.rows.departmental' },
    { key: 'departmental_norm', labelKey: 'kommunal_hygiene.rows.departmental_norm' },
];

const NUM_FIELDS_T1 = [
    'chem_total',
    'chem_src_manba', 'chem_src_tarmok_oldin', 'chem_src_tarmok_point', 'chem_src_consumer',
    'chem_bad_ammiak', 'chem_bad_nitrat', 'chem_bad_nitrit', 'chem_bad_qoldiq', 'chem_bad_xlorid',
    'chem_bad_sulfat', 'chem_bad_loyqa', 'chem_bad_qattiq', 'chem_bad_other',
    'total_inspected_samples',
    'bact_src_manba', 'bact_src_tarmok_oldin', 'bact_src_tarmok_point', 'bact_src_consumer',
    'bact_bad_umc', 'bact_bad_koli', 'bact_bad_sfz'
];

const emptyRowT1 = (rt: string) => {
    const r: any = { row_type: rt };
    for (const f of NUM_FIELDS_T1) r[f] = 0;
    return r;
};

// ─── Table 2 ─────────────────────────────────────────────────────────────────
const emptyRowT2 = () => ({
    water_body_name: '',
    object_name: '',
    treatment_system: '',
    disinfection: '',
    chem_before_total: 0,
    chem_before_bad: 0,
    chem_after_total: 0,
    chem_after_bad: 0,
    chem_efficiency: 0,
    bact_before_total: 0,
    bact_before_bad: 0,
    bact_after_total: 0,
    bact_after_bad: 0,
    bact_efficiency: 0,
});

// ─── Table 3 ─────────────────────────────────────────────────────────────────
const emptyRowT3 = () => ({
    water_body_name: '',
    category: '',
    samples_taken: 0,
    samples_bad: 0,
    pathogen_inf_disease: 0,
    pathogen_cholera: 0,
    pathogen_parasite: 0,
    chem_samples_total: 0,
    chem_pesticide_presence: 0,
    chem_bad_total: 0,
    chem_bad_pesticide: 0,
});

// ─── Status Indicator Component ───────────────────────────────────────────────
const StatusDot: React.FC<{ status: boolean; tooltip: string }> = ({ status, tooltip }) => (
    <Tooltip title={tooltip}>
        <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: status ? '#22c55e' : '#ef4444',
            display: 'inline-block',
            margin: '0 auto',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            cursor: 'default'
        }} />
    </Tooltip>
);

// ─── Regional Monitoring Section (Traffic Light System) ──────────────────────
const RegionalStatusPanel: React.FC<{ month: any }> = ({ month }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [statusData, setStatusData] = useState<{ districts: any[], summary: any }>({ districts: [], summary: {} });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await kommunalHygieneApi.getRegionalStatus(month.format('YYYY-MM'));
            setStatusData(res.data || { districts: [], summary: {} });
        } catch (e) {
            notification.error({ message: t('common.error_load_data') });
        } finally {
            setLoading(false);
        }
    }, [month, t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const { districts, summary } = statusData;

    return (
        <Card title={t('kommunal_hygiene.regional_indicators.title')} bordered={false}>
            <div style={{ overflowX: 'auto' }}>
                <Spin spinning={loading}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>{t('kommunal_hygiene.regional_indicators.district')}</th>
                                <th style={thStyle}>{t('kommunal_hygiene.regional_indicators.t1')}</th>
                                <th style={thStyle}>{t('kommunal_hygiene.regional_indicators.t2')}</th>
                                <th style={thStyle}>{t('kommunal_hygiene.regional_indicators.t3')}</th>
                                <th style={thStyle}>{t('kommunal_hygiene.regional_indicators.total_samples')}</th>
                                <th style={thStyle}>{t('kommunal_hygiene.regional_indicators.bad_count')}</th>
                                <th style={thStyle}>{t('kommunal_hygiene.regional_indicators.compliance')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {districts.map(row => (
                                <tr key={row.id}>
                                    <td style={{ ...tdStyle, textAlign: 'left', padding: '8px' }}>{row.name}</td>
                                    <td style={tdStyle}>
                                        <StatusDot status={row.t1} tooltip={row.t1 ? t('kommunal_hygiene.regional_indicators.status_submitted') : t('kommunal_hygiene.regional_indicators.status_pending')} />
                                    </td>
                                    <td style={tdStyle}>
                                        <StatusDot status={row.t2} tooltip={row.t2 ? t('kommunal_hygiene.regional_indicators.status_submitted') : t('kommunal_hygiene.regional_indicators.status_pending')} />
                                    </td>
                                    <td style={tdStyle}>
                                        <StatusDot status={row.t3} tooltip={row.t3 ? t('kommunal_hygiene.regional_indicators.status_submitted') : t('kommunal_hygiene.regional_indicators.status_pending')} />
                                    </td>
                                    <td style={tdStyle}>{row.totalSamples}</td>
                                    <td style={tdStyle}>{row.totalBad}</td>
                                    <td style={{ ...tdStyle, fontWeight: 700, color: Number(row.badPercent) > 10 ? '#ef4444' : '#111' }}>
                                        {row.totalSamples === 0 ? '-' : `${(100 - Number(row.badPercent)).toFixed(1)}%`}
                                    </td>
                                </tr>
                            ))}
                            {/* Regional Aggregation Row */}
                            {districts.length > 0 && (
                                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                                    <td colSpan={4} style={{ ...tdStyle, textAlign: 'right', padding: '8px 12px' }}>
                                        {t('kommunal_hygiene.regional_indicators.regional_totals')}:
                                    </td>
                                    <td style={tdStyle}>{summary.totalSamples || 0}</td>
                                    <td style={tdStyle}>{summary.totalBad || 0}</td>
                                    <td style={{ ...tdStyle, color: Number(summary.badPercent) > 10 ? '#ef4444' : '#111' }}>
                                        {summary.totalSamples === 0 ? '-' : `${(100 - Number(summary.badPercent)).toFixed(1)}%`}
                                    </td>
                                </tr>
                            )}
                            {districts.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} style={{ ...tdStyle, padding: 24, color: '#94a3b8' }}>{t('common.no_data')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Spin>
            </div>
        </Card>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const KommunalGigiyenaWaterPage: React.FC = () => {
    const { t } = useTranslation();
    const [month, setMonth] = useState(dayjs());
    const [orgId, setOrgId] = useState<string>('');
    const [orgs, setOrgs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('1');

    const userRole = (localStorage.getItem('user_role') || '').toUpperCase();
    const isRegionalAdmin = ['REGIONAL_MUDIR', 'EXECUTIVE', 'SUPER_ADMIN', 'ADMIN'].includes(userRole);
    const userOrgId = localStorage.getItem('user_org_id') || '';
    const isAdmin = ['ADMIN', 'REPUBLIC_HEAD', 'REGION_HEAD'].includes(userRole);
    const canEdit = ['SANITARY_SPECIALIST', 'SANITARY_OPERATOR', 'ADMIN'].includes(userRole);

    // Table 1 state
    const [dataT1, setDataT1] = useState<Record<string, any>>({});
    const [loadingT1, setLoadingT1] = useState(false);

    // Table 2 state
    const [rowsT2, setRowsT2] = useState<any[]>([emptyRowT2()]);
    const [loadingT2, setLoadingT2] = useState(false);

    // Table 3 state
    const [rowsT3, setRowsT3] = useState<any[]>([emptyRowT3()]);
    const [loadingT3, setLoadingT3] = useState(false);

    const [saving, setSaving] = useState(false);

    // ── Fetch orgs ────────────────────────────────────────────────────────────
    useEffect(() => {
        organizationsApi.getAll().then(res => {
            const list = (res.data || []).filter((o: any) => !!o.parent);
            setOrgs(list);
            if (!isAdmin && userOrgId) setOrgId(userOrgId);
            else if (list.length > 0 && !orgId) setOrgId(list[0].id);
        });
    }, []);

    // ── Fetch Table 1 ─────────────────────────────────────────────────────────
    const fetchDataT1 = useCallback(async () => {
        if (!orgId) return;
        setLoadingT1(true);
        try {
            const res = await kommunalHygieneApi.getWaterByMonth(month.format('YYYY-MM'), orgId);
            const map: Record<string, any> = {};
            for (const rt of ROW_TYPES) {
                const found = (res.data || []).find((r: any) => r.row_type === rt.key);
                map[rt.key] = found ? { ...found } : emptyRowT1(rt.key);
            }
            setDataT1(map);
        } catch {
            notification.error({ message: t('common.error_load_data') });
        } finally {
            setLoadingT1(false);
        }
    }, [month, orgId, t]);

    // ── Fetch Table 2 ─────────────────────────────────────────────────────────
    const fetchDataT2 = useCallback(async () => {
        if (!orgId) return;
        setLoadingT2(true);
        try {
            const res = await kommunalHygieneApi.getOpenWaterByMonth(month.format('YYYY-MM'), orgId);
            setRowsT2(res.data && res.data.length > 0 ? res.data : [emptyRowT2()]);
        } catch {
            notification.error({ message: t('common.error_load_data') });
        } finally {
            setLoadingT2(false);
        }
    }, [month, orgId, t]);

    // ── Fetch Table 3 ─────────────────────────────────────────────────────────
    const fetchDataT3 = useCallback(async () => {
        if (!orgId) return;
        setLoadingT3(true);
        try {
            const res = await kommunalHygieneApi.getWaterUsageByMonth(month.format('YYYY-MM'), orgId);
            setRowsT3(res.data && res.data.length > 0 ? res.data : [emptyRowT3()]);
        } catch {
            notification.error({ message: t('common.error_load_data') });
        } finally {
            setLoadingT3(false);
        }
    }, [month, orgId, t]);

    const fetchAll = useCallback(() => {
        fetchDataT1();
        fetchDataT2();
        fetchDataT3();
    }, [fetchDataT1, fetchDataT2, fetchDataT3]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Save handlers ─────────────────────────────────────────────────────────
    const handleSaveT1 = async () => {
        for (const rt of ROW_TYPES) {
            await kommunalHygieneApi.saveWaterRow({
                ...dataT1[rt.key],
                organizationId: orgId,
                reportMonth: month.format('YYYY-MM'),
                row_type: rt.key,
            });
        }
    };

    const handleSaveT2 = async () => {
        await kommunalHygieneApi.saveOpenWaterRows({
            rows: rowsT2.filter(r => r.water_body_name || r.object_name),
            month: month.format('YYYY-MM'),
            organizationId: orgId,
        });
    };

    const handleSaveT3 = async () => {
        await kommunalHygieneApi.saveWaterUsageRows({
            rows: rowsT3.filter(r => r.water_body_name || r.category),
            month: month.format('YYYY-MM'),
            organizationId: orgId,
        });
    };

    const handleGlobalSave = async () => {
        setSaving(true);
        try {
            if (activeTab === '1') await handleSaveT1();
            else if (activeTab === '2') await handleSaveT2();
            else await handleSaveT3();
            notification.success({ message: t('common.success_save') });
            fetchAll();
        } catch {
            notification.error({ message: t('common.error_save') });
        } finally {
            setSaving(false);
        }
    };

    // ── Table 1 helpers ───────────────────────────────────────────────────────
    const handleChangeT1 = (rowType: string, field: string, val: number) => {
        setDataT1(prev => {
            const row = { ...prev[rowType], [field]: val };

            // Auto-calculate Chemical Total (columns 2-5)
            if (['chem_src_manba', 'chem_src_tarmok_oldin', 'chem_src_tarmok_point', 'chem_src_consumer'].includes(field)) {
                row.chem_total = (Number(row.chem_src_manba) || 0) +
                    (Number(row.chem_src_tarmok_oldin) || 0) +
                    (Number(row.chem_src_tarmok_point) || 0) +
                    (Number(row.chem_src_consumer) || 0);
            }

            // Auto-calculate Bacteriological Total (columns 2-5)
            if (['bact_src_manba', 'bact_src_tarmok_oldin', 'bact_src_tarmok_point', 'bact_src_consumer'].includes(field)) {
                row.total_inspected_samples = (Number(row.bact_src_manba) || 0) +
                    (Number(row.bact_src_tarmok_oldin) || 0) +
                    (Number(row.bact_src_tarmok_point) || 0) +
                    (Number(row.bact_src_consumer) || 0);
            }

            return { ...prev, [rowType]: row };
        });
    };

    const jamiKI = useMemo(() => NUM_FIELDS_T1.reduce((acc, f) => {
        acc[f] = ['kommunal', 'departmental'].reduce((s, key) => s + (Number(dataT1[key]?.[f]) || 0), 0);
        return acc;
    }, {} as Record<string, number>), [dataT1]);

    const jamiTJB = useMemo(() => NUM_FIELDS_T1.reduce((acc, f) => {
        acc[f] = ['kommunal_norm', 'departmental_norm'].reduce((s, key) => s + (Number(dataT1[key]?.[f]) || 0), 0);
        return acc;
    }, {} as Record<string, number>), [dataT1]);

    // ── Table 2 helpers ───────────────────────────────────────────────────────
    const handleChangeT2 = (idx: number, field: string, val: any) => {
        const rows = [...rowsT2];
        rows[idx] = { ...rows[idx], [field]: val };
        // Auto-calculate samaradorlik
        if (field.startsWith('chem') || field.startsWith('bact')) {
            const prefix = field.startsWith('chem') ? 'chem' : 'bact';
            const before = Number(rows[idx][`${prefix}_before_bad`]) || 0;
            const after = Number(rows[idx][`${prefix}_after_bad`]) || 0;
            rows[idx][`${prefix}_efficiency`] = before > 0
                ? Number(((before - after) / before * 100).toFixed(1))
                : 0;
        }
        setRowsT2(rows);
    };

    const addRowT2 = () => setRowsT2([...rowsT2, emptyRowT2()]);
    const removeRowT2 = (idx: number) => setRowsT2(rowsT2.filter((_, i) => i !== idx));

    // ── Table 3 helpers ───────────────────────────────────────────────────────
    const handleChangeT3 = (idx: number, field: string, val: any) => {
        const rows = [...rowsT3];
        rows[idx] = { ...rows[idx], [field]: val };
        setRowsT3(rows);
    };

    const addRowT3 = () => setRowsT3([...rowsT3, emptyRowT3()]);
    const removeRowT3 = (idx: number) => setRowsT3(rowsT3.filter((_, i) => i !== idx));

    // ЖАМИ row for Table 2
    const jamiT2 = useMemo(() => rowsT2.reduce((acc, r) => ({
        chem_before_total: acc.chem_before_total + (Number(r.chem_before_total) || 0),
        chem_before_bad: acc.chem_before_bad + (Number(r.chem_before_bad) || 0),
        chem_after_total: acc.chem_after_total + (Number(r.chem_after_total) || 0),
        chem_after_bad: acc.chem_after_bad + (Number(r.chem_after_bad) || 0),
        bact_before_total: acc.bact_before_total + (Number(r.bact_before_total) || 0),
        bact_before_bad: acc.bact_before_bad + (Number(r.bact_before_bad) || 0),
        bact_after_total: acc.bact_after_total + (Number(r.bact_after_total) || 0),
        bact_after_bad: acc.bact_after_bad + (Number(r.bact_after_bad) || 0),
    }), {
        chem_before_total: 0, chem_before_bad: 0, chem_after_total: 0, chem_after_bad: 0,
        bact_before_total: 0, bact_before_bad: 0, bact_after_total: 0, bact_after_bad: 0
    }), [rowsT2]);

    const jamiChemEff = useMemo(() => jamiT2.chem_before_bad > 0
        ? ((jamiT2.chem_before_bad - jamiT2.chem_after_bad) / jamiT2.chem_before_bad * 100).toFixed(1)
        : '0.0', [jamiT2]);
    const jamiBactEff = useMemo(() => jamiT2.bact_before_bad > 0
        ? ((jamiT2.bact_before_bad - jamiT2.bact_after_bad) / jamiT2.bact_before_bad * 100).toFixed(1)
        : '0.0', [jamiT2]);

    // ЖАМИ row for Table 3
    const jamiT3 = useMemo(() => rowsT3.reduce((acc, r) => ({
        samples_taken: acc.samples_taken + (Number(r.samples_taken) || 0),
        samples_bad: acc.samples_bad + (Number(r.samples_bad) || 0),
        pathogen_inf_disease: acc.pathogen_inf_disease + (Number(r.pathogen_inf_disease) || 0),
        pathogen_cholera: acc.pathogen_cholera + (Number(r.pathogen_cholera) || 0),
        pathogen_parasite: acc.pathogen_parasite + (Number(r.pathogen_parasite) || 0),
        chem_samples_total: acc.chem_samples_total + (Number(r.chem_samples_total) || 0),
        chem_pesticide_presence: acc.chem_pesticide_presence + (Number(r.chem_pesticide_presence) || 0),
        chem_bad_total: acc.chem_bad_total + (Number(r.chem_bad_total) || 0),
        chem_bad_pesticide: acc.chem_bad_pesticide + (Number(r.chem_bad_pesticide) || 0),
    }), {
        samples_taken: 0, samples_bad: 0, pathogen_inf_disease: 0, pathogen_cholera: 0, pathogen_parasite: 0,
        chem_samples_total: 0, chem_pesticide_presence: 0, chem_bad_total: 0, chem_bad_pesticide: 0
    }), [rowsT3]);

    // ── Header controls ───────────────────────────────────────────────────────
    const headerControls = (
        <Space>
            <DatePicker picker="month" value={month} onChange={d => d && setMonth(d)} format="YYYY-MM" allowClear={false} style={{ width: 120 }} />
            {isAdmin && (
                <Select style={{ width: 220 }} value={orgId} onChange={v => setOrgId(v)} showSearch optionFilterProp="label"
                    options={orgs.map((o: any) => ({ value: o.id, label: o.name }))}
                    placeholder={t('common.select_district')} />
            )}
            <Button icon={<ReloadOutlined />} onClick={fetchAll}>{t('common.update')}</Button>
            {canEdit && <Button type="primary" icon={<SaveOutlined />} onClick={handleGlobalSave} loading={saving}>{t('common.save')}</Button>}
        </Space>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <PermissionGate permission="VIEW_SANITARY">
            <GlassLayout
                title={t('kommunal_hygiene.title')}
                subtitle={`${month.format('YYYY')} - ${month.format('MMMM')}`}
                headerButtons={headerControls}
            >
                <Card bordered={false} bodyStyle={{ padding: '0 12px' }}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>

                        {/* ══════════════ TAB 1: Ichimlik suvi ══════════════ */}
                        <TabPane tab={t('kommunal_hygiene.tabs.water')} key="1">
                            <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
                                <Spin spinning={loadingT1}>
                                    <table style={{ borderCollapse: 'collapse', width: 'max-content', margin: '0 auto' }}>
                                        <thead>
                                            <tr>
                                                <th rowSpan={4} style={{ ...thStyle, width: 220 }}>{t('kommunal_hygiene.water_table.headers.pipeline')}</th>
                                                <th colSpan={14} style={thStyle}>{t('kommunal_hygiene.water_table.headers.chemical')}</th>
                                                <th colSpan={8} style={thStyle}>{t('kommunal_hygiene.water_table.headers.bacteriology')}</th>
                                            </tr>
                                            <tr>
                                                <th rowSpan={2} style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.total_samples')} width={70} /></th>
                                                <th colSpan={4} style={thStyle}>{t('kommunal_hygiene.water_table.headers.points_samples')}</th>
                                                <th colSpan={9} style={thStyle}>{t('kommunal_hygiene.water_table.headers.not_compliant_sanitary')}</th>
                                                <th rowSpan={2} style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.total_samples')} width={70} /></th>
                                                <th colSpan={4} style={thStyle}>{t('kommunal_hygiene.water_table.headers.points_samples')}</th>
                                                <th colSpan={3} style={thStyle}>{t('kommunal_hygiene.water_table.headers.not_compliant_sanitary')}</th>
                                            </tr>
                                            <tr>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.source')} width={30} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.before_network')} width={40} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.control_points')} width={50} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.consumer')} width={40} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.ammonia')} width={35} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.nitrate')} width={35} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.nitrite')} width={35} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.dry_residue')} width={45} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.chloride')} width={40} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.sulfate')} width={40} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.turbidity')} width={45} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.hardness')} width={45} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.others')} width={40} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.source')} width={30} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.before_network')} width={40} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.control_points')} width={50} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.consumer')} width={40} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.umc')} width={30} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.coli')} width={35} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.water_table.headers.sfz')} width={30} /></th>
                                            </tr>
                                            <tr>
                                                {Array.from({ length: 14 }, (_, i) => (
                                                    <th key={`chem-${i}`} style={{ ...thStyle, color: '#94a3b8' }}>{i + 1}</th>
                                                ))}
                                                {Array.from({ length: 8 }, (_, i) => (
                                                    <th key={`bact-${i}`} style={{ ...thStyle, color: '#94a3b8' }}>{i + 1}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ROW_TYPES.map(rt => (
                                                <tr key={rt.key}>
                                                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: rt.key.includes('norm') ? 400 : 700, paddingLeft: rt.key.includes('norm') ? 24 : 8, width: 220 }}>
                                                        {rt.key.includes('norm')
                                                            ? <span style={{ color: '#64748b', fontSize: 10 }}>{t(rt.labelKey)}</span>
                                                            : t(rt.labelKey)}
                                                    </td>
                                                    {NUM_FIELDS_T1.map(f => (
                                                        <td key={f} style={tdStyle}>
                                                            <EditCell
                                                                value={dataT1[rt.key]?.[f] || 0}
                                                                readOnly={!canEdit || f === 'chem_total' || f === 'total_inspected_samples'}
                                                                onChange={v => handleChangeT1(rt.key, f, v)}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                                                <td style={{ ...tdStyle, textAlign: 'left', paddingLeft: 8, fontWeight: 800 }}>{t('kommunal_hygiene.rows.total_ki')}</td>
                                                {NUM_FIELDS_T1.map(f => (
                                                    <td key={f} style={tdStyle}>
                                                        <strong style={{ fontSize: 10 }}>{jamiKI[f] || 0}</strong>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                                                <td style={{ ...tdStyle, textAlign: 'left', paddingLeft: 8, fontWeight: 800 }}>{t('kommunal_hygiene.rows.total_tkb')}</td>
                                                {NUM_FIELDS_T1.map(f => (
                                                    <td key={f} style={tdStyle}>
                                                        <strong style={{ fontSize: 10 }}>{jamiTJB[f] || 0}</strong>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </Spin>
                            </div>
                        </TabPane>

                        {/* ══════════════ TAB 2: Ochiq suv ══════════════════ */}
                        <TabPane tab={t('kommunal_hygiene.tabs.open_water')} key="2">
                            <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
                                <Spin spinning={loadingT2}>
                                    <table style={{ borderCollapse: 'collapse', width: 'max-content', fontSize: 10 }}>
                                        <thead>
                                            <tr>
                                                <th rowSpan={4} style={{ ...thStyle, width: 100 }}>{t('kommunal_hygiene.open_water_table.headers.water_body')}</th>
                                                <th rowSpan={4} style={{ ...thStyle, width: 170 }}>{t('kommunal_hygiene.open_water_table.headers.object_name')}</th>
                                                <th rowSpan={4} style={{ ...thStyle, width: 90 }}>{t('kommunal_hygiene.open_water_table.headers.treatment_system')}</th>
                                                <th colSpan={10} style={thStyle}>{t('kommunal_hygiene.open_water_table.headers.lab_control')}</th>
                                                <th rowSpan={4} style={{ ...thStyle, width: 30, border: 'none', background: 'transparent' }}></th>
                                            </tr>
                                            <tr>
                                                <th colSpan={5} style={thStyle}>{t('kommunal_hygiene.open_water_table.headers.chem')}</th>
                                                <th colSpan={5} style={thStyle}>{t('kommunal_hygiene.open_water_table.headers.bact')}</th>
                                            </tr>
                                            <tr>
                                                <th colSpan={2} style={thStyle}>{t('kommunal_hygiene.open_water_table.headers.before')}</th>
                                                <th colSpan={2} style={thStyle}>{t('kommunal_hygiene.open_water_table.headers.after')}</th>
                                                <th style={thStyle}>{t('kommunal_hygiene.open_water_table.headers.efficiency')}</th>
                                                <th colSpan={2} style={thStyle}>{t('kommunal_hygiene.open_water_table.headers.before')}</th>
                                                <th colSpan={2} style={thStyle}>{t('kommunal_hygiene.open_water_table.headers.after')}</th>
                                                <th style={thStyle}>{t('kommunal_hygiene.open_water_table.headers.efficiency')}</th>
                                            </tr>
                                            <tr>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.open_water_table.headers.total_samples')} width={44} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.open_water_table.headers.not_meet')} width={55} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.open_water_table.headers.total_samples')} width={44} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.open_water_table.headers.not_meet')} width={55} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.open_water_table.headers.efficiency')} width={50} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.open_water_table.headers.total_samples')} width={44} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.open_water_table.headers.not_meet')} width={55} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.open_water_table.headers.total_samples')} width={44} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.open_water_table.headers.not_meet')} width={55} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.open_water_table.headers.efficiency')} width={50} /></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rowsT2.map((row: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td style={tdStyle}><EditTextCell value={row.water_body_name} onChange={v => handleChangeT2(idx, 'water_body_name', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditTextCell value={row.object_name} onChange={v => handleChangeT2(idx, 'object_name', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditTextCell value={row.treatment_system} onChange={v => handleChangeT2(idx, 'treatment_system', v)} readOnly={!canEdit} textAlign="center" /></td>
                                                    <td style={tdStyle}><EditCell value={row.chem_before_total} onChange={v => handleChangeT2(idx, 'chem_before_total', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.chem_before_bad} onChange={v => handleChangeT2(idx, 'chem_before_bad', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.chem_after_total} onChange={v => handleChangeT2(idx, 'chem_after_total', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.chem_after_bad} onChange={v => handleChangeT2(idx, 'chem_after_bad', v)} readOnly={!canEdit} /></td>
                                                    <td style={{ ...tdStyle, background: '#eff6ff', fontWeight: 700 }}>{row.chem_efficiency}%</td>
                                                    <td style={tdStyle}><EditCell value={row.bact_before_total} onChange={v => handleChangeT2(idx, 'bact_before_total', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.bact_before_bad} onChange={v => handleChangeT2(idx, 'bact_before_bad', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.bact_after_total} onChange={v => handleChangeT2(idx, 'bact_after_total', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.bact_after_bad} onChange={v => handleChangeT2(idx, 'bact_after_bad', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}>{row.bact_efficiency}%</td>
                                                    <td style={{ ...tdStyle, border: 'none' }}>
                                                        {canEdit && <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeRowT2(idx)} />}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                                                <td colSpan={3} style={{ ...tdStyle, textAlign: 'right', paddingRight: 12 }}>{t('common.total')}</td>
                                                <td style={tdStyle}>{jamiT2.chem_before_total}</td>
                                                <td style={tdStyle}>{jamiT2.chem_before_bad}</td>
                                                <td style={tdStyle}>{jamiT2.chem_after_total}</td>
                                                <td style={tdStyle}>{jamiT2.chem_after_bad}</td>
                                                <td style={tdStyle}>{jamiChemEff}%</td>
                                                <td style={tdStyle}>{jamiT2.bact_before_total}</td>
                                                <td style={tdStyle}>{jamiT2.bact_before_bad}</td>
                                                <td style={tdStyle}>{jamiT2.bact_after_total}</td>
                                                <td style={tdStyle}>{jamiT2.bact_after_bad}</td>
                                                <td style={tdStyle}>{jamiBactEff}%</td>
                                                <td style={{ border: 'none' }}></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    {canEdit && (
                                        <div style={{ textAlign: 'center', marginTop: 12 }}>
                                            <Button type="dashed" icon={<PlusOutlined />} onClick={addRowT2} style={{ width: 200 }}>Qator qo'shish</Button>
                                        </div>
                                    )}
                                </Spin>
                            </div>
                        </TabPane>

                        {/* ══════════════ TAB 3: Suvdan foydalanish ══════════════════ */}
                        <TabPane tab={t('kommunal_hygiene.tabs.usage_objects')} key="3">
                            <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
                                <Spin spinning={loadingT3}>
                                    <table style={{ borderCollapse: 'collapse', width: 'max-content', fontSize: 10 }}>
                                        <thead>
                                            <tr>
                                                <th rowSpan={3} style={{ ...thStyle, width: 140 }}>{t('kommunal_hygiene.usage_table.headers.water_body')}</th>
                                                <th rowSpan={3} style={{ ...thStyle, width: 80 }}>{t('kommunal_hygiene.usage_table.headers.category')}</th>
                                                <th colSpan={9} style={thStyle}>{t('kommunal_hygiene.usage_table.title')}</th>
                                                <th rowSpan={3} style={{ ...thStyle, width: 30, border: 'none', background: 'transparent' }}></th>
                                            </tr>
                                            <tr>
                                                <th rowSpan={2} style={thStyle}><TW label={t('kommunal_hygiene.usage_table.headers.samples_taken')} width={60} /></th>
                                                <th rowSpan={2} style={thStyle}><TW label={t('kommunal_hygiene.usage_table.headers.samples_bad')} width={100} /></th>
                                                <th colSpan={3} style={thStyle}>{t('kommunal_hygiene.usage_table.headers.pathogens')}</th>
                                                <th colSpan={4} style={thStyle}>{t('kommunal_hygiene.usage_table.headers.chem_pesticide')}</th>
                                            </tr>
                                            <tr>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.usage_table.headers.inf_disease')} width={70} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.usage_table.headers.cholera')} width={60} /></th>
                                                <th style={thStyle}><TW label={t('kommunal_hygiene.usage_table.headers.parasite')} width={60} /></th>
                                                <th colSpan={2} style={thStyle}>{t('kommunal_hygiene.usage_table.headers.presence')}</th>
                                                <th colSpan={2} style={thStyle}>{t('kommunal_hygiene.usage_table.headers.bad_pesticide')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rowsT3.map((row: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td style={tdStyle}><EditTextCell value={row.water_body_name} onChange={v => handleChangeT3(idx, 'water_body_name', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditTextCell value={row.category} onChange={v => handleChangeT3(idx, 'category', v)} readOnly={!canEdit} textAlign="center" /></td>
                                                    <td style={tdStyle}><EditCell value={row.samples_taken} onChange={v => handleChangeT3(idx, 'samples_taken', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.samples_bad} onChange={v => handleChangeT3(idx, 'samples_bad', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.pathogen_inf_disease} onChange={v => handleChangeT3(idx, 'pathogen_inf_disease', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.pathogen_cholera} onChange={v => handleChangeT3(idx, 'pathogen_cholera', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.pathogen_parasite} onChange={v => handleChangeT3(idx, 'pathogen_parasite', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.chem_samples_total} onChange={v => handleChangeT3(idx, 'chem_samples_total', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.chem_pesticide_presence} onChange={v => handleChangeT3(idx, 'chem_pesticide_presence', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.chem_bad_total} onChange={v => handleChangeT3(idx, 'chem_bad_total', v)} readOnly={!canEdit} /></td>
                                                    <td style={tdStyle}><EditCell value={row.chem_bad_pesticide} onChange={v => handleChangeT3(idx, 'chem_bad_pesticide', v)} readOnly={!canEdit} /></td>
                                                    <td style={{ ...tdStyle, border: 'none' }}>
                                                        {canEdit && <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeRowT3(idx)} />}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                                                <td colSpan={2} style={{ ...tdStyle, textAlign: 'right', paddingRight: 12 }}>{t('common.total')}</td>
                                                <td style={tdStyle}>{jamiT3.samples_taken}</td>
                                                <td style={tdStyle}>{jamiT3.samples_bad}</td>
                                                <td style={tdStyle}>{jamiT3.pathogen_inf_disease}</td>
                                                <td style={tdStyle}>{jamiT3.pathogen_cholera}</td>
                                                <td style={tdStyle}>{jamiT3.pathogen_parasite}</td>
                                                <td style={tdStyle}>{jamiT3.chem_samples_total}</td>
                                                <td style={tdStyle}>{jamiT3.chem_pesticide_presence}</td>
                                                <td style={tdStyle}>{jamiT3.chem_bad_total}</td>
                                                <td style={tdStyle}>{jamiT3.chem_bad_pesticide}</td>
                                                <td style={{ border: 'none' }}></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    {canEdit && (
                                        <div style={{ textAlign: 'center', marginTop: 12 }}>
                                            <Button type="dashed" icon={<PlusOutlined />} onClick={addRowT3} style={{ width: 200 }}>Qator qo'shish</Button>
                                        </div>
                                    )}
                                </Spin>
                            </div>
                        </TabPane>
                        {/* ══════════════ TAB 4: Regional Monitoring ══════════════════ */}
                        {isRegionalAdmin && (
                            <TabPane tab={t('kommunal_hygiene.tabs.regional_summary')} key="4">
                                <RegionalStatusPanel month={month} />
                            </TabPane>
                        )}
                    </Tabs>
                </Card>
            </GlassLayout>
        </PermissionGate>
    );
};

export default KommunalGigiyenaWaterPage;
