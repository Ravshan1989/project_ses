import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, DatePicker, Select, Input, Tag, Card, Row, Col, Statistic, Typography, Checkbox, Space, message } from 'antd';
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../../config';
import { APPEALS_SUBJECT_ROWS } from './AppealsConstants';

const { Title, Text } = Typography;

interface MasterAppealsJournalProps {
    month: string;
    orgId: string;
    records: any[];
    autoReports: any;
    isLoading: boolean;
    onCreate: (values: any) => void;
    isCreating: boolean;
    isRegionalOrg: boolean;
}

const MasterAppealsJournal: React.FC<MasterAppealsJournalProps> = ({
    month,
    orgId,
    records,
    autoReports,
    isLoading,
    onCreate,
    isCreating,
    isRegionalOrg
}) => {
    const { t } = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
    const [isExtendModalVisible, setIsExtendModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [form] = Form.useForm();
    const [closeForm] = Form.useForm();
    const [extendForm] = Form.useForm();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get(`${API_BASE_URL}/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data.filter((u: any) => u.organization?.id === orgId));
            } catch (error) {
                console.error('Users load error', error);
            }
        };
        if (isModalVisible) fetchUsers();
    }, [isModalVisible, orgId]);

    const handleCreate = (values: any) => {
        onCreate({
            ...values,
            organization_id: orgId,
            period_month: month,
            registration_date: values.registration_date.format('YYYY-MM-DD'),
            deadline_date: values.deadline_date ? values.deadline_date.format('YYYY-MM-DD') : dayjs(values.registration_date).add(15, 'day').format('YYYY-MM-DD'),
        });
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleClose = async (values: any) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`${API_BASE_URL}/appeals/records/${selectedRecord.id}/close`, {
                status: values.status,
                closureDate: values.closure_date.format('YYYY-MM-DD'),
                consequence: values.consequence
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Murojaat yopildi!');
            setIsCloseModalVisible(false);
            closeForm.resetFields();
            // Refresh logic - assuming parent handles it via react-query
            window.location.reload(); 
        } catch (error) {
            message.error('Xatolik yuz berdi');
        }
    };

    const handleExtend = async (values: any) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`${API_BASE_URL}/appeals/records/${selectedRecord.id}/extend`, {
                newDeadline: values.new_deadline.format('YYYY-MM-DD'),
                reason: values.reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Murojaat muddati uzaytirildi!');
            setIsExtendModalVisible(false);
            extendForm.resetFields();
            window.location.reload(); 
        } catch (error) {
            message.error('Xatolik yuz berdi');
        }
    };

    const columns = [
        {
            title: '№',
            key: 'index',
            width: 50,
            render: (text: any, record: any, index: number) => index + 1
        },
        { 
            title: t('appeals.journal.columns.date'), 
            dataIndex: 'registration_date', 
            key: 'registration_date',
            render: (date: string, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text>{date}</Text>
                    {record.deadline_date && (
                        <Text type={record.original_deadline_date ? "warning" : "secondary"} style={{ fontSize: '10px' }}>
                            {t('appeals.journal.columns.deadline')}: {record.deadline_date}
                        </Text>
                    )}
                    {record.original_deadline_date && (
                        <Text type="secondary" style={{ fontSize: '9px', textDecoration: 'line-through' }}>
                            {record.original_deadline_date}
                        </Text>
                    )}
                </Space>
            )
        },
        { 
            title: t('appeals.journal.columns.region'), 
            dataIndex: ['organization', 'name'], 
            key: 'organization',
            render: (name: string) => <Tag color="orange">{name || t('common.no_data')}</Tag>
        },
        { title: t('appeals.journal.columns.applicant'), dataIndex: 'applicant_name', key: 'applicant_name' },
        {
            title: t('appeals.journal.columns.type'),
            dataIndex: 'applicant_type',
            key: 'applicant_type',
            render: (v: string) => v === 'PHYSICAL' ? <Tag color="blue">{t('common.physical')}</Tag> : <Tag color="purple">{t('common.legal')}</Tag>
        },
        {
            title: t('appeals.journal.columns.channel'),
            dataIndex: 'channel',
            key: 'channel',
            render: (v: string) => <Tag>{v}</Tag>
        },
        {
            title: t('appeals.journal.columns.status'),
            key: 'status_deadline',
            render: (record: any) => {
                const isClosed = record.closure_date;
                const isOverdue = record.is_overdue || (dayjs().isAfter(dayjs(record.deadline_date)) && !isClosed);
                
                let statusTag;
                if (isClosed) {
                    statusTag = <Tag color="success" icon={<CheckCircleOutlined />}>{t('appeals.journal.statuses.closed')} ({record.closure_date})</Tag>;
                } else if (isOverdue) {
                    statusTag = <Tag color="error" icon={<ClockCircleOutlined />}>{t('appeals.journal.statuses.overdue')}</Tag>;
                } else {
                    statusTag = <Tag color="warning" icon={<ClockCircleOutlined />}>{t('appeals.journal.statuses.pending')}</Tag>;
                }

                return (
                    <Space direction="vertical" size={2}>
                        {statusTag}
                        {record.consequence && record.consequence !== 'NONE' && <Tag color="red">Chora: {record.consequence}</Tag>}
                        {record.extension_reason && (
                            <Text type="secondary" style={{ fontSize: '10px', fontStyle: 'italic' }}>
                                Uzaytirildi: {record.extension_reason}
                            </Text>
                        )}
                    </Space>
                );
            }
        },
        {
            title: t('appeals.journal.columns.actions'),
            key: 'actions',
            render: (record: any) => !record.closure_date && (
                <Space>
                    <Button 
                        type="link" 
                        size="small"
                        icon={<CheckCircleOutlined />} 
                        onClick={() => {
                            setSelectedRecord(record);
                            setIsCloseModalVisible(true);
                        }}
                    >
                        {t('appeals.table6.columns.pending')}
                    </Button>
                    <Button 
                        type="link" 
                        size="small"
                        style={{ color: '#fa8c16' }}
                        icon={<ClockCircleOutlined />} 
                        onClick={() => {
                            setSelectedRecord(record);
                            setIsExtendModalVisible(true);
                            extendForm.setFieldsValue({
                                new_deadline: dayjs(record.deadline_date).add(10, 'day')
                            });
                        }}
                    >
                        Muddatni uzaytirish
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '20px 0' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card size="small" className="glass-card" title={t('appeals.journal.auto_report_title')}>
                        <Row gutter={16}>
                            <Col span={4}>
                                <Statistic title={t('appeals.journal.fields.jami')} value={autoReports?.records_count || 0} />
                            </Col>
                            <Col span={4}>
                                <Statistic title={t('appeals.table2.columns.electronic')} value={autoReports?.table1?.electronic_curr || 0} />
                            </Col>
                            <Col span={4}>
                                <Statistic title={t('appeals.table5.columns.shikoyat')} value={(autoReports?.table5?.phys_shikoyat_curr || 0) + (autoReports?.table5?.legal_shikoyat_curr || 0)} />
                            </Col>
                            <Col span={4}>
                                <Statistic title={t('appeals.journal.statuses.pending')} value={autoReports?.table2?.being_considered || 0} />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4}>{t('appeals.journal.title')}</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    {t('appeals.journal.add_btn')}
                </Button>
            </div>

            <Table
                dataSource={records}
                columns={columns}
                loading={isLoading}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 30 }}
            />

            {/* NEW APPEAL MODAL */}
            <Modal
                title={t('appeals.journal.modal_add_title')}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={isCreating}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ registration_date: dayjs(), consequence: 'NONE' }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="registration_date" label={t('appeals.journal.fields.reg_date')} rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="deadline_date" label={t('appeals.journal.fields.deadline')}>
                                <DatePicker style={{ width: '100%' }} placeholder={t('appeals.journal.fields.deadline_placeholder')} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="applicant_name" label={t('appeals.journal.fields.applicant_name')} rules={[{ required: true }]}>
                                <Input placeholder="Eshmatov Toshmat..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="applicant_type" label={t('appeals.journal.fields.applicant_type')} rules={[{ required: true }]}>
                                <Select options={[
                                    { label: t('common.physical'), value: 'PHYSICAL' },
                                    { label: t('common.legal'), value: 'LEGAL' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="channel" label={t('appeals.journal.fields.channel')} rules={[{ required: true }]}>
                                <Select options={[
                                    { label: t('appeals.table2.columns.electronic'), value: 'ELECTRONIC' },
                                    { label: t('appeals.table2.columns.oral'), value: 'ORAL' },
                                    { label: t('appeals.table2.columns.written'), value: 'WRITTEN' },
                                    { label: t('appeals.table6.columns.virtual'), value: 'VIRTUAL_RECEPTION' },
                                    { label: t('appeals.table6.columns.people'), value: 'PEOPLES_RECEPTION' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="responsible_user_id" label={t('appeals.journal.fields.responsible')}>
                                <Select 
                                    showSearch
                                    placeholder={t('admin.organizations.select_org')} 
                                    optionFilterProp="children"
                                    options={users.map(u => ({
                                        label: `${u.lastName} ${u.firstName}`,
                                        value: u.id
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="appeal_type" label={t('appeals.journal.fields.appeal_type')} rules={[{ required: true }]}>
                                <Select options={[
                                    { label: t('appeals.table5.columns.ariza'), value: 'ARIZA' },
                                    { label: t('appeals.table5.columns.shikoyat'), value: 'SHIKOYAT' },
                                    { label: t('appeals.table5.columns.taklif'), value: 'TAKLIF' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="recipient" label={t('appeals.journal.fields.recipient')} rules={[{ required: true }]}>
                                <Select options={[
                                    { label: isRegionalOrg ? t('appeals.table1.rows.head_reg') : t('appeals.table1.rows.head'), value: 'head' },
                                    { label: isRegionalOrg ? t('appeals.table1.rows.deputy_epid_reg') : t('appeals.table1.rows.deputy_epid'), value: 'deputy_epid' },
                                    { label: isRegionalOrg ? t('appeals.table1.rows.deputy_san_reg') : t('appeals.table1.rows.deputy_san'), value: 'deputy_san' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="subject_key" label={t('appeals.journal.fields.subject')} rules={[{ required: true }]}>
                                <Select 
                                    showSearch
                                    placeholder={t('appeals.journal.fields.subject')}
                                    optionFilterProp="children"
                                    options={APPEALS_SUBJECT_ROWS.map(s => ({
                                        label: t(s.labelKey),
                                        value: s.key
                                    }))} 
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 0]}>
                        <Col span={6}>
                            <Form.Item name="is_repeated" valuePropName="checked">
                                <Checkbox>{t('appeals.journal.fields.is_repeated')}</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="is_phone" valuePropName="checked">
                                <Checkbox>{t('appeals.journal.fields.is_phone')}</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="is_field_meeting" valuePropName="checked">
                                <Checkbox>{t('appeals.journal.fields.is_field')}</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="is_overdue" valuePropName="checked">
                                <Checkbox>{t('appeals.journal.fields.is_overdue')}</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="summary" label="Qisqacha mazmuni">
                        <Input.TextArea rows={2} placeholder="Murojaat mazmuni..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* CLOSE APPEAL MODAL */}
            <Modal
                title={t('appeals.journal.modal_close_title')}
                open={isCloseModalVisible}
                onCancel={() => setIsCloseModalVisible(false)}
                onOk={() => closeForm.submit()}
                width={400}
            >
                <Form form={closeForm} layout="vertical" onFinish={handleClose} initialValues={{ closure_date: dayjs(), status: 'SATISFIED', consequence: 'NONE' }}>
                    <Form.Item name="closure_date" label={t('appeals.journal.statuses.closed')} rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="status" label={t('common.status')} rules={[{ required: true }]}>
                        <Select options={[
                            { label: t('appeals.table6.columns.satisfied'), value: 'SATISFIED' },
                            { label: t('appeals.table6.columns.explained'), value: 'EXPLAINED' },
                            { label: t('appeals.table6.columns.rejected'), value: 'REJECTED' },
                            { label: t('appeals.table6.columns.referral'), value: 'ROUTED' },
                        ]} />
                    </Form.Item>
                    <Form.Item name="consequence" label={t('appeals.table7.columns.action_type')}>
                        <Select options={[
                            { label: t('appeals.journal.consequences.none'), value: 'NONE' },
                            { label: t('appeals.journal.consequences.fine'), value: 'FINE' },
                            { label: t('appeals.journal.consequences.reprimand'), value: 'REPRIMAND' },
                            { label: t('appeals.journal.consequences.dismissal'), value: 'DISMISSAL' },
                            { label: t('appeals.journal.consequences.administrative'), value: 'ADMINISTRATIVE' },
                            { label: t('appeals.journal.consequences.criminal'), value: 'CRIMINAL' },
                        ]} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* EXTEND DEADLINE MODAL */}
            <Modal
                title="Muddatni uzaytirish"
                open={isExtendModalVisible}
                onCancel={() => setIsExtendModalVisible(false)}
                onOk={() => extendForm.submit()}
                width={400}
            >
                <Form form={extendForm} layout="vertical" onFinish={handleExtend}>
                    <Form.Item name="new_deadline" label="Yangi muddat" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="reason" label="Sababi" rules={[{ required: true }]}>
                        <Input.TextArea rows={3} placeholder="Masalan: Qo'shimcha o'rganish talab etiladi..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MasterAppealsJournal;
