import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Table, Typography, DatePicker, Button, InputNumber, notification, Space, Badge, Tooltip } from 'antd';
import PermissionGate from '../../components/PermissionGate';
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
                if (connectedOrgId) {
                    const filteredData = tableData.filter(d => d.organizationId === connectedOrgId);
                    setData(filteredData);
                } else {
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
            notification.success({ message: t('user.save') });
            fetchReports();
        } catch (error) {
            notification.error({
                message: t('auth.error_system'),
                description: t('daily_reports.actions.error_save')
            });
        } finally {
            setLoading(false);
        }
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
            notification.success({ message: t('user.save') });
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

    // --- PREMIUM UI STYLES ---
    const glassStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.05)',
        padding: '24px'
    };

    const headerStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
        padding: '32px',
        borderRadius: '24px',
        marginBottom: '24px',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
    };

    return (
        <PermissionGate permission="VIEW_ARI">
            <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
                <style>{`
                    .clinical-table .ant-table { background: transparent !important; }
                    .clinical-table .ant-table-thead > tr > th {
                        background: rgba(255, 255, 255, 0.5) !important;
                        font-weight: 700;
                        text-transform: uppercase;
                        font-size: 11px;
                        letter-spacing: 0.5px;
                        color: #1e3c72;
                    }
                    .clinical-table .ant-table-tbody > tr > td {
                        padding: 12px 8px !important;
                    }
                `}</style>

                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '16px' }}>
                            <AuditOutlined style={{ fontSize: '28px', color: '#fff' }} />
                        </div>
                        <div>
                            <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
                                {t('daily_reports.ari_title')}
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                                {t('daily_reports.date_status', { date: date.format('DD.MM.YYYY') })}
                            </Text>
                        </div>
                    </div>

                    <Space wrap>
                        <DatePicker
                            value={date}
                            onChange={(d) => d && setDate(d)}
                            format="DD.MM.YYYY"
                            allowClear={false}
                            inputReadOnly
                            style={{
                                borderRadius: '12px',
                                height: '40px',
                                width: 140,
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#fff'
                            }}
                        />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchReports}
                            style={{
                                borderRadius: '12px',
                                height: '40px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#fff'
                            }}
                        >
                            {t('daily_reports.actions.refresh')}
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            style={{
                                borderRadius: '12px',
                                height: '40px',
                                padding: '0 24px',
                                fontWeight: 700,
                                background: '#1890ff',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(24, 144, 255, 0.3)'
                            }}
                        >
                            {t('daily_reports.actions.save')}
                        </Button>
                    </Space>
                </div>

                {!isAdmin && !connectedOrgId && (
                    <div style={{ marginBottom: 24 }}>
                        <Badge status="warning" text={t('daily_reports.errors.no_org_context') || "Tashkilot ma'mulotlari topilmadi."} />
                    </div>
                )}

                <div style={glassStyle}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        bordered
                        size="small"
                        pagination={false}
                        scroll={{ x: 1200, y: 600 }}
                        className="clinical-table"
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row style={{ background: 'rgba(24, 144, 255, 0.05)', fontWeight: 'bold' }}>
                                    <Table.Summary.Cell index={0} />
                                    <Table.Summary.Cell index={1}>{t('daily_reports.table.total')}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} align="center">{totalGk}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={3} align="center">{totalAri}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={4} align="center">{totalPneumonia}</Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </div>
            </div>
        </PermissionGate>
    );
};

export default AriDailyReportPage;
