import React, { useState } from 'react';
import { Table, InputNumber, Space, Badge, Button, Modal, Form, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

interface ReportData {
    key: string;
    district_name: string;
    organizationId: string;
    is_submitted?: boolean;
    total_cases: number;
    age_under_1: number;
    age_1_3: number;
    age_4_6: number;
    age_7_14: number;
    age_15_19: number;
    age_20_plus: number;
    occ_unorganized: number;
    occ_unorganized_1_6: number;
    occ_organized_1_6: number;
    occ_unorganized_school_age: number;
    occ_students: number;
    occ_college_students: number;
    occ_workers: number;
    factor_water: number;
    factor_food: number;
    factor_contact: number;
    lab_samples: number;
    lab_positive: number;
    disinfection_done: number;
    id?: string;
    status?: string;
    verificationToken?: string;
}

interface HepatitisTabProps {
    data: ReportData[];
    loading: boolean;
    userRole: string;
    onChange: (value: number | null, rowKey: string, field: keyof ReportData) => void;
    onVerify: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onSubmit: (id: string) => void;
}

const HepatitisTab: React.FC<HepatitisTabProps> = ({ data, loading, userRole, onChange, onVerify, onApprove, onReject, onSubmit }) => {
    const { t } = useTranslation();

    const isAdmin = ['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(userRole);
    const isMudir = ['DEPARTMENT_HEAD', 'LAB_HEAD', 'DISTRICT_HEAD'].includes(userRole);
    const isSpecialist = ['STAFF', 'DISTRICT_SPECIALIST', 'DISTRICT_OPERATOR'].includes(userRole);

    const isSubmitted = (record: ReportData) => !!record.is_submitted || record.status !== 'DRAFT';

    const canEdit = (record: ReportData) => {
        if (record.status === 'APPROVED' || record.status === 'VERIFIED') return false;
        if (isSpecialist) return record.status === 'DRAFT' || record.status === 'REJECTED' || !record.status;
        if (isMudir) return record.status === 'SUBMITTED';
        return isAdmin;
    };

    const renderInput = (record: ReportData, field: keyof ReportData, forceReadOnly = false) => {
        const readOnly = forceReadOnly || !canEdit(record);
        return (
            <InputNumber
                size="small"
                min={0}
                value={record[field] as number}
                onChange={(val) => !readOnly && onChange(val || 0, record.key, field)}
                variant="borderless"
                readOnly={readOnly}
                className="report-input"
                style={{ width: '100%', padding: 0, fontWeight: readOnly ? 'bold' : 'normal', color: readOnly ? '#595959' : 'inherit' }}
                controls={false}
            />
        );
    };

    const columns: any = [
        {
            title: '№', dataIndex: 'key', width: 40, align: 'center', fixed: 'left',
            render: (text: string, r: ReportData) => (
                <div style={{ backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {text}
                </div>
            )
        },
        {
            title: t('daily_reports.table.district') || 'Hududlar',
            dataIndex: 'district_name',
            width: 150,
            fixed: 'left',
            render: (text: string, r: ReportData) => (
                <span style={{ color: isSubmitted(r) ? '#389e0d' : '#cf1322', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            ),
            onCell: (record: ReportData) => ({
                style: {
                    backgroundColor: isSubmitted(record) ? '#f6ffed' : '#fff1f0',
                }
            })
        },
        { title: t('dashboard_page.total_reports') || 'Jami', width: 60, render: (_: any, r: any) => renderInput(r, 'total_cases', true) },
        {
            title: t('daily_reports.tabs.hepatitis.by_age'),
            children: [
                { title: t('daily_reports.tabs.common.age_under_1'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_under_1') },
                { title: t('daily_reports.tabs.common.age_1_3'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: t('daily_reports.tabs.common.age_4_6'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: t('daily_reports.tabs.common.age_7_14'), width: 65, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: t('daily_reports.tabs.common.age_15_19'), width: 65, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: t('daily_reports.tabs.common.age_20_plus'), width: 65, render: (_: any, r: any) => renderInput(r, 'age_20_plus') },
            ]
        },
        {
            title: t('daily_reports.tabs.hepatitis.by_occ'),
            children: [
                { title: t('daily_reports.tabs.hepatitis.unorganized_u1'), width: 100, render: (_: any, r: any) => renderInput(r, 'occ_unorganized') },
                { title: t('daily_reports.tabs.hepatitis.unorganized_1_6'), width: 100, render: (_: any, r: any) => renderInput(r, 'occ_unorganized_1_6') },
                { title: t('daily_reports.tabs.hepatitis.kindergarten_1_6'), width: 100, render: (_: any, r: any) => renderInput(r, 'occ_organized_1_6') },
                { title: t('daily_reports.tabs.hepatitis.unorganized_school'), width: 110, render: (_: any, r: any) => renderInput(r, 'occ_unorganized_school_age') },
                { title: t('daily_reports.tabs.hepatitis.students'), width: 100, render: (_: any, r: any) => renderInput(r, 'occ_students') },
                { title: t('daily_reports.tabs.hepatitis.college_students'), width: 100, render: (_: any, r: any) => renderInput(r, 'occ_college_students') },
                { title: t('daily_reports.tabs.hepatitis.workers'), width: 100, render: (_: any, r: any) => renderInput(r, 'occ_workers') },
            ]
        },
        {
            title: t('daily_reports.tabs.hepatitis.factors_title'),
            children: [
                { title: t('daily_reports.tabs.hepatitis.water'), width: 80, render: (_: any, r: any) => renderInput(r, 'factor_water') },
                { title: t('daily_reports.tabs.hepatitis.food'), width: 80, render: (_: any, r: any) => renderInput(r, 'factor_food') },
                { title: t('daily_reports.tabs.hepatitis.contact'), width: 85, render: (_: any, r: any) => renderInput(r, 'factor_contact') },
            ]
        },
        {
            title: t('daily_reports.tabs.hepatitis.lab_title'),
            children: [
                { title: t('export_page.table_headers.total') || 'Jami', width: 50, render: (_: any, r: any) => renderInput(r, 'lab_samples') },
                { title: t('daily_reports.tabs.hepatitis.positive'), width: 55, render: (_: any, r: any) => renderInput(r, 'lab_positive') },
            ]
        },
        { title: t('daily_reports.tabs.hepatitis.disinfection'), dataIndex: 'disinfection_done', width: 80, render: (_: any, r: any) => renderInput(r, 'disinfection_done') },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 140,
            fixed: 'right',
            render: (_: any, r: ReportData) => (
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Badge
                        status={r.status === 'APPROVED' ? 'success' : r.status === 'VERIFIED' ? 'processing' : r.status === 'REJECTED' ? 'error' : r.status === 'SUBMITTED' ? 'warning' : 'default'}
                        text={r.status ? t(`dashboard_page.statuses.${r.status.toLowerCase()}`, { defaultValue: r.status }) : t('dashboard_page.statuses.draft', { defaultValue: 'DRAFT' })}
                    />
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

    const calculateTotal = (field: keyof ReportData) => data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

    // Mobile check
    const isMobile = window.innerWidth <= 768;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ReportData | null>(null);
    const [form] = Form.useForm();

    const handleEditClick = (record: ReportData) => {
        setEditingItem(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                Object.keys(values).forEach(key => {
                    onChange(values[key], editingItem.key, key as keyof ReportData);
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
                    label: 'Umumiy',
                    children: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <Form.Item name="total_cases" label="Jami bemorlar">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </div>
                    )
                },
                {
                    key: '2',
                    label: 'Yosh',
                    children: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <Form.Item name="age_under_1" label="1 yoshgacha">
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
                            <Form.Item name="age_20_plus" label="20+ yosh">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </div>
                    )
                },
                {
                    key: '3',
                    label: 'Aholi',
                    children: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <Form.Item name="occ_unorganized" label="Uyushmagan (1 yosh)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="occ_unorganized_1_6" label="Uyushmagan (1-6)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="occ_organized_1_6" label="Bog'cha (1-6)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="occ_unorganized_school_age" label="Maktab yoshi (Uyushmagan)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="occ_students" label="O'quvchilar">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="occ_college_students" label="Talabalar">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="occ_workers" label="Ishchilar">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </div>
                    )
                },
                {
                    key: '4',
                    label: 'Omillar',
                    children: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <Form.Item name="factor_water" label="Suv">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="factor_food" label="Oziq-ovqat">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="factor_contact" label="Muloqot">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </div>
                    )
                },
                {
                    key: '5',
                    label: 'Lab/Dez',
                    children: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <Form.Item name="lab_samples" label="Lab. namunalar">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="lab_positive" label="Lab. musbat">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="disinfection_done" label="Dezinfeksiya">
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
                                    <div style={{ fontSize: '12px', color: '#1890ff' }}>Bemorlar</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.total_cases}</div>
                                </div>
                                <div style={{ background: '#fff7e6', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#fa8c16' }}>14 yoshgacha</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.age_7_14}</div>
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
            scroll={{ x: 1800, y: 550 }}
            className="premium-table"
            summary={() => (
                <Table.Summary fixed>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                        <Table.Summary.Cell index={0} />
                        <Table.Summary.Cell index={1}>{t('dashboard_page.total_reports') || 'Jami'}</Table.Summary.Cell>
                        {columns.slice(2).flatMap((c: any) => c.children ? c.children : [c]).map((col: any, idx: number) => (
                            <Table.Summary.Cell key={idx} index={idx + 2} align="center">
                                {calculateTotal(col.dataIndex || (col.render ? 'total_cases' : 'total_cases') as any)}
                            </Table.Summary.Cell>
                        ))}
                    </Table.Summary.Row>
                </Table.Summary>
            )}
        />
    );
};

export default HepatitisTab;


