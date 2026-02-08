import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined, ExperimentOutlined, DeleteOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined, DownloadOutlined } from '@ant-design/icons';
import { Table, Typography, Card, DatePicker, Button, InputNumber, notification, Space, Switch, Alert, Popconfirm, Badge, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { exportDailyReport } from '../../services/excelExportService'; // UZ: Excel eksport service

const { Title, Text } = Typography;

interface AriReportData {
    key: string;
    district_name: string;
    organizationId: string;
    gk: number;
    ari: number;
    pneumonia: number;
    id?: string;
    status?: string;
    verificationToken?: string;
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
    }, [date]); // UZ: Test rejimi o'zgarganda ham qayta yuklanadi

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

            const res = await dailyReportsApi.getAriByDate(formattedDate, false);
            const apiData = res.data || [];

            const tableData = currentOrgs.map((org, idx) => {
                const existing = apiData.find((r: any) => r.organization?.id === org.id);
                return {
                    key: String(idx + 1),
                    district_name: org.name,
                    organizationId: org.id,
                    is_submitted: !!existing,
                    gk: existing?.gk || 0,
                    ari: existing?.ari || 0,
                    pneumonia: existing?.pneumonia || 0,
                    id: existing?.id,
                    status: existing?.status || 'DRAFT',
                    verificationToken: existing?.verificationToken,
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
                    isTest: false // UZ: Test bayrog'i yuboriladi
                });
            }
            notification.success({ message: false ? t('daily_reports.test_mode.save_success') : t('user.save') });
            fetchReports();
        } catch (error) {
            notification.error({
                message: false ? t('daily_reports.test_mode.save_error') : t('auth.error_system'),
                description: t('daily_reports.actions.error_save')
            });
        } finally {
            setLoading(false);
        }
    };

    // UZ: Excel ga eksport qilish funksiyasi
    const handleExcelExport = () => {
        // UZ: Ustunlar ro'yxati
        const columns = data.length > 0 ? Object.keys(data[0])
            .filter(key => !['is_submitted', 'id', 'organizationId', 'status', 'verificationToken'].includes(key))
            .map(key => ({
                header: key === 'key' ? '№' : key === 'district_name' ? t('daily_reports.table.district') : key,
                key: key,
                width: key === 'key' ? 5 : key === 'district_name' ? 20 : 12
            })) : [];

        // UZ: Fayl nomi va sarlavha
        const fileName = `ARI_Kunlik_${date.format('DD-MM-YYYY')}`;
        const title = t('daily_reports.ari_title');
        const dateStr = date.format('DD.MM.YYYY');

        // UZ: Excel ga eksport qilish
        exportDailyReport(data, fileName, title, dateStr, columns);
        notification.success({ message: 'Excel fayl yuklab olindi!' });
    };

    const handleVerify = async (id: string) => {
        try {
            await dailyReportsApi.verify('ari', id);
            notification.success({ message: t('daily_reports.actions.verify_success') || 'Mudir tasdiqladi' });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.verify_error') || 'Tasdiqlashda xatolik' });
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await dailyReportsApi.approve('ari', id);
            notification.success({ message: t('daily_reports.actions.approve_success') || 'Rahbar tasdiqladi' });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.approve_error') || 'Tasdiqlashda xatolik' });
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
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 150,
            render: (_: any, r: AriReportData) => (
                <Space>
                    <Badge
                        status={r.status === 'APPROVED' ? 'success' : r.status === 'VERIFIED' ? 'processing' : 'default'}
                        text={r.status}
                    />
                    {r.verificationToken && (
                        <Tooltip title="QR orqali tekshirish">
                            <Button
                                size="small"
                                icon={<QrcodeOutlined />}
                                onClick={() => window.open(`/verify/${r.verificationToken}`, '_blank')}
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        },
        {
            title: t('common.actions') || 'Amallar',
            key: 'actions',
            width: 200,
            render: (_: any, r: AriReportData) => {
                const canVerify = (userRole === 'DEPARTMENT_HEAD' || userRole === 'ADMIN') && r.is_submitted && r.status === 'DRAFT';
                const canApprove = (userRole === 'DISTRICT_HEAD' || userRole === 'ADMIN') && r.status === 'VERIFIED';

                return (
                    <Space>
                        {canVerify && (
                            <Button
                                size="small"
                                type="primary"
                                icon={<AuditOutlined />}
                                onClick={() => r.id && handleVerify(r.id)}
                            >
                                {t('daily_reports.actions.verify') || 'Mudir tasdiq'}
                            </Button>
                        )}
                        {canApprove && (
                            <Button
                                size="small"
                                type="primary"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                icon={<CheckCircleOutlined />}
                                onClick={() => r.id && handleApprove(r.id)}
                            >
                                {t('daily_reports.actions.approve') || 'Rahbar tasdiq'}
                            </Button>
                        )}
                    </Space>
                );
            }
        }
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
                        {false && (
                            <Popconfirm title={t('daily_reports.test_mode.cleanup_confirm')} onConfirm={handleCleanup}>
                                <Button danger icon={<DeleteOutlined />}>{t('daily_reports.test_mode.cleanup_btn')}</Button>
                            </Popconfirm>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #d9d9d9', padding: '4px 12px', borderRadius: '6px' }}>
                            <ExperimentOutlined style={{ color: false ? '#f5222d' : '#8c8c8c' }} />
                            <Text strong={false} type={false ? "danger" : "secondary"}>{t('daily_reports.test_mode.label')}</Text>
                            <Switch size="small" checked={false} onChange={setIsTestMode} />
                        </div>
                        <DatePicker value={date} onChange={(d) => d && setDate(d)} format="DD.MM.YYYY" />
                        <Button icon={<DownloadOutlined />} onClick={handleExcelExport}>Excel</Button>
                        <Button icon={<ReloadOutlined />} onClick={fetchReports}>{t('daily_reports.actions.refresh')}</Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>{t('daily_reports.actions.save')}</Button>
                    </Space>
                </div>

                {false && (
                    <Alert
                        message={t('daily_reports.test_mode.active_alert')}
                        description={t('daily_reports.test_mode.active_desc')}
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
