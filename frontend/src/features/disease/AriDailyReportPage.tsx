import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Table, DatePicker, Button, InputNumber, notification, Space, Badge, Card, Modal, Form } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import PermissionGate from '../../components/PermissionGate';
import GlassLayout from '../../components/layout/GlassLayout';

interface AriReportData {
    key: string;
    district_name: string;
    organizationId: string;
    gk: number;
    ari: number;
    pneumonia: number;
    is_submitted?: boolean;
    id?: string;
    status?: string;
    verificationToken?: string;
}

const AriDailyReportPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<AriReportData[]>([]);
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
            notification.success({ message: t('daily_reports.actions.verify_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.verify_error') });
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await dailyReportsApi.approve('ari', id);
            notification.success({ message: t('daily_reports.actions.approve_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.approve_error') });
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

    const columns: any = [
        { title: t('daily_reports.table.no'), dataIndex: 'key', width: 50, align: 'center', fixed: 'left' },
        {
            title: t('daily_reports.table.district'),
            dataIndex: 'district_name',
            width: 200,
            fixed: 'left',
            render: (text: string, r: AriReportData) => (
                <span style={{ color: r.is_submitted ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            )
        },
        { title: t('daily_reports.table.gk'), width: 120, render: (_: any, r: any) => renderInput(r, 'gk'), align: 'center' },
        { title: t('daily_reports.table.ari'), width: 120, render: (_: any, r: any) => renderInput(r, 'ari'), align: 'center' },
        { title: t('daily_reports.table.pneumonia'), width: 120, render: (_: any, r: any) => renderInput(r, 'pneumonia'), align: 'center' },
        {
            title: t('daily_reports.table.status'),
            key: 'status',
            width: 140,
            fixed: 'right',
            render: (_: any, r: AriReportData) => (
                <Space>
                    <Badge status={r.status === 'APPROVED' ? 'success' : r.status === 'VERIFIED' ? 'processing' : 'default'} text={r.status} />
                    {r.verificationToken && (
                        <Button size="small" icon={<QrcodeOutlined />} onClick={() => window.open(`/verify/${r.verificationToken}`, '_blank')} />
                    )}
                </Space>
            )
        },
        {
            title: t('common.actions'),
            key: 'actions',
            width: 180,
            fixed: 'right',
            render: (_: any, r: AriReportData) => {
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
    const [editingItem, setEditingItem] = useState<AriReportData | null>(null);
    const [form] = Form.useForm();

    const handleEditClick = (record: AriReportData) => {
        setEditingItem(record);
        form.setFieldsValue({
            gk: record.gk,
            ari: record.ari,
            pneumonia: record.pneumonia
        });
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

                // Optional: Save immediately to backend for better mobile UX
                const formattedDate = date.format('YYYY-MM-DD');
                await dailyReportsApi.upsertAri({
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

    return (
        <PermissionGate permission="VIEW_ARI">
            <GlassLayout
                title={t('daily_reports.ari_title')}
                subtitle={`${date.format('DD.MM.YYYY')} kungi holat`}
                headerButtons={headerControls}
            >
                {!isMobile ? (
                    <Card className="glass-card" bordered={false} bodyStyle={{ padding: 0 }}>
                        <Table
                            columns={columns}
                            dataSource={data}
                            loading={loading}
                            bordered
                            size="small"
                            pagination={false}
                            scroll={{ x: 1000 }}
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
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                        <div style={{ background: '#e6f7ff', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#1890ff' }}>GK</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.gk}</div>
                                        </div>
                                        <div style={{ background: '#fff7e6', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#fa8c16' }}>ARI</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.ari}</div>
                                        </div>
                                        <div style={{ background: '#f6ffed', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#52c41a' }}>Pnevmoniya</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.pneumonia}</div>
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
                >
                    <Form form={form} layout="vertical">
                        <Form.Item name="gk" label="GK (Gospitalizatsiya)">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                        <Form.Item name="ari" label="ARI (O'tkir respirator infeksiya)">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                        <Form.Item name="pneumonia" label="Pnevmoniya">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Form>
                </Modal>
            </GlassLayout>
        </PermissionGate>
    );
};

export default AriDailyReportPage;