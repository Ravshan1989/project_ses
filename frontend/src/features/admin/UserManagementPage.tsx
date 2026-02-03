import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Card } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const UserManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [organizations, setOrganizations] = useState([]); // Org state
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [submitLoading, setSubmitLoading] = useState(false);

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

    useEffect(() => {
        fetchUsers();
        fetchOrganizations();
    }, []);

    const handleCreateUser = async (values: any) => {
        setSubmitLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                message.success(t('user.success_create'));
                setIsModalVisible(false);
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
            render: (role: string) => {
                let color = 'geekblue';
                if (role === 'ADMIN') color = 'red';
                if (role === 'REGION_HEAD') color = 'gold';
                if (role === 'DISTRICT_HEAD') color = 'green';
                return (
                    <Tag color={color}>
                        {role}
                    </Tag>
                );
            },
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
                title={t('user.modal_title')}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateUser}
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
                        rules={[{ required: true, message: t('user.password') }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label={t('user.role')}
                        rules={[{ required: true, message: t('user.select_role') }]}
                    >
                        <Select placeholder={t('user.select_role')}>
                            <Option value="REGION_HEAD">Viloyat Boshqarmasi Rahbari</Option>
                            <Option value="DISTRICT_HEAD">Tuman Bo'limi Rahbari</Option>
                            <Option value="LAB_HEAD">Laboratoriya Mudiri</Option>
                            <Option value="REPUBLIC_HEAD">Respublika Rahbari</Option>
                            <Option value="STAFF">Oddiy Hodim</Option>
                            <Option value="ADMIN">Admin</Option>
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
