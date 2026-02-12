import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Table, DatePicker, Button, InputNumber, notification, Space, Badge, Tooltip, Card } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import PermissionGate from '../../components/PermissionGate';
import GlassLayout from '../../components/layout/GlassLayout';

interface EpiReportData {
    key: string;
    district_name: string;
    organizationId: string;
    inspected_total: number;
    inspected_mtm: number;
    inspected_school: number;
    inspected_dpm: number;
    inspected_other: number;
    defects_total: number;
    defects_mtm: number;
    defects_school: number;
    defects_dpm: number;
    defects_other: number;
    fines_total: number;
    fines_mtm: number;
    fines_school: number;
    fines_dpm: number;
    fines_other: number;
    suspended_total: number;
    suspended_mtm: number;
    suspended_school: number;
    suspended_dpm: number;
    suspended_other: number;
    is_submitted?: boolean;
    id?: string;
    status?: string;
    verificationToken?: string;
}

const EpidemiologyDailyReportPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<EpiReportData[]>([]);
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

            const res = await dailyReportsApi.getEpidemiologyByDate(formattedDate, false);
            const apiData = res.data || [];

            const tableData = currentOrgs.map((org, idx) => {
                const existing = apiData.find((r: any) => r.organization?.id === org.id);
                return {
                    key: String(idx + 1),
                    district_name: org.name,
                    organizationId: org.id,
                    is_submitted: !!existing,
                    inspected_total: existing?.inspected_total || 0,
                    inspected_mtm: existing?.inspected_mtm || 0,
                    inspected_school: existing?.inspected_school || 0,
                    inspected_dpm: existing?.inspected_dpm || 0,
                    inspected_other: existing?.inspected_other || 0,
                    defects_total: existing?.defects_total || 0,
                    defects_mtm: existing?.defects_mtm || 0,
                    defects_school: existing?.defects_school || 0,
                    defects_dpm: existing?.defects_dpm || 0,
                    defects_other: existing?.defects_other || 0,
                    fines_total: existing?.fines_total || 0,
                    fines_mtm: existing?.fines_mtm || 0,
                    fines_school: existing?.fines_school || 0,
                    fines_dpm: existing?.fines_dpm || 0,
                    fines_other: existing?.fines_other || 0,
                    suspended_total: existing?.suspended_total || 0,
                    suspended_mtm: existing?.suspended_mtm || 0,
                    suspended_school: existing?.suspended_school || 0,
                    suspended_dpm: existing?.suspended_dpm || 0,
                    suspended_other: existing?.suspended_other || 0,
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

    const handleCellChange = (value: number | null, rowKey: string, field: keyof EpiReportData) => {
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
                await dailyReportsApi.upsertEpidemiology({
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
            await dailyReportsApi.verify('epidemiology', id);
            notification.success({ message: t('daily_reports.actions.verify_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.verify_error') });
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await dailyReportsApi.approve('epidemiology', id);
            notification.success({ message: t('daily_reports.actions.approve_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.approve_error') });
        }
    };

    const renderInput = (record: EpiReportData, field: keyof EpiReportData) => (
        <InputNumber size="small" min={0} value={record[field] as number} onChange={(val) => handleCellChange(val, record.key, field)} variant="borderless" style={{ width: '100%', textAlign: 'center' }} controls={false} />
    );

    const columns: any = [
        {
            title: '№',
            dataIndex: 'key',
            width: 40, align: 'center', fixed: 'left',
            render: (text: string, r: EpiReportData) => (
                <div style={{ backgroundColor: r.is_submitted ? '#f6ffed' : '#fff1f0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {text}
                </div>
            )
        },
        {
            title: t('daily_reports.table.district'),
            dataIndex: 'district_name',
            width: 140,
            fixed: 'left',
            render: (text: string, r: EpiReportData) => (
                <span style={{ color: r.is_submitted ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            )
        },
        {
            title: t('daily_reports.table.inspected_objects'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'inspected_total') },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any) => renderInput(r, 'inspected_mtm') },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any) => renderInput(r, 'inspected_school') },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any) => renderInput(r, 'inspected_dpm') },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any) => renderInput(r, 'inspected_other') },
            ]
        },
        {
            title: t('daily_reports.table.defects_found'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'defects_total') },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any) => renderInput(r, 'defects_mtm') },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any) => renderInput(r, 'defects_school') },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any) => renderInput(r, 'defects_dpm') },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any) => renderInput(r, 'defects_other') },
            ]
        },
        {
            title: t('daily_reports.table.fines_issued'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'fines_total') },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any) => renderInput(r, 'fines_mtm') },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any) => renderInput(r, 'fines_school') },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any) => renderInput(r, 'fines_dpm') },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any) => renderInput(r, 'fines_other') },
            ]
        },
        {
            title: t('daily_reports.table.suspended_activities'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'suspended_total') },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any) => renderInput(r, 'suspended_mtm') },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any) => renderInput(r, 'suspended_school') },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any) => renderInput(r, 'suspended_dpm') },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any) => renderInput(r, 'suspended_other') },
            ]
        },
        {
            title: t('daily_reports.table.status'),
            key: 'status',
            width: 140,
            fixed: 'right',
            render: (_: any, r: EpiReportData) => (
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
            render: (_: any, r: EpiReportData) => {
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

    const headerControls = (
        <Space>
            <DatePicker value={date} onChange={(d) => d && setDate(d)} format="DD.MM.YYYY" allowClear={false} style={{ width: 140 }} />
            <Button icon={<ReloadOutlined />} onClick={fetchReports}>Yangilash</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Saqlash</Button>
        </Space>
    );

    return (
        <PermissionGate permission="VIEW_EPI">
            <GlassLayout
                title={t('daily_reports.epidemiology_title')}
                subtitle={`${date.format('DD.MM.YYYY')} kungi holat`}
                headerButtons={headerControls}
            >
                <Card className="glass-card" bordered={false} bodyStyle={{ padding: 0 }}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        bordered
                        size="small"
                        pagination={false}
                        scroll={{ x: 1800 }}
                    />
                </Card>
            </GlassLayout>
        </PermissionGate>
    );
};

export default EpidemiologyDailyReportPage;