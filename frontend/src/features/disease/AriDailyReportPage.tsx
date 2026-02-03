import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, DatePicker, Button, InputNumber, notification, Space } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';

const { Title, Text } = Typography;

interface AriReportData {
    key: string;
    district_name: string;
    organizationId: string;
    gk: number; // Grippsimon kasalliklar
    ari: number; // O'RI
    pneumonia: number; // O'P (Zotiljam)
}

// TUZATISH: AriReportData ni kengaytirish (declaration merging)
interface AriReportData {
    is_submitted?: boolean; // Hisobot topshirilganligini bildiruvchi yangi maydon
}

const AriDailyReportPage: React.FC = () => {
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<AriReportData[]>([]);
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);

    // Auth context (simulated)
    const userRole = localStorage.getItem('user_role') || 'REGION_HEAD';
    // const isAdmin = userRole === 'REGION_HEAD'; <- ESKI
    // YANGI: Admin yoki Region Head hammasini ko'radi
    const isAdmin = ['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(userRole);

    // User Org Name ni local storage dan olish kerak aslida
    // Hozircha hardcode qilingan "Olmaliq sh" ni olib tashlaymiz va dynamic qilamiz
    // const userOrgName = localStorage.getItem('user_org_name') || "";
    const connectedOrgId = localStorage.getItem('user_org_id'); // Agar bor bo'lsa

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
                // currentOrgs = (orgRes.data || []).filter((org: any) => !!org.parent); <- ESKI

                // YANGI: Shunchaki hammasini olib, Viloyat boshqarmasini olib tashlaymiz
                const allOrgs = orgRes.data || [];
                currentOrgs = allOrgs.filter((org: any) => org.id !== '1' && !org.name.toLowerCase().includes("boshqarma"));

                setOrganizations(currentOrgs);
            }

            const res = await dailyReportsApi.getAriByDate(formattedDate);
            const apiData = res.data || [];

            const tableData = currentOrgs.map((org, idx) => {
                const existing = apiData.find((r: any) => r.organization?.id === org.id);
                return {
                    key: String(idx + 1),
                    district_name: org.name,
                    organizationId: org.id,
                    is_submitted: !!existing, // Agar baza'da yozuv bo'lsa - true
                    gk: existing?.gk || 0,
                    ari: existing?.ari || 0,
                    pneumonia: existing?.pneumonia || 0,
                };
            });

            if (!isAdmin) {
                // const filteredData = tableData.filter(d => d.district_name === userOrgName); <- ESKI

                // YANGI: Agar user admin bo'lmasa, faqat o'zini tashkilotini ko'radi
                if (connectedOrgId) {
                    const filteredData = tableData.filter(d => d.organizationId === connectedOrgId);
                    setData(filteredData);
                } else {
                    // Fallback
                }
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

    const handleCellChange = (value: number | null, rowKey: string, field: keyof AriReportData) => {
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
                await dailyReportsApi.upsertAri({
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

    const renderInput = (record: AriReportData, field: keyof AriReportData) => (
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

    // TUZATISH: 'is_submitted' flagi orqali aniq tekshirish
    const isSubmitted = (row: AriReportData) => {
        return !!row.is_submitted;
    };

    const columns: any = [
        {
            title: '№', dataIndex: 'key', width: 50, align: 'center',
            onCell: (r: AriReportData) => ({ style: { backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff' } })
        },
        {
            title: 'Xududlar', dataIndex: 'district_name',
            onCell: (r: AriReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                    fontWeight: 500
                }
            })
        },
        { title: 'GK', width: 100, align: 'center', render: (_: any, r: any) => renderInput(r, 'gk') },
        { title: 'O\'RI', width: 100, align: 'center', render: (_: any, r: any) => renderInput(r, 'ari') },
        { title: 'O\'P', width: 100, align: 'center', render: (_: any, r: any) => renderInput(r, 'pneumonia') },
    ];

    // Calculate Grand Total for Header/Footer if needed, or just let user see
    const totalGk = data.reduce((sum, item) => sum + item.gk, 0);
    const totalAri = data.reduce((sum, item) => sum + item.ari, 0);
    const totalPneumonia = data.reduce((sum, item) => sum + item.pneumonia, 0);

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>
                        Toshkent viloyati Grippsimon kasalliklar (GK), O'tkir respirator infeksiyalar (O'RI), O'tkir Zotiljam (O'P) bo'yicha kunlik tezkor ma'lumot
                    </Title>
                    <Text type="secondary">{date.format('DD.MM.YYYY')} kungi holatga</Text>
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
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                                <Table.Summary.Cell index={0} />
                                <Table.Summary.Cell index={1}>ЖАМИ</Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="center">{totalGk}</Table.Summary.Cell>
                                <Table.Summary.Cell index={3} align="center">{totalAri}</Table.Summary.Cell>
                                <Table.Summary.Cell index={4} align="center">{totalPneumonia}</Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </Space>
        </Card>
    );
};

export default AriDailyReportPage;
