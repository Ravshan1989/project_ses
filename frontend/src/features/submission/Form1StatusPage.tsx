import React, { useState, useEffect } from 'react';
import { Card, Typography, DatePicker, Row, Col, Badge, Space, Empty, Spin } from 'antd';
import { CheckCircleFilled, ClockCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { organizationsApi, submissionApi } from '../../services/api';

const { Text } = Typography;

interface OrgStatus {
    organizationId: string;
    organizationName: string;
    status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    submissionId?: string;
}

import GlassLayout from '../../components/layout/GlassLayout';

const Form1StatusPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs().subtract(1, 'month')); // Default to last month
    const [statuses, setStatuses] = useState<OrgStatus[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const orgRes = await organizationsApi.getAll();
            const orgs = (orgRes.data || []).filter((org: any) => !!org.parent);

            const periodStr = date.startOf('month').format('YYYY-MM-DD');
            const statusRes = await submissionApi.getStatusSummary('FORM1', periodStr);
            const statusData = statusRes.data || [];

            const merged = orgs.map((org: any) => {
                const s = statusData.find((sd: any) => sd.organizationId === org.id);
                return {
                    organizationId: org.id,
                    organizationName: org.name,
                    status: s?.status,
                    submissionId: s?.submissionId
                };
            });

            setStatuses(merged);
        } catch (error) {
            console.error("Failed to fetch status summary", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status?: string) => {
        switch (status) {
            case 'APPROVED': return { color: '#389e0d', icon: <CheckCircleFilled />, text: 'Tasdiqlangan', bg: 'linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)', border: '#b7eb8f' };
            case 'SUBMITTED': return { color: '#096dd9', icon: <ClockCircleFilled />, text: 'Topshirilgan', bg: 'linear-gradient(135deg, #e6f7ff 0%, #91d5ff 100%)', border: '#91d5ff' };
            case 'REJECTED': return { color: '#cf1322', icon: <ExclamationCircleFilled />, text: 'Rad etilgan', bg: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)', border: '#ffccc7' };
            case 'DRAFT': return { color: '#d48806', icon: <ClockCircleFilled />, text: 'Qoralama', bg: 'linear-gradient(135deg, #fffbe6 0%, #ffe58f 100%)', border: '#ffe58f' };
            default: return { color: '#8c8c8c', icon: <ExclamationCircleFilled />, text: 'Topshirilmagan', bg: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)', border: '#d9d9d9' };
        }
    };

    const headerControls = (
        <DatePicker
            picker="month"
            value={date}
            onChange={(d) => d && setDate(d)}
            format="MMMM YYYY"
            allowClear={false}
            style={{ width: 220 }}
            size="large"
            className="glass-input"
        />
    );

    return (
        <GlassLayout
            title={t('monitoring.title') || 'Shakl 1: Monitoring'}
            subtitle={`${date.format('MMMM YYYY')} oyi bo'yicha hisobotlar holati`}
            headerButtons={headerControls}
        >
            <style>{`
                .monitoring-card {
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .monitoring-card:hover {
                    transform: translateY(-8px) scale(1.02);
                }
                .status-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    display: inline-block;
                    position: relative;
                }
                .status-dot::after {
                    content: '';
                    position: absolute;
                    top: -4px; right: -4px; bottom: -4px; left: -4px;
                    border-radius: 50%;
                    border: 1px solid currentColor;
                    opacity: 0.5;
                    animation: ripple 1.5s infinite;
                }
                @keyframes ripple {
                    0% { transform: scale(0.8); opacity: 1; }
                    100% { transform: scale(2.4); opacity: 0; }
                }
            `}</style>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
            ) : statuses.length === 0 ? (
                <Empty description="Ma'lumotlar topilmadi" />
            ) : (
                <Row gutter={[24, 24]}>
                    {statuses.map((s, index) => {
                        const info = getStatusInfo(s.status);
                        const isSubmitted = !!s.status;
                        return (
                            <Col xs={24} sm={12} lg={6} key={s.organizationId} className={`animate-fade-in animate-delay-${(index % 4) + 1}`}>
                                <Badge.Ribbon text={info.text} color={info.color} style={{ display: isSubmitted ? 'block' : 'none' }}>
                                    <Card
                                        className="glass-card monitoring-card"
                                        bordered={false}
                                        style={{
                                            background: info.bg,
                                            border: `1px solid ${info.border}`,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            minHeight: '160px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: info.color, opacity: isSubmitted ? 1 : 0 }} />

                                        <div style={{ textAlign: 'center', marginBottom: '16px', zIndex: 1 }}>
                                            <div style={{
                                                width: '60px', height: '60px', margin: '0 auto 12px',
                                                borderRadius: '50%', background: isSubmitted ? '#fff' : 'rgba(0,0,0,0.05)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '28px', color: info.color,
                                                boxShadow: isSubmitted ? `0 4px 12px ${info.color}40` : 'none'
                                            }}>
                                                {info.icon}
                                            </div>
                                            <Text strong style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>
                                                {t(`orgs.${s.organizationName.toLowerCase()}`, { defaultValue: s.organizationName })}
                                            </Text>
                                            <Space align="center" style={{ opacity: 0.8 }}>
                                                <span className="status-dot" style={{ color: info.color, background: info.color, display: isSubmitted ? 'inline-block' : 'none' }} />
                                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                                    {isSubmitted ? 'Hisobot mavjud' : 'Topshirilmagan'}
                                                </Text>
                                            </Space>
                                        </div>
                                    </Card>
                                </Badge.Ribbon>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </GlassLayout>
    );
};

export default Form1StatusPage;
