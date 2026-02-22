import React, { useState } from 'react';
import { Table, InputNumber, Space, Badge, Button, Modal, Form, Tabs } from 'antd';
import EditCell from '../../../components/common/EditCell';
import { useTranslation } from 'react-i18next';

export interface EpiReportData {
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

interface EpiTabProps {
    data: EpiReportData[];
    loading: boolean;
    userRole: string;
    onChange: (value: number | null, rowKey: string, field: keyof EpiReportData) => void;
    onVerify: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onSubmit: (id: string) => void;
}

const EpiTab: React.FC<EpiTabProps> = ({ data, loading, userRole, onChange, onVerify, onApprove, onReject, onSubmit }) => {
    const { t } = useTranslation();

    const isAdmin = ['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(userRole);
    const isMudir = ['DEPARTMENT_HEAD', 'LAB_HEAD', 'DISTRICT_HEAD'].includes(userRole);
    const isSpecialist = ['STAFF', 'DISTRICT_SPECIALIST', 'DISTRICT_OPERATOR'].includes(userRole);

    const canEdit = (record: EpiReportData) => {
        if (record.status === 'APPROVED' || record.status === 'VERIFIED') return false;
        if (isSpecialist) return record.status === 'DRAFT' || record.status === 'REJECTED' || !record.status;
        if (isMudir) return record.status === 'SUBMITTED';
        return isAdmin;
    };

    const renderInput = (record: EpiReportData, field: keyof EpiReportData, rowIdx: number, colIdx: number, forceReadOnly = false) => {
        const disabled = forceReadOnly || !canEdit(record);
        return (
            <EditCell
                value={record[field] as number}
                onChange={(val) => !disabled && onChange(val, record.key, field)}
                rowIdx={rowIdx}
                colIdx={colIdx}
                disabled={disabled}
            />
        );
    };

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
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'inspected_total', ridx, 2, true) },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'inspected_mtm', ridx, 3) },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'inspected_school', ridx, 4) },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'inspected_dpm', ridx, 5) },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'inspected_other', ridx, 6) },
            ]
        },
        {
            title: t('daily_reports.table.defects_found'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'defects_total', ridx, 7, true) },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'defects_mtm', ridx, 8) },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'defects_school', ridx, 9) },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'defects_dpm', ridx, 10) },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'defects_other', ridx, 11) },
            ]
        },
        {
            title: t('daily_reports.table.fines_issued'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'fines_total', ridx, 12, true) },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'fines_mtm', ridx, 13) },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'fines_school', ridx, 14) },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'fines_dpm', ridx, 15) },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'fines_other', ridx, 16) },
            ]
        },
        {
            title: t('daily_reports.table.suspended_activities'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'suspended_total', ridx, 17, true) },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'suspended_mtm', ridx, 18) },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'suspended_school', ridx, 19) },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any, ridx: number) => renderInput(r, 'suspended_dpm', ridx, 20) },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any, ridx: number) => renderInput(r, 'suspended_other', ridx, 21) },
            ]
        },
        {
            title: t('daily_reports.table.status'),
            key: 'status',
            width: 140,
            fixed: 'right',
            render: (_: any, r: EpiReportData) => (
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Badge status={r.status === 'APPROVED' ? 'success' : r.status === 'VERIFIED' ? 'processing' : 'default'} text={r.status} />
                    {r.id && (
                        <Space wrap>
                            {isSpecialist && (r.status === 'DRAFT' || r.status === 'REJECTED' || !r.status) && (
                                <Button size="small" type="primary" onClick={() => onSubmit(r.id!)} style={{ fontSize: '10px', height: '22px' }}>
                                    {t('common.submit') || 'Yuborish'}
                                </Button>
                            )}
                            {isMudir && r.status === 'SUBMITTED' && (
                                <>
                                    <Button size="small" type="primary" onClick={() => onVerify(r.id!)} style={{ fontSize: '10px', height: '22px', background: '#52c41a' }}>
                                        {t('common.verify') || 'Tekshirish'}
                                    </Button>
                                    <Button size="small" danger onClick={() => onReject(r.id!)} style={{ fontSize: '10px', height: '22px' }}>
                                        {t('common.reject') || 'Rad etish'}
                                    </Button>
                                </>
                            )}
                            {isAdmin && r.status === 'VERIFIED' && (
                                <>
                                    <Button size="small" type="primary" onClick={() => onApprove(r.id!)} style={{ fontSize: '10px', height: '22px', background: '#722ed1' }}>
                                        {t('common.approve') || 'Tasdiqlash'}
                                    </Button>
                                    <Button size="small" danger onClick={() => onReject(r.id!)} style={{ fontSize: '10px', height: '22px' }}>
                                        {t('common.reject') || 'Rad etish'}
                                    </Button>
                                </>
                            )}
                        </Space>
                    )}
                </Space>
            )
        }
    ];

    // Mobile check
    const isMobile = window.innerWidth <= 768;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EpiReportData | null>(null);
    const [form] = Form.useForm();

    const handleEditClick = (record: EpiReportData) => {
        setEditingItem(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                Object.keys(values).forEach(key => {
                    onChange(values[key], editingItem.key, key as keyof EpiReportData);
                });
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
                    label: 'Tekshiruv',
                    children: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <Form.Item name="inspected_mtm" label="MTM">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="inspected_school" label="Maktab">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="inspected_dpm" label="DPM">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="inspected_other" label="Boshqa">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </div>
                    )
                },
                {
                    key: '2',
                    label: 'Kamchiliklar',
                    children: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <Form.Item name="defects_mtm" label="MTM">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="defects_school" label="Maktab">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="defects_dpm" label="DPM">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="defects_other" label="Boshqa">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </div>
                    )
                },
                {
                    key: '3',
                    label: 'Jarimalar',
                    children: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <Form.Item name="fines_mtm" label="MTM">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="fines_school" label="Maktab">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="fines_dpm" label="DPM">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="fines_other" label="Boshqa">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </div>
                    )
                },
                {
                    key: '4',
                    label: "To'xtatish",
                    children: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <Form.Item name="suspended_mtm" label="MTM">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="suspended_school" label="Maktab">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="suspended_dpm" label="DPM">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="suspended_other" label="Boshqa">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </div>
                    )
                }
            ]} />
        </Form>
    );

    if (isMobile) {
        return (
            <div style={{ marginTop: '0px' }}>
                {loading ? <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div> : data.map((item) => (
                    <div
                        key={item.key}
                        style={{
                            marginBottom: '16px',
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            padding: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700 }}>{t(`orgs.${item.district_name.toLowerCase()}`, { defaultValue: item.district_name })}</span>
                            <Badge
                                status={item.status === 'APPROVED' ? 'success' : item.status === 'VERIFIED' ? 'processing' : item.status === 'REJECTED' ? 'error' : item.status === 'SUBMITTED' ? 'warning' : 'default'}
                                text={item.status}
                            />
                        </div>

                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ background: '#e6f7ff', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#1890ff' }}>Tekshirildi</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.inspected_total}</div>
                                </div>
                                <div style={{ background: '#fff7e6', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#fa8c16' }}>Kamchiliklar</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.defects_total}</div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ background: '#fff1f0', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#f5222d' }}>Jarimalar</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.fines_total}</div>
                                </div>
                                <div style={{ background: '#f9f0ff', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#722ed1' }}>To'xtatildi</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.suspended_total}</div>
                                </div>
                            </div>

                            {item.id && (
                                <Space wrap style={{ width: '100%', justifyContent: 'center' }}>
                                    {isSpecialist && (item.status === 'DRAFT' || item.status === 'REJECTED' || !item.status) && (
                                        <Button size="small" type="primary" onClick={() => onSubmit(item.id!)}>
                                            {t('common.submit') || 'Yuborish'}
                                        </Button>
                                    )}
                                    {isMudir && item.status === 'SUBMITTED' && (
                                        <>
                                            <Button size="small" type="primary" onClick={() => onVerify(item.id!)} style={{ background: '#52c41a' }}>
                                                {t('common.verify') || 'Tekshirish'}
                                            </Button>
                                            <Button size="small" danger onClick={() => onReject(item.id!)}>
                                                {t('common.reject') || 'Rad etish'}
                                            </Button>
                                        </>
                                    )}
                                    {isAdmin && item.status === 'VERIFIED' && (
                                        <>
                                            <Button size="small" type="primary" onClick={() => onApprove(item.id!)} style={{ background: '#722ed1' }}>
                                                {t('common.approve') || 'Tasdiqlash'}
                                            </Button>
                                            <Button size="small" danger onClick={() => onReject(item.id!)}>
                                                {t('common.reject') || 'Rad etish'}
                                            </Button>
                                        </>
                                    )}
                                </Space>
                            )}
                            <Button block type="primary" onClick={() => handleEditClick(item)}>
                                Tahrirlash
                            </Button>
                        </Space>
                    </div>
                ))}

                <Modal
                    title={`${editingItem ? t(`orgs.${editingItem.district_name.toLowerCase()}`, { defaultValue: editingItem.district_name }) : ''} - Tahrirlash`}
                    open={isModalOpen}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    okText="OK"
                    cancelText="Bekor qilish"
                    centered
                    width="95%"
                >
                    {modalContent}
                </Modal>
            </div>
        );
    }

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            bordered
            size="small"
            pagination={false}
            scroll={{ x: 1400 }}
            className="premium-table"
        />
    );
};

export default EpiTab;


