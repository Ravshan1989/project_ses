import React, { useState, useEffect } from 'react';
import { FileExcelOutlined, SaveOutlined, UploadOutlined, BarChartOutlined, GlobalOutlined, ExperimentOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Table, Typography, DatePicker, message, InputNumber, Upload, Tabs, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { diseasesApi, submissionApi, api } from '../../services/api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import PermissionGate from '../../components/PermissionGate';

const { Title, Text } = Typography;

interface Form1Record {
    key: string;
    code: string;
    name: string;
    // Monthly - Total
    m_t_p_a: number; m_t_p_i: number; m_t_c_a: number; m_t_c_i: number; m_t_g_a: number; m_t_g_p: number;
    // Monthly - U14
    m_u_p_a: number; m_u_p_i: number; m_u_c_a: number; m_u_c_i: number; m_u_g_a: number; m_u_g_p: number;
    // YTD - Total
    y_t_p_a: number; y_t_p_i: number; y_t_c_a: number; y_t_c_i: number; y_t_g_a: number; y_t_g_p: number;
    // YTD - U14
    y_u_p_a: number; y_u_p_i: number; y_u_c_a: number; y_u_c_i: number; y_u_g_a: number; y_u_g_p: number;
}

const Form1EntryPage: React.FC = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<Form1Record[]>([]);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState(dayjs().subtract(1, 'month'));
    const [templateId, setTemplateId] = useState<string>('');
    const [population, setPopulation] = useState<number>(100000); // Default or fetch
    const [childPopulation, setChildPopulation] = useState<number>(30000); // 14 yoshgacha


    useEffect(() => {
        fetchDiseases();
        fetchTemplate();
        fetchOrgInfo();
    }, []);

    const fetchOrgInfo = async () => {
        try {
            const res = await api.get('/auth/profile');
            if (res.data?.organization?.population) {
                setPopulation(res.data.organization.population);
            }
            if (res.data?.organization?.child_population) {
                setChildPopulation(res.data.organization.child_population);
            }
        } catch (e) {
            console.error("Failed to fetch org info", e);
        }
    };

    const fetchTemplate = async () => {
        try {
            const res = await api.get('/forms/templates');
            const form1 = res.data.find((t: any) => t.code === 'FORM1' || t.code === 'form_1');
            if (form1) setTemplateId(form1.id);
        } catch (e) {
            console.error("Failed to fetch template", e);
        }
    };

    const fetchDiseases = async () => {
        try {
            setLoading(true);
            const response = await diseasesApi.getAll();
            const mappedData: Form1Record[] = response.data.map((d: any) => ({
                key: d.id, code: d.code, name: d.name,
                m_t_p_a: 0, m_t_p_i: 0, m_t_c_a: 0, m_t_c_i: 0, m_t_g_a: 0, m_t_g_p: 0,
                m_u_p_a: 0, m_u_p_i: 0, m_u_c_a: 0, m_u_c_i: 0, m_u_g_a: 0, m_u_g_p: 0,
                y_t_p_a: 0, y_t_p_i: 0, y_t_c_a: 0, y_t_c_i: 0, y_t_g_a: 0, y_t_g_p: 0,
                y_u_p_a: 0, y_u_p_i: 0, y_u_c_a: 0, y_u_c_i: 0, y_u_g_a: 0, y_u_g_p: 0,
            }));
            setData(mappedData);
        } catch (error) {
            message.error(t('form1.actions.error_load_diseases'));
        } finally {
            setLoading(false);
        }
    };

    const calculateIntensive = (abs: number, popValue?: number) => {
        const p = popValue || population;
        if (!p || p === 0) return 0;
        return parseFloat(((abs / p) * 100000).toFixed(2));
    };

    const calculateGrowthAbs = (curr: number, prev: number) => {
        return curr - prev;
    };

    const calculateGrowthPer = (curr: number, prev: number) => {
        if (!prev || prev === 0) return curr > 0 ? 100 : 0;
        return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
    };

    // UZ: "Smart" (aqlli) o'sish/kamayish formulasi
    const calculateSmartGrowth = (curr: number, prev: number) => {
        if (curr === prev) return t('analysis_labels.equal');
        if (!prev || prev === 0) return `+${curr}`;
        if (!curr || curr === 0) return `-${prev} (0)`;

        const diffPercent = Math.abs((curr / prev - 1) * 100);

        if (diffPercent < 50) {
            const val = ((curr / prev - 1) * 100).toFixed(1);
            return `${val}%`;
        } else {
            if (curr > prev) {
                return `${(curr / prev).toFixed(1)} ${t('analysis_labels.increased')}`;
            } else {
                return `-${(prev / curr).toFixed(1)} ${t('analysis_labels.decreased')}`;
            }
        }
    };

    const handleInputChange = (value: number | null, key: string, field: keyof Form1Record) => {
        const newData = [...data];
        const index = newData.findIndex(item => item.key === key);
        if (index > -1) {
            const row = { ...newData[index], [field]: value || 0 };

            // Auto-update calculations for the group
            const updateGroup = (p: string) => {
                // p is prefix like 'm_t', 'm_u', etc.
                const isUnder14 = p.includes('_u');
                const popValue = isUnder14 ? childPopulation : population;

                const prev = Number(row[`${p}_p_a` as keyof Form1Record]) || 0;
                const curr = Number(row[`${p}_c_a` as keyof Form1Record]) || 0;

                (row as any)[`${p}_p_i`] = calculateIntensive(prev, popValue);
                (row as any)[`${p}_c_i`] = calculateIntensive(curr, popValue);
                (row as any)[`${p}_g_a`] = calculateGrowthAbs(curr, prev);
                (row as any)[`${p}_g_p`] = calculateGrowthPer(curr, prev);
            };

            const prefix = field.substring(0, 3); // e.g., 'm_t_' -> 'm_t'
            if (field.endsWith('_a')) {
                updateGroup(prefix);
            }

            newData[index] = row;
            setData(newData);
        }
    };

    const handleBulkUpload = (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const periodStr = period.startOf('month').format('YYYY-MM-DD');
        setLoading(true);

        api.post(`/submissions/bulk-upload?period=${periodStr}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(res => {
                message.success(res.data.message);
                if (res.data.period) {
                    setPeriod(dayjs(res.data.period));
                }
                // Fetch will happen automatically if period changes, or we force it if period is same
                if (!res.data.period || dayjs(res.data.period).isSame(period, 'month')) {
                    fetchAllSubmissions();
                }
            })
            .catch(err => {
                message.error(err.response?.data?.message || t('form1.actions.error_excel_read'));
            })
            .finally(() => setLoading(false));

        return false;
    };

    const renderInput = (record: Form1Record, field: keyof Form1Record, readOnly = false) => (
        <InputNumber
            size="small"
            min={-1000000}
            step={1}
            value={record[field] as number}
            onChange={(val) => !readOnly && handleInputChange(val, record.key, field)}
            variant="borderless"
            readOnly={readOnly}
            style={{
                width: '100%',
                padding: 0,
                textAlign: 'center',
                color: readOnly ? '#000' : '#1677ff',
                fontWeight: readOnly ? 400 : 600,
                backgroundColor: readOnly ? 'transparent' : '#e6f4ff'
            }}
            controls={false}
        />
    );

    const getStatColumns = (prefix: string) => {
        const currentYear = period.year();
        const prevYear = currentYear - 1;
        return [
            {
                title: `${prevYear} ${t('form1.table.year_suffix') || 'yil'}`,
                className: 'bg-prev',
                onHeaderCell: () => ({ className: 'bg-prev' }),
                children: [
                    {
                        title: t('form1.table.abs'),
                        width: 70,
                        align: 'center' as const,
                        key: `${prefix}_p_a`,
                        className: 'bg-prev',
                        render: (_: any, r: any) => renderInput(r, `${prefix}_p_a` as any)
                    },
                    {
                        title: t('form1.table.int'),
                        width: 70,
                        align: 'center' as const,
                        key: `${prefix}_p_i`,
                        className: 'bg-prev',
                        render: (_: any, r: any) => renderInput(r, `${prefix}_p_i` as any, true)
                    },
                ]
            },
            {
                title: `${currentYear} ${t('form1.table.year_suffix') || 'yil'}`,
                className: 'bg-curr',
                onHeaderCell: () => ({ className: 'bg-curr' }),
                children: [
                    {
                        title: t('form1.table.abs'),
                        width: 70,
                        align: 'center' as const,
                        key: `${prefix}_c_a`,
                        className: 'bg-curr',
                        render: (_: any, r: any) => renderInput(r, `${prefix}_c_a` as any)
                    },
                    {
                        title: t('form1.table.int'),
                        width: 70,
                        align: 'center' as const,
                        key: `${prefix}_c_i`,
                        className: 'bg-curr',
                        render: (_: any, r: any) => renderInput(r, `${prefix}_c_i` as any, true)
                    },
                ]
            },
            {
                title: t('form1.table.growth_title') || "o'sish/pasayish",
                children: [
                    { title: t('form1.table.growth_abs'), width: 70, align: 'center' as const, key: `${prefix}_g_a`, render: (_: any, r: any) => renderInput(r, `${prefix}_g_a` as any, true) },
                    {
                        title: t('form1.table.growth_per'),
                        width: 100,
                        align: 'center' as const,
                        key: `${prefix}_g_p`,
                        render: (_: any, r: any) => {
                            const curr = Number(r[`${prefix}_c_a`]) || 0;
                            const prev = Number(r[`${prefix}_p_a`]) || 0;
                            const text = calculateSmartGrowth(curr, prev);
                            const isGrowth = curr > prev;
                            const isStable = curr === prev;
                            return (
                                <Text type={isStable ? "secondary" : (isGrowth ? "danger" : "success")} style={{ fontSize: '11px', fontWeight: 600 }}>
                                    {text}
                                </Text>
                            );
                        }
                    },
                ]
            }
        ];
    };

    const columns: ColumnsType<Form1Record> = [
        {
            title: t('form1.table.indicator'),
            key: 'name',
            width: 250,
            fixed: 'left',
            render: (_, record) => <Text strong>{t(`diseases.${record.code}`, { defaultValue: record.name })}</Text>
        },
        { title: t('form1.table.code'), dataIndex: 'code', key: 'code', width: 60, align: 'center', fixed: 'left' },
        {
            title: t('form1.table.current_month'),
            children: [
                { title: t('form1.table.total'), children: getStatColumns('m_t') as any },
                { title: t('form1.table.u14'), children: getStatColumns('m_u') as any },
            ]
        },
        {
            title: t('form1.table.ytd'),
            children: [
                { title: t('form1.table.total'), children: getStatColumns('y_t') as any },
                { title: t('form1.table.u14'), children: getStatColumns('y_u') as any },
            ]
        }
    ];

    const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
    const [selectedDisease, setSelectedDisease] = useState<string | null>(null);

    const fetchAllSubmissions = async () => {
        try {
            const periodStr = period.startOf('month').format('YYYY-MM-DD');
            const res = await api.get(`/submissions?period=${periodStr}`);
            setAllSubmissions(res.data);

            if (res.data.length > 0) {
                const aggregated: Record<string, any> = {};
                res.data.forEach((sub: any) => {
                    sub.data.forEach((d: any) => {
                        if (!aggregated[d.code]) {
                            aggregated[d.code] = { ...d };
                            ['m_t_p_a', 'm_t_p_i', 'm_t_c_a', 'm_t_c_i', 'm_u_p_a', 'm_u_p_i', 'm_u_c_a', 'm_u_c_i'].forEach(k => aggregated[d.code][k] = 0);
                        }
                        const acc = aggregated[d.code];
                        acc.m_t_p_a += Number(d.m_t_p_a) || 0;
                        acc.m_t_c_a += Number(d.m_t_c_a) || 0;
                        acc.m_u_p_a += Number(d.m_u_p_a) || 0;
                        acc.m_u_c_a += Number(d.m_u_c_a) || 0;
                    });
                });
                setData(prev => prev.map(item => {
                    const agg = aggregated[item.code];
                    if (agg) {
                        const newItem = { ...item, ...agg };
                        const update = (p: string) => {
                            const isUnder14 = p.includes('_u');
                            const popValue = isUnder14 ? childPopulation : population;

                            const prev = Number(newItem[`${p}_p_a`]) || 0;
                            const curr = Number(newItem[`${p}_c_a`]) || 0;

                            newItem[`${p}_p_i`] = calculateIntensive(prev, popValue);
                            newItem[`${p}_c_i`] = calculateIntensive(curr, popValue);

                            newItem[`${p}_g_a`] = calculateGrowthAbs(curr, prev);
                            newItem[`${p}_g_p`] = calculateGrowthPer(curr, prev);
                        };
                        update('m_t');
                        update('m_u');
                        return newItem;
                    }
                    return item;
                }));
            }
        } catch (e) {
            console.error("Failed to fetch all submissions", e);
        }
    };

    const territoryColumns: ColumnsType<any> = [
        { title: t('form1.table.district_city'), dataIndex: 'orgName', key: 'orgName', width: 200, fixed: 'left' },
        {
            title: t('form1.table.current_month'),
            children: [
                {
                    title: t('form1.table.total'),
                    children: (getStatColumns('m_t') as any).map((group: any) => ({
                        ...group,
                        children: group.children?.map((c: any) => ({
                            ...c,
                            key: `t_${c.key}`,
                            render: (_: any, r: any) => <span style={{ fontWeight: r.isTotal ? 700 : 400 }}>{r[c.key] || 0}</span>
                        }))
                    }))
                },
                {
                    title: t('form1.table.u14'),
                    children: (getStatColumns('m_u') as any).map((group: any) => ({
                        ...group,
                        children: group.children?.map((c: any) => ({
                            ...c,
                            key: `t_${c.key}`,
                            render: (_: any, r: any) => <span style={{ fontWeight: r.isTotal ? 700 : 400 }}>{r[c.key] || 0}</span>
                        }))
                    }))
                }
            ]
        }
    ];

    const getTerritoryData = () => {
        if (!selectedDisease || !allSubmissions.length) return [];

        const results: any[] = [];
        const totals: any = { orgName: t('form1.table.total_province'), isTotal: true };

        allSubmissions.forEach(sub => {
            const diseaseData = sub.data.find((d: any) => d.code === selectedDisease);
            if (diseaseData) {
                const row = {
                    key: sub.organization.id,
                    orgName: sub.organization.name,
                    ...diseaseData
                };
                results.push(row);

                Object.keys(diseaseData).forEach(k => {
                    if (typeof diseaseData[k] === 'number') {
                        totals[k] = (totals[k] || 0) + diseaseData[k];
                    }
                });
            }
        });

        const p = ['m_t', 'm_u', 'y_t', 'y_u'];
        p.forEach(prefix => {
            const isUnder14 = prefix.includes('_u');
            const totalPop = allSubmissions.reduce((acc, sub) => {
                const val = isUnder14 ? sub.organization.child_population : sub.organization.population;
                return acc + (Number(val) || 0);
            }, 0);

            const prev = totals[`${prefix}_p_a`] || 0;
            const curr = totals[`${prefix}_c_a`] || 0;
            totals[`${prefix}_p_i`] = calculateIntensive(prev, totalPop);
            totals[`${prefix}_c_i`] = calculateIntensive(curr, totalPop);
            totals[`${prefix}_g_a`] = calculateGrowthAbs(curr, prev);
            totals[`${prefix}_g_p`] = calculateGrowthPer(curr, prev);
        });

        return [...results, totals];
    };

    const getGlobalMatrixData = () => {
        if (!allSubmissions.length) return [];
        const majorCodes = ['101', '106', '108', '136', '140', '145', '148', '162'];

        return allSubmissions.map(sub => {
            const row: any = {
                key: sub.organization.id,
                orgName: sub.organization.name,
            };
            majorCodes.forEach(code => {
                const disease = sub.data.find((d: any) => d.code === code);
                if (disease) {
                    row[`abs_${code}`] = disease.m_t_c_a;
                    row[`int_${code}`] = disease.m_t_c_i;
                }
            });
            return row;
        });
    };

    const globalMatrixColumns: ColumnsType<any> = [
        {
            title: t('form1.table.district_city'),
            dataIndex: 'orgName',
            key: 'orgName',
            width: 180,
            fixed: 'left',
            render: (text) => t(`orgs.${text}`, { defaultValue: text })
        },
        ...['101', '106', '108', '136', '140', '145', '148', '162'].map(code => ({
            title: t(`diseases.${code}`, { defaultValue: data.find(d => d.code === code)?.name || `Kod ${code}` }),
            children: [
                { title: t('form1.table.abs'), dataIndex: `abs_${code}`, key: `abs_${code}`, width: 60, align: 'center' as const },
                { title: t('form1.table.int'), dataIndex: `int_${code}`, key: `int_${code}`, width: 60, align: 'center' as const },
            ]
        }))
    ];

    const onFinish = async () => {
        if (!templateId) {
            message.error(t('form1.actions.error_no_template'));
            return;
        }
        setLoading(true);
        try {
            const periodStr = period.startOf('month').format('YYYY-MM-DD');
            await submissionApi.create({
                templateId: templateId,
                reportingPeriod: periodStr,
                data: data,
                status: 'SUBMITTED',
            });
            message.success(t('form1.actions.success_save'));
            fetchAllSubmissions();
        } catch (error) {
            message.error(t('form1.actions.error_save'));
        } finally {
            setLoading(false);
        }
    };

    const handleAggregateDaily = async () => {
        setLoading(true);
        try {
            const periodStr = period.startOf('month').format('YYYY-MM-DD');
            const res = await submissionApi.aggregateDaily(periodStr, false);
            const newData = [...data];
            const aggregatedData = res.data;

            aggregatedData.forEach((aggRow: any) => {
                const index = newData.findIndex(item => item.code === aggRow.code);
                if (index > -1) {
                    const r = { ...newData[index] };
                    r.m_t_c_a = aggRow.m_t_c_a;
                    r.m_u_c_a = aggRow.m_u_c_a;
                    const updateGroup = (p: string, row: any) => {
                        const prev = Number(row[`${p}_p_a`]) || 0;
                        const curr = Number(row[`${p}_c_a`]) || 0;
                        row[`${p}_p_i`] = calculateIntensive(prev);
                        row[`${p}_c_i`] = calculateIntensive(curr);
                        row[`${p}_g_a`] = calculateGrowthAbs(curr, prev);
                        row[`${p}_g_p`] = calculateGrowthPer(curr, prev);
                    };
                    updateGroup('m_t', r);
                    updateGroup('m_u', r);
                    newData[index] = r;
                }
            });
            setData(newData);
            message.success(t('form1.actions.success_aggregate'));
        } catch (error) {
            console.error(error);
            message.error(t('form1.actions.error_aggregate'));
        } finally {
            setLoading(false);
        }
    };

    // --- PREMIUM UI UPDATE ---
    const glassStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
        padding: '32px'
    };

    const gradientHeader: React.CSSProperties = {
        background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
        padding: '30px',
        borderRadius: '24px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(0, 114, 255, 0.2)'
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: '#f4f7fa' }}>
            <style>{`
                .form1-tabs .ant-tabs-nav {
                    background: rgba(255, 255, 255, 0.6);
                    border-radius: 16px;
                    padding: 8px;
                    margin-bottom: 24px !important;
                }
                .form1-tabs .ant-tabs-tab {
                    border-radius: 10px !important;
                    transition: all 0.3s ease !important;
                    margin: 0 5px !important;
                    border: none !important;
                    padding: 12px 20px !important;
                }
                .form1-tabs .ant-tabs-tab-active {
                    background: #fff !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08) !important;
                }
                .form1-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: #0072ff !important;
                    font-weight: 800 !important;
                }
                .action-pill {
                    border-radius: 12px;
                    height: 42px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: none !important;
                }
                .save-btn {
                    box-shadow: 0 4px 15px rgba(0, 114, 255, 0.4);
                }
                .bg-prev { background-color: #f6ffed !important; }
                .bg-curr { background-color: #fffbe6 !important; }
                .ant-table-thead > tr > th { 
                    background: #fafafa !important; 
                    font-size: 13px; 
                    text-transform: uppercase; 
                    letter-spacing: 0.5px;
                }
                .ant-table-row:hover > td {
                    background: rgba(0, 114, 255, 0.02) !important;
                }
            `}</style>

            <div style={gradientHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.25)', padding: '12px', borderRadius: '15px' }}>
                        <FileExcelOutlined style={{ fontSize: '30px', color: '#fff' }} />
                    </div>
                    <div>
                        <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
                            {t('form1.title') || 'Shakl 1: Oylik Hisobot'}
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
                            {t('form1.subtitle') || 'Ma\'lumotlarni kiritish va tahlil qilish oynasi'}
                        </Text>
                    </div>
                </div>

                <Space size="middle">
                    <PermissionGate permission="VIEW_FORM1_TABLE1" action="edit">
                        <Space>
                            <Upload beforeUpload={handleBulkUpload} showUploadList={false}>
                                <Button
                                    icon={<UploadOutlined />}
                                    className="action-pill"
                                    style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                                    loading={loading}
                                >
                                    {t('form1.actions.bulk_upload') || 'Ommaviy yuklash'}
                                </Button>
                            </Upload>
                            <Button
                                icon={<ExperimentOutlined />}
                                onClick={handleAggregateDaily}
                                loading={loading}
                                className="action-pill"
                                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                            >
                                {t('form1.actions.fill_daily')}
                            </Button>
                        </Space>
                    </PermissionGate>

                    <DatePicker
                        picker="month"
                        value={period}
                        onChange={(v) => v && setPeriod(v)}
                        format="MMMM YYYY"
                        size="large"
                        style={{ borderRadius: '12px', width: '180px' }}
                    />

                    <PermissionGate permission="VIEW_FORM1_TABLE1" action="edit">
                        <Button
                            type="primary"
                            size="large"
                            icon={<SaveOutlined />}
                            onClick={onFinish}
                            loading={loading}
                            className="action-pill save-btn"
                            style={{ background: '#fff', color: '#0072ff' }}
                        >
                            {t('daily_reports.actions.save')}
                        </Button>
                    </PermissionGate>
                </Space>
            </div>

            <div style={glassStyle}>
                <Tabs
                    defaultActiveKey="1"
                    className="form1-tabs"
                    items={[
                        {
                            key: '1',
                            label: (
                                <PermissionGate permission="VIEW_FORM1_TABLE1">
                                    <span><FileExcelOutlined /> {t('form1.tabs.by_disease')}</span>
                                </PermissionGate>
                            ),
                            children: (
                                <PermissionGate permission="VIEW_FORM1_TABLE1">
                                    <Table
                                        columns={columns}
                                        dataSource={data}
                                        pagination={false}
                                        scroll={{ x: 1800, y: 600 }}
                                        bordered
                                        size="small"
                                        className="premium-table"
                                    />
                                </PermissionGate>
                            )
                        },
                        {
                            key: '2',
                            label: (
                                <PermissionGate permission="VIEW_FORM1_TABLE2">
                                    <span><BarChartOutlined /> {t('form1.tabs.by_territory')}</span>
                                </PermissionGate>
                            ),
                            children: (
                                <PermissionGate permission="VIEW_FORM1_TABLE2">
                                    <div style={{ padding: '0 10px' }}>
                                        <div style={{
                                            background: '#f8f9fa',
                                            padding: '20px',
                                            borderRadius: '15px',
                                            marginBottom: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '20px',
                                            border: '1px solid #eee'
                                        }}>
                                            <Text strong>{t('form1.table.select_disease')}:</Text>
                                            <Select
                                                showSearch
                                                style={{ width: 450 }}
                                                placeholder={t('form1.table.search')}
                                                optionFilterProp="label"
                                                size="large"
                                                options={data.map(d => ({ label: `${d.code} - ${t(`diseases.${d.code}`, { defaultValue: d.name })}`, value: d.code }))}
                                                onChange={setSelectedDisease}
                                            />
                                            <Button
                                                type="primary"
                                                icon={<ReloadOutlined />}
                                                onClick={fetchAllSubmissions}
                                                size="large"
                                                style={{ borderRadius: '10px' }}
                                            >
                                                {t('form1.table.load_data')}
                                            </Button>
                                        </div>
                                        <Table
                                            columns={territoryColumns}
                                            dataSource={getTerritoryData()}
                                            pagination={false}
                                            scroll={{ x: 1000 }}
                                            bordered
                                            size="small"
                                        />
                                    </div>
                                </PermissionGate>
                            )
                        },
                        {
                            key: '3',
                            label: (
                                <PermissionGate permission="VIEW_FORM1_TABLE3">
                                    <span><GlobalOutlined /> {t('form1.tabs.matrix')}</span>
                                </PermissionGate>
                            ),
                            children: (
                                <PermissionGate permission="VIEW_FORM1_TABLE3">
                                    <div style={{ padding: '0 10px' }}>
                                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <Button
                                                type="primary"
                                                icon={<ReloadOutlined />}
                                                onClick={fetchAllSubmissions}
                                                size="large"
                                                style={{ borderRadius: '10px' }}
                                            >
                                                {t('form1.actions.matrix_refresh')}
                                            </Button>
                                            <Text type="secondary">
                                                * {t('form1.table.matrix_hint')}
                                            </Text>
                                        </div>
                                        <Table
                                            columns={globalMatrixColumns}
                                            dataSource={getGlobalMatrixData()}
                                            pagination={false}
                                            scroll={{ x: 1500 }}
                                            bordered
                                            size="small"
                                        />
                                    </div>
                                </PermissionGate>
                            )
                        }
                    ].filter(item => {
                        const userLevel = localStorage.getItem('user_level');
                        const rolePermsStr = localStorage.getItem('user_role_permissions');
                        const rolePerms = rolePermsStr ? JSON.parse(rolePermsStr) : [];
                        if (userLevel === '3' && (item.key === '2' || item.key === '3')) return false;
                        const isAdmin = ['ADMIN', 'REPUBLIC_HEAD'].includes(localStorage.getItem('user_role') || '');
                        if (isAdmin) return true;
                        const permCode = item.key === '1' ? 'VIEW_FORM1_TABLE1' : (item.key === '2' ? 'VIEW_FORM1_TABLE2' : 'VIEW_FORM1_TABLE3');
                        if (rolePermsStr) {
                            const rp = rolePerms.find((p: any) => p.permissionCode === permCode);
                            if (!rp || (!rp.canView && !rp.canEdit)) return false;
                        }
                        return true;
                    })}
                />
            </div>
        </div>
    );

    /* --- ESKI DIZAYN (O'zgarmas Qoidalar asosida saqlab qolindi) ---
    return (
        <div style={{ padding: '24px 0' }}>
            <style>{`
                /* Excel-like Vivid Colors * /
                .bg-prev { background-color: #b7eb8f !important; }
                .bg-curr { background-color: #fffb8f !important; }
                
                .ant-table-thead > tr > th.bg-prev { background-color: #73d13d !important; color: #000; }
                .ant-table-thead > tr > th.bg-curr { background-color: #ffec3d !important; color: #000; }
                
                .bg-prev .ant-input-number-input { background-color: #b7eb8f !important; }
                .bg-curr .ant-input-number-input { background-color: #fffb8f !important; }
                
                .ant-table-thead > tr > th { font-weight: 700 !important; }
                .ant-input-number-input { text-align: center !important; font-weight: 600; }
            `}</style>
            <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {/* [Rest of the old code would go here, simplified to avoid comment nesting issues] * /}
            </Card>
        </div>
    );
    */
};

export default Form1EntryPage;
