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
                const firstName = data.user.firstName;
                const lastName = data.user.lastName;
                const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : (data.user.fullName || data.user.username);

                localStorage.setItem('user_full_name', fullName);
                if (data.user.organization) {
                    localStorage.setItem('user_org_id', data.user.organization.id);
                    localStorage.setItem('user_org_name', data.user.organization.name);

                    // UZ: Darajani aniqlash (Level 3 - Tuman, Level 2 - Viloyat)
                    // Agar parent bo'lsa - Tuman (3), bo'lmasa - Viloyat/Respublika (2/1)
                    const level = data.user.organization.parent ? '3' : '2';
                    localStorage.setItem('user_level', level);
                }

                // UZ: Ruxsatlarni saqlash (Bo'lim va Dinamik Rol)
                const deptPerms = data.user.department?.permissions?.map((dp: any) => dp.permission.code) || [];
                localStorage.setItem('user_dept_permissions', JSON.stringify(deptPerms));

                if (data.user.dynamicRole && data.user.dynamicRole.rolePermissions) {
                    localStorage.setItem('user_role_permissions', JSON.stringify(data.user.dynamicRole.rolePermissions));
                } else {
                    localStorage.removeItem('user_role_permissions');
                }

                // UZ: Eski kod bilan tahliliy muvofiqlik uchun (ixtiyoriy)
                localStorage.setItem('user_permissions', JSON.stringify(deptPerms));

                if (data.user.department) {
                    localStorage.setItem('user_department_name', data.user.department.name);
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
            <div className="login-container" style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'Inter, sans-serif' }}>

                {/* Left Side - Modern Gradient Panel with Animation */}
                <div className="login-left-panel" style={{
                    flex: '0 0 45%',
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '60px',
                    boxShadow: '20px 0 60px rgba(0,0,0,0.3)'
                }}>
                    {/* Animated Background Shapes */}
                    <div style={{
                        position: 'absolute',
                        top: '-10%', left: '-10%',
                        width: '120%', height: '120%',
                        background: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                        animation: 'float 20s ease-in-out infinite',
                        zIndex: 0
                    }} />

                    {/* Floating Particles */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.4,
                        zIndex: 0
                    }} />

                    <style>{`
                        @keyframes float {
                            0%, 100% { transform: translate(0, 0) rotate(0deg); }
                            33% { transform: translate(30px, -30px) rotate(120deg); }
                            66% { transform: translate(-20px, 20px) rotate(240deg); }
                        }
                        @keyframes pulse {
                            0%, 100% { opacity: 1; transform: scale(1); }
                            50% { opacity: 0.8; transform: scale(1.05); }
                        }
                        @keyframes slideInLeft {
                            from { opacity: 0; transform: translateX(-30px); }
                            to { opacity: 1; transform: translateX(0); }
                        }
                        .login-left-panel > * {
                            animation: slideInLeft 0.6s ease-out;
                        }
                    `}</style>

                    <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            width: '50px', height: '50px',
                            background: 'linear-gradient(135deg, #fff 0%, #e0e7ff 100%)',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#1e3c72', fontSize: '24px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            animation: 'pulse 3s ease-in-out infinite'
                        }}>
                            <MedicineBoxOutlined />
                        </div>
                        <Text style={{ color: '#fff', fontSize: '20px', fontWeight: 600, letterSpacing: '1.5px' }}>
                            SMART <span style={{ fontWeight: 800, background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SES</span>
                        </Text>
                    </div>

                    <div style={{ zIndex: 1, maxWidth: '500px', margin: '40px 0' }}>
                        <Title level={1} style={{
                            color: '#fff',
                            fontSize: '42px',
                            lineHeight: '1.2',
                            fontWeight: 800,
                            marginBottom: '24px',
                            margin: 0,
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}>
                            {t('auth.slogan_part1', 'Aholining salomatligi')} — <br />
                            <span style={{
                                background: 'linear-gradient(135deg, #60a5fa 0%, #c084fc 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>{t('auth.slogan_part2', 'bizning ustuvor vazifamiz')}</span>
                        </Title>
                        <Text style={{
                            color: 'rgba(255,255,255,0.85)',
                            fontSize: '17px',
                            lineHeight: '1.7',
                            display: 'block',
                            maxWidth: '450px',
                            marginTop: '24px',
                            textShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}>
                            {t('auth.description', 'Toshkent viloyati Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi boshqarmasi yagona monitoring tizimi.')}
                        </Text>

                        {/* Feature Pills */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
                            {['🔒 Xavfsiz', '⚡ Tez', '📊 Samarali'].map((feature, i) => (
                                <div key={i} style={{
                                    padding: '8px 16px',
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '20px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ zIndex: 1 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                            © {new Date().getFullYear()} {t('common.app_name')}. {t('auth.footer_text', 'Barcha huquqlar himoyalangan.')}
                        </Text>
                    </div>
                </div>

                {/* Right Side - Modern Glassmorphism Login Form */}
                <div className="login-right-panel" style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    position: 'relative'
                }}>
                    {/* Decorative Gradient Orbs */}
                    <div style={{
                        position: 'absolute',
                        top: '10%', right: '10%',
                        width: '200px', height: '200px',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(40px)',
                        animation: 'pulse 4s ease-in-out infinite'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '15%', left: '15%',
                        width: '150px', height: '150px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(40px)',
                        animation: 'pulse 5s ease-in-out infinite reverse'
                    }} />

                    <div style={{
                        width: '100%',
                        maxWidth: '440px',
                        padding: '50px',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5)',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                                <LanguageSwitcher />
                            </div>
                            <Title level={2} style={{
                                color: '#1f1f1f',
                                marginBottom: '8px',
                                fontWeight: 800,
                                fontSize: '32px'
                            }}>
                                {t('auth.welcome_title', 'Xush kelibsiz')} 👋
                            </Title>
                            <Text type="secondary" style={{ fontSize: '16px', color: '#666' }}>{t('auth.welcome_subtitle', 'Hisobingizga kiring')}</Text>
                        </div>

                        <Form
                            name="login_v2"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                            requiredMark={false}
                        >
                            <Form.Item
                                label={<span style={{ fontWeight: 600, color: '#333', fontSize: '15px' }}>{t('user.username')}</span>}
                                name="username"
                                rules={[{ required: true, message: t('auth.username_required', 'Iltimos, loginingizni kiriting') }]}
                            >
                                <Input
                                    placeholder="admin"
                                    prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                                    style={{
                                        background: '#f9fafb',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: 600, color: '#333', fontSize: '15px' }}>{t('user.password')}</span>}
                                name="password"
                                rules={[{ required: true, message: t('auth.password_required', 'Iltimos, parolingizni kiriting') }]}
                            >
                                <Input.Password
                                    placeholder="••••••••"
                                    prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                                    style={{
                                        background: '#f9fafb',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </Form.Item>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px', marginTop: '-12px' }}>
                                <Link href="#" style={{
                                    color: '#8b5cf6',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    transition: 'color 0.3s ease'
                                }}>
                                    {t('auth.forgot_password', 'Parolni unutdingizmi?')}
                                </Link>
                            </div>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    icon={<RightOutlined />}
                                    iconPosition="end"
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        height: '54px',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
                                    }}
                                >
                                    {t('auth.login_btn', 'Kirish')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;
