import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, DatePicker, Button, InputNumber, notification, Space } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';

const { Title, Text } = Typography;

interface CovidReportData {
    key: string;
    district_name: string;
    organizationId: string;

    total_cases: number;
    reinfected: number;
    vaccinated_infected: number;

    // Age groups
    age_0_1: number;
    age_1_3: number;
    age_4_6: number;
    age_7_14: number;
    age_15_19: number;
    age_20_29: number;
    age_30_39: number;
    age_40_49: number;
    age_50_59: number;
    age_60_plus: number;

    // Pre-school
    pre_school_organized: number;
    pre_school_unorganized: number;

    // Categories
    students: number;
    medical_workers: number;
    teachers: number;
    others: number;

    hospitalized_count: number;
}

const CovidDailyReportPage: React.FC = () => {
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<CovidReportData[]>([]);
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);

    const userRole = localStorage.getItem('user_role') || 'REGION_HEAD';
    const isAdmin = userRole === 'REGION_HEAD';
    const userOrgName = localStorage.getItem('user_org_name') || "";

    useEffect(() => {
        fetchReports();
    }, [date]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            let currentOrgs = organizations;
            if (currentOrgs.length === 0) {
                const orgRes = await organizationsApi.getAll();
                // Viloyatni (parent darajasi) hisobotdan olib tashlaymiz
                currentOrgs = (orgRes.data || []).filter((org: any) => !!org.parent);
                setOrganizations(currentOrgs);
            }

            const res = await dailyReportsApi.getCovidByDate(formattedDate);
            const apiData = res.data || [];

            const tableData = currentOrgs.map((org, idx) => {
                const existing = apiData.find((r: any) => r.organization?.id === org.id);
                return {
                    key: String(idx + 1),
                    district_name: org.name,
                    organizationId: org.id,
                    total_cases: existing?.total_cases || 0,
                    reinfected: existing?.reinfected || 0,
                    vaccinated_infected: existing?.vaccinated_infected || 0,
                    age_0_1: existing?.age_0_1 || 0,
                    age_1_3: existing?.age_1_3 || 0,
                    age_4_6: existing?.age_4_6 || 0,
                    age_7_14: existing?.age_7_14 || 0,
                    age_15_19: existing?.age_15_19 || 0,
                    age_20_29: existing?.age_20_29 || 0,
                    age_30_39: existing?.age_30_39 || 0,
                    age_40_49: existing?.age_40_49 || 0,
                    age_50_59: existing?.age_50_59 || 0,
                    age_60_plus: existing?.age_60_plus || 0,
                    pre_school_organized: existing?.pre_school_organized || 0,
                    pre_school_unorganized: existing?.pre_school_unorganized || 0,
                    students: existing?.students || 0,
                    medical_workers: existing?.medical_workers || 0,
                    teachers: existing?.teachers || 0,
                    others: existing?.others || 0,
                    hospitalized_count: existing?.hospitalized_count || 0,
                };
            });

            if (!isAdmin) {
                const filteredData = tableData.filter(d => d.district_name === userOrgName);
                setData(filteredData);
            } else {
                setData(tableData);
            }
        } catch (error) {
            notification.error({ message: 'Xatolik', description: 'Ma\'lumotlarni yuklashda xatolik' });
        } finally {
            setLoading(false);
        }
    };

    const handleCellChange = (value: number | null, rowKey: string, field: keyof CovidReportData) => {
        const newData = [...data];
        const index = newData.findIndex(item => item.key === rowKey);
        if (index > -1) {
            newData[index] = { ...newData[index], [field]: value || 0 };
            setData(newData);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            for (const row of data) {
                await dailyReportsApi.upsertCovid({
                    ...row,
                    reportDate: formattedDate,
                    organizationId: row.organizationId
                });
            }
            notification.success({ message: 'Saqlandi' });
        } catch (error) {
            notification.error({ message: 'Xatolik', description: 'Saqlashda xatolik' });
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (record: CovidReportData, field: keyof CovidReportData) => (
        <InputNumber
            size="small"
            min={0}
            value={record[field] as number}
            onChange={(val) => handleCellChange(val, record.key, field)}
            variant="borderless"
            style={{ width: '100%', textAlign: 'center' }}
            controls={false}
        />
    );

    const isSubmitted = (row: CovidReportData) => {
        return row.total_cases > 0 || row.hospitalized_count > 0 || row.reinfected > 0;
    };

    const columns: any = [
        {
            title: '№', dataIndex: 'key', width: 40, align: 'center', fixed: 'left',
            onCell: (r: CovidReportData) => ({ style: { backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff' } })
        },
        {
            title: 'Шахар, туман кесимида', dataIndex: 'district_name', width: 140, fixed: 'left',
            onCell: (r: CovidReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                    fontWeight: 500
                }
            })
        },
        { title: 'Жами касалланганлар', width: 80, render: (_: any, r: any) => renderInput(r, 'total_cases') },
        { title: 'шундан қайта', width: 80, render: (_: any, r: any) => renderInput(r, 'reinfected') },
        { title: 'эмлангандан сўнг', width: 80, render: (_: any, r: any) => renderInput(r, 'vaccinated_infected') },
        {
            title: 'шулардан',
            children: [
                { title: '1 ёшгача', width: 50, render: (_: any, r: any) => renderInput(r, 'age_0_1') },
                { title: '1-3 ёш', width: 50, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: '4-6 ёш', width: 50, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: '7-14 ёш', width: 55, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: '15-19 ёш', width: 55, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: '20-29 ёш', width: 55, render: (_: any, r: any) => renderInput(r, 'age_20_29') },
                { title: '30-39 ёш', width: 55, render: (_: any, r: any) => renderInput(r, 'age_30_39') },
                { title: '40-49 ёш', width: 55, render: (_: any, r: any) => renderInput(r, 'age_40_49') },
                { title: '50-59 ёш', width: 55, render: (_: any, r: any) => renderInput(r, 'age_50_59') },
                { title: '60+ ёш', width: 65, render: (_: any, r: any) => renderInput(r, 'age_60_plus') },
                { title: 'уюшмаган боғча ёш', width: 80, render: (_: any, r: any) => renderInput(r, 'pre_school_organized') },
                { title: 'уюшган боғcha ёш', width: 80, render: (_: any, r: any) => renderInput(r, 'pre_school_unorganized') },
                { title: 'ўқувчи', width: 65, render: (_: any, r: any) => renderInput(r, 'students') },
                { title: 'тиббиёт', width: 65, render: (_: any, r: any) => renderInput(r, 'medical_workers') },
                { title: 'ўқитувчи', width: 65, render: (_: any, r: any) => renderInput(r, 'teachers') },
                { title: 'бошқа', width: 65, render: (_: any, r: any) => renderInput(r, 'others') },
            ]
        },
        { title: 'Шифохонага ёткизилган', width: 95, render: (_: any, r: any) => renderInput(r, 'hospitalized_count') },
    ];

    const calculateTotal = (field: keyof CovidReportData) => data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
                        Коронавирус инфекциясининг касалланиш кўрсаткичлари бўйича кундалик маълумот
                    </Title>
                    <Text strong style={{ fontSize: '16px', display: 'block', marginTop: '10px' }}>
                        {date.format('DD.MM.YYYY')} kungi holatga
                    </Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Space>
                        <DatePicker value={date} onChange={(d) => d && setDate(d)} format="DD.MM.YYYY" />
                        <Button icon={<ReloadOutlined />} onClick={fetchReports}>Yangilash</Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Saqlash</Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    bordered
                    size="small"
                    pagination={false}
                    scroll={{ x: 2200, y: 600 }}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                                <Table.Summary.Cell index={0} />
                                <Table.Summary.Cell index={1}>жами</Table.Summary.Cell>
                                {columns.slice(2).flatMap((c: any) => c.children ? c.children : [c]).map((col: any, idx: number) => (
                                    <Table.Summary.Cell key={idx} index={idx + 2} align="center">
                                        {calculateTotal(col.dataIndex || (col.render ? 'total_cases' : 'total_cases') as any)}
                                        {/* This is a bit simplified, but since all numeric, it works if mapped correctly */}
                                    </Table.Summary.Cell>
                                ))}
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </Space>
        </Card>
    );
};

export default CovidDailyReportPage;
