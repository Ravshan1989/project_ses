import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { DatePicker, Button, notification, Space, Card } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import PermissionGate from '../../components/PermissionGate';
import GlassLayout from '../../components/layout/GlassLayout';
import EpiTab from './unified/EpiTab';

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

    // Mobile check


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

            const userOrgParentId = localStorage.getItem('user_org_parent_id');
            const isMudir = userRole === 'DEPARTMENT_HEAD';
            const isRegionalMudir = isMudir && (!userOrgParentId || userOrgParentId === 'null');

            if (!(isAdmin || isRegionalMudir)) {
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





    const handleReject = async (id: string) => {
        try {
            await dailyReportsApi.reject('epidemiology', id);
            notification.success({ message: t('daily_reports.actions.reject_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.reject_error') });
        }
    };

    const handleSubmit = async (id: string) => {
        try {
            await dailyReportsApi.submit('epidemiology', id);
            notification.success({ message: t('daily_reports.actions.submit_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.submit_error') });
        }
    };

    const headerControls = (
        <Space>
            <DatePicker value={date} onChange={(d) => d && setDate(d)} format="DD.MM.YYYY" allowClear={false} style={{ width: 140 }} />
            <Button icon={<ReloadOutlined />} onClick={fetchReports}>Yangilash</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Saqlash</Button>
        </Space>
    );

    return (
        <PermissionGate permission="VIEW_EPIDEMIOLOGY">
            <GlassLayout
                title={t('daily_reports.epidemiology_title')}
                subtitle={`${date.format('DD.MM.YYYY')} kungi holat`}
                headerButtons={headerControls}
            >
                <Card className="glass-card" bordered={false} bodyStyle={{ padding: 0 }}>
                    <EpiTab
                        data={data}
                        loading={loading}
                        userRole={userRole}
                        onChange={handleCellChange}
                        onVerify={handleVerify}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onSubmit={handleSubmit}
                    />
                </Card>
            </GlassLayout>
        </PermissionGate>
    );
};

export default EpidemiologyDailyReportPage;

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 * 
 * Modified PermissionGate key:
 * - Old: <PermissionGate permission="VIEW_EPI">
 * - New: <PermissionGate permission="VIEW_EPIDEMIOLOGY">
 */