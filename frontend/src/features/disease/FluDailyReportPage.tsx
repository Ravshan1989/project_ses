import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, DatePicker, Button, InputNumber, notification, Space } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';

const { Title, Text } = Typography;

interface FluReportData {
    key: string;
    district_name: string;
    organizationId: string;
    institution_count: number;

    // O'tkir respirator infeksiyalar (O'RI / ARI)
    ari_total: number;
    ari_0_1: number;
    ari_1_2: number;
    ari_3_6: number;
    ari_7_14: number;
    ari_adult: number;
    ari_students: number;
    ari_nursery: number;

    // O'tkir zotiljam (O'P / Pneumonia)
    pneu_total: number;
    pneu_0_2: number;
    pneu_3_6: number;
    pneu_7_14: number;
    pneu_adult: number;
    pneu_students: number;
    pneu_nursery: number;

    // Grippga o'xshash kasalliklar (GK / Flu)
    flu_total: number;
    flu_0_1: number;
    flu_1_2: number;
    flu_3_6: number;
    flu_7_14: number;
    flu_adult: number;
    flu_students: number;
    flu_nursery: number;

    // Og'ir o'tkir respirator infeksiyalar (SARI)
    sari_total: number;
    sari_0_2: number;
    sari_3_6: number;
    sari_7_14: number;
    sari_adult: number;

    // Vafot etganlar (Deaths)
    death_total: number;
    death_pregnant: number;
}

const FluDailyReportPage: React.FC = () => {
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<FluReportData[]>([]);
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

            const res = await dailyReportsApi.getFluByDate(formattedDate);
            const apiData = res.data || [];

            const tableData = currentOrgs.map((org, idx) => {
                const existing = apiData.find((r: any) => r.organization?.id === org.id);
                return {
                    key: String(idx + 1),
                    district_name: org.name,
                    organizationId: org.id,
                    institution_count: existing?.institution_count || 0,
                    ari_total: existing?.ari_total || 0,
                    ari_0_1: existing?.ari_0_1 || 0,
                    ari_1_2: existing?.ari_1_2 || 0,
                    ari_3_6: existing?.ari_3_6 || 0,
                    ari_7_14: existing?.ari_7_14 || 0,
                    ari_adult: existing?.ari_adult || 0,
                    ari_students: existing?.ari_students || 0,
                    ari_nursery: existing?.ari_nursery || 0,
                    pneu_total: existing?.pneu_total || 0,
                    pneu_0_2: existing?.pneu_0_2 || 0,
                    pneu_3_6: existing?.pneu_3_6 || 0,
                    pneu_7_14: existing?.pneu_7_14 || 0,
                    pneu_adult: existing?.pneu_adult || 0,
                    pneu_students: existing?.pneu_students || 0,
                    pneu_nursery: existing?.pneu_nursery || 0,
                    flu_total: existing?.flu_total || 0,
                    flu_0_1: existing?.flu_0_1 || 0,
                    flu_1_2: existing?.flu_1_2 || 0,
                    flu_3_6: existing?.flu_3_6 || 0,
                    flu_7_14: existing?.flu_7_14 || 0,
                    flu_adult: existing?.flu_adult || 0,
                    flu_students: existing?.flu_students || 0,
                    flu_nursery: existing?.flu_nursery || 0,
                    sari_total: existing?.sari_total || 0,
                    sari_0_2: existing?.sari_0_2 || 0,
                    sari_3_6: existing?.sari_3_6 || 0,
                    sari_7_14: existing?.sari_7_14 || 0,
                    sari_adult: existing?.sari_adult || 0,
                    death_total: existing?.death_total || 0,
                    death_pregnant: existing?.death_pregnant || 0,
                };
            });

            if (!isAdmin) {
                const filteredData = tableData.filter(d => d.district_name === userOrgName);
                setData(filteredData);
            } else {
                setData(tableData);
            }
        } catch (error) {
            console.error(error);
            notification.error({ message: 'Xatolik', description: 'Ma\'lumotlarni yuklashda xatolik' });
        } finally {
            setLoading(false);
        }
    };

    const handleCellChange = (value: number | null, rowKey: string, field: keyof FluReportData) => {
        const newData = [...data];
        const index = newData.findIndex(item => item.key === rowKey);
        if (index > -1) {
            let updatedRow = { ...newData[index], [field]: value || 0 };

            // Auto-calculate section totals
            if (field.startsWith('ari_') && field !== 'ari_total') {
                updatedRow.ari_total = updatedRow.ari_0_1 + updatedRow.ari_1_2 + updatedRow.ari_3_6 + updatedRow.ari_7_14 + updatedRow.ari_adult;
            }
            if (field.startsWith('pneu_') && field !== 'pneu_total') {
                updatedRow.pneu_total = updatedRow.pneu_0_2 + updatedRow.pneu_3_6 + updatedRow.pneu_7_14 + updatedRow.pneu_adult;
            }
            if (field.startsWith('flu_') && field !== 'flu_total') {
                updatedRow.flu_total = updatedRow.flu_0_1 + updatedRow.flu_1_2 + updatedRow.flu_3_6 + updatedRow.flu_7_14 + updatedRow.flu_adult;
            }
            if (field.startsWith('sari_') && field !== 'sari_total') {
                updatedRow.sari_total = updatedRow.sari_0_2 + updatedRow.sari_3_6 + updatedRow.sari_7_14 + updatedRow.sari_adult;
            }

            newData[index] = updatedRow;
            setData(newData);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            for (const row of data) {
                await dailyReportsApi.upsertFlu({
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

    const renderInput = (record: FluReportData, field: keyof FluReportData, readOnly = false) => (
        <InputNumber
            size="small"
            min={0}
            value={record[field] as number}
            onChange={(val) => !readOnly && handleCellChange(val, record.key, field)}
            variant="borderless"
            readOnly={readOnly}
            style={{ width: '100%', textAlign: 'center', fontWeight: readOnly ? 'bold' : 'normal' }}
            controls={false}
        />
    );

    const isSubmitted = (row: FluReportData) => {
        return (row.ari_total + row.flu_total + row.pneu_total + row.sari_total + row.death_total) > 0;
    };

    const columns: any = [
        {
            title: '№', dataIndex: 'key', width: 40, align: 'center', fixed: 'left',
            onCell: (r: FluReportData) => ({ style: { backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff' } })
        },
        {
            title: 'Hududlar', dataIndex: 'district_name', width: 140, fixed: 'left',
            onCell: (r: FluReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                    fontWeight: 500
                }
            })
        },
        {
            title: 'O\'tkir respirator infeksiyalar',
            children: [
                { title: 'Jami', width: 60, render: (_: any, r: any) => renderInput(r, 'ari_total', true) },
                { title: '0-1 y', width: 50, render: (_: any, r: any) => renderInput(r, 'ari_0_1') },
                { title: '1-2 y', width: 50, render: (_: any, r: any) => renderInput(r, 'ari_1_2') },
                { title: '3-6 y', width: 50, render: (_: any, r: any) => renderInput(r, 'ari_3_6') },
                { title: '7-14 y', width: 55, render: (_: any, r: any) => renderInput(r, 'ari_7_14') },
                { title: 'kattalar', width: 65, render: (_: any, r: any) => renderInput(r, 'ari_adult') },
                { title: 'O\'quv', width: 55, render: (_: any, r: any) => renderInput(r, 'ari_students') },
                { title: 'Tarb', width: 55, render: (_: any, r: any) => renderInput(r, 'ari_nursery') },
            ]
        },
        {
            title: 'O\'tkir zotiljam',
            children: [
                { title: 'Jami', width: 60, render: (_: any, r: any) => renderInput(r, 'pneu_total', true) },
                { title: '0-2 y', width: 50, render: (_: any, r: any) => renderInput(r, 'pneu_0_2') },
                { title: '3-6 y', width: 50, render: (_: any, r: any) => renderInput(r, 'pneu_3_6') },
                { title: '7-14 y', width: 55, render: (_: any, r: any) => renderInput(r, 'pneu_7_14') },
                { title: 'kattalar', width: 65, render: (_: any, r: any) => renderInput(r, 'pneu_adult') },
                { title: 'O\'quv', width: 55, render: (_: any, r: any) => renderInput(r, 'pneu_students') },
                { title: 'Tarb', width: 55, render: (_: any, r: any) => renderInput(r, 'pneu_nursery') },
            ]
        },
        {
            title: 'Grippga o\'xshash',
            children: [
                { title: 'Jami', width: 60, render: (_: any, r: any) => renderInput(r, 'flu_total', true) },
                { title: '0-1 y', width: 50, render: (_: any, r: any) => renderInput(r, 'flu_0_1') },
                { title: '1-2 y', width: 50, render: (_: any, r: any) => renderInput(r, 'flu_1_2') },
                { title: '3-6 y', width: 50, render: (_: any, r: any) => renderInput(r, 'flu_3_6') },
                { title: '7-14 y', width: 55, render: (_: any, r: any) => renderInput(r, 'flu_7_14') },
                { title: 'kattalar', width: 65, render: (_: any, r: any) => renderInput(r, 'flu_adult') },
                { title: 'O\'quv', width: 55, render: (_: any, r: any) => renderInput(r, 'flu_students') },
                { title: 'Tarb', width: 55, render: (_: any, r: any) => renderInput(r, 'flu_nursery') },
            ]
        },
        {
            title: 'Og\'ir o\'tkir (SARI)',
            children: [
                { title: 'Jami', width: 60, render: (_: any, r: any) => renderInput(r, 'sari_total', true) },
                { title: '0-2 y', width: 50, render: (_: any, r: any) => renderInput(r, 'sari_0_2') },
                { title: '3-6 y', width: 50, render: (_: any, r: any) => renderInput(r, 'sari_3_6') },
                { title: '7-14 y', width: 55, render: (_: any, r: any) => renderInput(r, 'sari_7_14') },
                { title: 'Kattalar', width: 65, render: (_: any, r: any) => renderInput(r, 'sari_adult') },
            ]
        },
        {
            title: 'Vafot etganlar',
            children: [
                { title: 'Jami', width: 60, render: (_: any, r: any) => renderInput(r, 'death_total') },
                { title: 'Homilador', width: 80, render: (_: any, r: any) => renderInput(r, 'death_pregnant') },
            ]
        }
    ];

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
                        0-14 yoshgacha bo'lgan bolalar, kattalar, o'quvchilar, tarbiyalanuvchilar, homiladorlar orasida o'tkir respirator infeksiyalar, o'tkir zotiljam, grippga o'xshash kasalliklar, og'ir o'tkir respirator infeksiyalar to'g'risida MA'LUMOT
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
                    scroll={{ x: 1800, y: 600 }}
                />
            </Space>
        </Card>
    );
};

export default FluDailyReportPage;
