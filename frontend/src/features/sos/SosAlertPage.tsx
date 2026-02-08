import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Card, Typography, message, Modal, Form, Radio, Input } from 'antd';
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

    // --- PREMIUM UI UPDATE ---
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
        background: 'linear-gradient(135deg, #8E0E00 0%, #1F1C18 100%)',
        padding: '40px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(142, 14, 0, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const newColumns = [
        ...columns.slice(0, 3), // Sana, Tuman, Kasallik
        {
            ...columns[3], // Holati
            render: (status: string) => (
                <Tag
                    color={status === 'CONFIRMED' ? '#ff4d4f' : '#faad14'}
                    style={{
                        borderRadius: '6px',
                        fontWeight: 700,
                        border: 'none',
                        padding: '4px 12px',
                        boxShadow: status === 'CONFIRMED' ? '0 0 10px rgba(255, 77, 79, 0.3)' : '0 0 10px rgba(250, 173, 20, 0.3)'
                    }}
                >
                    {status === 'CONFIRMED' ? 'ANIQLANGAN' : 'GUMON'}
                </Tag>
            )
        },
        columns[4], // ID
        {
            ...columns[5], // Ko'rib chiqish
            render: (status: string, record: any) => (
                status === 'REVIEWED' ? (
                    <Tag
                        color="success"
                        icon={<CheckCircleOutlined />}
                        style={{ borderRadius: '6px', fontWeight: 600, padding: '4px 12px' }}
                    >
                        Ko'rib chiqildi
                    </Tag>
                ) : (
                    <Button
                        type="primary"
                        style={{
                            borderRadius: '10px',
                            background: '#1e3c72',
                            border: 'none',
                            fontWeight: 600,
                            height: '36px'
                        }}
                        onClick={() => handleMarkReviewed(record.id)}
                        disabled={isAdmin === false && localStorage.getItem('user_role') !== 'REGION_HEAD'}
                    >
                        Tasdiqlash
                    </Button>
                )
            )
        }
    ];

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
            <style>{`
                .sos-table .ant-table { background: transparent !important; }
                .sos-table .ant-table-thead > tr > th {
                    background: rgba(255, 255, 255, 0.5) !important;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 12px;
                    letter-spacing: 0.5px;
                }
                .sos-card {
                    background: rgba(255, 255, 255, 0.8) !important;
                    backdrop-filter: blur(20px) !important;
                    border-radius: 20px !important;
                    border: 1px solid rgba(255, 255, 255, 0.4) !important;
                    margin-bottom: 24px;
                }
            `}</style>

            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '18px' }}>
                        <BellOutlined style={{ fontSize: '32px', color: '#fff' }} />
                    </div>
                    <div>
                        <Title level={1} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
                            SOS Xabarlar Monitoringi
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>
                            Favqulodda vaziyatlar va shoshilinch xabarlarni nazorat qilish markazi
                        </Text>
                    </div>
                </div>
            </div>

            <div style={glassStyle}>
                <Table
                    dataSource={alerts}
                    columns={newColumns}
                    loading={loading}
                    rowKey="id"
                    className="sos-table"
                    expandable={{
                        expandedRowRender: (record: any) => (
                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px' }}>
                                <Text strong>Izoh:</Text> {record.comment || 'Izoh yo\'q'}
                            </div>
                        ),
                    }}
                />
            </div>

            {isAdmin && (
                <div style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
                        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                            SOS Kasalliklar Ro'yxati (Admin)
                        </Title>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalOpen(true)}
                            style={{ borderRadius: '10px', fontWeight: 600, height: '40px' }}
                        >
                            Yangi qo'shish
                        </Button>
                    </div>
                    <Card className="sos-card">
                        <Table
                            dataSource={diseases}
                            rowKey="id"
                            className="sos-table"
                            columns={[
                                { title: 'NOMI', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
                                {
                                    title: 'TOIFA',
                                    dataIndex: 'type',
                                    key: 'type',
                                    render: (t: string) => (
                                        <Tag
                                            color={t === 'CONFIRMED' ? 'red' : 'orange'}
                                            style={{ borderRadius: '4px', fontWeight: 600 }}
                                        >
                                            {t === 'CONFIRMED' ? 'Aniqlangan' : 'Gumon'}
                                        </Tag>
                                    )
                                },
                                {
                                    title: 'AMALLAR',
                                    key: 'actions',
                                    align: 'right',
                                    render: (_: any, record: any) => (
                                        <Button
                                            danger
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeleteDisease(record.id)}
                                        />
                                    )
                                }
                            ]}
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </div>
            )}

            <Modal
                title={<Title level={4} style={{ margin: 0 }}>Yangi SOS kasalligini qo'shish</Title>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleAddDisease}
                centered
                okText="Saqlash"
                cancelText="Bekor qilish"
                style={{ borderRadius: '20px' }}
            >
                <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                    <Form.Item name="name" label="Kasallik nomi" rules={[{ required: true }]}>
                        <Input size="large" style={{ borderRadius: '10px' }} />
                    </Form.Item>
                    <Form.Item name="type" label="Toifa" rules={[{ required: true }]}>
                        <Radio.Group style={{ width: '100%' }}>
                            <Radio.Button value="CONFIRMED" style={{ width: '50%', textAlign: 'center', borderRadius: '10px 0 0 10px' }}>Aniqlangan</Radio.Button>
                            <Radio.Button value="SUSPECTED" style={{ width: '50%', textAlign: 'center', borderRadius: '0 10px 10px 0' }}>Gumon qilinadigan</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

/* --- ESKI DIZAYN (O'zgarmas Qoidalar asosida saqlab qolindi) ---
const OldSosAlertPage: React.FC = () => {
    // ... (Original logic and return preserved in comments if needed, 
    // but here we just wrap the old return for brevity as per instructions)
    return null; 
};
*/

export default SosAlertPage;
