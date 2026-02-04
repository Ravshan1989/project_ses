import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { Form, Input, Button, message, Typography, theme, ConfigProvider } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const { Title, Text, Link } = Typography;

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const { t } = useTranslation();

    const onFinish = async (values: any) => {
        // ... (same as before)
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('user_role', data.user.role);
                localStorage.setItem('username', data.user.username);
                // UZ: Foydalanuvchi ism-familiyasi va tashkilot ma'lumotlarini saqlash
                localStorage.setItem('user_full_name', data.user.fullName || data.user.firstName + ' ' + data.user.lastName || data.user.username);
                if (data.user.organization) {
                    localStorage.setItem('user_org_id', data.user.organization.id);
                    localStorage.setItem('user_org_name', data.user.organization.name);
                }

                message.success(t('auth.success_login', 'Xush kelibsiz!'));
                navigate('/dashboard');
            } else {
                message.error(data.message || t('auth.error_login', 'Login yoki parol noto\'g\'ri'));
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error(t('auth.error_system', 'Tizimga ulanishda xatolik yuz berdi'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Input: {
                        controlHeight: 50,
                        borderRadius: 8,
                        colorBorder: '#d9d9d9',
                        hoverBorderColor: token.colorPrimary,
                        activeBorderColor: token.colorPrimary,
                    },
                    Button: {
                        controlHeight: 50,
                        borderRadius: 8,
                        fontSize: 16,
                        fontWeight: 600,
                    }
                }
            }}
        >
            <style>
                {`
                    @media (max-width: 768px) {
                        .login-container {
                            flex-direction: column !important;
                        }
                        .login-left-panel {
                            flex: none !important;
                            width: 100% !important;
                            padding: 40px 20px !important;
                        }
                        .login-left-panel h1 {
                            font-size: 28px !important;
                        }
                        .login-right-panel {
                            padding: 20px !important;
                        }
                    }
                `}
            </style>
            <div className="login-container" style={{ display: 'flex', minHeight: '100vh', background: '#fff', fontFamily: 'Inter, sans-serif' }}>

                {/* Left Side - Professional Blue Panel */}
                <div className="login-left-panel" style={{
                    flex: '0 0 40%',
                    background: '#001529',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '60px'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        opacity: 0.1,
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(22, 119, 255, 0.3) 0%, transparent 50%)',
                        zIndex: 0
                    }} />

                    <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            width: '44px', height: '44px',
                            background: '#fff',
                            borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#001529', fontSize: '22px'
                        }}>
                            <MedicineBoxOutlined />
                        </div>
                        <Text style={{ color: '#fff', fontSize: '18px', fontWeight: 500, letterSpacing: '0.5px' }}>
                            REGION<span style={{ fontWeight: 700 }}>STAT</span>
                        </Text>
                    </div>

                    <div style={{ zIndex: 1, maxWidth: '480px', margin: '40px 0' }}>
                        <Title level={1} style={{ color: '#fff', fontSize: '38px', lineHeight: '1.2', fontWeight: 700, marginBottom: '24px', margin: 0 }}>
                            {t('auth.slogan_part1', 'Aholining salomatligi')} — <br />
                            <span style={{ color: '#69b1ff' }}>{t('auth.slogan_part2', 'bizning ustuvor vazifamiz')}</span>
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: '16px', lineHeight: '1.6', display: 'block', maxWidth: '400px', marginTop: '20px' }}>
                            {t('auth.description', 'Toshkent viloyati Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi boshqarmasi yagona monitoring tizimi.')}
                        </Text>
                    </div>

                    <div style={{ zIndex: 1 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>
                            © 2026 RegionStat. {t('auth.footer_text', 'Barcha huquqlar himoyalangan.')}
                        </Text>
                    </div>
                </div>

                {/* Right Side - Clean Login Form */}
                <div className="login-right-panel" style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff'
                }}>
                    <div style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                <LanguageSwitcher />
                            </div>
                            <Title level={2} style={{ color: '#1f1f1f', marginBottom: '8px', fontWeight: 700 }}>
                                {t('auth.welcome_title', 'Xush kelibsiz')}
                            </Title>
                            <Text type="secondary" style={{ fontSize: '16px' }}>{t('auth.welcome_subtitle', 'Hisobingizga kiring')}</Text>
                        </div>

                        <Form
                            name="login_v2"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                            requiredMark={false}
                        >
                            <Form.Item
                                label={<span style={{ fontWeight: 500, color: '#333' }}>{t('user.username')}</span>}
                                name="username"
                                rules={[{ required: true, message: t('auth.username_required', 'Iltimos, loginingizni kiriting') }]}
                            >
                                <Input
                                    placeholder="admin"
                                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                    style={{ background: '#f8f9fa' }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: 500, color: '#333' }}>{t('user.password')}</span>}
                                name="password"
                                rules={[{ required: true, message: t('auth.password_required', 'Iltimos, parolingizni kiriting') }]}
                            >
                                <Input.Password
                                    placeholder="••••••••"
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                    style={{ background: '#f8f9fa' }}
                                />
                            </Form.Item>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', marginTop: '-12px' }}>
                                <Link href="#" style={{ color: token.colorPrimary, fontWeight: 500 }}>
                                    {t('auth.forgot_password', 'Parolni unutdingizmi?')}
                                </Link>
                            </div>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} block icon={<RightOutlined />} iconPosition="end">
                                    {t('auth.login_btn', 'Kirish')}
                                </Button>
                            </Form.Item>

                            <div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px', borderLeft: `3px solid ${token.colorPrimary}` }}>
                                <Text style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 600 }}>Demo:</span> admin / admin123
                                </Text>
                                <Text style={{ fontSize: '13px', color: '#666' }}>
                                    <span style={{ fontWeight: 600 }}>Demo:</span> tuman / tuman123
                                </Text>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;
