import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Switch, message, Space, Transfer, Tag, Typography, Select } from 'antd';
import { ClusterOutlined, PlusOutlined, SafetyCertificateOutlined, EditOutlined } from '@ant-design/icons';
import { departmentsApi, permissionsApi } from '../../services/api';

const { Text } = Typography;

const DepartmentManagementPage: React.FC = () => {
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
                </Space>
            )
        }
    ];

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

            {/* UZ: Bo'lim yaratish/tahrirlash Modali */}
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

            {/* UZ: Ruxsatlar Matrix (Transfer) Modali */}
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
};

export default DepartmentManagementPage;
