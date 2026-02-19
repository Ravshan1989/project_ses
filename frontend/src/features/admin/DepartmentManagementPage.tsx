import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Transfer, Tag, Typography, Select, Popconfirm } from 'antd';
import { ClusterOutlined, PlusOutlined, SafetyCertificateOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { departmentsApi, permissionsApi } from '../../services/api';
// import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const DepartmentManagementPage: React.FC = () => {
    // const { t } = useTranslation();
    const [departments, setDepartments] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDeptModalVisible, setIsDeptModalVisible] = useState(false);
    const [isPermModalVisible, setIsPermModalVisible] = useState(false);
    const [selectedDept, setSelectedDept] = useState<any>(null);
    const [form] = Form.useForm();

    // UZ: Bo'limlarni yuklash
    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await departmentsApi.getAll();
            setDepartments(res.data);
        } catch (e) {
            message.error("Bo'limlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    // UZ: Barcha ruxsatlarni yuklash (Matrix uchun)
    const fetchPermissions = async () => {
        try {
            const res = await permissionsApi.getAll();
            setPermissions(res.data);
        } catch (e) {
            console.error("Failed to fetch permissions", e);
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchPermissions();
    }, []);

    const handleCreateOrUpdateDept = async (values: any) => {
        try {
            const request = selectedDept
                ? departmentsApi.update(selectedDept.id, values)
                : departmentsApi.create(values);

            await request;

            message.success(selectedDept ? "Bo'lim yangilandi" : "Yangi bo'lim yaratildi");
            setIsDeptModalVisible(false);
            setSelectedDept(null);
            form.resetFields();
            fetchDepartments();
        } catch (e: any) {
            console.error("Save error:", e);
            const errMsg = e.response?.data?.message || "Saqlashda xatolik yuz berdi";
            message.error(errMsg);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await departmentsApi.delete(id);
            message.success("Bo'lim o'chirildi");
            fetchDepartments();
        } catch (e) {
            console.error("Delete error:", e);
            message.error("O'chirishda xatolik yuz berdi");
        }
    };

    const handleSyncPermissions = async (targetKeys: any[]) => {
        if (!selectedDept) return;
        try {
            await departmentsApi.syncPermissions(selectedDept.id, targetKeys);
            message.success("Ruxsatlar muvaffaqiyatli saqlandi");
            setIsPermModalVisible(false);
            fetchDepartments();
        } catch (e) {
            message.error("Ruxsatlarni saqlashda xatolik");
        }
    };

    const columns = [
        { title: "Bo'lim nomi", dataIndex: 'name', key: 'name', render: (t: string) => <Text strong>{t}</Text> },
        {
            title: "Daraja",
            dataIndex: 'level',
            key: 'level',
            render: (lv: number) => {
                if (lv === 1) return <Tag color="gold">Respublika</Tag>;
                if (lv === 2) return <Tag color="blue">Viloyat</Tag>;
                return <Tag color="cyan">Tuman</Tag>;
            }
        },
        { title: "Tavsif", dataIndex: 'description', key: 'description' },
        {
            title: "Holati",
            dataIndex: 'isActive',
            key: 'isActive',
            render: (active: boolean) => active ? <Tag color="green">Faol</Tag> : <Tag color="red">Nofaol</Tag>
        },
        {
            title: "Ruxsatlar",
            key: 'perms',
            render: (_: any, record: any) => (
                <Space wrap>
                    {record.permissions?.map((p: any) => (
                        <Tag key={p.id} color="blue">{p.permission?.code}</Tag>
                    ))}
                    {(!record.permissions || record.permissions.length === 0) && <Text type="secondary">-</Text>}
                </Space>
            )
        },
        {
            title: "Amallar",
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => {
                        setSelectedDept(record);
                        form.setFieldsValue(record);
                        setIsDeptModalVisible(true);
                    }}>Tahrirlash</Button>
                    <Button icon={<SafetyCertificateOutlined />} type="primary" onClick={() => {
                        setSelectedDept(record);
                        setIsPermModalVisible(true);
                    }}>Ruxsatlar Berish</Button>
                    <Popconfirm
                        title="Bo'limni o'chirish"
                        description="Haqiqatan ham ushbu bo'limni o'chirmoqchimisiz? Unga biriktirilgan xodimlar bo'limsiz qoladi."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Ha"
                        cancelText="Yo'q"
                    >
                        <Button danger icon={<DeleteOutlined />}>O'chirish</Button>
                    </Popconfirm>
                </Space>
            )
        }
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
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        padding: '30px 40px',
        borderRadius: '24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(17, 153, 142, 0.2)'
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: '#f5f7fa' }}>
            <style>{`
                .dept-table .ant-table { background: transparent !important; }
                .dept-table .ant-table-thead > tr > th {
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
                .add-dept-btn {
                    background: #fff !important;
                    color: #11998e !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .add-dept-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                }
            `}</style>

            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '18px' }}>
                        <ClusterOutlined style={{ fontSize: '32px', color: '#fff' }} />
                    </div>
                    <div>
                        <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
                            Bo'limlarni Boshqarish
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px' }}>
                            Tizim tarkibiy bo'linmalarini sozlosh va boshqarish
                        </Text>
                    </div>
                </div>
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setSelectedDept(null);
                        form.resetFields();
                        form.setFieldsValue({ isActive: true, level: 3 });
                        setIsDeptModalVisible(true);
                    }}
                    className="action-pill add-dept-btn"
                >
                    Yangi Bo'lim Qo'shish
                </Button>
            </div>

            <div style={glassStyle}>
                <Table
                    dataSource={departments}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    className="dept-table"
                />
            </div>

            <Modal
                title={selectedDept ? "Bo'limni tahrirlash" : "Yangi bo'lim qo'shish"}
                open={isDeptModalVisible}
                onCancel={() => setIsDeptModalVisible(false)}
                onOk={() => form.submit()}
                centered
                style={{ borderRadius: '20px' }}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateOrUpdateDept} style={{ paddingTop: '10px' }}>
                    <Form.Item name="name" label="Bo'lim Nomi" rules={[{ required: true, message: "Nomini kiriting" }]}>
                        <Input size="large" style={{ borderRadius: '10px' }} />
                    </Form.Item>
                    <Form.Item name="level" label="Bo'lim Darajasi" rules={[{ required: true }]}>
                        <Select size="large" style={{ borderRadius: '10px' }} options={[
                            { label: 'Respublika (1-daraja)', value: 1 },
                            { label: 'Viloyat (2-daraja)', value: 2 },
                            { label: 'Tuman (3-daraja)', value: 3 },
                        ]} />
                    </Form.Item>
                    <Form.Item name="description" label="Tavsif">
                        <Input.TextArea rows={3} style={{ borderRadius: '10px' }} />
                    </Form.Item>
                    <Form.Item name="isActive" label="Faol" valuePropName="checked" initialValue={true}>
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span><SafetyCertificateOutlined /> {selectedDept?.name} uchun ruxsatlar</span>}
                open={isPermModalVisible}
                onCancel={() => setIsPermModalVisible(false)}
                width={800}
                footer={null}
                centered
                style={{ borderRadius: '20px' }}
            >
                <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
                    <Transfer
                        dataSource={permissions.map(p => ({ key: p.code, title: `${p.code} - ${p.description}` }))}
                        targetKeys={selectedDept?.permissions?.map((p: any) => p.permission?.code) || []}
                        onChange={handleSyncPermissions}
                        render={item => item.title}
                        listStyle={{ width: 320, height: 400, borderRadius: '12px' }}
                        titles={['Mavjud ruxsatlar', 'Biriktirilgan']}
                    />
                </div>
                <div style={{ marginTop: 20, textAlign: 'right' }}>
                    <Button size="large" onClick={() => setIsPermModalVisible(false)} style={{ borderRadius: '10px', minWidth: '100px' }}>
                        Yopish
                    </Button>
                </div>
            </Modal>
        </div>
    );

    /* --- ESKI DIZAYN (O'zgarmas Qoidalar asosida saqlab qolindi) ---
    return (
        <Card
            title={<span><ClusterOutlined /> Bo'limlarni Boshqarish</span>}
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setSelectedDept(null);
                form.resetFields();
                form.setFieldsValue({ isActive: true, level: 3 });
                setIsDeptModalVisible(true);
            }}>Yangi Bo'lim Qo'shish</Button>}
        >
            <Table
                dataSource={departments}
                columns={columns}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title={selectedDept ? "Bo'limni tahrirlash" : "Yangi bo'lim qo'shish"}
                open={isDeptModalVisible}
                onCancel={() => setIsDeptModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateOrUpdateDept}>
                    <Form.Item name="name" label="Bo'lim Nomi" rules={[{ required: true, message: "Nomini kiriting" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="level" label="Bo'lim Darajasi" rules={[{ required: true }]}>
                        <Select options={[
                            { label: 'Respublika (1-daraja)', value: 1 },
                            { label: 'Viloyat (2-daraja)', value: 2 },
                            { label: 'Tuman (3-daraja)', value: 3 },
                        ]} />
                    </Form.Item>
                    <Form.Item name="description" label="Tavsif">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="isActive" label="Faol" valuePropName="checked" initialValue={true}>
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span><SafetyCertificateOutlined /> {selectedDept?.name} uchun ruxsatlar</span>}
                open={isPermModalVisible}
                onCancel={() => setIsPermModalVisible(false)}
                width={700}
                footer={null}
            >
                <Transfer
                    dataSource={permissions.map(p => ({ key: p.code, title: `${p.code} - ${p.description}` }))}
                    targetKeys={selectedDept?.permissions?.map((p: any) => p.permission?.code) || []}
                    onChange={handleSyncPermissions}
                    render={item => item.title}
                    listStyle={{ width: 300, height: 400 }}
                    titles={['Mavjud ruxsatlar', 'Biriktirilgan']}
                />
                <div style={{ marginTop: 20, textAlign: 'right' }}>
                    <Button onClick={() => setIsPermModalVisible(false)}>Yopish</Button>
                </div>
            </Modal>
        </Card>
    );
    */
};

export default DepartmentManagementPage;
