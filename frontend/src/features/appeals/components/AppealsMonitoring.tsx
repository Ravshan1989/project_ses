import React from 'react';
import { Table, Tag, Card, Row, Col, Statistic, Progress } from 'antd';
import { useTranslation } from 'react-i18next';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface MonitoringData {
    organizationId: string;
    organizationName: string;
    count: number;
    status: 'SUBMITTED' | 'PENDING';
}

interface AppealsMonitoringProps {
    data: MonitoringData[];
    isLoading: boolean;
}

const AppealsMonitoring: React.FC<AppealsMonitoringProps> = ({ data, isLoading }) => {
    // const { t } = useTranslation();

    const submittedCount = data.filter(d => d.status === 'SUBMITTED').length;
    const totalCount = data.length;
    const percentage = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

    const columns = [
        {
            title: 'Tuman / Hudud',
            dataIndex: 'organizationName',
            key: 'organizationName',
            render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>
        },
        {
            title: 'Murojaatlar soni',
            dataIndex: 'count',
            key: 'count',
            render: (count: number) => (
                <Tag color={count > 0 ? 'blue' : 'default'} style={{ fontSize: '14px', padding: '2px 10px' }}>
                    {count} ta
                </Tag>
            )
        },
        {
            title: 'Holati',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                if (status === 'SUBMITTED') {
                    return <Tag icon={<CheckCircleOutlined />} color="success">TO'LDIRILGAN</Tag>;
                }
                return <Tag icon={<ClockCircleOutlined />} color="warning">KUTILMOQDA</Tag>;
            }
        },
    ];

    return (
        <div style={{ padding: '20px 0' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card size="small" className="glass-card">
                        <Row gutter={16} align="middle">
                            <Col span={6}>
                                <Statistic 
                                    title="Jami Tumanlar" 
                                    value={totalCount} 
                                    suffix="ta"
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic 
                                    title="Topshirgan" 
                                    value={submittedCount} 
                                    valueStyle={{ color: '#3f8600' }}
                                    suffix="ta"
                                />
                            </Col>
                            <Col span={12}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ marginBottom: 5, fontSize: '12px', color: '#8c8c8c' }}>UMUMIY TOPSHIRISH KO'RSATKICHI</div>
                                    <Progress 
                                        percent={percentage} 
                                        status={percentage === 100 ? "success" : "active"}
                                        strokeColor={{
                                            '0%': '#108ee9',
                                            '100%': '#87d068',
                                        }}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <Table
                dataSource={data}
                columns={columns}
                loading={isLoading}
                rowKey="organizationId"
                size="middle"
                pagination={false}
                bordered
            />
        </div>
    );
};

export default AppealsMonitoring;
