import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { DatePicker, Button, notification, Space, Badge, Card } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import PermissionGate from '../../components/PermissionGate';
import GlassLayout from '../../components/layout/GlassLayout';
import HepatitisTab from './unified/HepatitisTab';
import { transformToHierarchy } from '../../utils/reportDataTransformer';

interface ReportData {
    key: string;
    district_name: string;
    organizationId: string;
    total_cases: number;
    // Ages
    age_under_1: number;
    age_1_3: number;
    age_4_6: number;
    age_7_14: number;
    age_15_19: number;
    age_20_plus: number;
    // Occ
    occ_unorganized: number;
    occ_unorganized_1_6: number;
    occ_organized_1_6: number;
    occ_unorganized_school_age: number;
    occ_students: number;
    occ_college_students: number;
    occ_workers: number;
    // Factors
    factor_water: number;
    factor_food: number;
    factor_contact: number;
    // Lab
    lab_samples: number;
    lab_positive: number;
    disinfection_done: number;
    is_submitted?: boolean;
    id?: string;
    status?: string;
    verificationToken?: string;
}

const DailyHepatitisPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<ReportData[]>([]);
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
                currentOrgs = orgRes.data || [];
                setOrganizations(currentOrgs);
            }

            const res = await dailyReportsApi.getByDate(formattedDate, false);
            const apiData = res.data || [];

            const defaultFields = {
                total_cases: 0, age_under_1: 0, age_1_3: 0, age_4_6: 0, age_7_14: 0, age_15_19: 0, age_20_plus: 0,
                occ_unorganized: 0, occ_unorganized_1_6: 0, occ_organized_1_6: 0, occ_unorganized_school_age: 0,
                occ_students: 0, occ_college_students: 0, occ_workers: 0, factor_water: 0, factor_food: 0,
                factor_contact: 0, lab_samples: 0, lab_positive: 0, disinfection_done: 0, status: 'DRAFT'
            };

            const tableData = transformToHierarchy(apiData, currentOrgs, defaultFields, isAdmin, connectedOrgId);
            setData(tableData);
        } catch (error) {
            console.error("Failed to fetch reports", error);
            notification.error({
                message: t('daily_reports.actions.error_load'),
                description: t('daily_reports.actions.error_load')
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCellChange = (value: number | null, rowKey: string, field: keyof ReportData) => {
        const newData = [...data];
        const index = newData.findIndex(item => item.key === rowKey);
        if (index > -1) {
            const updatedRow = { ...newData[index], [field]: value || 0 };
            const ageFields: (keyof ReportData)[] = [
                'age_under_1', 'age_1_3', 'age_4_6', 'age_7_14', 'age_15_19', 'age_20_plus'
            ];
            if (ageFields.includes(field)) {
                updatedRow.total_cases = ageFields.reduce((sum, f) => sum + (updatedRow[f] as number), 0);
            }
            newData[index] = updatedRow;
            setData(newData);
        }
    };



    const handleSave = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            
            const flatten = (items: any[]) => {
                let result: any[] = [];
                items.forEach(item => {
                    if (item.children) {
                        result = [...result, ...flatten(item.children)];
                    } else if (!item.isParent) {
                        result.push(item);
                    }
                });
                return result;
            };

            const districtData = flatten(data);

            for (const row of districtData) {
                await dailyReportsApi.upsert({
                    ...row,
                    reportDate: formattedDate,
                    organizationId: row.organizationId,
                });
            }
            notification.success({
                message: t('daily_reports.actions.save'),
                description: t('daily_reports.actions.success_save')
            });
            fetchReports();
        } catch (error) {
            console.error("Failed to save", error);
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
            await dailyReportsApi.verify('hepatitis', id);
            notification.success({ message: t('daily_reports.actions.verify_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.verify_error') });
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await dailyReportsApi.approve('hepatitis', id);
            notification.success({ message: t('daily_reports.actions.approve_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.approve_error') });
        }
    };



    const handleReject = async (id: string) => {
        try {
            await dailyReportsApi.reject('hepatitis', id);
            notification.success({ message: t('daily_reports.actions.reject_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.reject_error') });
        }
    };

    const handleSubmit = async (id: string) => {
        try {
            await dailyReportsApi.submit('hepatitis', id);
            notification.success({ message: t('daily_reports.actions.submit_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.submit_error') });
        }
    };

    const headerControls = (
        <Space wrap>
            <DatePicker
                value={date}
                onChange={(d) => d && setDate(d)}
                format="DD.MM.YYYY"
                allowClear={false}
                inputReadOnly
                style={{ width: 140 }}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchReports}>
                {t('daily_reports.actions.refresh')}
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                {t('daily_reports.actions.save')}
            </Button>
        </Space>
    );

    return (
        <PermissionGate permission="VIEW_HEPATITIS">
            <GlassLayout
                title={t('daily_reports.hepatitis_title')}
                subtitle={t('daily_reports.date_status', { date: date.format('DD.MM.YYYY') })}
                headerButtons={headerControls}
            >
                {!isAdmin && !connectedOrgId && (
                    <div style={{ marginBottom: 24 }}>
                        <Badge status="warning" text={t('daily_reports.errors.no_org_context') || "Tashkilot ma'lumotlari topilmadi."} />
                    </div>
                )}

                <Card className="glass-card" bordered={false} styles={{ body: { padding: 0 } }}>
                    <HepatitisTab
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

export default DailyHepatitisPage;
