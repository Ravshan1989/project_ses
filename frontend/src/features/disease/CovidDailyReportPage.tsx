import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined, ExperimentOutlined, DeleteOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined, DownloadOutlined } from '@ant-design/icons';
import { Table, Typography, Card, DatePicker, Button, InputNumber, notification, Space, Switch, Alert, Popconfirm, Badge, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { exportDailyReport } from '../../services/excelExportService'; // UZ: Excel eksport service

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
    is_submitted?: boolean;
    id?: string;
    status?: string;
    verificationToken?: string;
}

// TUZATISH: CovidReportData ni kengaytirish (declaration merging)
interface CovidReportData {
    is_submitted?: boolean; // Hisobot topshirilganligini bildiruvchi yangi maydon
}

const CovidDailyReportPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<CovidReportData[]>([]);
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [false, setIsTestMode] = useState(false); // UZ: Test rejimi holati

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

            const res = await dailyReportsApi.getCovidByDate(formattedDate, false);
            const apiData = res.data || [];

            const tableData = currentOrgs.map((org, idx) => {
                const existing = apiData.find((r: any) => r.organization?.id === org.id);
                return {
                    key: String(idx + 1),
                    district_name: org.name,
                    organizationId: org.id,
                    is_submitted: !!existing, // Agar baza'da yozuv bo'lsa - true
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
            notification.error({ message: t('auth.error_system'), description: t('daily_reports.actions.error_load') });
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
                    organizationId: row.organizationId,
                    isTest: false // UZ: Test bayrog'i yuboriladi
                });
            }
            notification.success({ message: false ? t('daily_reports.test_mode.save_success') : t('daily_reports.actions.success_save') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('auth.error_system'), description: false ? t('daily_reports.test_mode.save_error') : t('daily_reports.actions.error_save') });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: string) => {
        try {
            await dailyReportsApi.verify('covid', id);
            notification.success({ message: t('daily_reports.actions.verify_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.verify_error') });
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await dailyReportsApi.approve('covid', id);
            notification.success({ message: t('daily_reports.actions.approve_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.approve_error') });
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

    // TUZATISH: 'is_submitted' flagi orqali aniq tekshirish
    const isSubmitted = (row: CovidReportData) => {
        return !!row.is_submitted;
    };

    const columns: any = [
        {
            title: t('daily_reports.table.no'), dataIndex: 'key', width: 40, align: 'center', fixed: 'left',
            onCell: (r: CovidReportData) => ({ style: { backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff' } })
        },
        {
            title: t('daily_reports.table.district'), dataIndex: 'district_name', width: 140, fixed: 'left',
            onCell: (r: CovidReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                    fontWeight: 500
                }
            })
        },
        { title: t('daily_reports.table.total_cases'), width: 80, render: (_: any, r: any) => renderInput(r, 'total_cases') },
        { title: t('daily_reports.table.reinfected'), width: 80, render: (_: any, r: any) => renderInput(r, 'reinfected') },
        { title: t('daily_reports.table.vaccinated_infected'), width: 80, render: (_: any, r: any) => renderInput(r, 'vaccinated_infected') },
        {
            title: t('daily_reports.table.including'),
            children: [
                { title: t('daily_reports.table.age_0_1'), width: 50, render: (_: any, r: any) => renderInput(r, 'age_0_1') },
                { title: t('daily_reports.table.age_1_3'), width: 50, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: t('daily_reports.table.age_4_6'), width: 50, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: t('daily_reports.table.age_7_14'), width: 55, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: t('daily_reports.table.age_15_19'), width: 55, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: t('daily_reports.table.age_20_29'), width: 55, render: (_: any, r: any) => renderInput(r, 'age_20_29') },
                { title: t('daily_reports.table.age_30_39'), width: 55, render: (_: any, r: any) => renderInput(r, 'age_30_39') },
                { title: t('daily_reports.table.age_40_49'), width: 55, render: (_: any, r: any) => renderInput(r, 'age_40_49') },
                { title: t('daily_reports.table.age_50_59'), width: 55, render: (_: any, r: any) => renderInput(r, 'age_50_59') },
                { title: t('daily_reports.table.age_60_plus'), width: 65, render: (_: any, r: any) => renderInput(r, 'age_60_plus') },
                { title: t('daily_reports.table.pre_school_unorganized'), width: 80, render: (_: any, r: any) => renderInput(r, 'pre_school_organized') },
                { title: t('daily_reports.table.pre_school_organized'), width: 80, render: (_: any, r: any) => renderInput(r, 'pre_school_unorganized') },
                { title: t('daily_reports.table.students'), width: 65, render: (_: any, r: any) => renderInput(r, 'students') },
                { title: t('daily_reports.table.medical_workers'), width: 65, render: (_: any, r: any) => renderInput(r, 'medical_workers') },
                { title: t('daily_reports.table.teachers'), width: 65, render: (_: any, r: any) => renderInput(r, 'teachers') },
                { title: t('daily_reports.table.others'), width: 65, render: (_: any, r: any) => renderInput(r, 'others') },
            ]
        },
        { title: t('daily_reports.table.hospitalized'), width: 95, render: (_: any, r: any) => renderInput(r, 'hospitalized_count') },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 120, fixed: 'right',
            render: (_: any, r: CovidReportData) => (
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
            render: (_: any, r: CovidReportData) => {
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

    const calculateTotal = (field: keyof CovidReportData) => data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
                        {t('daily_reports.covid_title')}
                    </Title>
                    <Text strong style={{ fontSize: '16px', display: 'block', marginTop: '10px' }}>
                        {t('daily_reports.date_status', { date: date.format('DD.MM.YYYY') })}
                    </Text>
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
                    scroll={{ x: 2200, y: 600 }}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                                <Table.Summary.Cell index={0} />
                                <Table.Summary.Cell index={1}>{t('daily_reports.table.total')}</Table.Summary.Cell>
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
