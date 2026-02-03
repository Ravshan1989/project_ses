import React, { useState, useEffect } from 'react';
import { Card, Typography, DatePicker, Row, Col, Badge, Space, Empty, Spin } from 'antd';
import { CheckCircleFilled, ClockCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { organizationsApi, submissionApi } from '../../services/api';

const { Title, Text } = Typography;

interface OrgStatus {
    organizationId: string;
    organizationName: string;
    status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    submissionId?: string;
}

const Form1StatusPage: React.FC = () => {
    const [date, setDate] = useState(dayjs().subtract(1, 'month')); // Default to last month
    const [statuses, setStatuses] = useState<OrgStatus[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Orgs
            // Always fetch orgs to ensure we have the latest list
            const orgRes = await organizationsApi.getAll();
            // Viloyatni (parent darajasi) monitoringdan olib tashlaymiz
            const orgs = (orgRes.data || []).filter((org: any) => !!org.parent);

            // 2. Fetch Submission Status Summary
            const periodStr = date.startOf('month').format('YYYY-MM-DD');
            const statusRes = await submissionApi.getStatusSummary('FORM1', periodStr);
            const statusData = statusRes.data || [];

            // 3. Merge
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
};

export default Form1StatusPage;
