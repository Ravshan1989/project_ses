import React, { useState, useEffect } from 'react';
import { Card, Typography, DatePicker, Row, Col, Badge, Space, Empty, Spin } from 'antd';
import { CheckCircleFilled, ClockCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { organizationsApi, submissionApi } from '../../services/api';

const { Title, Text } = Typography;

interface OrgStatus {
    organizationId: string;
    organizationName: string;
    status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    submissionId?: string;
}

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
            case 'APPROVED': return { color: '#52c41a', icon: <CheckCircleFilled />, text: 'Tasdiqlangan' };
            case 'SUBMITTED': return { color: '#1890ff', icon: <ClockCircleFilled />, text: 'Topshirilgan' };
            case 'REJECTED': return { color: '#f5222d', icon: <ExclamationCircleFilled />, text: 'Rad etilgan' };
            case 'DRAFT': return { color: '#faad14', icon: <ClockCircleFilled />, text: 'Qoralama' };
            default: return { color: '#bfbfbf', icon: <ExclamationCircleFilled />, text: 'Topshirilmagan' };
        }
    };

    // --- PREMIUM UI UPDATE ---
    const glassStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        padding: '32px'
    };

    const cardStyle = (submitted: boolean): React.CSSProperties => ({
        borderRadius: '20px',
        border: `1px solid ${submitted ? 'rgba(82, 196, 26, 0.2)' : 'rgba(191, 191, 191, 0.1)'}`,
        background: submitted ? 'rgba(82, 196, 26, 0.03)' : 'rgba(255, 255, 255, 0.8)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative'
    });

    return (
        <div style={{ padding: '24px', background: '#f8faff', minHeight: '100vh' }}>
            <style>{`
                .monitoring-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;
                }
                .status-neon {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 8px;
                    box-shadow: 0 0 10px currentColor;
                }
                .header-gradient {
                    background: linear-gradient(135deg, #1677ff 0%, #722ed1 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 800;
                }
            `}</style>

            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <Title level={2} className="header-gradient" style={{ margin: 0 }}>
                            {t('monitoring.title') || 'Shakl 1: Monitoring'}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            {date.format('MMMM YYYY')} oyi bo'yicha hisobotlar holati
                        </Text>
                    </div>
                    <DatePicker
                        picker="month"
                        value={date}
                        onChange={(d) => d && setDate(d)}
                        format="MMMM YYYY"
                        size="large"
                        style={{ borderRadius: '12px', width: '200px' }}
                    />
                </div>

                <div style={glassStyle}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
                    ) : statuses.length === 0 ? (
                        <Empty description="Ma'lumotlar topilmadi" />
                    ) : (
                        <Row gutter={[24, 24]}>
                            {statuses.map(s => {
                                const info = getStatusInfo(s.status);
                                const isSubmitted = !!s.status;
                                return (
                                    <Col xs={24} sm={12} lg={6} key={s.organizationId}>
                                        <Badge.Ribbon text={info.text} color={info.color}>
                                            <Card
                                                className="monitoring-card"
                                                style={cardStyle(isSubmitted)}
                                                bordered={false}
                                            >
                                                <div style={{ marginBottom: '16px' }}>
                                                    <Text strong style={{ fontSize: '17px', display: 'block', color: '#1f1f1f' }}>
                                                        {t(`orgs.${s.organizationName.toLowerCase()}`, { defaultValue: s.organizationName })}
                                                    </Text>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Space>
                                                        <span className="status-neon" style={{ color: info.color, background: info.color }} />
                                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                                            {isSubmitted ? 'Hisobot mavjud' : 'Topshirilmagan'}
                                                        </Text>
                                                    </Space>
                                                    <div style={{ fontSize: '20px', color: info.color }}>
                                                        {info.icon}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    height: '4px',
                                                    width: '100%',
                                                    background: isSubmitted ? info.color : '#f0f0f0',
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    opacity: 0.6
                                                }} />
                                            </Card>
                                        </Badge.Ribbon>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </div>
            </div>
        </div>
    );

    /* --- ESKI DIZAYN (O'zgarmas Qoidalar asosida saqlab qolindi) ---
    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={4}>Shakl 1: Hisobotlar topshirish holati</Title>
                        <Text type="secondary">{date.format('MMMM YYYY')} oyi uchun</Text>
                    </div>
                    <DatePicker
                        picker="month"
                        value={date}
                        onChange={(d) => d && setDate(d)}
                        format="MMMM YYYY"
                    />
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
                ) : statuses.length === 0 ? (
                    <Empty />
                ) : (
                    <Row gutter={[16, 16]}>
                        {statuses.map(s => {
                            const info = getStatusInfo(s.status);
                            return (
                                <Col xs={24} sm={12} md={8} lg={6} key={s.organizationId}>
                                    <Badge.Ribbon text={info.text} color={info.color}>
                                        <Card
                                            size="small"
                                            hoverable
                                            style={{
                                                borderLeft: `4px solid ${info.color}`,
                                                backgroundColor: s.status ? '#f6ffed' : '#fff1f0'
                                            }}
                                        >
                                            <Space direction="vertical">
                                                <Text strong style={{ fontSize: '16px' }}>{s.organizationName}</Text>
                                                <Space>
                                                    <span style={{ color: info.color, fontSize: '20px' }}>{info.icon}</span>
                                                    <Text type="secondary">
                                                        {s.status ? 'Hisobot mavjud' : 'Hisobot topilmadi'}
                                                    </Text>
                                                </Space>
                                            </Space>
                                        </Card>
                                    </Badge.Ribbon>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Space>
        </Card>
    );
    */
};

export default Form1StatusPage;
