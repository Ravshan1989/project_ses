import React, { useState, useEffect } from 'react';
import { Typography, DatePicker, Button, Space, notification } from 'antd';
import { SaveOutlined, ReloadOutlined, AuditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import DiarrheaTab from './unified/DiarrheaTab';
import PermissionGate from '../../components/PermissionGate';

const { Title, Text } = Typography;

const DailyDiarrheaPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);

    const userRole = localStorage.getItem('user_role') || 'STAFF';
    const isAdmin = ['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(userRole);
    const userOrgId = localStorage.getItem('user_org_id');

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

            const res = await dailyReportsApi.getDiarrheaByDate(formattedDate);
            const apiData = res.data || [];

            let tableData = currentOrgs.map((org, idx) => {
                const existing = apiData.find((r: any) => r.organization?.id === org.id);
                return {
                    key: String(idx + 1),
                    district: org.name,
                    organizationId: org.id,
                    total_2025: existing?.total_2025 || 0,
                    total_2026: existing?.total_2026 || 0,
                    actively_found: existing?.actively_found || 0,
                    hospitalized: existing?.hospitalized || 0,
                    illness_days_1_2: existing?.illness_days_1_2 || 0,
                    age_under_1: existing?.age_under_1 || 0,
                    age_1_3: existing?.age_1_3 || 0,
                    age_4_6: existing?.age_4_6 || 0,
                    age_7_14: existing?.age_7_14 || 0,
                    age_15_19: existing?.age_15_19 || 0,
                    age_20_plus: existing?.age_20_plus || 0,
                    nursery_org: existing?.nursery_org || 0,
                    nursery_unorg: existing?.nursery_unorg || 0,
                    kindergarten_org: existing?.kindergarten_org || 0,
                    kindergarten_unorg: existing?.kindergarten_unorg || 0,
                    students: existing?.students || 0,
                    higher_students: existing?.higher_students || 0,
                    adults: existing?.adults || 0,
                    open_water_samples: existing?.open_water_samples || 0,
                    open_water_isolated: existing?.open_water_isolated || 0,
                    tap_water_samples: existing?.tap_water_samples || 0,
                    tap_water_isolated: existing?.tap_water_isolated || 0,
                    id: existing?.id,
                    status: existing?.status || 'DRAFT',
                };
            });

            const userOrgParentId = localStorage.getItem('user_org_parent_id');
            const isMudir = userRole === 'DEPARTMENT_HEAD';
            const isRegionalMudir = isMudir && (!userOrgParentId || userOrgParentId === 'null');

            if (!(isAdmin || isRegionalMudir)) {
                if (userOrgId) {
                    tableData = tableData.filter(d => d.organizationId === userOrgId);
                }
            }

            setData(tableData);
        } catch (error) {
            notification.error({ message: t('common.error_load_data') });
        } finally {
            setLoading(false);
        }
    };

    const handleCellChange = (value: number, key: string, field: string) => {
        const newData = [...data];
        const index = newData.findIndex(item => item.key === key);
        if (index > -1) {
            newData[index] = { ...newData[index], [field]: value };
            setData(newData);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            for (const row of data) {
                await dailyReportsApi.upsertDiarrhea({
                    ...row,
                    reportDate: formattedDate,
                    organizationId: row.organizationId
                });
            }
            notification.success({ message: t('daily_reports.actions.save_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.save_error') });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: string) => {
        try {
            await dailyReportsApi.verify('diarrhea', id);
            notification.success({ message: t('daily_reports.actions.verified') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.verify_error') });
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await dailyReportsApi.approve('diarrhea', id);
            notification.success({ message: t('daily_reports.actions.approved') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.approve_error') });
        }
    };

    const handleReject = async (id: string) => {
        try {
            await dailyReportsApi.reject('diarrhea', id);
            notification.success({ message: t('daily_reports.actions.reject_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.reject_error') });
        }
    };

    const handleSubmit = async (id: string) => {
        try {
            await dailyReportsApi.submit('diarrhea', id);
            notification.success({ message: t('daily_reports.actions.submit_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.submit_error') });
        }
    };

    const headerStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    };

    return (
        <PermissionGate permission="VIEW_HEPATITIS">
            <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
                <div style={headerStyle}>
                    <Space size="middle">
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                            <AuditOutlined style={{ fontSize: '24px' }} />
                        </div>
                        <div>
                            <Title level={3} style={{ margin: 0, color: '#fff' }}>
                                {t('reports.diarrhea')}
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                {t('daily_reports.actions.all_sections_data', { date: date.format('DD.MM.YYYY') })}
                            </Text>
                        </div>
                    </Space>
                    <Space size="middle">
                        <DatePicker
                            value={date}
                            onChange={(d) => d && setDate(d)}
                            format="DD.MM.YYYY"
                            style={{ borderRadius: '8px', width: '150px' }}
                        />
                        <Button icon={<ReloadOutlined />} onClick={fetchReports} style={{ borderRadius: '8px' }}>
                            {t('daily_reports.actions.refresh')}
                        </Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} style={{ borderRadius: '8px', background: '#fff', color: '#1e3c72', fontWeight: 700, border: 'none' }}>
                            {t('daily_reports.actions.save')}
                        </Button>
                    </Space>
                </div>

                <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <DiarrheaTab
                        data={data}
                        loading={loading}
                        onChange={handleCellChange}
                        userRole={userRole}
                        onVerify={handleVerify}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </PermissionGate>
    );
};

export default DailyDiarrheaPage;
