import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, ConfigProvider, Typography } from 'antd';
import {
    MedicineBoxOutlined,
    DashboardOutlined,
    BarChartOutlined,
    SettingOutlined,
    LogoutOutlined,
    FileTextOutlined,
    ClusterOutlined,
    TeamOutlined,
    UserOutlined,
    AlertOutlined,
    BellOutlined
} from '@ant-design/icons';
import RoleManagementPage from './features/admin/RoleManagementPage';
import UserManagementPage from './features/admin/UserManagementPage';
import { EyeOutlined, DownloadOutlined, SaveOutlined } from '@ant-design/icons';
import DashboardPage from './features/dashboard/DashboardPage';
import DiseaseEntryPage from './features/disease/DiseaseEntryPage';
import Form1EntryPage from './features/submission/Form1EntryPage';
import DiseaseManagerPage from './features/admin/DiseaseManagerPage';
import DailyHepatitisPage from './features/disease/DailyHepatitisPage';
import Form1StatusPage from './features/submission/Form1StatusPage';
import FluDailyReportPage from './features/disease/FluDailyReportPage';
import AriDailyReportPage from './features/disease/AriDailyReportPage';
import EpidemiologyDailyReportPage from './features/disease/EpidemiologyDailyReportPage';
import WeeklyFluReportPage from './features/disease/WeeklyFluReportPage';
import CovidDailyReportPage from './features/disease/CovidDailyReportPage';
import DailyReportUnifiedPage from './features/disease/unified/DailyReportUnifiedPage';
import DailyDiarrheaPage from './features/disease/DailyDiarrheaPage';
import SanitaryDailyReportPage from './features/disease/SanitaryDailyReportPage';
import AnalysisDashboard from './features/analysis/AnalysisDashboard';
import GlobalMonitoringPage from './features/analysis/GlobalMonitoringPage';
import LoginPage from './features/auth/LoginPage';
import ExportPage from './features/export/ExportPage';
import ImportPage from './features/import/ImportPage';
import DepartmentManagementPage from './features/admin/DepartmentManagementPage';
import SosAlertPage from './features/sos/SosAlertPage';
import SosModal from './features/sos/SosModal';
import VerificationPage from './features/verify/VerificationPage';
import DashboardExecutivePage from './features/dashboard/DashboardExecutivePage';
import RegisterPage from './features/auth/RegisterPage';
import { AdminUsersPage } from './features/admin/AdminUsersPage';
import MobileReportsPage from './features/mobile/MobileReportsPage';
import KommunalGigiyenaWaterPage from './features/kommunal-hygiene/KommunalGigiyenaWaterPage';


const { Header, Content, Footer } = Layout;
const { Text } = Typography;

import LanguageSwitcher from './components/LanguageSwitcher';
import MobileBottomNav from './components/layout/MobileBottomNav';
import { useTranslation } from 'react-i18next';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = React.useState(false);
    const [sosVisible, setSosVisible] = React.useState(false);
    const { t } = useTranslation();

    const userRole = localStorage.getItem('user_role');

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        navigate('/login');
    };

    const hasRole = (allowedRoles: string[]) => {
        if (!userRole) return false;
        if (userRole === 'ADMIN') return true;
        return allowedRoles.includes(userRole);
    };

    const isAdmin = userRole === 'ADMIN';
    const isRepublic = userRole === 'REPUBLIC_HEAD';
    const isHR = userRole === 'HR';

    const isRegionHeadOnly = userRole === 'REGION_HEAD';

    const menuItems: any[] = ([
        ...(!isRegionHeadOnly ? [{
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: t('common.dashboard'),
            onClick: () => navigate('/dashboard')
        }] : []),
        ...(hasRole(['REPUBLIC_HEAD', 'REGION_HEAD']) ? [{
            key: '/dashboard/executive',
            icon: <BarChartOutlined />,
            label: t('executive.title'),
            onClick: () => navigate('/dashboard/executive')
        }] : []),
        ...(hasRole(['DISTRICT_HEAD', 'STAFF']) ? [{
            key: '/disease-entry',
            icon: <MedicineBoxOutlined />,
            label: t('common.vaccination_entry'),
            onClick: () => navigate('/disease-entry')
        }] : []),
        ...(hasRole(['REPUBLIC_HEAD', 'REGION_HEAD', 'DISTRICT_HEAD', 'DEPARTMENT_HEAD', 'LAB_HEAD', 'EPIDEMIOLOGIST', 'EPIDEMIOLOGIST_ASSISTANT', 'STAFF']) && !isRegionHeadOnly ? [{
            key: 'grp_reports',
            icon: <FileTextOutlined />,
            label: t('common.reports'),
            children: [
                {
                    key: 'sub_daily',
                    label: t('reports.daily_menu'),
                    children: [
                        { key: '/daily-reports', label: t('reports.daily_hepatitis'), onClick: () => navigate('/daily-reports') },
                        { key: '/daily-flu', label: t('reports.flu'), onClick: () => navigate('/daily-flu') },
                        { key: '/daily-ari', label: t('reports.ari'), onClick: () => navigate('/daily-ari') },
                        { key: '/daily-covid', label: t('reports.covid'), onClick: () => navigate('/daily-covid') },
                        { key: '/daily-diarrhea', label: t('reports.diarrhea'), onClick: () => navigate('/daily-diarrhea') },
                        { key: '/daily-epidemiology', label: t('reports.epidemiology'), onClick: () => navigate('/daily-epidemiology') },
                        {
                            key: '/daily-unified',
                            label: t('reports.unified'),
                            onClick: () => navigate('/daily-unified'),
                            icon: <SaveOutlined style={{ color: '#1890ff' }} />
                        },
                        { key: '/weekly-flu', label: t('reports.weekly_flu'), onClick: () => navigate('/weekly-flu') },
                    ]
                },
                {
                    key: 'sub_monthly',
                    label: t('reports.monthly_menu'),
                    children: [
                        { key: '/form-1', label: t('reports.form1'), onClick: () => navigate('/form-1') },
                    ]
                }
            ]
        }] : []),
        ...(hasRole(['SANITARY_HEAD', 'SANITARY_SPECIALIST', 'SANITARY_OPERATOR']) ? [{
            key: 'grp_sanitary',
            icon: <ClusterOutlined />,
            label: t('common.sanitary_menu') || 'Sanitariya',
            children: [
                {
                    key: 'sub_sanitary_daily',
                    label: t('reports.daily_menu'),
                    children: [
                        { key: '/daily-sanitary', label: t('reports.sanitary_daily'), onClick: () => navigate('/daily-sanitary') },
                    ]
                },
                {
                    key: 'sub_sanitary_monthly',
                    label: t('reports.monthly_reports'),
                    children: [
                        { key: '/kg-water', label: t('reports.kg_water'), onClick: () => navigate('/kg-water') },
                    ]
                }
            ]
        }] : []),
        ...(hasRole(['REPUBLIC_HEAD', 'REGION_HEAD']) ? [
            { key: '/sos-monitoring', icon: <BellOutlined />, label: t('common.sos_monitoring'), onClick: () => navigate('/sos-monitoring') }
        ] : []),
        ...(hasRole(['REPUBLIC_HEAD']) ? [
            { key: '/form1-monitoring', icon: <EyeOutlined />, label: t('reports.form1_monitoring'), onClick: () => navigate('/form1-monitoring') },
            { key: '/export', icon: <DownloadOutlined />, label: t('common.export'), onClick: () => navigate('/export') }
        ] : []),
        ...(hasRole(['REPUBLIC_HEAD', 'LAB_HEAD']) ? [{
            key: 'grp_analytics',
            icon: <BarChartOutlined />,
            label: t('common.analysis'),
            children: [
                { key: '/analysis', label: t('analysis.regional'), onClick: () => navigate('/analysis') },
                { key: '/analysis/global', label: t('analysis.global'), onClick: () => navigate('/analysis/global') }
            ]
        }] : []),
        ...((isAdmin || isRepublic || isHR) && !isRegionHeadOnly ? [{
            key: 'grp_settings',
            label: t('common.settings'),
            type: 'group' as const,
            children: [
                ...(hasRole(['REPUBLIC_HEAD']) ? [{ key: '/disease-manager', icon: <SettingOutlined />, label: t('common.diseases'), onClick: () => navigate('/disease-manager') }] : []),
                ...(isAdmin || isRepublic ? [
                    { key: '/departments', icon: <ClusterOutlined />, label: t('common.departments'), onClick: () => navigate('/departments') },
                    { key: '/roles', icon: <TeamOutlined />, label: t('common.roles_menu'), onClick: () => navigate('/roles') },
                    { key: '/users', icon: <UserOutlined />, label: t('common.users_menu'), onClick: () => navigate('/users') }
                ] : []),
                ...(isAdmin || isHR ? [
                    { key: '/admin/users-management', icon: <TeamOutlined />, label: 'Xodimlar boshqaruvi', onClick: () => navigate('/admin/users-management') }
                ] : [])
            ]
        }] : []),
        ...(!isRegionHeadOnly ? [{
            key: 'mobile_app',
            icon: <DownloadOutlined />,
            label: 'Mobil Ilova',
            onClick: () => {
                window.location.href = 'https://github.com/Ravshan1989/project_ses/releases/latest/download/app-release.apk';
            }
        }] : [])
    ]).filter(item => item !== null);


    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard': return t('dashboard_page.title');
            case '/disease-entry': return t('common.vaccination_entry');
            case '/form-1': return t('reports.form1');
            case '/disease-manager': return t('common.diseases');
            case '/users': return t('user.title');
            case '/export': return t('common.export');
            case '/import': return t('common.import');
            default: return t('common.app_name');
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Layout.Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                width={250}
                className="desktop-only hide-on-mobile"
                style={{
                    background: '#001529',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
                    zIndex: 10,
                    // FORCE HIDE ON MOBILE (Inline style beats class sometimes in Antd Sider logic)
                    display: window.innerWidth <= 768 ? 'none' : 'block'
                }}
                breakpoint="lg"
                collapsedWidth="0"
                onBreakpoint={(broken) => {
                    console.log(broken);
                }}
            >
                <div
                    style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', margin: '16px', borderRadius: 6, cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}
                >
                    <MedicineBoxOutlined style={{ color: '#fff', fontSize: '24px', marginRight: collapsed ? 0 : 10 }} />
                    {!collapsed && (
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px', letterSpacing: '1px' }}>
                            {t('common.app_name').split(' ')[0]} <span style={{ color: '#1890ff' }}>{t('common.app_name').split(' ')[1]}</span>
                        </span>
                    )}
                </div>
                <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} style={{ borderRight: 0, fontSize: '15px' }} items={menuItems} />
            </Layout.Sider>
            <Layout>
                <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,21,41,0.08)' }}>
                    <Text style={{ fontSize: '18px', fontWeight: 600, color: '#001529' }}>{getPageTitle()}</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <LanguageSwitcher />
                        <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                            <Text strong style={{ display: 'block', color: '#333' }}>
                                {localStorage.getItem('user_full_name') || localStorage.getItem('username') || t('common.user_fallback')}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {t(`user.roles.${localStorage.getItem('user_role') || 'STAFF'}`)}
                            </Text>
                        </div>
                        {hasRole(['DISTRICT_HEAD', 'STAFF']) && (
                            <Button type="primary" danger icon={<AlertOutlined />} onClick={() => setSosVisible(true)} style={{ fontWeight: 'bold' }}>
                                {t('common.sos_btn')}
                            </Button>
                        )}
                        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} danger>{t('common.logout')}</Button>
                    </div>
                </Header>
                <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}><div style={{ padding: 0, minHeight: 360 }}>{children}</div></Content>
                <SosModal visible={sosVisible} onClose={() => setSosVisible(false)} />
                <MobileBottomNav />
                <Footer style={{ textAlign: 'center', color: '#999', background: 'transparent', paddingBottom: '80px' }}>
                    {t('common.app_name')} ©{new Date().getFullYear()} {t('common.footer_org')}
                </Footer>
            </Layout>
        </Layout>
    );
};

const ProtectedRoute = ({ children }: { children: any }) => {
    const token = localStorage.getItem('access_token');
    if (!token) return <Navigate to="/login" replace />;
    return <MainLayout>{children}</MainLayout>;
};



function App() {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#0050b3',
                    borderRadius: 6,
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                },
                components: {
                    Layout: { headerBg: '#001529', bodyBg: '#f0f2f5' },
                    Button: { algorithm: true }
                }
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify/:token" element={<VerificationPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/dashboard/executive" element={<ProtectedRoute><DashboardExecutivePage /></ProtectedRoute>} />
                    <Route path="/disease-entry" element={<ProtectedRoute><DiseaseEntryPage /></ProtectedRoute>} />
                    <Route path="/form-1" element={<ProtectedRoute><Form1EntryPage /></ProtectedRoute>} />
                    <Route path="/disease-manager" element={<ProtectedRoute><DiseaseManagerPage /></ProtectedRoute>} />
                    <Route path="/daily-reports" element={<ProtectedRoute><DailyHepatitisPage /></ProtectedRoute>} />
                    <Route path="/daily-flu" element={<ProtectedRoute><FluDailyReportPage /></ProtectedRoute>} />
                    <Route path="/daily-ari" element={<ProtectedRoute><AriDailyReportPage /></ProtectedRoute>} />
                    <Route path="/daily-epidemiology" element={<ProtectedRoute><EpidemiologyDailyReportPage /></ProtectedRoute>} />
                    <Route path="/weekly-flu" element={<ProtectedRoute><WeeklyFluReportPage /></ProtectedRoute>} />
                    <Route path="/daily-covid" element={<ProtectedRoute><CovidDailyReportPage /></ProtectedRoute>} />
                    <Route path="/daily-diarrhea" element={<ProtectedRoute><DailyDiarrheaPage /></ProtectedRoute>} />
                    <Route path="/daily-sanitary" element={<ProtectedRoute><SanitaryDailyReportPage /></ProtectedRoute>} />
                    <Route path="/kg-water" element={<ProtectedRoute><KommunalGigiyenaWaterPage /></ProtectedRoute>} />

                    <Route path="/daily-unified" element={<ProtectedRoute><DailyReportUnifiedPage /></ProtectedRoute>} />
                    <Route path="/form1-monitoring" element={<ProtectedRoute><Form1StatusPage /></ProtectedRoute>} />
                    <Route path="/export" element={<ProtectedRoute><ExportPage /></ProtectedRoute>} />
                    <Route path="/import" element={<ProtectedRoute><ImportPage /></ProtectedRoute>} />
                    <Route path="/analysis" element={<ProtectedRoute><AnalysisDashboard /></ProtectedRoute>} />
                    <Route path="/analysis/global" element={<ProtectedRoute><GlobalMonitoringPage /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><MobileReportsPage /></ProtectedRoute>} />
                    <Route path="/sos-monitoring" element={<ProtectedRoute><SosAlertPage /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
                    <Route path="/departments" element={<ProtectedRoute><DepartmentManagementPage /></ProtectedRoute>} />
                    <Route path="/roles" element={<ProtectedRoute><RoleManagementPage /></ProtectedRoute>} />
                    <Route path="/admin/users-management" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </ConfigProvider>
    );
}

export default App;
