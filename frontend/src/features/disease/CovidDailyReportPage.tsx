import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Table, Typography, DatePicker, Button, InputNumber, notification, Space, Badge, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import PermissionGate from '../../components/PermissionGate';

const { Title, Text } = Typography;

interface CovidReportData {
    key: string;
    district_name: string;
    organizationId: string;
    total_cases: number;
    reinfected: number;
    vaccinated_infected: number;
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
    pre_school_organized: number;
    pre_school_unorganized: number;
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

const CovidDailyReportPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<CovidReportData[]>([]);
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);

    const userRole = localStorage.getItem('user_role') || 'REGION_HEAD';
    const isAdmin = ['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(userRole);
    const connectedOrgId = localStorage.getItem('user_org_id');

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
                currentOrgs = (orgRes.data || []).filter((org: any) => !!org.parent);
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
                    is_submitted: !!existing,
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

            if (!isAdmin && connectedOrgId) {
                setData(tableData.filter(d => d.organizationId === connectedOrgId));
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

    const columns: any = [
        { title: t('daily_reports.table.no'), dataIndex: 'key', width: 50, align: 'center', fixed: 'left' },
        {
            title: t('daily_reports.table.district'),
            dataIndex: 'district_name',
            width: 150,
            fixed: 'left',
            render: (text: string, r: CovidReportData) => (
                <span style={{ color: r.is_submitted ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            )
        },
        { title: t('daily_reports.table.total_cases'), width: 80, render: (_: any, r: any) => renderInput(r, 'total_cases'), align: 'center' },
        { title: t('daily_reports.table.reinfected'), width: 80, render: (_: any, r: any) => renderInput(r, 'reinfected'), align: 'center' },
        { title: t('daily_reports.table.vaccinated_infected'), width: 100, render: (_: any, r: any) => renderInput(r, 'vaccinated_infected'), align: 'center' },
        {
            title: t('daily_reports.table.by_age'),
            children: [
                { title: t('daily_reports.table.age_0_1'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_0_1') },
                { title: t('daily_reports.table.age_1_3'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: t('daily_reports.table.age_4_6'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: t('daily_reports.table.age_7_14'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: t('daily_reports.table.age_15_19'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: t('daily_reports.table.age_20_29'), width: 70, render: (_: any, r: any) => renderInput(r, 'age_20_29') },
                { title: t('daily_reports.table.age_30_39'), width: 70, render: (_: any, r: any) => renderInput(r, 'age_30_39') },
                { title: t('daily_reports.table.age_40_49'), width: 70, render: (_: any, r: any) => renderInput(r, 'age_40_49') },
                { title: t('daily_reports.table.age_50_59'), width: 70, render: (_: any, r: any) => renderInput(r, 'age_50_59') },
                { title: t('daily_reports.table.age_60_plus'), width: 70, render: (_: any, r: any) => renderInput(r, 'age_60_plus') },
            ]
        },
        {
            title: t('daily_reports.table.hospitalized'),
            width: 100,
            render: (_: any, r: any) => renderInput(r, 'hospitalized_count'),
            align: 'center'
        },
        {
            title: t('daily_reports.table.status'),
            key: 'status',
            width: 140,
            fixed: 'right',
            render: (_: any, r: CovidReportData) => (
                <Space>
                    <Badge status={r.status === 'APPROVED' ? 'success' : r.status === 'VERIFIED' ? 'processing' : 'default'} text={r.status} />
                    {r.verificationToken && (
                        <Tooltip title="QR orqali tekshirish">
                            <Button size="small" icon={<QrcodeOutlined />} onClick={() => window.open(`/verify/${r.verificationToken}`, '_blank')} />
                        </Tooltip>
                    )}
                </Space>
            )
        },
        {
            title: t('common.actions'),
            key: 'actions',
            width: 180,
            fixed: 'right',
            render: (_: any, r: CovidReportData) => {
                const canVerify = (userRole === 'DEPARTMENT_HEAD' || userRole === 'ADMIN') && r.is_submitted && r.status === 'DRAFT';
                const canApprove = (userRole === 'DISTRICT_HEAD' || userRole === 'ADMIN') && r.status === 'VERIFIED';
                return (
                    <Space>
                        {canVerify && <Button size="small" type="primary" icon={<AuditOutlined />} onClick={() => r.id && handleVerify(r.id)}>{t('daily_reports.actions.verify')}</Button>}
                        {canApprove && <Button size="small" type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => r.id && handleApprove(r.id)}>{t('daily_reports.actions.approve')}</Button>}
                    </Space>
                );
            }
        }
    ];

    const headerStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    return (
        <PermissionGate permission="VIEW_COVID">
            <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
                <div style={headerStyle}>
                    <Space direction="vertical" size={0}>
                        <Title level={3} style={{ margin: 0, color: '#fff' }}>{t('daily_reports.covid_title')}</Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>{date.format('DD.MM.YYYY')} kungi holat</Text>
                    </Space>
                    <Space>
                        <DatePicker value={date} onChange={(d) => d && setDate(d)} format="DD.MM.YYYY" allowClear={false} />
                        <Button icon={<ReloadOutlined />} onClick={fetchReports}>Yangilash</Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Saqlash</Button>
                    </Space>
                </div>
                <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Table columns={columns} dataSource={data} loading={loading} bordered size="small" pagination={false} scroll={{ x: 1500 }} />
                </div>
            </div>
        </PermissionGate>
    );
};

export default CovidDailyReportPage;