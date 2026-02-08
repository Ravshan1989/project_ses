import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Table, Typography, Space, Badge, Spin, message } from 'antd';
import { Bar } from '@ant-design/plots';
import { analysisApi } from '../../services/api';
import dayjs from 'dayjs';
import {
    LineChartOutlined,
    HeatMapOutlined,
    EnvironmentOutlined,
    CalendarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AnalysisDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [diseaseType, setDiseaseType] = useState('hepatitis');
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await analysisApi.getIncidenceRates({
                diseaseType,
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD'),
            });
            setData(res.data);
        } catch (error) {
            console.error('Error fetching analysis data:', error);
            message.error('Tahliliy ma\'lumotlarni yuklashda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [diseaseType, dateRange]);

    const barConfig = {
        data: data.slice(0, 10), // Top 10 districts
        xField: 'incidenceRate',
        yField: 'organizationName',
        seriesField: 'organizationName',
        legend: false,
        label: {
            position: 'right',
            offset: 4,
        },
        color: ({ organizationName }: any) => {
            const item = data.find(d => d.organizationName === organizationName);
            if (item && item.incidenceRate > 50) return '#ff4d4f'; // High risk
            if (item && item.incidenceRate > 20) return '#faad14'; // Medium risk
            return '#52c41a'; // Low risk
        },
    };

    const columns = React.useMemo(() => [
        {
            title: 'Hudud nomi',
            dataIndex: 'organizationName',
            key: 'organizationName',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Aholi soni',
            dataIndex: 'population',
            key: 'population',
            render: (val: number) => val.toLocaleString(),
        },
        {
            title: 'Kasallanish soni',
            dataIndex: 'totalCases',
            key: 'totalCases',
            render: (val: number) => <Badge count={val} overflowCount={9999} style={{ backgroundColor: '#1677ff' }} />,
        },
        {
            title: 'Ko\'rsatkich (har 100k aholiga)',
            dataIndex: 'incidenceRate',
            key: 'incidenceRate',
            sorter: (a: any, b: any) => a.incidenceRate - b.incidenceRate,
            render: (val: number) => {
                let color = '#52c41a';
                if (val > 50) color = '#ff4d4f';
                else if (val > 20) color = '#faad14';
                return <Text style={{ color, fontWeight: 'bold' }}>{val.toFixed(2)}</Text>;
            },
        },
    ], []);

    // --- PREMIUM UI UPDATE ---

    const headerStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #243B55 0%, #141E30 100%)',
        padding: '40px',
        borderRadius: '24px',
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(20, 30, 48, 0.3)'
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
            <style>{`
                .analysis-table .ant-table { background: transparent !important; }
                .analysis-table .ant-table-thead > tr > th {
                    background: rgba(255, 255, 255, 0.5) !important;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 11px;
                    letter-spacing: 0.8px;
                }
                .filter-glass {
                    background: rgba(255, 255, 255, 0.15) !important;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 16px 24px;
                    display: flex;
                    gap: 32px;
                    width: fit-content;
                }
                .analysis-card {
                    background: rgba(255, 255, 255, 0.8) !important;
                    backdrop-filter: blur(20px) !important;
                    border-radius: 20px !important;
                    border: 1px solid rgba(255, 255, 255, 0.4) !important;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.03) !important;
                }
            `}</style>

            <div style={headerStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '14px' }}>
                                <LineChartOutlined style={{ fontSize: '28px', color: '#fff' }} />
                            </div>
                            <Title level={1} style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '32px' }}>
                                Epidemiologik Analiz
                            </Title>
                        </div>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
                            Hududlar bo'yicha kasallanish darajasini aholi soniga nisbatan tahlili
                        </Text>
                    </div>

                    <div className="filter-glass">
                        <Space direction="vertical" size={0}>
                            <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>
                                <HeatMapOutlined /> Kasallik
                            </Text>
                            <Select
                                value={diseaseType}
                                onChange={setDiseaseType}
                                style={{ width: 180, color: '#fff' }}
                                variant="borderless"
                                dropdownStyle={{ background: '#fff', borderRadius: '12px' }}
                            >
                                <Option value="hepatitis">Gepatit</Option>
                                <Option value="flu">Gripp</Option>
                                <Option value="ari">O'RVI</Option>
                                <Option value="covid">COVID-19</Option>
                            </Select>
                        </Space>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        <Space direction="vertical" size={0}>
                            <Text style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>
                                <CalendarOutlined /> Davr
                            </Text>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
                                variant="borderless"
                                style={{ color: '#fff' }}
                            />
                        </Space>
                    </div>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card
                        className="analysis-card"
                        title={
                            <Space>
                                <EnvironmentOutlined style={{ color: '#1677ff' }} />
                                <span style={{ fontWeight: 700 }}>Eng yuqori kasallanish ko'rsatkichiga ega hududlar (Top 10)</span>
                            </Space>
                        }
                    >
                        {loading ? (
                            <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            <div style={{ height: '400px' }}>
                                <Bar {...(barConfig as any)} theme="light" />
                            </div>
                        )}
                    </Card>
                </Col>

                <Col span={24}>
                    <Card
                        className="analysis-card"
                        title={<span style={{ fontWeight: 700 }}>Hududlar bo'yicha batafsil ma'lumotlar</span>}
                    >
                        <Table
                            columns={columns}
                            dataSource={data}
                            rowKey="organizationId"
                            loading={loading}
                            pagination={{ pageSize: 12 }}
                            className="analysis-table"
                            footer={() => (
                                <div style={{ fontSize: '12px', color: '#8c8c8c', padding: '10px' }}>
                                    * Ko'rsatkich har 100 000 aholiga nisbatan hisoblangan.
                                </div>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );

    /* --- ESKI DIZAYN (O'zgarmas Qoidalar asosida saqlab qolindi) ---
    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        <LineChartOutlined /> Epidemiologik Tahlil va Analiz
                    </Title>
                    <Text type="secondary">Hududlar bo'yicha kasallanish darajasini aholi soniga nisbatan tahlili</Text>
                </div>
                <Space size="large" style={{ background: '#fff', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: '12px' }}><HeatMapOutlined /> Kasallik turi</Text>
                        <Select
                            value={diseaseType}
                            onChange={setDiseaseType}
                            style={{ width: 200 }}
                            variant="borderless"
                        >
                            <Option value="hepatitis">Gepatit</Option>
                            <Option value="flu">Gripp</Option>
                            <Option value="ari">O'RVI</Option>
                            <Option value="covid">COVID-19</Option>
                        </Select>
                    </Space>
                    <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: '12px' }}><CalendarOutlined /> Davr</Text>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
                            variant="borderless"
                        />
                    </Space>
                </Space>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card title={
                        <Space>
                            <EnvironmentOutlined />
                            <span>Eng yuqori kasallanish ko'rsatkichiga ega hududlar (Top 10)</span>
                        </Space>
                    } bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        {loading ? (
                            <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            <div style={{ height: '400px' }}>
                                <Bar {...(barConfig as any)} />
                            </div>
                        )}
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="Hududlar bo'yicha batafsil ma'lumotlar" bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Table
                            columns={columns}
                            dataSource={data}
                            rowKey="organizationId"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                            footer={() => (
                                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                    * Ko'rsatkich formula: (Kasallanishlar soni / Aholi soni) * 100 000
                                </div>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
    */
};

export default AnalysisDashboard;
