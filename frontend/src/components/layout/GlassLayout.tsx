import React, { useState, useEffect } from 'react';
import { Button, Space, Switch, Typography, Layout } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Content } = Layout;

interface GlassLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    headerButtons?: React.ReactNode;
}

const GlassLayout: React.FC<GlassLayoutProps> = ({ children, title, subtitle, headerButtons }) => {
    const { t } = useTranslation();
    // Initialize dark mode from localStorage if available, else false
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('isDarkMode');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('isDarkMode', isDarkMode.toString());
    }, [isDarkMode]);

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
            background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
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
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }} className="animate-fade-in">
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
                <Space>
                    {headerButtons}
                    <Switch
                        checkedChildren="🌙"
                        unCheckedChildren="☀"
                        checked={isDarkMode}
                        onChange={setIsDarkMode}
                        style={{ background: isDarkMode ? '#11998e' : '#ccc' }}
                    />
                    <Button type="primary" shape="round" icon={<ClockCircleOutlined />} size="large" style={{ background: '#11998e', border: 'none' }}>
                        {dayjs().format('DD.MM.YYYY HH:mm')}
                    </Button>
                </Space>
            </div>

            {/* Pass isDarkMode to children via props if they need it, or they can rely on CSS classes */}
            {/* For charts that need explicit theme config, we might need a Context, but for now we'll assume children handle it via CSS or we can use a simple prop pattern later if needed. 
                Actually, charts need 'isDarkMode' prop. We can cloneElement or use Context. 
                For simplicity, let's export a hook or context later. 
                For now, let's just render children. If children need isDarkMode JS variable (like Charts), they can't get it easily without Context.
                
                Let's export a Context so children can use it.
            */}
            <LayoutContext.Provider value={{ isDarkMode }}>
                {children}
            </LayoutContext.Provider>
        </div>
    );
};

export const LayoutContext = React.createContext({ isDarkMode: false });

export default GlassLayout;
