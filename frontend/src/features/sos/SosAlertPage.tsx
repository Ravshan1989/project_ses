import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Card, Space, Typography, message, Modal, Form, Radio, Input } from 'antd';
import { BellOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { sosService } from '../../services/sos.service';

const { Title, Text } = Typography;

const SosAlertPage: React.FC = () => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [diseases, setDiseases] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const userRole = localStorage.getItem('user_role');
    const isAdmin = userRole === 'ADMIN';

    useEffect(() => {
        fetchData();
        if (isAdmin) fetchDiseases();
    }, [isAdmin]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await sosService.getAlerts();
            setAlerts(data);
        } catch (error) {
            message.error('SOS xabarlarni yuklashda xatolik!');
        } finally {
            setLoading(false);
        }
    };

    const fetchDiseases = async () => {
        try {
            const data = await sosService.getDiseases();
            setDiseases(data);
        } catch (error) {
            console.error('Predefined diseases fetch error');
        }
    };

    const handleMarkReviewed = async (id: string) => {
        try {
            await sosService.markAsReviewed(id);
            message.success('Holat "Ko\'rib chiqildi" deb belgilandi.');
            fetchData();
        } catch (error) {
            message.error('Xatolik yuz berdi.');
        }
    };

    const handleAddDisease = async () => {
        try {
            const values = await form.validateFields();
            await sosService.createDisease(values);
            message.success('Kasallik ro\'yxatga qo\'shildi.');
            form.resetFields();
            setIsModalOpen(false);
            fetchDiseases();
        } catch (error) {
            message.error('Xatolik saqlashda.');
        }
    };

    const handleDeleteDisease = async (id: string) => {
        Modal.confirm({
            title: 'Haqiqatan ham o\'chirmoqchimisiz?',
            onOk: async () => {
                await sosService.deleteDisease(id);
                message.success('O\'chirildi.');
                fetchDiseases();
            }
        });
    };

    const columns: any[] = [
        {
            title: 'Sana/Vaqt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => new Date(text).toLocaleString('uz-UZ'),
        },
        {
            title: 'Tuman/Shahar',
            dataIndex: ['organization', 'name'],
            key: 'organization',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Kasallik',
            dataIndex: 'diseaseName',
            key: 'diseaseName',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Holati',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'CONFIRMED' ? 'error' : 'warning'}>
                    {status === 'CONFIRMED' ? 'ANIQLANGAN' : 'GUMON'}
                </Tag>
            ),
        },
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (id: string) => <Text code style={{ fontSize: '10px' }}>{id.substring(0, 8)}</Text>,
        },
        {
            title: 'Ko\'rib chiqish',
            dataIndex: 'reviewStatus',
            key: 'reviewStatus',
            render: (status: string, record: any) => (
                status === 'REVIEWED' ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Ko'rib chiqildi</Tag>
                ) : (
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => handleMarkReviewed(record.id)}
                        disabled={isAdmin === false && localStorage.getItem('user_role') !== 'REGION_HEAD'}
                    >
                        Tasdiqlash
                    </Button>
                )
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title={<Title level={4}><BellOutlined /> SOS Xabarlar Monitoringi</Title>}>
                <Table
                    dataSource={alerts}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    expandable={{
                        expandedRowRender: (record: any) => <p style={{ margin: 0 }}><b>Izoh:</b> {record.comment || 'Izoh yo\'q'}</p>,
                    }}
                />
            </Card>

            {isAdmin && (
                <Card
                    title={<Title level={4}><PlusOutlined /> SOS Kasalliklar Ro'yxati (Admin)</Title>}
                    extra={<Button type="primary" onClick={() => setIsModalOpen(true)}>Yangi qo'shish</Button>}
                >
                    <Table
                        dataSource={diseases}
                        rowKey="id"
                        columns={[
                            { title: 'Nomi', dataIndex: 'name', key: 'name' },
                            { title: 'Toifa', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === 'CONFIRMED' ? 'red' : 'orange'}>{t === 'CONFIRMED' ? 'Aniqlangan' : 'Gumon'}</Tag> },
                            {
                                title: 'Amallar',
                                key: 'actions',
                                render: (_: any, record: any) => (
                                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteDisease(record.id)} />
                                )
                            }
                        ]}
                        pagination={{ pageSize: 5 }}
                    />
                </Card>
            )}

            <Modal
                title="Yangi SOS kasalligini qo'shish"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleAddDisease}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Kasallik nomi" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="Toifa" rules={[{ required: true }]}>
                        <Radio.Group>
                            <Radio value="CONFIRMED">Aniqlangan</Radio>
                            <Radio value="SUSPECTED">Gumon qilinadigan</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
};

export default SosAlertPage;
