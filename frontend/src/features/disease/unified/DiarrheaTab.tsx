import React, { useState } from 'react';
import { Table, InputNumber, Space, Button, Badge, Modal, Form, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
// 

import EditCell from '../../../components/common/EditCell';

interface DiarrheaReportData {
    id?: string;
    key: string;
    organizationId: string;
    district: string;
    status?: string;
    verificationToken?: string;
    total_2025: number;
    total_2026: number;
    actively_found: number;
    hospitalized: number;
    illness_days_1_2: number;
    age_under_1: number;
    age_1_3: number;
    age_4_6: number;
    age_7_14: number;
    age_15_19: number;
    age_20_plus: number;
    nursery_org: number;
    nursery_unorg: number;
    kindergarten_org: number;
    kindergarten_unorg: number;
    students: number;
    higher_students: number;
    adults: number;
    open_water_samples: number;
    open_water_isolated: number;
    tap_water_samples: number;
    tap_water_isolated: number;
    is_submitted?: boolean;
}

interface DiarrheaTabProps {
    data: DiarrheaReportData[];
    loading: boolean;
    userRole: string;
    onChange: (value: number, key: string, field: keyof DiarrheaReportData) => void;
    onVerify: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onSubmit: (id: string) => void;
}

const DiarrheaTab: React.FC<DiarrheaTabProps> = ({ data, loading, userRole, onChange, onVerify, onApprove, onReject, onSubmit }) => {
    const { t } = useTranslation();

    const isAdmin = ['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(userRole);
    const isMudir = ['DEPARTMENT_HEAD', 'LAB_HEAD', 'DISTRICT_HEAD'].includes(userRole);
    const isSpecialist = ['STAFF', 'DISTRICT_SPECIALIST', 'DISTRICT_OPERATOR'].includes(userRole);

    // Mobile check
    const isMobile = window.innerWidth <= 768;

    const isSubmitted = (row: DiarrheaReportData) => !!row.is_submitted || row.status !== 'DRAFT';

    const canEdit = (record: DiarrheaReportData) => {
        if (record.status === 'APPROVED' || record.status === 'VERIFIED') return false;
        if (isSpecialist) return record.status === 'DRAFT' || record.status === 'REJECTED' || !record.status;
        if (isMudir) return record.status === 'SUBMITTED';
        return isAdmin;
    };

    const renderInput = (record: DiarrheaReportData, field: keyof DiarrheaReportData, rowIdx: number, colIdx: number) => {
        return (
            <EditCell
                value={record[field] as number}
                onChange={(val) => onChange(val, record.key, field)}
                rowIdx={rowIdx}
                colIdx={colIdx}
                disabled={!canEdit(record)}
            />
        );
    };

    const columns: any = [
        {
            title: '№',
            dataIndex: 'no',
            width: 50,
            fixed: 'left',
            render: (_: any, r: DiarrheaReportData, index: number) => (
                <div style={{ backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {index + 1}
                </div>
            ),
        },
        {
            title: t('daily_reports.table.district'),
            dataIndex: 'district',
            width: 150,
            fixed: 'left',
            render: (text: string, r: DiarrheaReportData) => (
                <span style={{ color: isSubmitted(r) ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            ),
        },
        {
            title: t('daily_reports.tabs.diarrhea.total_patients'),
            children: [
                { title: '2025', width: 70, render: (_: any, r: any, ridx: number) => renderInput(r, 'total_2025', ridx, 2) },
                { title: '2026', width: 70, render: (_: any, r: any, ridx: number) => renderInput(r, 'total_2026', ridx, 3) },
            ]
        },
        { title: t('daily_reports.tabs.diarrhea.actively_found'), width: 100, render: (_: any, r: any, ridx: number) => renderInput(r, 'actively_found', ridx, 4) },
        { title: t('daily_reports.tabs.diarrhea.hospitalized'), width: 110, render: (_: any, r: any, ridx: number) => renderInput(r, 'hospitalized', ridx, 5) },
        { title: t('daily_reports.tabs.diarrhea.illness_days'), width: 90, render: (_: any, r: any, ridx: number) => renderInput(r, 'illness_days_1_2', ridx, 6) },
        {
            title: t('daily_reports.tabs.diarrhea.by_age'),
            children: [
                { title: t('daily_reports.tabs.common.age_under_1'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_under_1', ridx, 7) },
                { title: t('daily_reports.tabs.common.age_1_3'), width: 70, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_1_3', ridx, 8) },
                { title: t('daily_reports.tabs.common.age_4_6'), width: 70, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_4_6', ridx, 9) },
                { title: t('daily_reports.tabs.common.age_7_14'), width: 75, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_7_14', ridx, 10) },
                { title: t('daily_reports.tabs.common.age_15_19'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_15_19', ridx, 11) },
                { title: t('daily_reports.tabs.common.age_20_plus'), width: 75, render: (_: any, r: any, ridx: number) => renderInput(r, 'age_20_plus', ridx, 12) },
            ]
        },
        {
            title: t('daily_reports.tabs.diarrhea.by_occ'),
            children: [
                { title: t('daily_reports.tabs.diarrhea.occ_nursery_org'), width: 100, render: (_: any, r: any, ridx: number) => renderInput(r, 'nursery_org', ridx, 13) },
                { title: t('daily_reports.tabs.diarrhea.occ_nursery_unorg'), width: 110, render: (_: any, r: any, ridx: number) => renderInput(r, 'nursery_unorg', ridx, 14) },
                { title: t('daily_reports.tabs.diarrhea.occ_kindergarten_org'), width: 110, render: (_: any, r: any, ridx: number) => renderInput(r, 'kindergarten_org', ridx, 15) },
                { title: t('daily_reports.tabs.diarrhea.occ_kindergarten_unorg'), width: 120, render: (_: any, r: any, ridx: number) => renderInput(r, 'kindergarten_unorg', ridx, 16) },
                { title: t('daily_reports.tabs.diarrhea.occ_students'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'students', ridx, 17) },
                { title: t('daily_reports.tabs.diarrhea.occ_higher_students'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'higher_students', ridx, 18) },
                { title: t('daily_reports.tabs.diarrhea.occ_adults'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'adults', ridx, 19) },
            ]
        },
        {
            title: t('daily_reports.tabs.diarrhea.water_samples_title'),
            children: [
                {
                    title: t('daily_reports.tabs.diarrhea.open_water'),
                    children: [
                        { title: t('daily_reports.tabs.diarrhea.samples'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'open_water_samples', ridx, 20) },
                        { title: t('daily_reports.tabs.diarrhea.isolated'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'open_water_isolated', ridx, 21) },
                    ]
                },
                {
                    title: t('daily_reports.tabs.diarrhea.tap_water'),
                    children: [
                        { title: t('daily_reports.tabs.diarrhea.samples'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'tap_water_samples', ridx, 22) },
                        { title: t('daily_reports.tabs.diarrhea.isolated'), width: 80, render: (_: any, r: any, ridx: number) => renderInput(r, 'tap_water_isolated', ridx, 23) },
                    ]
                }
            ]
        },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 140,
            fixed: 'right',
            render: (_: any, record: DiarrheaReportData) => (
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Badge
                        status={record.status === 'APPROVED' ? 'success' : record.status === 'VERIFIED' ? 'processing' : record.status === 'REJECTED' ? 'error' : record.status === 'SUBMITTED' ? 'warning' : 'default'}
                        text={record.status ? t(`dashboard_page.statuses.${record.status.toLowerCase()}`, { defaultValue: record.status }) : t('dashboard_page.statuses.draft', { defaultValue: 'DRAFT' })}
                    />
                    {record.id && (
                        <Space wrap>
                            {isSpecialist && (record.status === 'DRAFT' || record.status === 'REJECTED' || !record.status) && (
                                <Button size="small" type="primary" onClick={() => onSubmit(record.id!)} style={{ fontSize: '10px', height: '22px' }}>
                                    {t('common.submit') || 'Yuborish'}
                                </Button>
                            )}
                            {isMudir && record.status === 'SUBMITTED' && (
                                <>
                                    <Button size="small" type="primary" onClick={() => onVerify(record.id!)} style={{ fontSize: '10px', height: '22px', background: '#52c41a' }}>
                                        {t('common.verify') || 'Tekshirish'}
                                    </Button>
                                    <Button size="small" danger onClick={() => onReject(record.id!)} style={{ fontSize: '10px', height: '22px' }}>
                                        {t('common.reject') || 'Rad etish'}
                                    </Button>
                                </>
                            )}
                            {isAdmin && record.status === 'VERIFIED' && (
                                <>
                                    <Button size="small" type="primary" onClick={() => onApprove(record.id!)} style={{ fontSize: '10px', height: '22px', background: '#722ed1' }}>
                                        {t('common.approve') || 'Tasdiqlash'}
                                    </Button>
                                    <Button size="small" danger onClick={() => onReject(record.id!)} style={{ fontSize: '10px', height: '22px' }}>
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

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DiarrheaReportData | null>(null);
    const [form] = Form.useForm();

    const handleEditClick = (record: DiarrheaReportData) => {
        setEditingItem(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                // Update via onChange prop for each field
                Object.keys(values).forEach(key => {
                    onChange(values[key], editingItem.key, key as keyof DiarrheaReportData);
                });

                // Note: We cannot save immediately here because we don't have the date.
                // The user must click the main Save button.
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
                            <Form.Item name="total_2025" label="Jami 2025">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="total_2026" label="Jami 2026">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="actively_found" label="Faol topilgan">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="hospitalized" label="Shifoxonada">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="illness_days_1_2" label="1-2 kun murojaat">
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
                            <Form.Item name="nursery_org" label="Bog'cha (Uyush)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="nursery_unorg" label="Bog'cha (Uyushmagan)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="kindergarten_org" label="Maktab (Uyush)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="kindergarten_unorg" label="Maktab (Uyushmagan)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="students" label="Talabalar">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="adults" label="Kattalar">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </div>
                    )
                },
                {
                    key: '4',
                    label: 'Suv',
                    children: (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <Form.Item name="open_water_samples" label="Ochiq suv (namuna)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="open_water_isolated" label="Ochiq suv (ajratma)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="tap_water_samples" label="Jo'mrak suv (namuna)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item name="tap_water_isolated" label="Jo'mrak suv (ajratma)">
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
                            <span style={{ fontSize: '16px', fontWeight: 700 }}>{t(`orgs.${item.district.toLowerCase()}`, { defaultValue: item.district })}</span>
                            <Badge status={item.status === 'APPROVED' ? 'success' : item.status === 'VERIFIED' ? 'processing' : 'default'} text={item.status} />
                        </div>

                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ background: '#e6f7ff', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#1890ff' }}>Jami (2025)</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.total_2025}</div>
                                </div>
                                <div style={{ background: '#fff7e6', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#fa8c16' }}>Faol topilgan</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.actively_found}</div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ background: '#f6ffed', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#52c41a' }}>Shifoxonada</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.hospitalized}</div>
                                </div>
                                <div style={{ background: '#fff0f6', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#eb2f96' }}>1-yoshgacha</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.age_under_1}</div>
                                </div>
                            </div>
                            <Button block type="primary" onClick={() => handleEditClick(item)}>
                                Tahrirlash
                            </Button>
                        </Space>
                    </div>
                ))}

                <Modal
                    title={`${editingItem ? t(`orgs.${editingItem.district.toLowerCase()}`, { defaultValue: editingItem.district }) : ''} - Tahrirlash`}
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
            pagination={false}
            scroll={{ x: 2200, y: 'calc(100vh - 400px)' }}
            size="small"
            bordered
            rowClassName={(record) => record.district.includes('jami') ? 'row-total' : ''}
        />
    );
};

export default DiarrheaTab;
