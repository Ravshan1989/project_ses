import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Table, DatePicker, Button, InputNumber, notification, Space, Badge, Tooltip, Card, Modal, Form, Tabs } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import PermissionGate from '../../components/PermissionGate';
import GlassLayout from '../../components/layout/GlassLayout';
import EditCell from '../../components/common/EditCell';

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

    // Mobile check
    const isMobile = window.innerWidth <= 768;

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

    const canEdit = (record: any) => {
        if (record.status === 'APPROVED' || record.status === 'VERIFIED') return false;
        if (userRole === 'STAFF') return record.status === 'DRAFT' || record.status === 'REJECTED' || !record.status;
        if (userRole === 'DEPARTMENT_HEAD') return record.status === 'SUBMITTED';
        return isAdmin;
    };

    const renderInput = (record: CovidReportData, field: keyof CovidReportData, rowIdx: number, colIdx: number) => (
        <EditCell
            value={record[field] as number}
            onChange={(val) => handleCellChange(val, record.key, field)}
            rowIdx={rowIdx}
            colIdx={colIdx}
            disabled={!canEdit(record)}
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
        { title: t('daily_reports.table.total_cases'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'total_cases', ridx, 2), align: 'center' },
        { title: t('daily_reports.table.reinfected'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'reinfected', ridx, 3), align: 'center' },
        { title: t('daily_reports.table.vaccinated_infected'), width: 100, render: (_: any, r: any, ridx: number) => renderInput(r, 'vaccinated_infected', ridx, 4), align: 'center' },
        {
            title: t('daily_reports.table.by_age'),
            children: [
                { title: t('daily_reports.table.age_0_1'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_0_1', ridx, 5) },
                { title: t('daily_reports.table.age_1_3'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_1_3', ridx, 6) },
                { title: t('daily_reports.table.age_4_6'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_4_6', ridx, 7) },
                { title: t('daily_reports.table.age_7_14'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_7_14', ridx, 8) },
                { title: t('daily_reports.table.age_15_19'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_15_19', ridx, 9) },
                { title: t('daily_reports.table.age_20_29'), width: 70, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_20_29', ridx, 10) },
                { title: t('daily_reports.table.age_30_39'), width: 70, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_30_39', ridx, 11) },
                { title: t('daily_reports.table.age_40_49'), width: 70, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_40_49', ridx, 12) },
                { title: t('daily_reports.table.age_50_59'), width: 70, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_50_59', ridx, 13) },
                { title: t('daily_reports.table.age_60_plus'), width: 70, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_60_plus', ridx, 14) },
            ]
        },
        {
            title: t('daily_reports.table.hospitalized'),
            width: 100,
            render: (_: any, r: any, ridx: number) => renderInput(r, 'hospitalized_count', ridx, 15),
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

    const headerControls = (
        <Space>
            <DatePicker value={date} onChange={(d) => d && setDate(d)} format="DD.MM.YYYY" allowClear={false} style={{ width: 140 }} />
            <Button icon={<ReloadOutlined />} onClick={fetchReports}>Yangilash</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Saqlash</Button>
        </Space>
    );

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CovidReportData | null>(null);
    const [form] = Form.useForm();

    const handleEditClick = (record: CovidReportData) => {
        setEditingItem(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                // Update local state
                const newData = [...data];
                const index = newData.findIndex(item => item.key === editingItem.key);
                if (index > -1) {
                    newData[index] = { ...newData[index], ...values };
                    setData(newData);
                }

                const formattedDate = date.format('YYYY-MM-DD');
                await dailyReportsApi.upsertCovid({
                    ...editingItem,
                    ...values,
                    reportDate: formattedDate,
                    organizationId: editingItem.organizationId,
                });
                notification.success({ message: t('user.save') });
            }
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const modalContent = (
        <Form form={form} layout="vertical">
            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: 'Umumiy',
                    children: (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <Form.Item name="total_cases" label="Jami">
                                    <InputNumber style={{ width: '100%' }} min={0} />
                                </Form.Item>
                                <Form.Item name="hospitalized_count" label="Shifoxonada">
                                    <InputNumber style={{ width: '100%' }} min={0} />
                                </Form.Item>
                                <Form.Item name="reinfected" label="Qayta kasallangan">
                                    <InputNumber style={{ width: '100%' }} min={0} />
                                </Form.Item>
                                <Form.Item name="vaccinated_infected" label="Emlangan">
                                    <InputNumber style={{ width: '100%' }} min={0} />
                                </Form.Item>
                            </div>
                        </>
                    )
                },
                {
                    key: '2',
                    label: 'Yosh kesimida',
                    children: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <Form.Item name="age_0_1" label="0-1 yosh">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="age_1_3" label="1-3 yosh">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="age_4_6" label="4-6 yosh">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="age_7_14" label="7-14 yosh">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="age_15_19" label="15-19 yosh">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="age_20_29" label="20-29 yosh">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="age_30_39" label="30-39 yosh">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="age_40_49" label="40-49 yosh">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="age_50_59" label="50-59 yosh">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="age_60_plus" label="60+ yosh">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </div>
                    )
                }
            ]} />
        </Form>
    );

    return (
        <PermissionGate permission="VIEW_COVID">
            <GlassLayout
                title={t('daily_reports.covid_title')}
                subtitle={`${date.format('DD.MM.YYYY')} kungi holat`}
                headerButtons={headerControls}
            >
                {!isMobile ? (
                    <Card className="glass-card" bordered={false} styles={{ body: { padding: 0 } }}>
                        <Table
                            columns={columns}
                            dataSource={data}
                            loading={loading}
                            bordered
                            size="small"
                            pagination={false}
                            scroll={{ x: 1500 }}
                        />
                    </Card>
                ) : (
                    <div style={{ marginTop: '16px' }}>
                        {loading ? <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div> : data.map((item) => (
                            <Card
                                key={item.key}
                                style={{
                                    marginBottom: '16px',
                                    borderRadius: '16px',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }}
                                title={<span style={{ fontSize: '16px', fontWeight: 700 }}>{t(`orgs.${item.district_name.toLowerCase()}`, { defaultValue: item.district_name })}</span>}
                                extra={<Badge status={item.status === 'APPROVED' ? 'success' : item.status === 'VERIFIED' ? 'processing' : 'default'} text={item.status} />}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div style={{ background: '#e6f7ff', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#1890ff' }}>Jami</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.total_cases}</div>
                                        </div>
                                        <div style={{ background: '#fff7e6', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#fa8c16' }}>Shifoxonada</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.hospitalized_count}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div style={{ background: '#f6ffed', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#52c41a' }}>Qayta</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.reinfected}</div>
                                        </div>
                                        <div style={{ background: '#fff0f6', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#eb2f96' }}>Emlangan</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.vaccinated_infected}</div>
                                        </div>
                                    </div>
                                    <Button block type="primary" onClick={() => handleEditClick(item)}>
                                        Tahrirlash
                                    </Button>
                                </Space>
                            </Card>
                        ))}
                    </div>
                )}
                <Modal
                    title={`${editingItem ? t(`orgs.${editingItem.district_name.toLowerCase()}`, { defaultValue: editingItem.district_name }) : ''} - Tahrirlash`}
                    open={isModalOpen}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    okText="Saqlash"
                    cancelText="Bekor qilish"
                    centered
                    width={isMobile ? '95%' : 600}
                >
                    {modalContent}
                </Modal>
            </GlassLayout>
        </PermissionGate>
    );
};

export default CovidDailyReportPage;