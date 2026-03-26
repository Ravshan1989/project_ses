import React, { useState, useEffect } from 'react';
import { Button, Space, Switch, Typography } from 'antd';
import { ClockCircleOutlined, AndroidOutlined, SettingOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Dropdown, MenuProps } from 'antd';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../../features/auth/ChangePasswordModal';

import dayjs from 'dayjs';


const { Title, Text } = Typography;

interface GlassLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    headerButtons?: React.ReactNode;
}

const GlassLayout: React.FC<GlassLayoutProps> = ({ children, title, subtitle, headerButtons }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('isDarkMode');
        return saved === 'true';
    });
    const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('isDarkMode', isDarkMode.toString());
    }, [isDarkMode]);

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        if (e.key === 'changePassword') {
            setIsPwdModalOpen(true);
        } else if (e.key === 'logout') {
            localStorage.clear();
            navigate('/login');
        }
    };
    
    const userMenuItems: MenuProps['items'] = [
        {
            key: 'changePassword',
            icon: <SettingOutlined />,
            label: 'Parolni o\'zgartirish',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined style={{ color: 'red' }}/>,
            label: <span style={{ color: 'red' }}>Chiqish</span>,
        },
    ];

    const globalStyles = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(22, 119, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(22, 119, 255, 0); }
        }
        .dashboard-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 24px;
            font-family: 'Inter', sans-serif;
            transition: all 0.5s ease;
        }
        .dashboard-container.dark-mode {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
            transition: all 0.3s ease;
        }
        .dashboard-container.dark-mode .glass-card {
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #fff;
            backdrop-filter: blur(16px);
        }
        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.15);
        }
        .dashboard-container.dark-mode .glass-card:hover {
            box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.5);
        }
        
        .stat-card-gradient-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .stat-card-gradient-2 { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; }
        .stat-card-gradient-3 { background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%); color: white; }
        .stat-card-gradient-4 { background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%); color: white; }
        
        .animate-fade-in {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-delay-1 { animation-delay: 0.1s; }
        .animate-delay-2 { animation-delay: 0.2s; }
        .animate-delay-3 { animation-delay: 0.3s; }
        .animate-delay-4 { animation-delay: 0.4s; }

        /* Dark Mode Text Overrides - Targeting Ant Design Classes */
        .dashboard-container.dark-mode .ant-typography { color: rgba(255, 255, 255, 0.95); }
        .dashboard-container.dark-mode .ant-typography-secondary { color: rgba(255, 255, 255, 0.7); }
        .dashboard-container.dark-mode .ant-table { background: transparent; color: #fff; }
        .dashboard-container.dark-mode .ant-table-thead > tr > th { background: rgba(0,0,0,0.3) !important; color: #fff !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; }
        .dashboard-container.dark-mode .ant-table-tbody > tr > td { border-bottom: 1px solid rgba(255,255,255,0.05) !important; color: rgba(255,255,255,0.85) !important; }
        .dashboard-container.dark-mode .ant-table-tbody > tr:hover > td { background: rgba(255,255,255,0.1) !important; }
        .dashboard-container.dark-mode .ant-pagination-item a { color: #fff; }
        .dashboard-container.dark-mode .ant-pagination-item-active { background: transparent; border-color: #11998e; }
        .dashboard-container.dark-mode .ant-pagination-item-active a { color: #11998e; }
        .dashboard-container.dark-mode .ant-select-selector { background: rgba(255,255,255,0.1) !important; color: #fff !important; border: none !important; }
        .dashboard-container.dark-mode .ant-select-arrow { color: rgba(255,255,255,0.5); }
        .dashboard-container.dark-mode .ant-input-affix-wrapper { background: rgba(255,255,255,0.1) !important; border: none !important; }
        .dashboard-container.dark-mode input { color: #fff !important; }
        .dashboard-container.dark-mode .ant-picker { background: rgba(255,255,255,0.1) !important; border: none !important; }
        .dashboard-container.dark-mode .ant-picker-input > input { color: #fff !important; }
        .dashboard-container.dark-mode .ant-picker-suffix { color: rgba(255,255,255,0.5); }
    `;

    return (
        <div className={`dashboard-container ${isDarkMode ? 'dark-mode' : ''}`}>
            <style>{globalStyles}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }} className="animate-fade-in glass-header">
                <div>
                    {title && (
                        <Title level={2} style={{ margin: 0, background: 'linear-gradient(45deg, #11998e, #38ef7d)', WebkitBackgroundClip: isDarkMode ? 'text' : 'text', WebkitTextFillColor: isDarkMode ? 'transparent' : 'transparent', fontWeight: 800, color: isDarkMode ? '#fff' : undefined }}>
                            {title}
                        </Title>
                    )}
                    {subtitle && (
                        <Text type="secondary" style={{ fontSize: '16px' }}>{subtitle}</Text>
                    )}
                </div>
                <div className="glass-header-actions">
                    <Space size="small" wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
                        {headerButtons}
                        <Switch
                            checkedChildren="🌙"
                            unCheckedChildren="☀"
                            checked={isDarkMode}
                            onChange={setIsDarkMode}
                            style={{ background: isDarkMode ? '#11998e' : '#ccc' }}
                        />
                        <Button 
                            type="default" 
                            shape="round" 
                            icon={<AndroidOutlined />} 
                            size="large"
                            href={API_BASE_URL.startsWith('http') ? `${API_BASE_URL}/updates/download` : `https://project-ses.onrender.com/api/v1/updates/download`}
                            target="_blank"
                            style={{ background: 'rgba(255,255,255,0.1)', color: isDarkMode ? '#fff' : '#000', border: '1px solid rgba(255,255,255,0.3)' }}
                        >
                            Mobil ilova
                        </Button>
                        <Button type="primary" shape="round" icon={<ClockCircleOutlined />} size="large" style={{ background: '#11998e', border: 'none' }}>
                            {dayjs().format('DD.MM.YYYY HH:mm')}
                        </Button>
                        <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} trigger={['click']} placement="bottomRight">
                            <Button shape="circle" size="large" icon={<UserOutlined />} style={{ background: 'rgba(255,255,255,0.1)', color: isDarkMode ? '#fff' : '#000', border: '1px solid rgba(255,255,255,0.3)', marginLeft: '8px' }} />
                        </Dropdown>

                    </Space>
                </div>
            </div>

            <LayoutContext.Provider value={{ isDarkMode }}>
                {children}
            </LayoutContext.Provider>
            <ChangePasswordModal open={isPwdModalOpen} onClose={() => setIsPwdModalOpen(false)} />
        </div>
    );
};



export const LayoutContext = React.createContext({ isDarkMode: false });

export default GlassLayout;
