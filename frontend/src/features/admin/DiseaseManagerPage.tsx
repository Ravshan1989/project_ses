import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Checkbox, message, Typography, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import { diseasesApi } from '../../services/api';

const { Text } = Typography;

interface Disease {
    id: string;
    code: string;
    name: string;
    reportFrequency: ('DAILY' | 'MONTHLY')[];
    isActive: boolean;
}

const DiseaseManagerPage: React.FC = () => {
    const { t } = useTranslation();
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form] = Form.useForm();

    const fetchDiseases = async () => {
        setLoading(true);
        try {
            const response = await diseasesApi.getAll();
            setDiseases(response.data);
        } catch (error) {
            console.error('Failed to fetch diseases:', error);
            message.error("Kasalliklar ro'yxatini yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiseases();
    }, []);

    const columns: ColumnsType<Disease> = [
        {
            title: 'Kod',
            dataIndex: 'code',
            key: 'code',
            width: 80,
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Kasallik Nomi',
            key: 'name',
            render: (_, record) => <Text strong>{t(`diseases.${record.code}`, { defaultValue: record.name })}</Text>
        },
        {
            title: 'Hisobot Turi',
            dataIndex: 'reportFrequency',
            key: 'frequency',
            render: (frequencies: string[]) => (
                <Space>
                    {frequencies.includes('DAILY') && <Tag color="orange">Kunlik</Tag>}
                    {frequencies.includes('MONTHLY') && <Tag color="green">Oylik</Tag>}
                </Space>
            )
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        size="small"
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            )
        }
    ];

    const handleEdit = (record: Disease) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Rostdan ham o\'chirmoqchimisiz?')) {
            diseasesApi.delete(id)
                .then(() => {
                    message.success('O\'chirildi');
                    fetchDiseases();
                })
                .catch(() => message.error("O'chirishda xatolik"));
        }
    };

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then(values => {
            if (editingId) {
                // Edit
                diseasesApi.update(editingId, values)
                    .then(() => {
                        message.success('Yangilandi');
                        setIsModalOpen(false);
                        fetchDiseases();
                    })
                    .catch(() => message.error("Yangilashda xatolik"));
            } else {
                // Add
                diseasesApi.create(values)
                    .then(() => {
                        message.success('Qo\'shildi');
                        setIsModalOpen(false);
                        fetchDiseases();
                    })
                    .catch(() => message.error("Qo'shishda xatolik"));
            }
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    // --- PREMIUM UI UPDATE ---
    const { Title } = Typography;

    const glassStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.05)',
        padding: '32px'
    };

    const headerStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)',
        padding: '30px 40px',
        borderRadius: '24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(255, 81, 47, 0.2)'
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: '#f5f7fa' }}>
            <style>{`
                .disease-table .ant-table { background: transparent !important; }
                .disease-table .ant-table-thead > tr > th {
                    background: rgba(255, 255, 255, 0.5) !important;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 12px;
                }
                .action-pill {
                    border-radius: 12px;
                    height: 42px;
                    font-weight: 600;
                    border: none !important;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .add-disease-btn {
                    background: #fff !important;
                    color: #FF512F !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .add-disease-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                }
            `}</style>

            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '18px' }}>
                        <SettingOutlined style={{ fontSize: '32px', color: '#fff' }} />
                    </div>
                    <div>
                        <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
                            Kasalliklar Mas'lumotnomasi
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>
                            Tizimdagi kasalliklar ro'yxati va ularning hisobot parametrlarini sozlash
                        </Text>
                    </div>
                </div>
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    className="action-pill add-disease-btn"
                >
                    Yangi Qo'shish
                </Button>
            </div>

            <div style={glassStyle}>
                <Table
                    columns={columns}
                    dataSource={diseases}
                    rowKey="id"
                    loading={loading}
                    className="disease-table"
                    pagination={{
                        pageSize: 50,
                        pageSizeOptions: ['50', '100', '200', '500'],
                        showSizeChanger: true,
                    }}
                />
            </div>

            <Modal
                title={editingId ? "Kasallikni tahrirlash" : "Yangi kasallik qo'shish"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                okText="Saqlash"
                cancelText="Bekor qilish"
                centered
                style={{ borderRadius: '20px' }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ reportFrequency: ['MONTHLY'] }}
                    style={{ paddingTop: '10px' }}
                >
                    <Form.Item
                        name="name"
                        label="Kasallik Nomi"
                        rules={[{ required: true, message: 'Nomini kiriting' }]}
                    >
                        <Input size="large" style={{ borderRadius: '10px' }} placeholder="Masalan: Qizamiq" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Qator Kodi / MKB-10"
                        rules={[{ required: true, message: 'Kodini kiriting' }]}
                    >
                        <Input size="large" style={{ borderRadius: '10px' }} placeholder="Masalan: 101 yoki A01" />
                    </Form.Item>

                    <Form.Item
                        name="reportFrequency"
                        label="Hisobot turlari"
                        rules={[{ required: true, message: 'Kamida bittasini tanlang' }]}
                    >
                        <Checkbox.Group>
                            <Space direction="vertical">
                                <Checkbox value="DAILY">Kunlik hisobotga qo'shish</Checkbox>
                                <Checkbox value="MONTHLY">Oylik hisobotga (Shakl 1) qo'shish</Checkbox>
                            </Space>
                        </Checkbox.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );

    /* --- ESKI DIZAYN (O'zgarmas Qoidalar asosida saqlab qolindi) ---
    return (
        <div style={{ padding: '24px 0', maxWidth: 1000, margin: '0 auto' }}>
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SettingOutlined /> Mas'lumotnoma: Kasalliklar Ro'yxati
                    </div>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Yangi qo'shish
                    </Button>
                }
                bordered={false}
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
                <Table
                    columns={columns}
                    dataSource={diseases}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 50,
                        pageSizeOptions: ['50', '100', '200', '500'],
                        showSizeChanger: true,
                        locale: { items_per_page: '' }
                    }}
                />
            </Card>

            <Modal
                title={editingId ? "Kasallikni tahrirlash" : "Yangi kasallik qo'shish"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                okText="Saqlash"
                cancelText="Bekor qilish"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ reportFrequency: ['MONTHLY'] }}
                >
                    <Form.Item
                        name="name"
                        label="Kasallik Nomi"
                        rules={[{ required: true, message: 'Nomini kiriting' }]}
                    >
                        <Input placeholder="Masalan: Qizamiq" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Qator Kodi / MKB-10"
                        rules={[{ required: true, message: 'Kodini kiriting' }]}
                    >
                        <Input placeholder="Masalan: 101 yoki A01" />
                    </Form.Item>

                    <Form.Item
                        name="reportFrequency"
                        label="Hisobot turlari"
                        rules={[{ required: true, message: 'Kamida bittasini tanlang' }]}
                    >
                        <Checkbox.Group>
                            <Space direction="vertical">
                                <Checkbox value="DAILY">Kunlik hisobotga qo'shish</Checkbox>
                                <Checkbox value="MONTHLY">Oylik hisobotga (Shakl 1) qo'shish</Checkbox>
                            </Space>
                        </Checkbox.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
    */
};

export default DiseaseManagerPage;
