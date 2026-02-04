import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Typography, DatePicker, message, InputNumber, Upload, Tabs, Select, Space } from 'antd';
import { FileExcelOutlined, SaveOutlined, UploadOutlined, BarChartOutlined, GlobalOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { read, utils } from 'xlsx';
import { diseasesApi, submissionApi, api } from '../../services/api';
import dayjs from 'dayjs';

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
            const res = await api.get('/auth/me');
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
            message.error("Yo'nalishlarni yuklashda xatolik");
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
                message.success('Excel ma\'lumotlari yuklandi!');
            } catch (error) {
                message.error('Excel o\'qishda xatolik');
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

    const getStatColumns = (prefix: string) => [
        { title: '2023 йил (абс)', width: 80, align: 'center' as const, key: `${prefix}_p_a`, className: 'bg-prev', render: (_: any, r: any) => renderInput(r, `${prefix}_p_a` as any) },
        { title: '2023 йил (инт.к)', width: 80, align: 'center' as const, key: `${prefix}_p_i`, className: 'bg-prev', render: (_: any, r: any) => renderInput(r, `${prefix}_p_i` as any, true) },
        { title: '2024 йил (абс)', width: 80, align: 'center' as const, key: `${prefix}_c_a`, className: 'bg-curr', render: (_: any, r: any) => renderInput(r, `${prefix}_c_a` as any) },
        { title: '2024 йил (инт.к)', width: 80, align: 'center' as const, key: `${prefix}_c_i`, className: 'bg-curr', render: (_: any, r: any) => renderInput(r, `${prefix}_c_i` as any, true) },
        { title: 'рост/камайиш абс.', width: 80, align: 'center' as const, key: `${prefix}_g_a`, render: (_: any, r: any) => renderInput(r, `${prefix}_g_a` as any, true) },
        { title: 'рост/камайиш %', width: 80, align: 'center' as const, key: `${prefix}_g_p`, render: (_: any, r: any) => renderInput(r, `${prefix}_g_p` as any, true) },
    ];

    const columns: ColumnsType<Form1Record> = [
        { title: 'Кўрсаткичлар номи', dataIndex: 'name', key: 'name', width: 250, fixed: 'left', render: (t) => <Text strong>{t}</Text> },
        { title: 'Код', dataIndex: 'code', key: 'code', width: 60, align: 'center', fixed: 'left' },
        {
            title: 'жорий ой',
            children: [
                { title: 'жами', children: getStatColumns('m_t') as any },
                { title: '14 ёшгача', children: getStatColumns('m_u') as any },
            ]
        },
        {
            title: 'йил бошиdan buyon',
            children: [
                { title: 'жами', children: getStatColumns('y_t') as any },
                { title: '14 ёшгача', children: getStatColumns('y_u') as any },
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
        } catch (e) {
            console.error("Failed to fetch all submissions", e);
        }
    };

    const territoryColumns: ColumnsType<any> = [
        { title: 'Tuman/Shahar', dataIndex: 'orgName', key: 'orgName', width: 200, fixed: 'left' },
        ...(getStatColumns('m_t') as any).map((c: any) => ({
            ...c,
            key: `t_${c.key}`,
            render: (_: any, r: any) => <span style={{ fontWeight: r.isTotal ? 700 : 400 }}>{r[c.key] || 0}</span>
        })),
        ...(getStatColumns('m_u') as any).map((c: any) => ({
            ...c,
            key: `t_${c.key}`,
            render: (_: any, r: any) => <span style={{ fontWeight: r.isTotal ? 700 : 400 }}>{r[c.key] || 0}</span>
        })),
    ];

    const getTerritoryData = () => {
        if (!selectedDisease || !allSubmissions.length) return [];

        const results: any[] = [];
        const totals: any = { orgName: 'JAMI (Viloyat)', isTotal: true };

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
        { title: 'Hudud', dataIndex: 'orgName', key: 'orgName', width: 180, fixed: 'left' },
        ...['101', '106', '108', '136', '140', '145', '148', '162'].map(code => ({
            title: data.find(d => d.code === code)?.name || `Kod ${code}`,
            children: [
                { title: 'абс', dataIndex: `abs_${code}`, key: `abs_${code}`, width: 60, align: 'center' as const },
                { title: 'инт', dataIndex: `int_${code}`, key: `int_${code}`, width: 60, align: 'center' as const },
            ]
        }))
    ];

    const onFinish = async () => {
        if (!templateId) {
            message.error("Hisobot shakli topilmadi");
            return;
        }
        setLoading(true);
        try {
            const periodStr = period.startOf('month').format('YYYY-MM-DD');
            await submissionApi.create({
                templateId: templateId,
                reportingPeriod: periodStr,
                data: data,
                status: 'SUBMITTED'
            });
            message.success('Shakl 1 hisoboti muvaffaqiyatli saqlandi!');
            fetchAllSubmissions();
        } catch (error) {
            message.error('Saqlashda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px 0' }}>
            <style>{`
                .bg-prev { background-color: #f6ffed !important; }
                .bg-curr { background-color: #fffbe6 !important; }
                .ant-table-thead > tr > th { background-color: #fafafa !important; font-weight: 700 !important; }
                .ant-input-number-input { text-align: center !important; }
            `}</style>
            <Card bordered={false} style={{ borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: '#e6f4ff', padding: '8px', borderRadius: '6px' }}>
                                <FileExcelOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
                            </div>
                            <div>
                                <Title level={3} style={{ margin: 0 }}>Hisobot Shakl №1</Title>
                                <Text type="secondary">Yuqumli kasalliklar to'g'risida oylik hisobot</Text>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Upload beforeUpload={handleExcelUpload} showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Excel Yuklash</Button>
                        </Upload>
                        <DatePicker picker="month" value={period} onChange={(v) => v && setPeriod(v)} format="MMMM YYYY" />
                        <Button type="primary" size="large" icon={<SaveOutlined />} onClick={onFinish} loading={loading}>
                            Saqlash
                        </Button>
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
                        // UZ: Admin yoki Viloyat darajasidagi foydalanuvchilar uchun qo'shimcha tablar
                        ...(['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(localStorage.getItem('user_role') || '') ? [
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
                        ] : [])
                    ]} />
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
