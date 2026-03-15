import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, DatePicker, Select, Input, Tag, Card, Row, Col, Statistic, Typography, Checkbox, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
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
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [form] = Form.useForm();
    const [closeForm] = Form.useForm();

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

    const columns = [
        { 
            title: 'Sana', 
            dataIndex: 'registration_date', 
            key: 'registration_date',
            render: (date: string, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text>{date}</Text>
                    {record.deadline_date && (
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                            Muddati: {record.deadline_date}
                        </Text>
                    )}
                </Space>
            )
        },
        { 
            title: 'Hudud', 
            dataIndex: ['organization', 'name'], 
            key: 'organization',
            render: (name: string) => <Tag color="orange">{name || 'Noma\'lum'}</Tag>
        },
        { title: 'F.I.O / Nom', dataIndex: 'applicant_name', key: 'applicant_name' },
        {
            title: 'Turi',
            dataIndex: 'applicant_type',
            key: 'applicant_type',
            render: (v: string) => v === 'PHYSICAL' ? <Tag color="blue">Jismoniy</Tag> : <Tag color="purple">Yuridik</Tag>
        },
        {
            title: 'Kanal',
            dataIndex: 'channel',
            key: 'channel',
            render: (v: string) => <Tag>{v}</Tag>
        },
        {
            title: 'Holat / Muddati',
            key: 'status_deadline',
            render: (record: any) => {
                const isClosed = record.closure_date;
                const isOverdue = record.is_overdue || (dayjs().isAfter(dayjs(record.deadline_date)) && !isClosed);
                
                let statusTag;
                if (isClosed) {
                    statusTag = <Tag color="success" icon={<CheckCircleOutlined />}>Yopilgan ({record.closure_date})</Tag>;
                } else if (isOverdue) {
                    statusTag = <Tag color="error" icon={<ClockCircleOutlined />}>Muddat o'tgan</Tag>;
                } else {
                    statusTag = <Tag color="warning" icon={<ClockCircleOutlined />}>Ko'rilmoqda</Tag>;
                }

                return (
                    <Space direction="vertical" size={2}>
                        {statusTag}
                        {record.consequence && record.consequence !== 'NONE' && <Tag color="red">Chora: {record.consequence}</Tag>}
                    </Space>
                );
            }
        },
        {
            title: 'Amallar',
            key: 'actions',
            render: (record: any) => !record.closure_date && (
                <Button 
                    type="link" 
                    icon={<CheckCircleOutlined />} 
                    onClick={() => {
                        setSelectedRecord(record);
                        setIsCloseModalVisible(true);
                    }}
                >
                    Yopish
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '20px 0' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card size="small" className="glass-card" title="Avtomatik Hisobot Ko'rsatkichlari (Jurnal asosida)">
                        <Row gutter={16}>
                            <Col span={4}>
                                <Statistic title="Jami Murojaatlar" value={autoReports?.records_count || 0} />
                            </Col>
                            <Col span={4}>
                                <Statistic title="Elektron" value={autoReports?.table1?.electronic_curr || 0} />
                            </Col>
                            <Col span={4}>
                                <Statistic title="Shikoyatlar" value={autoReports?.table5?.phys_shikoyat_curr + autoReports?.table5?.legal_shikoyat_curr || 0} />
                            </Col>
                            <Col span={4}>
                                <Statistic title="Ko'rilmoqda" value={autoReports?.table2?.being_considered || 0} />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4}>Murojaatlar Ro'yxati (Jurnal)</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Murojaat Qo'shish
                </Button>
            </div>

            <Table
                dataSource={records}
                columns={columns}
                loading={isLoading}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
            />

            {/* NEW APPEAL MODAL */}
            <Modal
                title="Yangi Murojaat Qo'shish"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={isCreating}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ registration_date: dayjs(), consequence: 'NONE' }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="registration_date" label="Qabul sanasi" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="deadline_date" label="Muddat (Deadline)">
                                <DatePicker style={{ width: '100%' }} placeholder="Standart 15 kun" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="applicant_name" label="Murojaatchi F.I.O / Nom" rules={[{ required: true }]}>
                                <Input placeholder="Eshmatov Toshmat..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="applicant_type" label="Murojaatchi turi" rules={[{ required: true }]}>
                                <Select options={[
                                    { label: 'Jismoniy shaxs', value: 'PHYSICAL' },
                                    { label: 'Yuridik shaxs', value: 'LEGAL' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="channel" label="Murojaat kanali" rules={[{ required: true }]}>
                                <Select options={[
                                    { label: 'Elektron', value: 'ELECTRONIC' },
                                    { label: 'Og\'zaki', value: 'ORAL' },
                                    { label: 'Yozma', value: 'WRITTEN' },
                                    { label: 'Virtual qabulxona', value: 'VIRTUAL_RECEPTION' },
                                    { label: 'Xalq qabulxonasi', value: 'PEOPLES_RECEPTION' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="responsible_user_id" label="Mas'ul xodim">
                                <Select 
                                    showSearch
                                    placeholder="Xodimni tanlang"
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
                            <Form.Item name="appeal_type" label="Murojaat mavzusi" rules={[{ required: true }]}>
                                <Select options={[
                                    { label: 'Ariza', value: 'ARIZA' },
                                    { label: 'Shikoyat', value: 'SHIKOYAT' },
                                    { label: 'Taklif', value: 'TAKLIF' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="recipient" label="Kimga (Table 1)" rules={[{ required: true }]}>
                                <Select options={[
                                    { label: isRegionalOrg ? 'Boshqarma boshlig\'i' : 'Bo\'lim boshlig\'i', value: 'head' },
                                    { label: isRegionalOrg ? 'Epid. muovini' : 'Epid. mudiri', value: 'deputy_epid' },
                                    { label: isRegionalOrg ? 'San. muovini' : 'San. mudiri', value: 'deputy_san' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="subject_key" label="Masala turi (Table 4)" rules={[{ required: true }]}>
                                <Select 
                                    showSearch
                                    placeholder="Masala turini tanlang"
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
                                <Checkbox>Takroriy</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="is_phone" valuePropName="checked">
                                <Checkbox>Ishonch telefoni</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="is_field_meeting" valuePropName="checked">
                                <Checkbox>Sayyor qabul</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="is_overdue" valuePropName="checked">
                                <Checkbox>Muddat buzilgan</Checkbox>
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
                title="Murojaatni Yopish"
                open={isCloseModalVisible}
                onCancel={() => setIsCloseModalVisible(false)}
                onOk={() => closeForm.submit()}
                width={400}
            >
                <Form form={closeForm} layout="vertical" onFinish={handleClose} initialValues={{ closure_date: dayjs(), status: 'SATISFIED', consequence: 'NONE' }}>
                    <Form.Item name="closure_date" label="Yopilgan sana" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="status" label="Natija (Holati)" rules={[{ required: true }]}>
                        <Select options={[
                            { label: 'Qanoatlantirildi', value: 'SATISFIED' },
                            { label: 'Tushuntirildi', value: 'EXPLAINED' },
                            { label: 'Rad etildi', value: 'REJECTED' },
                            { label: 'Tegishliligi bo\'yicha yuborildi', value: 'ROUTED' },
                        ]} />
                    </Form.Item>
                    <Form.Item name="consequence" label="Intizomiy chora (Table 7)">
                        <Select options={[
                            { label: 'Chora qo\'llanilmagan', value: 'NONE' },
                            { label: 'Jarima', value: 'FINE' },
                            { label: 'Hayfsan', value: 'REPRIMAND' },
                            { label: 'Lavozimdan ozod etish', value: 'DISMISSAL' },
                            { label: 'Ma\'muriy javobgarlik', value: 'ADMINISTRATIVE' },
                            { label: 'Jinoiy javobgarlik', value: 'CRIMINAL' },
                        ]} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MasterAppealsJournal;
