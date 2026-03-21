import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Modal, message, Popconfirm } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, LockOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phoneNumber: string;
    username?: string;
    role: string;
    organization?: { id: string; name: string };
    department?: { id: string; name: string };
    isActive: boolean;
    createdAt: string;
}

export const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [credentialsModal, setCredentialsModal] = useState<{ visible: boolean; username?: string; password?: string }>({ visible: false });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            message.error('Xodimlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_BASE_URL}/admin/users/${userId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Xodim tasdiqlandi!');

            // Show credentials
            setCredentialsModal({
                visible: true,
                username: response.data.username,
                password: response.data.password
            });

            fetchUsers();
        } catch (error) {
            message.error('Tasdiqlashda xatolik');
        }
    };

    const handleReject = async (userId: string) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`${API_BASE_URL}/admin/users/${userId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Xodim rad etildi');
            fetchUsers();
        } catch (error) {
            message.error('Rad etishda xatolik');
        }
    };

    const handleDeactivate = async (userId: string) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`${API_BASE_URL}/admin/users/${userId}/deactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Xodim deaktivatsiya qilindi');
            fetchUsers();
        } catch (error) {
            message.error('Deaktivatsiya qilishda xatolik');
        }
    };

    const handleActivate = async (userId: string) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`${API_BASE_URL}/admin/users/${userId}/activate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Xodim faollashtirildi');
            fetchUsers();
        } catch (error) {
            message.error('Faollashtirishda xatolik');
        }
    };

    const handleResetPassword = async (userId: string, username: string | undefined) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Parol muvaffaqiyatli yangilandi');
            
            // Show new credentials
            setCredentialsModal({
                visible: true,
                username: username,
                password: response.data.password
            });
        } catch (error) {
            message.error('Parolni yangilashda xatolik');
        }
    };

    const handleDelete = async (userId: string) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`${API_BASE_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Xodim o\'chirildi');
            fetchUsers();
        } catch (error) {
            message.error('O\'chirishda xatolik');
        }
    };

    const columns = [
        {
            title: 'F.I.O',
            key: 'fullName',
            render: (record: User) => `${record.lastName || ''} ${record.firstName || ''} ${record.middleName || ''}`.trim(),
            filteredValue: [searchText],
            onFilter: (value: any, record: User) => {
                const fullName = `${record.lastName} ${record.firstName} ${record.middleName}`.toLowerCase();
                const phone = record.phoneNumber || '';
                const org = record.organization?.name || '';
                return fullName.includes(value.toLowerCase()) || phone.includes(value) || org.toLowerCase().includes(value.toLowerCase());
            }
        },
        {
            title: 'Telefon',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Tashkilot',
            key: 'organization',
            render: (record: User) => record.organization?.name || '-',
        },
        {
            title: 'Bo\'lim',
            key: 'department',
            render: (record: User) => record.department?.name || '-',
        },
        {
            title: 'Lavozim',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                const roleLabels: Record<string, string> = {
                    ADMIN: 'Tizim administratori',
                    HR: 'Kadrlar bo\'limi',
                    REPUBLIC_HEAD: 'Respublika rahbari',
                    REGION_HEAD: 'Viloyat boshlig\'i',
                    DISTRICT_HEAD: 'Tuman (Shahar) boshlig\'i',
                    DEPARTMENT_HEAD: 'Bo\'lim mudiri',
                    DISTRICT_SPECIALIST: 'Epidemiolog vrach',
                    DISTRICT_OPERATOR: 'Epidemiolog yordamchisi',
                    SANITARY_HEAD: 'Sanitariya bo\'limi mudiri',
                    SANITARY_SPECIALIST: 'Sanitar vrach',
                    SANITARY_OPERATOR: 'Sanitar yordamchisi',
                    LEAD_SPECIALIST: 'Yetakchi mutaxassis',
                    STAFF: 'Xodim',
                };
                return roleLabels[role] || role;
            }
        },
        {
            title: 'Login',
            dataIndex: 'username',
            key: 'username',
            render: (username: string) => (!username || username.startsWith('reg_')) ? <Tag color="orange">Kutmoqda</Tag> : username,
        },
        {
            title: 'Holat',
            key: 'isActive',
            render: (record: User) => {
                if (!record.username || record.username.startsWith('reg_')) {
                    return <Tag color="orange">Kutmoqda</Tag>;
                }
                return record.isActive ? <Tag color="green">Faol</Tag> : <Tag color="red">Nofaol</Tag>;
            }
        },
        {
            title: 'Amallar',
            key: 'actions',
            render: (record: User) => (
                <Space>
                    {!record.username || record.username.startsWith('reg_') ? (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={() => handleApprove(record.id)}
                            >
                                Tasdiqlash
                            </Button>
                            <Popconfirm
                                title="Rad etishni tasdiqlaysizmi?"
                                onConfirm={() => handleReject(record.id)}
                                okText="Ha"
                                cancelText="Yo'q"
                            >
                                <Button danger size="small" icon={<CloseOutlined />}>
                                    Rad etish
                                </Button>
                            </Popconfirm>
                        </>
                    ) : (
                        <>
                            {record.isActive ? (
                                <Popconfirm
                                    title="Deaktivatsiya qilishni tasdiqlaysizmi?"
                                    onConfirm={() => handleDeactivate(record.id)}
                                    okText="Ha"
                                    cancelText="Yo'q"
                                >
                                    <Button size="small" icon={<LockOutlined />}>
                                        Bloklash
                                    </Button>
                                </Popconfirm>
                            ) : (
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleActivate(record.id)}
                                >
                                    Faollashtirish
                                </Button>
                            )}
                        </>
                    )}
                </Space>
            ),
        },
        {
            title: 'Boshqa',
            key: 'delete',
            render: (record: User) => (
                <Space>
                    {record.username && !record.username.startsWith('reg_') && (
                        <Popconfirm
                            title="Parolni yangilashni tasdiqlaysizmi?"
                            onConfirm={() => handleResetPassword(record.id, record.username)}
                            okText="Ha"
                            cancelText="Yo'q"
                        >
                            <Button type="text" style={{ color: '#faad14' }} icon={<LockOutlined />} />
                        </Popconfirm>
                    )}
                    <Popconfirm
                        title="Xodimni o'chirishni tasdiqlaysizmi?"
                        description="Bu amalni ortga qaytarib bo'lmaydi!"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Ha, o'chirish"
                        cancelText="Yo'q"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Xodimlar Boshqaruvi</h2>
                <Space>
                    <Button
                        type="dashed"
                        icon={<CheckOutlined style={{ color: 'green' }} />}
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem('access_token');
                                const response = await axios.get(`${API_BASE_URL}/users/export`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                    responseType: 'blob',
                                });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'users_export.xlsx');
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                message.success("Excel fayl yuklab olindi!");
                            } catch (err) {
                                message.error("Yuklashda xatolik bo'ldi");
                            }
                        }}
                    >
                        Excelga Yuklash
                    </Button>
                    <Input
                        placeholder="F.I.O, telefon yoki tashkilot bo'yicha qidirish..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Login va Parol"
                open={credentialsModal.visible}
                onOk={() => setCredentialsModal({ visible: false })}
                onCancel={() => setCredentialsModal({ visible: false })}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setCredentialsModal({ visible: false })}>
                        Yopish
                    </Button>
                ]}
            >
                <div style={{ padding: '20px 0' }}>
                    <p><strong>Login:</strong> <code style={{ fontSize: 16, padding: '4px 8px', background: '#f0f0f0' }}>{credentialsModal.username}</code></p>
                    <p><strong>Parol:</strong> <code style={{ fontSize: 16, padding: '4px 8px', background: '#f0f0f0' }}>{credentialsModal.password}</code></p>
                    <p style={{ color: '#888', marginTop: 16 }}>⚠️ Parolni xavfsiz joyda saqlang!</p>
                </div>
            </Modal>
        </div>
    );
};
