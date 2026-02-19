import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
import { RightOutlined, MedicineBoxOutlined, AlertOutlined, SafetyCertificateOutlined, ExperimentOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import GlassLayout from '../../components/layout/GlassLayout';

const { Text } = Typography;

const MobileReportsPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const reportTypes = [
        {
            id: 'flu',
            path: '/daily-flu', // Or /disease-entry?type=flu if using query params
            title: t('reports.flu'), // "Gripp va O'RVI"
            icon: <MedicineBoxOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
            color: '#e6f4ff'
        },
        {
            id: 'ari',
            path: '/daily-ari',
            title: t('reports.ari'),
            icon: <MedicineBoxOutlined style={{ fontSize: '24px', color: '#0ea5e9' }} />,
            color: '#f0f9ff'
        },
        {
            id: 'covid',
            path: '/daily-covid',
            title: t('reports.covid'),
            icon: <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
            color: '#f6ffed'
        },
        {
            id: 'hepatitis',
            path: '/daily-reports',
            title: t('reports.daily_hepatitis'),
            icon: <ExperimentOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
            color: '#f9f0ff'
        },
        {
            id: 'epidemiology',
            path: '/daily-epidemiology',
            title: t('reports.epidemiology'),
            icon: <FileTextOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
            color: '#fffbe6'
        },
        {
            id: 'diarrhea',
            path: '/daily-diarrhea',
            title: t('reports.diarrhea'),
            icon: <AlertOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />,
            color: '#eff6ff'
        },
    ];

    return (
        <GlassLayout title={t('common.reports')}>
            <div style={{ paddingBottom: '60px' }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
                    {t('common.select_report_type')}
                </Text>

                {reportTypes.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            padding: '16px',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: item.color,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: '16px'
                        }}>
                            {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <Text strong style={{ fontSize: '15px', color: '#1e293b', display: 'block' }}>
                                {item.title}
                            </Text>
                        </div>
                        <RightOutlined style={{ color: '#94a3b8' }} />
                    </div>
                ))}
            </div>
        </GlassLayout>
    );
};

export default MobileReportsPage;
