import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined, ExperimentOutlined, DeleteOutlined } from '@ant-design/icons';
import { Table, Typography, Card, DatePicker, Button, InputNumber, notification, Space, Switch, Alert, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface AriReportData {
    key: string;
    district_name: string;
    organizationId: string;
    gk: number;
    ari: number;
    pneumonia: number;
}

// TUZATISH: AriReportData ni kengaytirish (declaration merging)
interface AriReportData {
    is_submitted?: boolean; // Hisobot topshirilganligini bildiruvchi yangi maydon
}

const AriDailyReportPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<AriReportData[]>([]);
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [isTestMode, setIsTestMode] = useState(false); // UZ: Test rejimi holati

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
    }, [date, isTestMode]); // UZ: Test rejimi o'zgarganda ham qayta yuklanadi

    const fetchReports = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');

            let currentOrgs = organizations;
            if (currentOrgs.length === 0) {
                const orgRes = await organizationsApi.getAll();
                // Viloyatni (parent darajasi) hisobotdan olib tashlaymiz
                // currentOrgs = (orgRes.data || []).filter((org: any) => !!org.parent); <- ESKI

                // YANGI: Faqat tumanlarni (ota-onasi bor tashkilotlarni) olamiz
                const allOrgs = orgRes.data || [];
                currentOrgs = allOrgs.filter((org: any) => !!org.parent);

                setOrganizations(currentOrgs);
            }

            const res = await dailyReportsApi.getAriByDate(formattedDate, isTestMode);
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
                    // UZ: Xavfsizlik uchun
                    setData([]);
                }
            } else {
                setData(tableData);
            }
        } catch (error) {
            console.error(error);
            notification.error({
                message: t('daily_reports.actions.error_load'),
                description: t('daily_reports.actions.error_load')
            });
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
                    organizationId: row.organizationId,
                    isTest: isTestMode // UZ: Test bayrog'i yuboriladi
                });
            }
            notification.success({ message: isTestMode ? "Test ma'lumoti saqlandi" : t('user.save') });
            fetchReports();
        } catch (error) {
            notification.error({
                message: isTestMode ? "Test ma'lumoti saqlashda xatolik" : t('auth.error_system'),
                description: t('daily_reports.actions.error_save')
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCleanup = async () => {
        setLoading(true);
        try {
            await dailyReportsApi.cleanupTest();
            notification.success({ message: "Test ma'lumotlari tozalandi" });
            fetchReports();
        } catch (error) {
            notification.error({ message: "Tozalashda xatolik" });
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
            title: t('daily_reports.table.no'), dataIndex: 'key', width: 50, align: 'center',
            onCell: (r: AriReportData) => ({ style: { backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff' } })
        },
        {
            title: t('daily_reports.table.district'), dataIndex: 'district_name',
            onCell: (r: AriReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                    fontWeight: 500
                }
            })
        },
        { title: t('daily_reports.table.gk'), width: 100, align: 'center', render: (_: any, r: any) => renderInput(r, 'gk') },
        { title: t('daily_reports.table.ari'), width: 100, align: 'center', render: (_: any, r: any) => renderInput(r, 'ari') },
        { title: t('daily_reports.table.pneumonia'), width: 100, align: 'center', render: (_: any, r: any) => renderInput(r, 'pneumonia') },
    ];

    const totalGk = data.reduce((sum, item) => sum + item.gk, 0);
    const totalAri = data.reduce((sum, item) => sum + item.ari, 0);
    const totalPneumonia = data.reduce((sum, item) => sum + item.pneumonia, 0);

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>
                        {t('daily_reports.ari_title')}
                    </Title>
                    <Text type="secondary">{t('daily_reports.date_status', { date: date.format('DD.MM.YYYY') })}</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Space>
                        {isTestMode && (
                            <Popconfirm title="Barcha test ma'lumotlarini o'chirishni xohlaysizmi?" onConfirm={handleCleanup}>
                                <Button danger icon={<DeleteOutlined />}>Tozalash</Button>
                            </Popconfirm>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #d9d9d9', padding: '4px 12px', borderRadius: '6px' }}>
                            <ExperimentOutlined style={{ color: isTestMode ? '#f5222d' : '#8c8c8c' }} />
                            <Text strong={isTestMode} type={isTestMode ? "danger" : "secondary"}>Test Rejimi</Text>
                            <Switch size="small" checked={isTestMode} onChange={setIsTestMode} />
                        </div>
                        <DatePicker value={date} onChange={(d) => d && setDate(d)} format="DD.MM.YYYY" />
                        <Button icon={<ReloadOutlined />} onClick={fetchReports}>{t('daily_reports.actions.refresh')}</Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>{t('daily_reports.actions.save')}</Button>
                    </Space>
                </div>

                {isTestMode && (
                    <Alert
                        message="DIQQAT: TEST REJIMI FAOL"
                        description="Hozirgi kiritilayotgan barcha ma'lumotlar 'Test' deb belgilanadi va real hisobotga ta'sir qilmaydi."
                        type="error"
                        showIcon
                        icon={<ExperimentOutlined />}
                    />
                )}

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
                                <Table.Summary.Cell index={1}>{t('daily_reports.table.total')}</Table.Summary.Cell>
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
