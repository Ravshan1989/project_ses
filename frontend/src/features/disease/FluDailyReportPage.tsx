import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined, DownloadOutlined } from '@ant-design/icons';
import { Table, DatePicker, Button, notification, Space, Badge, Tooltip, Card, Modal, Form, InputNumber, Divider } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { exportDailyReport } from '../../services/excelExportService';
import PermissionGate from '../../components/PermissionGate';
import GlassLayout from '../../components/layout/GlassLayout';
import EditCell from '../../components/common/EditCell';

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

const FluDailyReportPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<FluReportData[]>([]);
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<FluReportData | null>(null);
    const [form] = Form.useForm();

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
                    is_submitted: !!existing,
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

    const handleCellChange = (value: number | null, rowKey: string, field: keyof FluReportData) => {
        const newData = [...data];
        const index = newData.findIndex(item => item.key === rowKey);
        if (index > -1) {
            const updatedRow = { ...newData[index], [field]: value || 0 };
            // Auto-calculate totals
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
                    isTest: false
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

    const handleExcelExport = () => {
        const columns = data.length > 0 ? Object.keys(data[0])
            .filter(key => key !== 'is_submitted' && key !== 'id' && key !== 'organizationId' && key !== 'status' && key !== 'verificationToken')
            .map(key => ({
                header: key === 'key' ? '№' : key === 'district_name' ? t('daily_reports.table.district') : key,
                key: key,
                width: key === 'key' ? 5 : key === 'district_name' ? 20 : 12
            })) : [];

        const fileName = `Gripp_Kunlik_${date.format('DD-MM-YYYY')} `;
        const title = t('daily_reports.flu_title');
        const dateStr = date.format('DD.MM.YYYY');

        const translatedData = data.map(item => ({
            ...item,
            district_name: t(`orgs.${item.district_name.toLowerCase()}`, { defaultValue: item.district_name })
        }));

        exportDailyReport(translatedData, fileName, title, dateStr, columns);
        notification.success({ message: 'Excel fayl yuklab olindi!' });
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

    const handleMobileEdit = (record: FluReportData) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            const newData = [...data];
            const index = newData.findIndex(item => item.key === editingRecord?.key);
            if (index > -1) {
                const updatedRow = { ...newData[index], ...values };
                // Re-calculate totals
                updatedRow.ari_total = updatedRow.ari_0_1 + updatedRow.ari_1_2 + updatedRow.ari_3_6 + updatedRow.ari_7_14 + updatedRow.ari_adult;
                updatedRow.pneu_total = updatedRow.pneu_0_2 + updatedRow.pneu_3_6 + updatedRow.pneu_7_14 + updatedRow.pneu_adult;
                updatedRow.flu_total = updatedRow.flu_0_1 + updatedRow.flu_1_2 + updatedRow.flu_3_6 + updatedRow.flu_7_14 + updatedRow.flu_adult;
                updatedRow.sari_total = updatedRow.sari_0_2 + updatedRow.sari_3_6 + updatedRow.sari_7_14 + updatedRow.sari_adult;
                
                newData[index] = updatedRow;
                setData(newData);
            }
            setIsModalVisible(false);
            setEditingRecord(null);
        });
    };

    const canEdit = (record: any) => {
        if (record.status === 'APPROVED' || record.status === 'VERIFIED') return false;
        if (userRole === 'STAFF') return record.status === 'DRAFT' || record.status === 'REJECTED' || !record.status;
        if (userRole === 'DEPARTMENT_HEAD') return record.status === 'SUBMITTED';
        return isAdmin;
    };

    const renderInput = (record: FluReportData, field: keyof FluReportData, rowIdx: number, colIdx: number, forceReadOnly = false) => {
        const disabled = forceReadOnly || !canEdit(record);
        return (
            <EditCell
                value={record[field] as number}
                onChange={(val) => !disabled && handleCellChange(val, record.key, field)}
                rowIdx={rowIdx}
                colIdx={colIdx}
                disabled={disabled}
            />
        );
    };

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
            render: (text: string, r: FluReportData) => (
                <span style={{ color: r.is_submitted ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            )
        },
        {
            title: t('reports.ari'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'ari_total', ridx, 2, true) },
                { title: t('daily_reports.table.age_0_1'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'ari_0_1', ridx, 3) },
                { title: t('daily_reports.table.age_1_2'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'ari_1_2', ridx, 4) },
                { title: t('daily_reports.table.age_3_6'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'ari_3_6', ridx, 5) },
                { title: t('daily_reports.table.age_7_14'), width: 55, render: (_: any, r: any, ridx: number) => renderInput(r, 'ari_7_14', ridx, 6) },
                { title: t('daily_reports.table.adults_short'), width: 65, render: (_: any, r: any, ridx: number) => renderInput(r, 'ari_adult', ridx, 7) },
                { title: t('daily_reports.table.students_short'), width: 55, render: (_: any, r: any, ridx: number) => renderInput(r, 'ari_students', ridx, 8) },
                { title: t('daily_reports.table.nursery_short'), width: 55, render: (_: any, r: any, ridx: number) => renderInput(r, 'ari_nursery', ridx, 9) },
            ]
        },
        {
            title: t('reports.pneumonia'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'pneu_total', ridx, 10, true) },
                { title: t('daily_reports.table.age_0_2'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'pneu_0_2', ridx, 11) },
                { title: t('daily_reports.table.age_3_6'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'pneu_3_6', ridx, 12) },
                { title: t('daily_reports.table.age_7_14'), width: 55, render: (_: any, r: any, ridx: number) => renderInput(r, 'pneu_7_14', ridx, 13) },
                { title: t('daily_reports.table.adults_short'), width: 65, render: (_: any, r: any, ridx: number) => renderInput(r, 'pneu_adult', ridx, 14) },
                { title: t('daily_reports.table.students_short'), width: 55, render: (_: any, r: any, ridx: number) => renderInput(r, 'pneu_students', ridx, 15) },
                { title: t('daily_reports.table.nursery_short'), width: 55, render: (_: any, r: any, ridx: number) => renderInput(r, 'pneu_nursery', ridx, 16) },
            ]
        },
        {
            title: t('reports.flu'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'flu_total', ridx, 17, true) },
                { title: t('daily_reports.table.age_0_1'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'flu_0_1', ridx, 18) },
                { title: t('daily_reports.table.age_1_2'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'flu_1_2', ridx, 19) },
                { title: t('daily_reports.table.age_3_6'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'flu_3_6', ridx, 20) },
                { title: t('daily_reports.table.age_7_14'), width: 55, render: (_: any, r: any, ridx: number) => renderInput(r, 'flu_7_14', ridx, 21) },
                { title: t('daily_reports.table.adults_short'), width: 65, render: (_: any, r: any, ridx: number) => renderInput(r, 'flu_adult', ridx, 22) },
                { title: t('daily_reports.table.students_short'), width: 55, render: (_: any, r: any, ridx: number) => renderInput(r, 'flu_students', ridx, 23) },
                { title: t('daily_reports.table.nursery_short'), width: 55, render: (_: any, r: any, ridx: number) => renderInput(r, 'flu_nursery', ridx, 24) },
            ]
        },
        {
            title: t('daily_reports.table.sari'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'sari_total', ridx, 25, true) },
                { title: t('daily_reports.table.age_0_2'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'sari_0_2', ridx, 26) },
                { title: t('daily_reports.table.age_3_6'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'sari_3_6', ridx, 27) },
                { title: t('daily_reports.table.age_7_14'), width: 55, render: (_: any, r: any, ridx: number) => renderInput(r, 'sari_7_14', ridx, 28) },
                { title: t('daily_reports.table.adults_short'), width: 65, render: (_: any, r: any, ridx: number) => renderInput(r, 'sari_adult', ridx, 29) },
            ]
        },
        {
            title: t('daily_reports.table.deaths'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'death_total', ridx, 30) },
                { title: t('daily_reports.table.pregnant'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'death_pregnant', ridx, 31) },
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
            <Button
                icon={<DownloadOutlined />}
                onClick={handleExcelExport}
            >
                Excel
            </Button>
            <Button
                icon={<ReloadOutlined />}
                onClick={fetchReports}
            >
                {t('daily_reports.actions.refresh')}
            </Button>
            <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
            >
                {t('daily_reports.actions.save')}
            </Button>
        </Space>
    );

    return (
        <PermissionGate permission="VIEW_FLU">
            <GlassLayout
                title={t('daily_reports.flu_title')}
                subtitle={t('daily_reports.date_status', { date: date.format('DD.MM.YYYY') })}
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
                            scroll={{ x: 1800, y: 600 }}
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
                                extra={<Badge status={item.status === 'APPROVED' ? 'success' : 'processing'} text={item.status} />}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Institutions:</span>
                                        <strong>{item.institution_count}</strong>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div style={{ background: '#e6f7ff', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#1890ff' }}>Gripp</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.flu_total}</div>
                                        </div>
                                        <div style={{ background: '#fff7e6', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#fa8c16' }}>O'RVI</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.ari_total}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div style={{ background: '#f6ffed', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#52c41a' }}>Pnevmoniya</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.pneu_total}</div>
                                        </div>
                                        <div style={{ background: '#fff0f6', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: '#eb2f96' }}>SARI</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.sari_total}</div>
                                        </div>
                                    </div>
                                    <Button 
                                        block 
                                        type="primary" 
                                        disabled={!canEdit(item)}
                                        onClick={() => handleMobileEdit(item)}
                                    >
                                        Tahrirlash / Batafsil
                                    </Button>
                                </Space>
                            </Card>
                        ))}
                    </div>
                )}
            </GlassLayout>

            <Modal
                title={editingRecord ? `${editingRecord.district_name} - Tahrirlash` : 'Tahrirlash'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                width={600}
                okText={t('daily_reports.actions.save')}
                cancelText={t('common.cancel')}
            >
                <Form form={form} layout="vertical">
                    <Divider orientation="left">{t('reports.ari')}</Divider>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <Form.Item name="ari_0_1" label={t('daily_reports.table.age_0_1')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="ari_1_2" label={t('daily_reports.table.age_1_2')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="ari_3_6" label={t('daily_reports.table.age_3_6')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="ari_7_14" label={t('daily_reports.table.age_7_14')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="ari_adult" label={t('daily_reports.table.adults_short')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                    </div>

                    <Divider orientation="left">{t('reports.pneumonia')}</Divider>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <Form.Item name="pneu_0_2" label={t('daily_reports.table.age_0_2')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="pneu_3_6" label={t('daily_reports.table.age_3_6')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="pneu_7_14" label={t('daily_reports.table.age_7_14')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="pneu_adult" label={t('daily_reports.table.adults_short')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                    </div>

                    <Divider orientation="left">{t('reports.flu')}</Divider>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <Form.Item name="flu_0_1" label={t('daily_reports.table.age_0_1')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="flu_1_2" label={t('daily_reports.table.age_1_2')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="flu_3_6" label={t('daily_reports.table.age_3_6')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="flu_7_14" label={t('daily_reports.table.age_7_14')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="flu_adult" label={t('daily_reports.table.adults_short')}><InputNumber style={{ width: '100%' }} /></Form.Item>
                    </div>
                </Form>
            </Modal>
        </PermissionGate>
    );
};

export default FluDailyReportPage;
