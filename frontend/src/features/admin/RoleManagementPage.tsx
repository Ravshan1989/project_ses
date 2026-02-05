import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Switch, message, Space, Tag, Typography, Select, Checkbox } from 'antd';
import { TeamOutlined, PlusOutlined, SafetyCertificateOutlined, EditOutlined } from '@ant-design/icons';
import { rolesApi, permissionsApi } from '../../services/api';

const { Text } = Typography;

const RoleManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
    const [isPermModalVisible, setIsPermModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [rolePerms, setRolePerms] = useState<any[]>([]);
    const [form] = Form.useForm();

    // UZ: Rollarni yuklash
    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await rolesApi.getAll();
            setRoles(res.data);
        } catch (e) {
            message.error("Rollarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    // UZ: Ruxsatlar ro'yxatini yuklash
    const fetchPermissions = async () => {
        try {
            const res = await permissionsApi.getAll();
            setPermissions(res.data);
        } catch (e) {
            console.error("Failed to fetch permissions", e);
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const handleCreateOrUpdateRole = async (values: any) => {
        try {
            const request = selectedRole
                ? rolesApi.update(selectedRole.id, values)
                : rolesApi.create(values);

            await request;
            message.success(selectedRole ? "Rol yangilandi" : "Yangi rol yaratildi");
            setIsRoleModalVisible(false);
            setSelectedRole(null);
            form.resetFields();
            fetchRoles();
        } catch (e: any) {
            message.error(e.response?.data?.message || "Saqlashda xatolik");
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        try {
            await rolesApi.syncPermissions(selectedRole.id, rolePerms);
            message.success("Ruxsatlar saqlandi");
            setIsPermModalVisible(false);
            fetchRoles();
        } catch (e) {
            message.error("Ruxsatlarni saqlashda xatolik");
        }
    };

    const togglePermission = (code: string, field: string, checked: boolean) => {
        const index = rolePerms.findIndex(p => p.permissionCode === code);
        const newList = [...rolePerms];
        if (index > -1) {
            newList[index] = { ...newList[index], [field]: checked };
        } else {
            newList.push({ permissionCode: code, [field]: checked });
        }
        setRolePerms(newList);
    };

    const columns = [
        { title: "Rol nomi", dataIndex: 'name', key: 'name', render: (t: string) => <Text strong>{t}</Text> },
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
        {
            title: "Holati",
            dataIndex: 'isActive',
            key: 'isActive',
            render: (active: boolean) => active ? <Tag color="green">Faol</Tag> : <Tag color="red">Nofaol</Tag>
        },
        {
            title: "Amallar",
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => {
                        setSelectedRole(record);
                        form.setFieldsValue(record);
                        setIsRoleModalVisible(true);
                    }}>Tahrirlash</Button>
                    <Button icon={<SafetyCertificateOutlined />} type="primary" onClick={() => {
                        setSelectedRole(record);
                        setRolePerms(record.rolePermissions || []);
                        setIsPermModalVisible(true);
                    }}>Ruxsatlarni sozlash</Button>
                </Space>
            )
        }
    ];

    const permColumns = [
        { title: 'Ruxsat Kodu', dataIndex: 'code', key: 'code' },
        { title: 'Tavsif', dataIndex: 'description', key: 'description' },
        {
            title: 'Ko\'rish',
            key: 'view',
            render: (_: any, record: any) => (
                <Checkbox
                    checked={rolePerms.find(p => p.permissionCode === record.code)?.canView}
                    onChange={e => togglePermission(record.code, 'canView', e.target.checked)}
                />
            )
        },
        {
            title: 'Kiritish/Tahrirlash',
            key: 'edit',
            render: (_: any, record: any) => (
                <Checkbox
                    checked={rolePerms.find(p => p.permissionCode === record.code)?.canEdit}
                    onChange={e => togglePermission(record.code, 'canEdit', e.target.checked)}
                />
            )
        },
        {
            title: 'Excel (Download)',
            key: 'download',
            render: (_: any, record: any) => (
                <Checkbox
                    checked={rolePerms.find(p => p.permissionCode === record.code)?.canDownload}
                    onChange={e => togglePermission(record.code, 'canDownload', e.target.checked)}
                />
            )
        }
    ];

    return (
        <Card
            title={<span><TeamOutlined /> Rollarni Boshqarish</span>}
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setSelectedRole(null);
                form.resetFields();
                form.setFieldsValue({ isActive: true, level: 3 });
                setIsRoleModalVisible(true);
            }}>Yangi Rol Qo'shish</Button>}
        >
            <Table dataSource={roles} columns={columns} rowKey="id" loading={loading} />

            {/* UZ: Rol yaratish Modali */}
            <Modal
                title={selectedRole ? "Rolni tahrirlash" : "Yangi rol qo'shish"}
                open={isRoleModalVisible}
                onCancel={() => setIsRoleModalVisible(false)}
                onOk={() => form.submit()}
                okText="Saqlash"
                cancelText="Bekor qilish"
            >
                <Form form={form} layout="vertical" onFinish={handleCreateOrUpdateRole}>
                    <Form.Item name="name" label="Rol Nomi" rules={[{ required: true }]}>
                        <Input placeholder="Masalan: Bo'lim boshlig'i" />
                    </Form.Item>
                    <Form.Item name="level" label="Amal qilish darajasi" rules={[{ required: true }]}>
                        <Select options={[
                            { label: 'Respublika (1-daraja)', value: 1 },
                            { label: 'Viloyat (2-daraja)', value: 2 },
                            { label: 'Tuman (3-daraja)', value: 3 },
                        ]} />
                    </Form.Item>
                    <Form.Item name="description" label="Tavsif">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="isActive" label="Faol holatda" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* UZ: Granulyar Ruxsatlar Matrix Modali */}
            <Modal
                title={<span><SafetyCertificateOutlined /> {selectedRole?.name} - Ruxsatlar Matritsasi</span>}
                open={isPermModalVisible}
                onCancel={() => setIsPermModalVisible(false)}
                onOk={handleSavePermissions}
                width={900}
                okText="Saqlash"
                cancelText="Yopish"
            >
                <Table
                    dataSource={permissions}
                    columns={permColumns}
                    rowKey="id"
                    pagination={false}
                    scroll={{ y: 400 }}
                />
            </Modal>
        </Card>
    );
};

export default RoleManagementPage;
