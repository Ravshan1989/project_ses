import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppstoreOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const MobileBottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const tabs = [
        {
            key: '/dashboard',
            icon: <AppstoreOutlined style={{ fontSize: '20px' }} />,
            label: t('common.dashboard'),
        },
        {
            key: '/reports', // navigate to a reports list page or history
            icon: <FileTextOutlined style={{ fontSize: '20px' }} />,
            label: t('common.reports'),
        },
        {
            key: '/profile', // navigate to profile
            icon: <UserOutlined style={{ fontSize: '20px' }} />,
            label: t('user.profile'),
        },
    ];

    return (
        <div className="mobile-only" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'rgba(30, 41, 59, 0.95)', // Slate-800 with opacity
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 1000,
            paddingBottom: 'safe-area-inset-bottom'
        }}>
            {tabs.map(tab => {
                const isActive = location.pathname === tab.key;
                return (
                    <div
                        key={tab.key}
                        onClick={() => navigate(tab.key)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? '#38bdf8' : '#94a3b8',
                            cursor: 'pointer',
                            flex: 1,
                            height: '100%'
                        }}
                    >
                        {tab.icon}
                        <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: isActive ? 600 : 400 }}>
                            {tab.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default MobileBottomNav;
