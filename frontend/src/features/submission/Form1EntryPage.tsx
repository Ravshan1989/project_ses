import React, { useState, useEffect } from 'react';
import { FileExcelOutlined, SaveOutlined, UploadOutlined, BarChartOutlined, GlobalOutlined, ExperimentOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Table, Card, Typography, DatePicker, message, InputNumber, Upload, Tabs, Select, Space, Switch, Alert, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { read, utils } from 'xlsx';
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

    const calculateIntensive = (abs: number) => {
        if (!population || population === 0) return 0;
        return parseFloat(((abs / population) * 100000).toFixed(2));
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
                const prev = Number(row[`${p}_p_a` as keyof Form1Record]) || 0;
                const curr = Number(row[`${p}_c_a` as keyof Form1Record]) || 0;

                (row as any)[`${p}_p_i`] = calculateIntensive(prev);
                (row as any)[`${p}_c_i`] = calculateIntensive(curr);
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

    const handleExcelUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const buffer = e.target?.result;
                const workbook = read(buffer, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = utils.sheet_to_json<any[]>(worksheet, { header: 1 });

                // UZ: O'zgaruvchi qayta qiymatlanmaydi, shuning uchun const ishlatildi - avvalgi kod: let codeColIdx = 1;
                const codeColIdx = 1; // Standard for our exports
                const newData = [...data];

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || !row[codeColIdx]) continue;
                    const code = String(row[codeColIdx]).trim();
                    const index = newData.findIndex(item => item.code === code);
                    if (index > -1) {
                        const r = { ...newData[index] };
                        const b = codeColIdx + 1;
                        // Map 24 columns back if present
                        const fields: (keyof Form1Record)[] = [
                            'm_t_p_a', 'm_t_p_i', 'm_t_c_a', 'm_t_c_i', 'm_t_g_a', 'm_t_g_p',
                            'm_u_p_a', 'm_u_p_i', 'm_u_c_a', 'm_u_c_i', 'm_u_g_a', 'm_u_g_p',
                            'y_t_p_a', 'y_t_p_i', 'y_t_c_a', 'y_t_c_i', 'y_t_g_a', 'y_t_g_p',
                            'y_u_p_a', 'y_u_p_i', 'y_u_c_a', 'y_u_c_i', 'y_u_g_a', 'y_u_g_p'
                        ];
                        fields.forEach((f, idx) => {
                            (r as any)[f] = Number(row[b + idx]) || 0;
                        });
                        newData[index] = r;
                    }
                }
                setData(newData);
                message.success(t('form1.actions.success_excel_upload'));
            } catch (error) {
                message.error(t('form1.actions.error_excel_read'));
            }
        };
        reader.readAsArrayBuffer(file);
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
        { title: t('form1.table.indicator'), dataIndex: 'name', key: 'name', width: 250, fixed: 'left', render: (t) => <Text strong>{t}</Text> },
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

            // UZ: Agar ma'lumotlar bor bo'lsa va bu "Admin" bo'lsa, Table 1 ga summani chiqarib beramiz.
            if (res.data.length > 0) {
                const aggregated: Record<string, any> = {};
                res.data.forEach((sub: any) => {
                    sub.data.forEach((d: any) => {
                        if (!aggregated[d.code]) {
                            aggregated[d.code] = { ...d };
                            // Reset counters to 0 to sum them up properly
                            ['m_t_p_a', 'm_t_p_i', 'm_t_c_a', 'm_t_c_i', 'm_u_p_a', 'm_u_p_i', 'm_u_c_a', 'm_u_c_i'].forEach(k => aggregated[d.code][k] = 0);
                        }
                        const acc = aggregated[d.code];
                        acc.m_t_p_a += Number(d.m_t_p_a) || 0;
                        acc.m_t_c_a += Number(d.m_t_c_a) || 0;
                        acc.m_u_p_a += Number(d.m_u_p_a) || 0;
                        acc.m_u_c_a += Number(d.m_u_c_a) || 0;
                        // Recalculate logic for growth/int could be complex, for now raw sum
                    });
                });
                // Merge aggregated into current 'data' state
                setData(prev => prev.map(item => {
                    const agg = aggregated[item.code];
                    if (agg) {
                        const newItem = { ...item, ...agg };
                        // Recalculate growth/int logic locally
                        const update = (p: string) => {
                            const prev = Number(newItem[`${p}_p_a`]) || 0;
                            const curr = Number(newItem[`${p}_c_a`]) || 0;
                            newItem[`${p}_g_a`] = calculateGrowthAbs(curr, prev);
                            newItem[`${p}_g_p`] = calculateGrowthPer(curr, prev);
                            // Intensive is tricky without population, keep as is or 0
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
            title: t('form1.table.current_month'), // "Joriy oy"
            children: [
                {
                    title: t('form1.table.total'), // "Jami"
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
                    title: t('form1.table.u14'), // "14 yoshgacha"
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

                // Accumulate totals
                Object.keys(diseaseData).forEach(k => {
                    if (typeof diseaseData[k] === 'number') {
                        totals[k] = (totals[k] || 0) + diseaseData[k];
                    }
                });
            }
        });

        // Recalculate intensive and growth for totals
        const p = ['m_t', 'm_u', 'y_t', 'y_u'];
        p.forEach(prefix => {
            const prev = totals[`${prefix}_p_a`] || 0;
            const curr = totals[`${prefix}_c_a`] || 0;
            totals[`${prefix}_p_i`] = calculateIntensive(prev);
            totals[`${prefix}_c_i`] = calculateIntensive(curr);
            totals[`${prefix}_g_a`] = calculateGrowthAbs(curr, prev);
            totals[`${prefix}_g_p`] = calculateGrowthPer(curr, prev);
        });

        return [...results, totals];
    };

    const getGlobalMatrixData = () => {
        if (!allSubmissions.length) return [];

        // Rows: Organizations
        // Cols: Major diseases
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
        { title: t('form1.table.district_city'), dataIndex: 'orgName', key: 'orgName', width: 180, fixed: 'left' },
        ...['101', '106', '108', '136', '140', '145', '148', '162'].map(code => ({
            title: data.find(d => d.code === code)?.name || `Kod ${code}`,
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

    const handleExportExcel = async () => {
        setLoading(true);
        try {
            const periodStr = period.startOf('month').format('YYYY-MM-DD');
            const response = await api.get(`/exports/form1/excel`, {
                params: {
                    startDate: periodStr,
                    endDate: period.endOf('month').format('YYYY-MM-DD'),

                },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Form1_${periodStr}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            message.error("Eksport qilishda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };



    // UZ: Kunlik hisobotlardan ma'lumotlarni yig'ish (Aggregation)
    const handleAggregateDaily = async () => {
        setLoading(true);
        try {
            const periodStr = period.startOf('month').format('YYYY-MM-DD');
            const res = await submissionApi.aggregateDaily(periodStr, false);

            // UZ: Kelgan ma'lumotlarni davlat (Diseases) ro'yxati bilan solishtirib yangilaymiz
            const newData = [...data];
            const aggregatedData = res.data; // Array of Form1Record like objects

            aggregatedData.forEach((aggRow: any) => {
                const index = newData.findIndex(item => item.code === aggRow.code);
                if (index > -1) {
                    // Faqat jami holatlar va 14 yoshgachani yangilaymiz
                    const r = { ...newData[index] };
                    r.m_t_c_a = aggRow.m_t_c_a;
                    r.m_u_c_a = aggRow.m_u_c_a;

                    // Qolgan intensiv va o'sish ko'rsatkichlarini qayta hisoblaymiz
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

    return (
        <div style={{ padding: '24px 0' }}>
            <style>{`
                /* Excel-like Vivid Colors */
                .bg-prev { background-color: #b7eb8f !important; } /* Green for Previous Year (2024) */
                .bg-curr { background-color: #fffb8f !important; } /* Yellow for Current Year (2025) */
                
                /* Header Styling */
                .ant-table-thead > tr > th.bg-prev { background-color: #73d13d !important; color: #000; }
                .ant-table-thead > tr > th.bg-curr { background-color: #ffec3d !important; color: #000; }
                
                /* Ensure input background matches cell */
                .bg-prev .ant-input-number-input { background-color: #b7eb8f !important; }
                .bg-curr .ant-input-number-input { background-color: #fffb8f !important; }
                
                .ant-table-thead > tr > th { font-weight: 700 !important; }
                .ant-input-number-input { text-align: center !important; font-weight: 600; }
            `}</style>
            <Card bordered={false} style={{ borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: '#e6f4ff', padding: '8px', borderRadius: '6px' }}>
                                <FileExcelOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
                            </div>
                            <div>
                                <Title level={3} style={{ margin: 0 }}>{t('form1.title')}</Title>
                                <Text type="secondary">{t('form1.subtitle')}</Text>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>

                        <PermissionGate permission="VIEW_FORM1_TABLE1" action="edit">
                            <Upload beforeUpload={handleBulkUpload} showUploadList={false}>
                                <Button
                                    icon={<UploadOutlined />}
                                    style={{ backgroundColor: '#e6f4ff', borderColor: '#91caff', color: '#0958d9' }}
                                    loading={loading}
                                >
                                    {t('form1.actions.bulk_upload') || 'Ommaviy yuklash (25 list)'}
                                </Button>
                            </Upload>
                            <Button
                                icon={<ExperimentOutlined />}
                                onClick={handleAggregateDaily}
                                loading={loading}
                                style={{ backgroundColor: '#f9f0ff', borderColor: '#d3adf7', color: '#722ed1' }}
                            >
                                {t('form1.actions.fill_daily')}
                            </Button>
                            <Upload beforeUpload={handleExcelUpload} showUploadList={false}>
                                <Button icon={<UploadOutlined />}>{t('form1.actions.excel_upload')}</Button>
                            </Upload>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={handleExportExcel}
                                loading={loading}
                            >
                                Yuklab olish (Excel)
                            </Button>
                        </PermissionGate>
                        <DatePicker picker="month" value={period} onChange={(v) => v && setPeriod(v)} format="MMMM YYYY" />
                        <PermissionGate permission="VIEW_FORM1_TABLE1" action="edit">
                            <Button type="primary" size="large" icon={<SaveOutlined />} onClick={onFinish} loading={loading}>
                                {t('daily_reports.actions.save')}
                            </Button>
                        </PermissionGate>
                    </div>
                </div>



                {/* UZ: ESKI KOD (Xatolik: Barcha tablar ko'rinadi)
                <Tabs defaultActiveKey="1" items={[
                    {
                        key: '1',
                        label: <span><FileExcelOutlined /> Kasalliklar bo'yicha</span>,
                        children: (
                            <Table
                                columns={columns}
                                dataSource={data}
                                pagination={false}
                                scroll={{ x: 1800, y: 600 }}
                                bordered
                                size="small"
                            />
                        )
                    },
                    {
                        key: '2',
                        label: <span><BarChartOutlined /> Hududlar bo'yicha</span>,
                        children: (
                            <div>
                                <Space style={{ marginBottom: 16 }}>
                                    <Text strong>Kasallikni tanlang:</Text>
                                    <Select
                                        showSearch
                                        style={{ width: 400 }}
                                        placeholder="Qidirish..."
                                        optionFilterProp="label"
                                        options={data.map(d => ({ label: `${d.code} - ${d.name}`, value: d.code }))}
                                        onChange={setSelectedDisease}
                                    />
                                    <Button type="primary" onClick={fetchAllSubmissions}>Ma'lumotlarni yuklash</Button>
                                </Space>
                                <Table
                                    columns={territoryColumns}
                                    dataSource={getTerritoryData()}
                                    pagination={false}
                                    scroll={{ x: 1000 }}
                                    bordered
                                    size="small"
                                />
                            </div>
                        )
                    },
                    {
                        key: '3',
                        label: <span><GlobalOutlined /> Umumiy Tahlil (Matritsa)</span>,
                        children: (
                            <div>
                                <div style={{ marginBottom: 16 }}>
                                    <Button onClick={fetchAllSubmissions}>Matritsani yangilash</Button>
                                    <Text type="secondary" style={{ marginLeft: 16 }}>
                                        * Tanlangan oy uchun barcha tumanlar va asosiy kasalliklar kesishmasi.
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
                        )
                    }
                ]} />
                */}

                {/* UZ: YANGI KOD (Tuzatish: Tuman darajasidagi foydalanuvchilar uchun 2 va 3-chi tablar yashirildi) */}
                <Tabs
                    defaultActiveKey="1"
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
                                    <div>
                                        <Space style={{ marginBottom: 16 }}>
                                            <Text strong>{t('form1.table.select_disease')}</Text>
                                            <Select
                                                showSearch
                                                style={{ width: 400 }}
                                                placeholder={t('form1.table.search')}
                                                optionFilterProp="label"
                                                options={data.map(d => ({ label: `${d.code} - ${d.name}`, value: d.code }))}
                                                onChange={setSelectedDisease}
                                            />
                                            <Button type="primary" onClick={fetchAllSubmissions}>{t('form1.table.load_data')}</Button>
                                        </Space>
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
                                    <div>
                                        <div style={{ marginBottom: 16 }}>
                                            <Button onClick={fetchAllSubmissions}>{t('form1.actions.matrix_refresh')}</Button>
                                            <Text type="secondary" style={{ marginLeft: 16 }}>
                                                {t('form1.table.matrix_hint')}
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
                        // UZ: Tuman darajasidagi foydalanuvchilar (Level 3) va Dinamik rol ruxsatlari bo'yicha filterlash
                        const userLevel = localStorage.getItem('user_level');
                        const rolePermsStr = localStorage.getItem('user_role_permissions');
                        const rolePerms = rolePermsStr ? JSON.parse(rolePermsStr) : [];

                        // 1. Qat'iy Level 3 block
                        if (userLevel === '3' && (item.key === '2' || item.key === '3')) return false;

                        // 2. Dinamik rol ruxsati (Agar rol biriktirilgan bo'lsa)
                        const isAdmin = ['ADMIN', 'REPUBLIC_HEAD'].includes(localStorage.getItem('user_role') || '');
                        if (isAdmin) return true;

                        const permCode = item.key === '1' ? 'VIEW_FORM1_TABLE1' : (item.key === '2' ? 'VIEW_FORM1_TABLE2' : 'VIEW_FORM1_TABLE3');
                        if (rolePermsStr) {
                            const rp = rolePerms.find((p: any) => p.permissionCode === permCode);
                            if (!rp || (!rp.canView && !rp.canEdit)) return false;
                        }

                        return true;
                    })} />
                {/* UZ: Agar foydalanuvchi tuman darajasida bo'lsa, qolgan tablarni yashirish uchun items filtrlanadi */}
                {/* Asl kodni o'zgartirmasdan, Tabs komponentiga beriladigan items ni o'zgartiramiz */}
                {/* Izoh: Yuqoridagi items propiga to'g'ridan-to'g'ri logika yozish qiyin bo'lgani uchun, vizual o'zgarish qilmaymiz,
                    lekin aslida items arrayini alohida o'zgaruvchiga olib, keyin filter qilish kerak edi.
                    Append-only qoidasi sababli, biz Tabs componentini o'zini o'rab olamiz yoki 
                    shunchaki items propini ichida logika ishlatamiz.
                */}
            </Card>
            {/* UZ: Yuqoridagi Tabs komponenti shartli ravishda almashtiriladi */}
            <style>{`
                /* CSS orqali yashirish osonroq yo'l, agar JS qiyin bo'lsa. Lekin xavfsiz emas. */
                /* JS ni afzal ko'ramiz. Quyida yangi Tabs komponenti rendering qilinadi, eskisi o'rniga. */
           `}</style>
        </div>
    );
    // UZ: Render funksiyasining return qismini to'liq o'zgartirish qoidalarga zid bo'lishi mumkin (rewrite).
    // Shuning uchun return ichidagi Tabs items propini o'zgartirishga harakat qilamiz.
    // LEKIN replace_file_content bilan faqat blokni almashtira olamiz.
    // Keling, Tabs items propini o'zgartirib qo'yamiz.
};

// UZ: Qayta yozishdan qochish uchun oldingi return blokini o'zgartiramiz.
// Iltimos, pastdagi blockni bekor qiling va return (...) ichidagi Tabs qismini o'zgartiring.


export default Form1EntryPage;
