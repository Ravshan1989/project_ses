import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Table, Typography, DatePicker, Button, InputNumber, notification, Space, Badge, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import PermissionGate from '../../components/PermissionGate';


const { Title, Text } = Typography;

interface FluReportData {
    key: string;
    district_name: string;
    organizationId: string;
    institution_count: number;
    ari_total: number;
    ari_0_1: number;
    ari_1_2: number;
    ari_3_6: number;
    ari_7_14: number;
    ari_adult: number;
    ari_students: number;
    ari_nursery: number;
    pneu_total: number;
    pneu_0_2: number;
    pneu_3_6: number;
    pneu_7_14: number;
    pneu_adult: number;
    pneu_students: number;
    pneu_nursery: number;
    flu_total: number;
    flu_0_1: number;
    flu_1_2: number;
    flu_3_6: number;
    flu_7_14: number;
    flu_adult: number;
    flu_students: number;
    flu_nursery: number;
    sari_total: number;
    sari_0_2: number;
    sari_3_6: number;
    sari_7_14: number;
    sari_adult: number;
    death_total: number;
    death_pregnant: number;
    is_submitted?: boolean;
    id?: string;
    status?: string;
    verificationToken?: string;
}

// TUZATISH: FluReportData ni kengaytirish (declaration merging)
interface FluReportData {
    is_submitted?: boolean; // Hisobot topshirilganligini bildiruvchi yangi maydon
}

const FluDailyReportPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<FluReportData[]>([]);
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

            const res = await dailyReportsApi.getFluByDate(formattedDate, false);
            const apiData = res.data || [];

            const tableData = currentOrgs.map((org, idx) => {
                const existing = apiData.find((r: any) => r.organization?.id === org.id);
                return {
                    key: String(idx + 1),
                    district_name: org.name,
                    organizationId: org.id,
                    is_submitted: !!existing, // Agar baza'da yozuv bo'lsa - true
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

    const handleCellChange = (value: number | null, rowKey: string, field: keyof FluReportData) => {
        const newData = [...data];
        const index = newData.findIndex(item => item.key === rowKey);
        if (index > -1) {
            // UZ: O'zgaruvchi qayta qiymatlanmaydi, shuning uchun const ishlatildi - avvalgi kod: let updatedRow = { ...newData[index], [field]: value || 0 };
            const updatedRow = { ...newData[index], [field]: value || 0 };
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
            await dailyReportsApi.verify('flu', id);
            notification.success({ message: t('daily_reports.actions.verify_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.verify_error') });
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await dailyReportsApi.approve('flu', id);
            notification.success({ message: t('daily_reports.actions.approve_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.approve_error') });
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

    // TUZATISH: 'is_submitted' flagi orqali aniq tekshirish
    const isSubmitted = (row: FluReportData) => {
        return !!row.is_submitted;
    };

    const columns: any = [
        {
            title: t('daily_reports.table.no'), dataIndex: 'key', width: 40, align: 'center', fixed: 'left',
            onCell: (r: FluReportData) => ({ style: { backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff' } })
        },
        {
            title: t('daily_reports.table.district'), dataIndex: 'district_name', width: 140, fixed: 'left',
            onCell: (r: FluReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                    fontWeight: 500
                }
            })
        },
        {
            title: t('reports.ari'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'ari_total', true) },
                { title: t('daily_reports.table.age_0_1'), width: 50, render: (_: any, r: any) => renderInput(r, 'ari_0_1') },
                { title: t('daily_reports.table.age_1_2'), width: 50, render: (_: any, r: any) => renderInput(r, 'ari_1_2') },
                { title: t('daily_reports.table.age_3_6'), width: 50, render: (_: any, r: any) => renderInput(r, 'ari_3_6') },
                { title: t('daily_reports.table.age_7_14'), width: 55, render: (_: any, r: any) => renderInput(r, 'ari_7_14') },
                { title: t('daily_reports.table.adults_short'), width: 65, render: (_: any, r: any) => renderInput(r, 'ari_adult') },
                { title: t('daily_reports.table.students_short'), width: 55, render: (_: any, r: any) => renderInput(r, 'ari_students') },
                { title: t('daily_reports.table.nursery_short'), width: 55, render: (_: any, r: any) => renderInput(r, 'ari_nursery') },
            ]
        },
        {
            title: t('reports.pneumonia'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'pneu_total', true) },
                { title: t('daily_reports.table.age_0_2'), width: 50, render: (_: any, r: any) => renderInput(r, 'pneu_0_2') },
                { title: t('daily_reports.table.age_3_6'), width: 50, render: (_: any, r: any) => renderInput(r, 'pneu_3_6') },
                { title: t('daily_reports.table.age_7_14'), width: 55, render: (_: any, r: any) => renderInput(r, 'pneu_7_14') },
                { title: t('daily_reports.table.adults_short'), width: 65, render: (_: any, r: any) => renderInput(r, 'pneu_adult') },
                { title: t('daily_reports.table.students_short'), width: 55, render: (_: any, r: any) => renderInput(r, 'pneu_students') },
                { title: t('daily_reports.table.nursery_short'), width: 55, render: (_: any, r: any) => renderInput(r, 'pneu_nursery') },
            ]
        },
        {
            title: t('reports.flu'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'flu_total', true) },
                { title: t('daily_reports.table.age_0_1'), width: 50, render: (_: any, r: any) => renderInput(r, 'flu_0_1') },
                { title: t('daily_reports.table.age_1_2'), width: 50, render: (_: any, r: any) => renderInput(r, 'flu_1_2') },
                { title: t('daily_reports.table.age_3_6'), width: 50, render: (_: any, r: any) => renderInput(r, 'flu_3_6') },
                { title: t('daily_reports.table.age_7_14'), width: 55, render: (_: any, r: any) => renderInput(r, 'flu_7_14') },
                { title: t('daily_reports.table.adults_short'), width: 65, render: (_: any, r: any) => renderInput(r, 'flu_adult') },
                { title: t('daily_reports.table.students_short'), width: 55, render: (_: any, r: any) => renderInput(r, 'flu_students') },
                { title: t('daily_reports.table.nursery_short'), width: 55, render: (_: any, r: any) => renderInput(r, 'flu_nursery') },
            ]
        },
        {
            title: t('daily_reports.table.sari'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'sari_total', true) },
                { title: t('daily_reports.table.age_0_2'), width: 50, render: (_: any, r: any) => renderInput(r, 'sari_0_2') },
                { title: t('daily_reports.table.age_3_6'), width: 50, render: (_: any, r: any) => renderInput(r, 'sari_3_6') },
                { title: t('daily_reports.table.age_7_14'), width: 55, render: (_: any, r: any) => renderInput(r, 'sari_7_14') },
                { title: t('daily_reports.table.adults_short'), width: 65, render: (_: any, r: any) => renderInput(r, 'sari_adult') },
            ]
        },
        {
            title: t('daily_reports.table.deaths'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'death_total') },
                { title: t('daily_reports.table.pregnant'), width: 80, render: (_: any, r: any) => renderInput(r, 'death_pregnant') },
            ]
        },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 120, fixed: 'right',
            render: (_: any, r: FluReportData) => (
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
            width: 160, fixed: 'right',
            render: (_: any, r: FluReportData) => {
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
                                {t('daily_reports.actions.verify')}
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
                                {t('daily_reports.actions.approve')}
                            </Button>
                        )}
                    </Space>
                );
            }
        }
    ];


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
        <PermissionGate permission="VIEW_FLU">
            <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
                <style>{`
                    .clinical-table .ant-table { background: transparent !important; }
                    .clinical-table .ant-table-thead > tr > th {
                        background: rgba(255, 255, 255, 0.5) !important;
                        font-weight: 700;
                        text-transform: uppercase;
                        font-size: 10px;
                        letter-spacing: 0.5px;
                        color: #1e3c72;
                    }
                    .clinical-table .ant-table-tbody > tr > td {
                        padding: 6px 2px !important;
                    }
                `}</style>

                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '16px' }}>
                            <AuditOutlined style={{ fontSize: '28px', color: '#fff' }} />
                        </div>
                        <div>
                            <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
                                {t('daily_reports.flu_title')}
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
                        <Badge status="warning" text={t('daily_reports.errors.no_org_context') || "Tashkilot ma'lumotlari topilmadi."} />
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
                        scroll={{ x: 1800, y: 600 }}
                        className="clinical-table"
                    />
                </div>
            </div>
        </PermissionGate>
    );
};

export default FluDailyReportPage;
