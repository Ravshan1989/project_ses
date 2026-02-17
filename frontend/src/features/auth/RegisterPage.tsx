import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Typography, message, Space, ConfigProvider, theme } from 'antd';
import { UserOutlined, MedicineBoxOutlined, ArrowLeftOutlined, BankOutlined, ClusterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../config';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { token } = theme.useToken();

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [orgRes, deptRes] = await Promise.all([
                fetch(`${API_BASE_URL}/organizations`),
                fetch(`${API_BASE_URL}/departments`)
            ]);

            if (orgRes.ok && deptRes.ok) {
                const orgs = await orgRes.json();
                const depts = await deptRes.json();
                setOrganizations(orgs);
                setDepartments(depts);
            }
        } catch (error) {
            console.error('Fetch data error:', error);
            message.error(t('common.error_loading_data', 'Ma\'lumotlarni yuklab bo\'lmadi'));
        }
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    role: 'STAFF' // Default role for self-registration
                }),
            });

            const data = await response.json();

            if (response.ok) {
                message.success(t('auth.success_register', "Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi kirishingiz mumkin."));
                navigate('/login');
            } else {
                message.error(data.message || t('auth.error_register', "Ro'yxatdan o'tishda xatolik yuz berdi"));
            }
        } catch (error) {
            console.error('Registration error:', error);
            message.error(t('auth.error_system', 'Tizimga ulanishda xatolik yuz berdi'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Input: { controlHeight: 45, borderRadius: 8 },
                    Select: { controlHeight: 45, borderRadius: 8 },
                    Button: { controlHeight: 45, borderRadius: 8 }
                }
            }}
        >
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%)',
                padding: '40px 20px'
            }}>
                <div style={{ position: 'absolute', top: 20, right: 20 }}>
                    <LanguageSwitcher />
                </div>

                <div style={{ maxWidth: 500, width: '100%', margin: 'auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <MedicineBoxOutlined style={{ fontSize: 48, color: token.colorPrimary, marginBottom: 16 }} />
                        <Title level={2} style={{ margin: 0 }}>{t('common.app_name', 'Smart SES')}</Title>
                        <Text type="secondary">{t('auth.register_title', "Ro'yxatdan o'tish")}</Text>
                    </div>

                    <Card bordered={false} style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderRadius: 16 }}>
                        <Form layout="vertical" onFinish={onFinish} requiredMark={true}>
                            <Space style={{ display: 'flex' }} align="start">
                                <Form.Item
                                    name="lastName"
                                    label={t('user.last_name', 'Familiya')}
                                    rules={[{ required: true, message: t('user.error_last_name', 'Familiyangizni kiriting') }]}
                                    style={{ flex: 1 }}
                                >
                                    <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} />
                                </Form.Item>
                                <Form.Item
                                    name="firstName"
                                    label={t('user.first_name', 'Ism')}
                                    rules={[{ required: true, message: t('user.error_first_name', 'Ismingizni kiriting') }]}
                                    style={{ flex: 1 }}
                                >
                                    <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} />
                                </Form.Item>
                                <Form.Item
                                    name="middleName"
                                    label={t('user.middle_name', "Otasining ismi")}
                                    rules={[{ required: true, message: t('user.error_middle_name', "Otasining ismini kiriting") }]}
                                    style={{ flex: 1 }}
                                >
                                    <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} />
                                </Form.Item>
                            </Space>

                            <Form.Item
                                name="organizationId"
                                label={t('common.organization', 'Tashkilot (Viloyat/Tuman)')}
                                rules={[{ required: true, message: t('common.error_select_org', 'Tashkilotni tanlang') }]}
                            >
                                <Select
                                    showSearch
                                    placeholder={t('common.placeholder_org', 'Qidirish...')}
                                    optionFilterProp="children"
                                    prefix={<BankOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                >
                                    {organizations.map(org => (
                                        <Option key={org.id} value={org.id}>
                                            {org.parent ? `${org.parent.name} - ${org.name}` : org.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="departmentId"
                                label={t('common.department', "Bo'lim")}
                                rules={[{ required: true, message: t('common.error_select_dept', "Bo'limni tanlang") }]}
                            >
                                <Select placeholder={t('common.placeholder_dept', 'Tanlang...')} prefix={<ClusterOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}>
                                    {departments.map(dept => (
                                        <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="phoneNumber"
                                label={t('user.phone_number', 'Telefon raqami')}
                                rules={[{ required: true, message: t('user.error_phone_number', 'Telefon raqamingizni kiriting') }]}
                            >
                                <Input
                                    placeholder="+998 90 123 45 67"
                                    prefix={<span style={{ color: 'rgba(0,0,0,.25)', marginRight: 4 }}>📞</span>}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button type="primary" htmlType="submit" loading={loading} block style={{ fontWeight: 600 }}>
                                    {t('auth.register_btn', "RO'YXATDAN O'TISH")}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>

                    <div style={{ textAlign: 'center', marginTop: 24, padding: '0 20px' }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                            {t('auth.register_info', "Ro'yxatdan o'tgach, ma'lumotlaringiz admin tomonidan tekshiriladi va login/parol Telegram orqali yuboriladi.")}
                        </Text>
                        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/login')}>
                            {t('auth.back_to_login', 'Tizimga qaytish')}
                        </Button>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default RegisterPage;
