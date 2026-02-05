import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Card } from 'antd';
import { UserAddOutlined, SolutionOutlined } from '@ant-design/icons';
import { rolesApi } from '../../services/api';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const UserManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [organizations, setOrganizations] = useState([]); // Org state
    const [departments, setDepartments] = useState([]); // Dept state
    const [roles, setRoles] = useState<any[]>([]); // UZ: Dinamik rollar state'i
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [submitLoading, setSubmitLoading] = useState(false);

    const [editingUser, setEditingUser] = useState<any>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                message.error(t('user.error_load'));
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Organizations
    const fetchOrganizations = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/organizations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setOrganizations(data);
            }
        } catch (error) {
            console.error('Error fetching orgs:', error);
        }
    };

    // Fetch Departments
    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/departments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Error fetching depts:', error);
        }
    };

    // UZ: Dinamik rollarni yuklash
    const fetchDynamicRoles = async () => {
        try {
            const res = await rolesApi.getAll();
            setRoles(res.data);
        } catch (e) {
            console.error("Roles load error:", e);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchOrganizations();
        fetchDepartments();
        fetchDynamicRoles();
    }, []);

    const handleCreateOrUpdateUser = async (values: any) => {
        setSubmitLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const url = editingUser ? `${API_BASE_URL}/users/${editingUser.id}` : `${API_BASE_URL}/users`;
            const method = editingUser ? 'PATCH' : 'POST';

            // If editing and password is empty, remove it from submission
            if (editingUser && !values.password) {
                delete values.password;
            }

            // UZ: DynamicRoleId ni jo'natish
            const payload = { ...values };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                message.success(editingUser ? t('user.success_update') : t('user.success_create'));
                setIsModalVisible(false);
                setEditingUser(null);
                form.resetFields();
                fetchUsers();
            } else {
                message.error(t('user.error_create'));
            }
        } catch (error) {
            console.error('Error:', error);
            message.error(t('user.error_create'));
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        Modal.confirm({
            title: t('user.delete_button'),
            content: t('user.delete_confirm'),
            okText: t('user.delete_button'),
            okType: 'danger',
            cancelText: t('user.cancel'),
            onOk: async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        message.success(t('user.success_delete'));
                        fetchUsers();
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                }
            }
        });
    };

    const showEditModal = (user: any) => {
        setEditingUser(user);
        form.setFieldsValue({
            username: user.username,
            role: user.role,
            organizationId: user.organization?.id,
            departmentId: user.department?.id,
            dynamicRoleId: user.dynamicRole?.id
        });
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: t('user.username'),
            dataIndex: 'username',
            key: 'username',
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: t('user.role'),
            dataIndex: 'role',
            key: 'role',
            render: (role: string, record: any) => {
                let color = 'geekblue';
                if (role === 'ADMIN') color = 'red';
                if (role === 'REGION_HEAD') color = 'gold';
                if (role === 'DISTRICT_HEAD') color = 'green';
                return (
                    <Space direction="vertical" size={0}>
                        <Tag color={color}>
                            {t(`user.roles.${role}`)}
                        </Tag>
                        {record.dynamicRole && (
                            <Tag color="purple" icon={<SolutionOutlined />} style={{ marginTop: 4 }}>
                                {record.dynamicRole.name}
                            </Tag>
                        )}
                    </Space>
                );
            },
        },
        {
            title: t('user.actions'),
            key: 'actions',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="link" onClick={() => showEditModal(record)}>
                        {t('user.edit_button')}
                    </Button>
                    <Button type="link" danger onClick={() => handleDeleteUser(record.id)}>
                        {t('user.delete_button')}
                    </Button>
                </Space>
            ),
        },
        {
            title: t('user.organization'),
            dataIndex: ['organization', 'name'],
            key: 'organization',
            render: (text: string) => text || '-',
        },
        {
            title: t('user.created_at'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
    ];

    return (
        <Card title={t('user.title')} extra={
            <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalVisible(true)}>
                {t('user.add_button')}
            </Button>
        }>
            <Table
                dataSource={users}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingUser ? t('user.edit_modal_title') : t('user.modal_title')}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingUser(null);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateOrUpdateUser}
                >
                    <Form.Item
                        name="username"
                        label={t('user.username')}
                        rules={[{ required: true, message: t('user.username') }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={t('user.password')}
                        rules={[{ required: !editingUser, message: t('user.password') }]}
                    >
                        <Input.Password placeholder={editingUser ? "O'zgartirish uchun yangi parol kiriting (ixtiyoriy)" : ""} />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label={t('user.role')}
                        rules={[{ required: true, message: t('user.select_role') }]}
                    >
                        <Select placeholder={t('user.select_role')}>
                            <Option value="REGION_HEAD">{t('user.roles.REGION_HEAD')}</Option>
                            <Option value="DISTRICT_HEAD">{t('user.roles.DISTRICT_HEAD')}</Option>
                            <Option value="LAB_HEAD">{t('user.roles.LAB_HEAD')}</Option>
                            <Option value="REPUBLIC_HEAD">{t('user.roles.REPUBLIC_HEAD')}</Option>
                            <Option value="STAFF">{t('user.roles.STAFF')}</Option>
                            <Option value="ADMIN">{t('user.roles.ADMIN')}</Option>

                            <Option value="DEPARTMENT_HEAD">Bo'lim Boshlig'i</Option>
                            <Option value="EPIDEMIOLOGIST">Epidemiolog Vrach</Option>
                            <Option value="EPIDEMIOLOGIST_ASSISTANT">Epidemiolog Yordamchisi</Option>
                            <Option value="SANITARY_DOCTOR">Sanitar Vrach</Option>
                            <Option value="SANITARY_ASSISTANT">Sanitar Yordamchisi</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="organizationId"
                        label={t('user.organization')}
                        rules={[{ required: true, message: t('user.select_org') }]} // Make it required for simplicity
                    >
                        <Select
                            placeholder={t('user.select_org')}
                            showSearch
                            optionFilterProp="children"
                        >
                            {organizations.map((org: any) => (
                                <Option key={org.id} value={org.id}>
                                    {org.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dynamicRoleId"
                        label="Dinamik Rol (Huquqlar)"
                    >
                        <Select placeholder="Rolni tanlang (Ixtiyoriy)" allowClear>
                            {roles.map((r: any) => (
                                <Select.Option key={r.id} value={r.id}>
                                    {r.name} ({r.level}-daraja)
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="departmentId"
                        label="Bo'lim (Department)"
                        rules={[{ required: false, message: "Bo'limni tanlang" }]}
                    >
                        <Select placeholder="Bo'limni tanlang (Ixtiyoriy)">
                            <Option value="">- Bo'limsiz -</Option>
                            {departments.map((dept: any) => (
                                <Option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>{t('user.cancel')}</Button>
                            <Button type="primary" htmlType="submit" loading={submitLoading}>
                                {t('user.save')}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default UserManagementPage;
