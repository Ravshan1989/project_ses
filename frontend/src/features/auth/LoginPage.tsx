import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { Form, Input, Button, message, Typography, theme, ConfigProvider, Badge } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined, RightOutlined, AndroidOutlined } from '@ant-design/icons';
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
                    if (data.user.organization.parent) {
                        localStorage.setItem('user_org_parent_id', data.user.organization.parent.id);
                        localStorage.setItem('user_org_parent_name', data.user.organization.parent.name);
                    } else {
                        localStorage.removeItem('user_org_parent_id');
                        localStorage.removeItem('user_org_parent_name');
                    }

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
                    flex: '0 0 50%',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '80px',
                    boxShadow: '20px 0 60px rgba(0,0,0,0.5)',
                    borderRight: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {/* Animated Background Shapes - More Dynamic */}
                    <div style={{
                        position: 'absolute',
                        top: '-20%', left: '-20%',
                        width: '140%', height: '140%',
                        background: 'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.4) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.4) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 60%)',
                        animation: 'float 25s ease-in-out infinite alternate',
                        zIndex: 0,
                        filter: 'blur(60px)'
                    }} />

                    {/* Tech Grid Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        zIndex: 0
                    }} />

                    <style>{`
                        @keyframes float {
                            0% { transform: translate(0, 0) scale(1); }
                            50% { transform: translate(40px, -40px) scale(1.1); }
                            100% { transform: translate(-20px, 20px) scale(1); }
                        }
                        @keyframes glow {
                            0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
                            50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.7); }
                        }
                        @keyframes slideUp {
                            from { opacity: 0; transform: translateY(30px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes hue {
                            from { filter: hue-rotate(0deg); }
                            to { filter: hue-rotate(360deg); }
                        }
                        .login-left-panel > * {
                            animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                        }
                    `}</style>

                    <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '64px', height: '64px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '32px',
                            boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
                            animation: 'glow 4s ease-in-out infinite'
                        }}>
                            <MedicineBoxOutlined />
                        </div>
                        <div>
                            <Text style={{
                                color: '#fff',
                                fontSize: '24px',
                                fontWeight: 300,
                                letterSpacing: '4px',
                                display: 'block',
                                marginBottom: '-5px'
                            }}>
                                SMART
                            </Text>
                            <Text style={{
                                color: '#fff',
                                fontSize: '32px',
                                fontWeight: 900,
                                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                SES
                            </Text>
                        </div>
                    </div>

                    <div style={{ zIndex: 1, maxWidth: '600px', margin: '60px 0' }}>
                        <Title level={1} style={{
                            color: '#fff',
                            fontSize: '52px',
                            lineHeight: '1.1',
                            fontWeight: 900,
                            marginBottom: '32px',
                            letterSpacing: '-1px'
                        }}>
                            {t('auth.slogan_part1', 'Aholining salomatligi')} — <br />
                            <span style={{
                                background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                animation: 'hue 10s infinite linear'
                            }}>{t('auth.slogan_part2', 'bizning ustuvor vazifamiz')}</span>
                        </Title>
                        <Text style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '20px',
                            lineHeight: '1.6',
                            display: 'block',
                            maxWidth: '480px',
                            fontWeight: 300
                        }}>
                            {t('auth.description', 'Toshkent viloyati Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi boshqarmasi yagona monitoring tizimi.')}
                        </Text>

                        {/* Feature Cards Instead of Pills */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '48px' }}>
                            {[
                                { text: '🔒 Xavfsiz', desc: 'Secure Data' },
                                { text: '⚡ Tez', desc: 'Real-time' },
                                { text: '📊 Samarali', desc: 'Insightful' }
                            ].map((feature, i) => (
                                <div key={i} style={{
                                    padding: '20px',
                                    background: 'rgba(255,255,255,0.05)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s ease'
                                }} onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                }} onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}>
                                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{feature.text}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{feature.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ zIndex: 1 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', letterSpacing: '1px' }}>
                            DEVELOPED BY <span style={{ color: '#fff', fontWeight: 600 }}>ADVANCED ANALYTICS</span> © {new Date().getFullYear()}
                        </Text>
                    </div>
                </div>

                {/* Right Side - Premium Hybrid Panel */}
                <div className="login-right-panel" style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0f172a',
                    backgroundImage: 'radial-gradient(at 50% 50%, rgba(30, 41, 59, 1) 0%, rgba(15, 23, 42, 1) 100%)',
                    position: 'relative',
                    padding: '40px'
                }}>
                    {/* Floating Glows */}
                    <div style={{
                        position: 'absolute',
                        top: '20%', right: '10%',
                        width: '400px', height: '400px',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }} />

                    <div style={{
                        width: '100%',
                        maxWidth: '480px',
                        padding: '60px',
                        background: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(40px) saturate(180%)',
                        borderRadius: '32px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{ marginBottom: '48px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <Badge status="processing" text={<span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>System Online</span>} />
                                <LanguageSwitcher />
                            </div>
                            <Title level={2} style={{
                                color: '#fff',
                                marginBottom: '12px',
                                fontWeight: 800,
                                fontSize: '36px',
                                letterSpacing: '-0.5px'
                            }}>
                                {t('auth.welcome_title', 'Xush kelibsiz')}
                            </Title>
                            <Text style={{ fontSize: '18px', color: '#94a3b8', fontWeight: 400 }}>{t('auth.welcome_subtitle', 'Hisobingizga kiring')}</Text>
                        </div>

                        <Form
                            name="login_premium"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                            requiredMark={false}
                        >
                            <Form.Item
                                label={<span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('user.username')}</span>}
                                name="username"
                                rules={[{ required: true, message: t('auth.username_required', 'Iltimos, loginingizni kiriting') }]}
                            >
                                <Input
                                    placeholder="admin"
                                    prefix={<UserOutlined style={{ color: '#6366f1' }} />}
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        fontSize: '16px',
                                        color: '#fff',
                                        height: '60px',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('user.password')}</span>}
                                name="password"
                                rules={[{ required: true, message: t('auth.password_required', 'Iltimos, parolingizni kiriting') }]}
                            >
                                <Input.Password
                                    placeholder="••••••••"
                                    prefix={<LockOutlined style={{ color: '#6366f1' }} />}
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        fontSize: '16px',
                                        color: '#fff',
                                        height: '60px',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </Form.Item>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px', marginTop: '-8px' }}>
                                <Link href="#" style={{
                                    color: '#818cf8',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease'
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
                                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                        border: 'none',
                                        height: '64px',
                                        borderRadius: '16px',
                                        fontSize: '18px',
                                        fontWeight: 800,
                                        boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {t('auth.login_btn', 'Tizimga kirish')}
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{ marginTop: '32px', textAlign: 'center' }}>
                            <Button
                                type="default"
                                icon={<AndroidOutlined />}
                                href={`${API_BASE_URL}/updates/download`}
                                target="_blank"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#94a3b8',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    height: '54px',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.color = '#94a3b8';
                                }}
                            >
                                {t('auth.download_app', 'Mobil ilovani yuklab olish')}
                            </Button>
                        </div>

                        <div style={{ marginTop: '16px', textAlign: 'center' }}>
                            <Button
                                type="link"
                                onClick={() => navigate('/register')}
                                style={{
                                    color: '#94a3b8',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {t('auth.create_account', 'Yangi hisob yaratish')}
                            </Button>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '32px' }}>
                            <Text style={{ color: '#64748b', fontSize: '14px' }}>
                                Technical Support: <Link style={{ color: '#94a3b8' }}>+998 (71) 276-XX-XX</Link>
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default LoginPage;

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 * 
 * import React, { useState } from 'react';
 * import { API_BASE_URL } from '../../config';
 * import { Form, Input, Button, message, Typography, theme, ConfigProvider } from 'antd';
 * import { UserOutlined, LockOutlined, MedicineBoxOutlined, RightOutlined } from '@ant-design/icons';
 * import { useNavigate } from 'react-router-dom';
 * import { useTranslation } from 'react-i18next';
 * import LanguageSwitcher from '../../components/LanguageSwitcher';
 * 
 * const { Title, Text, Link } = Typography;
 * 
 * const LoginPage: React.FC = () => {
 *     const [loading, setLoading] = useState(false);
 *     const navigate = useNavigate();
 *     const { token } = theme.useToken();
 *     const { t } = useTranslation();
 * 
 *     const onFinish = async (values: any) => {
 *         setLoading(true);
 *         try {
 *             const response = await fetch(`${API_BASE_URL}/auth/login`, {
 *                 method: 'POST',
 *                 headers: {
 *                     'Content-Type': 'application/json',
 *                 },
 *                 body: JSON.stringify(values),
 *             });
 * 
 *             const data = await response.json();
 * 
 *             if (response.ok) {
 *                 localStorage.setItem('access_token', data.access_token);
 *                 localStorage.setItem('user_role', data.user.role);
 *                 localStorage.setItem('username', data.user.username);
 *                 const firstName = data.user.firstName;
 *                 const lastName = data.user.lastName;
 *                 const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : (data.user.fullName || data.user.username);
 * 
 *                 localStorage.setItem('user_full_name', fullName);
 *                 if (data.user.organization) {
 *                     localStorage.setItem('user_org_id', data.user.organization.id);
 *                     localStorage.setItem('user_org_name', data.user.organization.name);
 *                     const level = data.user.organization.parent ? '3' : '2';
 *                     localStorage.setItem('user_level', level);
 *                 }
 * 
 *                 const deptPerms = data.user.department?.permissions?.map((dp: any) => dp.permission.code) || [];
 *                 localStorage.setItem('user_dept_permissions', JSON.stringify(deptPerms));
 * 
 *                 if (data.user.dynamicRole && data.user.dynamicRole.rolePermissions) {
 *                     localStorage.setItem('user_role_permissions', JSON.stringify(data.user.dynamicRole.rolePermissions));
 *                 } else {
 *                     localStorage.removeItem('user_role_permissions');
 *                 }
 * 
 *                 localStorage.setItem('user_permissions', JSON.stringify(deptPerms));
 * 
 *                 if (data.user.department) {
 *                     localStorage.setItem('user_department_name', data.user.department.name);
 *                 }
 * 
 *                 message.success(t('auth.success_login', 'Xush kelibsiz!'));
 *                 navigate('/dashboard');
 *             } else {
 *                 message.error(data.message || t('auth.error_login', 'Login yoki parol noto\'g\'ri'));
 *             }
 *         } catch (error) {
 *             console.error('Login error:', error);
 *             message.error(t('auth.error_system', 'Tizimga ulanishda xatolik yuz berdi'));
 *         } finally {
 *             setLoading(false);
 *         }
 *     };
 * 
 *     return (
 *         <ConfigProvider
 *             theme={{
 *                 components: {
 *                     Input: {
 *                         controlHeight: 50,
 *                         borderRadius: 8,
 *                         colorBorder: '#d9d9d9',
 *                         hoverBorderColor: token.colorPrimary,
 *                         activeBorderColor: token.colorPrimary,
 *                     },
 *                     Button: {
 *                         controlHeight: 50,
 *                         borderRadius: 8,
 *                         fontSize: 16,
 *                         fontWeight: 600,
 *                     }
 *                 }
 *             }}
 *         >
 *             <style>
 *                 {\`
 *                     @media (max-width: 768px) {
 *                         .login-container {
 *                             flex-direction: column !important;
 *                         }
 *                         .login-left-panel {
 *                             flex: none !important;
 *                             width: 100% !important;
 *                             padding: 40px 20px !important;
 *                         }
 *                         .login-left-panel h1 {
 *                             font-size: 28px !important;
 *                         }
 *                         .login-right-panel {
 *                             padding: 20px !important;
 *                         }
 *                     }
 *                 \`}
 *             </style>
 *             <div className="login-container" style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'Inter, sans-serif' }}>
 *                 <div className="login-left-panel" style={{
 *                     flex: '0 0 45%',
 *                     background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
 *                     position: 'relative',
 *                     overflow: 'hidden',
 *                     display: 'flex',
 *                     flexDirection: 'column',
 *                     justifyContent: 'space-between',
 *                     padding: '60px',
 *                     boxShadow: '20px 0 60px rgba(0,0,0,0.3)'
 *                 }}>
 *                     <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
 *                         <div style={{
 *                             width: '50px', height: '50px',
 *                             background: 'linear-gradient(135deg, #fff 0%, #e0e7ff 100%)',
 *                             borderRadius: '12px',
 *                             display: 'flex', alignItems: 'center', justifyContent: 'center',
 *                             color: '#1e3c72', fontSize: '24px',
 *                         }}>
 *                             <MedicineBoxOutlined />
 *                         </div>
 *                         <Text style={{ color: '#fff', fontSize: '20px', fontWeight: 600, letterSpacing: '1.5px' }}>
 *                             SMART <span style={{ fontWeight: 800 }}>SES</span>
 *                         </Text>
 *                     </div>
 *                     <div style={{ zIndex: 1, maxWidth: '500px', margin: '40px 0' }}>
 *                         <Title level={1} style={{ color: '#fff', fontSize: '42px', lineHeight: '1.2', fontWeight: 800, marginBottom: '24px', margin: 0 }}>
 *                             {t('auth.slogan_part1', 'Aholining salomatligi')} — <br />
 *                             <span style={{ color: '#60a5fa' }}>{t('auth.slogan_part2', 'bizning ustuvor vazifamiz')}</span>
 *                         </Title>
 *                         <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '17px', lineHeight: '1.7', display: 'block', maxWidth: '450px', marginTop: '24px' }}>
 *                             {t('auth.description', 'Toshkent viloyati Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi boshqarmasi yagona monitoring tizimi.')}
 *                         </Text>
 *                     </div>
 *                     <div style={{ zIndex: 1 }}>
 *                         <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
 *                             © {new Date().getFullYear()} {t('common.app_name')}. {t('auth.footer_text', 'Barcha huquqlar himoyalangan.')}
 *                         </Text>
 *                     </div>
 *                 </div>
 *                 <div className="login-right-panel" style={{
 *                     flex: 1,
 *                     display: 'flex',
 *                     alignItems: 'center',
 *                     justifyContent: 'center',
 *                     background: '#fff',
 *                     position: 'relative'
 *                 }}>
 *                     <div style={{ width: '100%', maxWidth: '440px', padding: '50px' }}>
 *                         <div style={{ marginBottom: '40px' }}>
 *                             <Title level={2} style={{ color: '#1f1f1f', marginBottom: '8px', fontWeight: 800, fontSize: '32px' }}>
 *                                 {t('auth.welcome_title', 'Xush kelibsiz')} 👋
 *                             </Title>
 *                             <Text type="secondary" style={{ fontSize: '16px' }}>{t('auth.welcome_subtitle', 'Hisobingizga kiring')}</Text>
 *                         </div>
 *                         <Form name="login" onFinish={onFinish} layout="vertical" size="large">
 *                             <Form.Item
 *                                 label={t('user.username')}
 *                                 name="username"
 *                                 rules={[{ required: true, message: t('auth.username_required') }]}
 *                             >
 *                                 <Input prefix={<UserOutlined />} />
 *                             </Form.Item>
 *                             <Form.Item
 *                                 label={t('user.password')}
 *                                 name="password"
 *                                 rules={[{ required: true, message: t('auth.password_required') }]}
 *                             >
 *                                 <Input.Password prefix={<LockOutlined />} />
 *                             </Form.Item>
 *                             <Form.Item>
 *                                 <Button type="primary" htmlType="submit" loading={loading} block>
 *                                     {t('auth.login_btn', 'Kirish')}
 *                                 </Button>
 *                             </Form.Item>
 *                         </Form>
 *                     </div>
 *                 </div>
 *             </div>
 *         </ConfigProvider>
 *     );
 * };
 */
