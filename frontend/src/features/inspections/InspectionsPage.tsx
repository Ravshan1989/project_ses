import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Button, DatePicker, Select, Space, Spin, Card,
    Input, Popconfirm, Typography, Table, Tabs, InputNumber
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import GlassLayout from '../../components/layout/GlassLayout';
import { useInspectionsData } from './hooks/useInspectionsData';
import {
    InspectionRecord, UpdateInspectionRecordPayload,
    InspectionTable2Row, InspectionTable3Row,
} from '../../services/inspectionsApi';
import { INSPECTION_T2_ROWS } from './components/InspectionsConstants';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface EditState { [id: string]: Partial<InspectionRecord>; }
interface Organization { id: string; name: string; }
interface TRow { key: string; label: string; isTotal?: boolean; }

// ─────────────────────────────────────────────────────────────────────────────

const InspectionsPage: React.FC = () => {
    const { t } = useTranslation();
    const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('2');
    const [editState, setEditState] = useState<EditState>({});

    const isAdmin = localStorage.getItem('user_role') === 'ADMIN' || localStorage.getItem('user_role') === 'EXECUTIVE';
    const userOrgId = localStorage.getItem('user_org_id');
    const effectiveOrgId = isAdmin ? (selectedOrgId || userOrgId) : userOrgId;

    const {
        organizations,
        records, isLoadingRecords, isCreating, isUpdating, isDeleting,
        createRecord, updateRecord, deleteRecord,
        table2Data, isLoadingTable2, isSavingTable2, saveTable2,
        table3Data, isLoadingTable3, isSavingTable3, saveTable3,
        refresh,
    } = useInspectionsData(month, effectiveOrgId, activeTab);

    const year = dayjs(month).year();
    const monthNum = dayjs(month).month() + 1;

    // ─── Table 2 helpers ──────────────────────────────────────────────────
    const [t2State, setT2State] = useState<Record<string, Partial<InspectionTable2Row>>>({});

    const getT2Val = (key: string, field: keyof InspectionTable2Row): number => {
        if (field === 'row_key') return 0;
        const local = t2State[key]?.[field];
        if (local !== undefined) return local as number;
        const sv = table2Data.find(r => r.row_key === key);
        return sv ? (sv[field] as number) : 0;
    };
    const setT2Val = (key: string, field: keyof InspectionTable2Row, v: number) =>
        setT2State(p => ({ ...p, [key]: { ...p[key], [field]: v } }));

    const getDiff2 = (key: string, field: 'total' | 'notified' | 'notified_24h') => {
        const c = getT2Val(key, `curr_${field}` as keyof InspectionTable2Row) as number;
        const p2 = field === 'notified_24h' ? 0 : getT2Val(key, `prev_${field as 'total' | 'notified'}` as keyof InspectionTable2Row) as number;
        return c - p2;
    };

    const t2Jami = useMemo(() => {
        const fields: (keyof InspectionTable2Row)[] = ['prev_total', 'prev_notified', 'prev_agreed', 'curr_total', 'curr_notified', 'curr_notified_24h'];
        return fields.reduce((a, f) => { a[f as string] = INSPECTION_T2_ROWS.reduce((s, r) => s + getT2Val(r.key, f), 0); return a; }, {} as Record<string, number>);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t2State, table2Data]);

    const handleSaveTable2 = () => {
        const rows: InspectionTable2Row[] = INSPECTION_T2_ROWS.map(r => ({
            row_key: r.key,
            prev_total: getT2Val(r.key, 'prev_total'),
            prev_notified: getT2Val(r.key, 'prev_notified'),
            prev_agreed: getT2Val(r.key, 'prev_agreed'),
            curr_total: getT2Val(r.key, 'curr_total'),
            curr_notified: getT2Val(r.key, 'curr_notified'),
            curr_notified_24h: getT2Val(r.key, 'curr_notified_24h'),
        }));
        saveTable2(rows);
        setT2State({});
    };

    // ─── Table 3 helpers ──────────────────────────────────────────────────
    const T3_FIELDS: (keyof InspectionTable3Row)[] = [
        'inspections_count', 'defects_count',
        'measure_suspend', 'measure_admin', 'measure_license', 'measure_tavdinaoma',
        'measure_warning', 'measure_conclusion', 'measure_tmb',
        'others', 'fine_count', 'fine_amount',
        'court_economic', 'court_civil', 'court_admin',
    ];

    const [t3State, setT3State] = useState<Record<string, Partial<InspectionTable3Row>>>({});

    const getT3Val = (key: string, field: keyof InspectionTable3Row): number => {
        if (field === 'row_key') return 0;
        const local = t3State[key]?.[field];
        if (local !== undefined) return local as number;
        const sv = table3Data.find(r => r.row_key === key);
        return sv ? (sv[field] as number) : 0;
    };
    const setT3Val = (key: string, field: keyof InspectionTable3Row, v: number) =>
        setT3State(p => ({ ...p, [key]: { ...p[key], [field]: v } }));

    const t3Jami = useMemo(() => {
        return T3_FIELDS.reduce((a, f) => {
            a[f as string] = INSPECTION_T2_ROWS.reduce((s, r) => s + getT3Val(r.key, f), 0);
            return a;
        }, {} as Record<string, number>);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t3State, table3Data]);

    const handleSaveTable3 = () => {
        const rows: InspectionTable3Row[] = INSPECTION_T2_ROWS.map(r => ({
            row_key: r.key,
            inspections_count: getT3Val(r.key, 'inspections_count'),
            defects_count: getT3Val(r.key, 'defects_count'),
            measure_suspend: getT3Val(r.key, 'measure_suspend'),
            measure_admin: getT3Val(r.key, 'measure_admin'),
            measure_license: getT3Val(r.key, 'measure_license'),
            measure_tavdinaoma: getT3Val(r.key, 'measure_tavdinaoma'),
            measure_warning: getT3Val(r.key, 'measure_warning'),
            measure_conclusion: getT3Val(r.key, 'measure_conclusion'),
            measure_tmb: getT3Val(r.key, 'measure_tmb'),
            others: getT3Val(r.key, 'others'),
            fine_count: getT3Val(r.key, 'fine_count'),
            fine_amount: getT3Val(r.key, 'fine_amount'),
            court_economic: getT3Val(r.key, 'court_economic'),
            court_civil: getT3Val(r.key, 'court_civil'),
            court_admin: getT3Val(r.key, 'court_admin'),
        }));
        saveTable3(rows);
        setT3State({});
    };

    // ─── Controls ─────────────────────────────────────────────────────────
    const controls = (
        <Card size="small" style={{ marginBottom: 12 }}>
            <Space wrap>
                <DatePicker picker="month" value={dayjs(month)} allowClear={false}
                    onChange={d => setMonth(d ? d.format('YYYY-MM') : dayjs().format('YYYY-MM'))} />
                {isAdmin && (
                    <Select placeholder={t('admin.organizations.select_org') || 'Ташкилотни танланг'}
                        style={{ width: 250 }} value={selectedOrgId} onChange={setSelectedOrgId}
                        options={organizations.map((o: Organization) => ({ label: o.name, value: o.id }))}
                        showSearch allowClear />
                )}
                <Button icon={<ReloadOutlined />} onClick={refresh} loading={isLoadingRecords || isLoadingTable2 || isLoadingTable3}>
                    {t('common.refresh')}
                </Button>
            </Space>
        </Card>
    );

    // ─── Table 1 columns ──────────────────────────────────────────────────
    const handleFieldChange = (id: string, field: keyof InspectionRecord, value: string) =>
        setEditState(p => ({ ...p, [id]: { ...p[id], [field]: value } }));

    const handleSaveRow = (record: InspectionRecord) => {
        const rawChanges = editState[record.id];
        if (!rawChanges || !Object.keys(rawChanges).length) return;
        const changes = Object.fromEntries(Object.entries(rawChanges).map(([k, v]) => [k, v === null ? undefined : v])) as UpdateInspectionRecordPayload;
        updateRecord(record.id, changes);
        setEditState(p => { const n = { ...p }; delete n[record.id]; return n; });
    };

    const getVal = (record: InspectionRecord, field: keyof InspectionRecord): string =>
        (editState[record.id]?.[field] !== undefined ? editState[record.id]![field] : record[field] ?? '') as string;

    const table1Columns: ColumnsType<InspectionRecord> = [
        { title: '№', key: 'i', width: 44, align: 'center', render: (_: any, __: any, i: number) => i + 1 },
        {
            title: t('inspections.col_object'), key: 'obj', width: 220,
            render: (_: any, r: InspectionRecord) => <TextArea value={getVal(r, 'object_name')} onChange={e => handleFieldChange(r.id, 'object_name', e.target.value)} autoSize={{ minRows: 2, maxRows: 5 }} style={{ fontSize: 12 }} />
        },
        {
            title: t('inspections.col_date'), key: 'dt', width: 130, align: 'center',
            render: (_: any, r: InspectionRecord) => <DatePicker value={getVal(r, 'transfer_date') ? dayjs(getVal(r, 'transfer_date')) : null} onChange={d => handleFieldChange(r.id, 'transfer_date', d ? d.format('YYYY-MM-DD') : '')} style={{ width: '100%' }} format="DD.MM.YYYY" />
        },
        {
            title: t('inspections.col_reason'), key: 'rsn',
            render: (_: any, r: InspectionRecord) => <TextArea value={getVal(r, 'reason')} onChange={e => handleFieldChange(r.id, 'reason', e.target.value)} autoSize={{ minRows: 2, maxRows: 5 }} style={{ fontSize: 12 }} />
        },
        {
            title: t('inspections.col_measures'), key: 'msr',
            render: (_: any, r: InspectionRecord) => <TextArea value={getVal(r, 'measures_taken')} onChange={e => handleFieldChange(r.id, 'measures_taken', e.target.value)} autoSize={{ minRows: 2, maxRows: 5 }} style={{ fontSize: 12 }} />
        },
        {
            title: '', key: 'act', width: 85, align: 'center',
            render: (_: any, r: InspectionRecord) => (
                <Space direction="vertical" size={4}>
                    <Button type="primary" size="small" icon={<SaveOutlined />} onClick={() => handleSaveRow(r)} loading={isUpdating} disabled={!editState[r.id] || !Object.keys(editState[r.id]).length}>{t('common.save')}</Button>
                    <Popconfirm title={t('inspections.delete_confirm')} onConfirm={() => deleteRecord(r.id)} okText="Ha" cancelText="Yo'q">
                        <Button danger size="small" icon={<DeleteOutlined />} loading={isDeleting}>O'chirish</Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    // ─── Generic helpers for fixed-row tables ─────────────────────────────
    const numIn = (key: string, field: keyof InspectionTable2Row | keyof InspectionTable3Row, isT3 = false, step = 1) => (
        <InputNumber min={0} step={step}
            value={(isT3 ? getT3Val(key, field as keyof InspectionTable3Row) : getT2Val(key, field as keyof InspectionTable2Row)) as number}
            onChange={v => isT3 ? setT3Val(key, field as keyof InspectionTable3Row, v ?? 0) : setT2Val(key, field as keyof InspectionTable2Row, v ?? 0)}
            style={{ width: 65 }} size="small" />
    );
    const diffCell2 = (key: string, field: 'total' | 'notified' | 'notified_24h') => {
        const v = getDiff2(key, field);
        return <span style={{ color: v >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{v >= 0 ? `+${v}` : v}</span>;
    };

    const tableRows: TRow[] = [...INSPECTION_T2_ROWS.map(r => ({ key: r.key, label: r.label })), { key: 'jami', label: 'Жами:', isTotal: true }];

    // ─── Table 2 columns ──────────────────────────────────────────────────
    interface Col { title: React.ReactNode; key: string; width?: number; align?: 'center' | 'left'; render?: (v: any, row: TRow, i?: number) => React.ReactNode; children?: Col[] }

    const t2Cols: Col[] = [
        { title: '№', key: 'no', width: 40, align: 'center', render: (_: any, __: TRow, i?: number) => (i !== undefined && i < INSPECTION_T2_ROWS.length) ? i + 1 : '' },
        { title: 'Ҳудудлар', key: 'label', width: 140, render: (_: any, r: TRow) => <span style={{ fontWeight: r.isTotal ? 700 : 400 }}>{r.label}</span> },
        {
            title: `Ўтган ${year - 1} йилда`, key: 'prev', align: 'center', children: [
                { title: 'Йил бошидан жами', key: 'pt', width: 80, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t2Jami['prev_total']}</b> : numIn(r.key, 'prev_total') },
                { title: 'хабардор этиш', key: 'pn', width: 80, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t2Jami['prev_notified']}</b> : numIn(r.key, 'prev_notified') },
                { title: 'келишилган', key: 'pa', width: 80, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t2Jami['prev_agreed']}</b> : numIn(r.key, 'prev_agreed') },
            ]
        },
        {
            title: `${year} йил бошидан`, key: 'curr', align: 'center', children: [
                { title: 'Йил бошидан жами', key: 'ct', width: 80, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t2Jami['curr_total']}</b> : numIn(r.key, 'curr_total') },
                { title: 'хабардор этиш', key: 'cn', width: 80, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t2Jami['curr_notified']}</b> : numIn(r.key, 'curr_notified') },
                { title: '24 соатдан сўнг', key: 'c24', width: 80, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t2Jami['curr_notified_24h']}</b> : numIn(r.key, 'curr_notified_24h') },
            ]
        },
        {
            title: 'Нисбат (+/-)', key: 'diff', align: 'center', children: [
                { title: 'Жами', key: 'dt', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b style={{ color: (t2Jami['curr_total'] - t2Jami['prev_total']) >= 0 ? '#16a34a' : '#dc2626' }}>{t2Jami['curr_total'] - t2Jami['prev_total'] >= 0 ? `+${t2Jami['curr_total'] - t2Jami['prev_total']}` : t2Jami['curr_total'] - t2Jami['prev_total']}</b> : diffCell2(r.key, 'total') },
                { title: 'хабардор', key: 'dn', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t2Jami['curr_notified'] - t2Jami['prev_notified'] >= 0 ? `+${t2Jami['curr_notified'] - t2Jami['prev_notified']}` : t2Jami['curr_notified'] - t2Jami['prev_notified']}</b> : diffCell2(r.key, 'notified') },
                { title: '24 соат', key: 'd24', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>+{t2Jami['curr_notified_24h']}</b> : diffCell2(r.key, 'notified_24h') },
            ]
        },
    ];

    // ─── Table 3 columns ──────────────────────────────────────────────────
    const t3n = (key: string, field: keyof InspectionTable3Row, step = 1) => (
        <InputNumber min={0} step={step} value={getT3Val(key, field)} onChange={v => setT3Val(key, field, v ?? 0)} style={{ width: 65 }} size="small" />
    );

    const t3Cols: Col[] = [
        { title: '№', key: 'no', width: 40, align: 'center', render: (_: any, __: TRow, i?: number) => (i !== undefined && i < INSPECTION_T2_ROWS.length) ? i + 1 : '' },
        { title: 'Ҳудудлар', key: 'label', width: 140, render: (_: any, r: TRow) => <span style={{ fontWeight: r.isTotal ? 700 : 400 }}>{r.label}</span> },
        { title: 'Хабардор этиш тартибида ўтказилган текширишлар', key: 'ic', width: 80, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['inspections_count']}</b> : t3n(r.key, 'inspections_count') },
        { title: 'Аниқланган камчиликлар', key: 'dc', width: 80, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['defects_count']}</b> : t3n(r.key, 'defects_count') },
        {
            title: 'Қўлланилган чоралар', key: 'measures', align: 'center', children: [
                { title: 'Фаолиятини тўхтатиш', key: 'ms', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['measure_suspend']}</b> : t3n(r.key, 'measure_suspend') },
                { title: 'Маъмурий жавобгарлик', key: 'ma', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['measure_admin']}</b> : t3n(r.key, 'measure_admin') },
                { title: 'Лицензияни бекор қилиш', key: 'ml', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['measure_license']}</b> : t3n(r.key, 'measure_license') },
                { title: 'Тавдинома', key: 'mt', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['measure_tavdinaoma']}</b> : t3n(r.key, 'measure_tavdinaoma') },
                { title: 'Огоҳлантириш (кўрсатма)', key: 'mw', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['measure_warning']}</b> : t3n(r.key, 'measure_warning') },
                { title: 'Хулоса', key: 'mc', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['measure_conclusion']}</b> : t3n(r.key, 'measure_conclusion') },
                { title: 'ТМБ олиб қўйиш', key: 'mb', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['measure_tmb']}</b> : t3n(r.key, 'measure_tmb') },
            ]
        },
        { title: 'Бошқалар', key: 'oth', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['others']}</b> : t3n(r.key, 'others') },
        {
            title: 'Молиявий жарималар', key: 'fines', align: 'center', children: [
                { title: 'Сони', key: 'fc', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['fine_count']}</b> : t3n(r.key, 'fine_count') },
                { title: 'Суммаси (млн.сўм)', key: 'fa', width: 80, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['fine_amount']}</b> : t3n(r.key, 'fine_amount', 0.01) },
                {
                    title: 'Жами', key: 'ft', width: 65, align: 'center', render: (_: any, r: TRow) => {
                        const v = r.isTotal ? (Number(t3Jami['fine_count']) || 0) + (Number(t3Jami['fine_amount']) || 0) : (Number(getT3Val(r.key, 'fine_count')) || 0) + (Number(getT3Val(r.key, 'fine_amount')) || 0);
                        return <span style={{ fontWeight: r.isTotal ? 700 : 400 }}>{Number(v).toFixed(2)}</span>;
                    }
                },
            ]
        },
        {
            title: 'Қўзғатилган даъволар', key: 'courts', align: 'center', children: [
                { title: 'Иқтисодий судга', key: 'ce', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['court_economic']}</b> : t3n(r.key, 'court_economic') },
                { title: 'Фуқаролик судга', key: 'cc', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['court_civil']}</b> : t3n(r.key, 'court_civil') },
                { title: 'Маъмурий судга', key: 'ca', width: 65, align: 'center', render: (_: any, r: TRow) => r.isTotal ? <b>{t3Jami['court_admin']}</b> : t3n(r.key, 'court_admin') },
            ]
        },
    ];

    // ─── Page ─────────────────────────────────────────────────────────────
    const saveBtn = (loading: boolean, onClick: () => void) => (
        <div style={{ marginTop: 10, textAlign: 'right' }}>
            <Button type="primary" icon={<SaveOutlined />} loading={loading} disabled={!effectiveOrgId} onClick={onClick}>{t('common.save')}</Button>
        </div>
    );

    const tableWrap = (loading: boolean, columns: any[], saveOnClick: () => void, savingFlag: boolean, subtitle?: string) => (
        <div style={{ background: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
            {subtitle && <div style={{ textAlign: 'center', marginBottom: 8 }}><Text strong style={{ fontSize: 12 }}>{subtitle}</Text></div>}
            <Spin spinning={loading}>
                <Table dataSource={tableRows} columns={columns as any} rowKey="key" pagination={false} bordered size="small" scroll={{ x: 'max-content' }} />
            </Spin>
            {saveBtn(savingFlag, saveOnClick)}
        </div>
    );

    return (
        <GlassLayout title={t('inspections.title')}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <Title level={5} style={{ marginBottom: 2 }}>
                    Санитария-эпидемиологик осойишталик ва жамоат саломатлиги қўмитасининг
                    Тошкент вилояти бошқармаси томонидан {year} йилнинг {monthNum}-ойи давомида
                </Title>
                <Text strong>{t('inspections.info_label')}</Text>
            </div>

            {controls}

            <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" items={[
                {
                    key: '2', label: t('inspections.tab2_label') || 'Тадбиркорлик текширишлари (Жадвал 2)',
                    children: tableWrap(isLoadingTable2, t2Cols, handleSaveTable2, isSavingTable2,
                        'тадбиркорлик субъектларда ўтказилган текширишлар тўғрисида (назорат қилувчи орган номи)')
                },
                {
                    key: '3', label: t('inspections.tab3_label') || 'Таъсир чоралари (Жадвал 3)',
                    children: tableWrap(isLoadingTable3, t3Cols, handleSaveTable3, isSavingTable3,
                        'хабардор этиш тартибида ўтказилган текширишлар натижасида тадбиркорлик субъектларга нисбатан қўлланилган таъсир чоралари тўғрисида')
                },
                {
                    key: '1', label: t('inspections.tab1_label') || 'Прокурaturaga юборилганлар (Жадвал 1)',
                    children: (
                        <div style={{ background: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
                            <div style={{ marginBottom: 8 }}>
                                <Button type="primary" icon={<PlusOutlined />} loading={isCreating} disabled={!effectiveOrgId}
                                    onClick={() => { if (!effectiveOrgId) return; createRecord({ organization_id: effectiveOrgId, period_month: month, object_name: '' }); }}>
                                    {t('inspections.add_row')}
                                </Button>
                            </div>
                            <Spin spinning={isLoadingRecords}>
                                <Table dataSource={records} columns={table1Columns} rowKey="id" pagination={false} bordered size="small" locale={{ emptyText: t('inspections.no_records') }} />
                            </Spin>
                        </div>
                    ),
                },
            ]} />
        </GlassLayout>
    );
};

export default InspectionsPage;
