import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Space, Badge, DatePicker, Empty, message, Row, Col, Input, Switch } from 'antd';
import { analysisApi } from '../../services/api';
import dayjs from 'dayjs';
import {
    GlobalOutlined,
    WarningOutlined,
    SearchOutlined,
    FilterOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const GlobalMonitoringPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [highRiskOnly, setHighRiskOnly] = useState(false);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await analysisApi.getGlobalSummary({
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD'),
            });
            setData(res.data);
        } catch (error) {
            console.error('Error fetching global analysis data:', error);
            message.error('Global monitoring ma\'lumotlarini yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    // Flatten data for matrix: rows = diseases, cols = districts
    const { districtNames, diseaseRows } = React.useMemo(() => {
        const diseasesMap: Record<string, Record<string, number>> = {};
        const names = data.map(d => d.organizationName);

        data.forEach(districtData => {
            districtData.diseases.forEach((d: any) => {
                if (!diseasesMap[d.disease]) diseasesMap[d.disease] = {};
                diseasesMap[d.disease][districtData.organizationName] = d.rate;
            });
        });

        const rows = Object.keys(diseasesMap).map(name => {
            const row: any = { disease: name };
            names.forEach(dn => {
                row[dn] = diseasesMap[name][dn] || 0;
            });
            return row;
        });

        return { districtNames: names, diseaseRows: rows };
    }, [data]);

    const filteredRows = React.useMemo(() => {
        let rows = diseaseRows.filter(row =>
            row.disease.toLowerCase().includes(searchText.toLowerCase())
        );

        if (highRiskOnly) {
            rows = rows.filter(row => districtNames.some(dn => row[dn] > 50));
        }

        return rows;
    }, [diseaseRows, searchText, highRiskOnly, districtNames]);

    const getCellColor = (rate: number) => {
        if (rate === 0) return 'transparent';
        if (rate > 50) return '#fff1f0'; // Red background
        if (rate > 20) return '#fffbe6'; // Yellow background
        return '#f6ffed'; // Green background
    };

    const getTextColor = (rate: number) => {
        if (rate === 0) return '#bfbfbf';
        if (rate > 50) return '#cf1322';
        if (rate > 20) return '#d4b106';
        return '#389e0d';
    };

    const columns = React.useMemo(() => [
        {
            title: 'Kasallik nomi',
            dataIndex: 'disease',
            key: 'disease',
            fixed: 'left' as const,
            width: 200,
            render: (text: string) => <Text strong>{text}</Text>,
            sorter: (a: any, b: any) => a.disease.localeCompare(b.disease),
        },
        ...districtNames.map(dn => ({
            title: dn as any,
            dataIndex: dn,
            key: dn,
            width: 120,
            align: 'center' as const,
            render: (val: number) => (
                <div style={{
                    backgroundColor: getCellColor(val),
                    padding: '8px',
                    borderRadius: '4px',
                    color: getTextColor(val),
                    fontWeight: val > 0 ? 'bold' : 'normal'
                }}>
                    {val > 0 ? val.toFixed(1) : '-'}
                </div>
            )
        }))
    ], [districtNames]);

    // Top Alerts: Diseases with highest rates anywhere
    const alerts = data.flatMap(dist => dist.diseases.map((d: any) => ({ ...d, district: dist.organizationName })))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5);

    // --- PREMIUM UI UPDATE ---

    const headerStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        padding: '40px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: '#f5f7fa' }}>
            <style>{`
                .monitoring-table .ant-table { background: transparent !important; }
                .monitoring-table .ant-table-thead > tr > th {
                    background: rgba(255, 255, 255, 0.5) !important;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 10px;
                    letter-spacing: 0.5px;
                }
                .monitoring-card {
                    background: rgba(255, 255, 255, 0.8) !important;
                    backdrop-filter: blur(20px) !important;
                    border-radius: 20px !important;
                    border: 1px solid rgba(255, 255, 255, 0.4) !important;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.03) !important;
                }
                .monitoring-filter {
                    background: rgba(255, 255, 255, 0.1) !important;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 12px 20px;
                }
                .alert-item {
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .alert-item:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 24px rgba(255, 77, 79, 0.2);
                }
            `}</style>

            <div style={headerStyle}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '14px' }}>
                            <GlobalOutlined style={{ fontSize: '28px', color: '#fff' }} />
                        </div>
                        <Title level={1} style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: '30px' }}>
                            Global Monitoring
                        </Title>
                    </div>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '15px' }}>
                        Barcha 100+ kasalliklar bo'yicha tumanlararo xavf tahlili
                    </Text>
                </div>

                <div className="monitoring-filter">
                    <Space direction="vertical" align="end" size={12}>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
                            variant="borderless"
                            style={{ color: '#fff' }}
                            placeholder={['Boshlanish', 'Tugash']}
                        />
                        <Space>
                            <Input
                                placeholder="Qidiruv..."
                                prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
                                style={{ width: 160, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff' }}
                                onChange={e => setSearchText(e.target.value)}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Text style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Faqat xavfli</Text>
                                <Switch size="small" checked={highRiskOnly} onChange={setHighRiskOnly} />
                            </div>
                        </Space>
                    </Space>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card
                        className="monitoring-card"
                        title={<Space><WarningOutlined style={{ color: '#ff4d4f' }} /> <span style={{ fontWeight: 700 }}>Eng yuqori xavf hududlari</span></Space>}
                    >
                        <Row gutter={16}>
                            {alerts.map((alert, i) => (
                                <Col span={4} key={i}>
                                    <div className="alert-item" style={{ padding: '16px', background: '#fff1f0', borderRadius: '16px', borderLeft: '6px solid #ff4d4f' }}>
                                        <Text type="secondary" style={{ fontSize: '10px', display: 'block', letterSpacing: '1px' }}>{alert.district.toUpperCase()}</Text>
                                        <Text strong style={{ display: 'block', fontSize: '14px', margin: '4px 0' }}>{alert.disease}</Text>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                            <Text style={{ fontSize: '24px', fontWeight: 900, color: '#cf1322' }}>{alert.rate.toFixed(1)}</Text>
                                            <Text type="secondary" style={{ fontSize: '10px' }}>100k</Text>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                            {alerts.length === 0 && <Col span={24}><Empty description="Hozircha xavf aniqlanmadi" /></Col>}
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card
                        className="monitoring-card"
                        title={<Space><FilterOutlined style={{ color: '#1677ff' }} /> <span style={{ fontWeight: 700 }}>Kasalliklar va Hududlar Matritsasi</span></Space>}
                    >
                        <Table
                            columns={columns}
                            dataSource={filteredRows}
                            rowKey="disease"
                            loading={loading}
                            scroll={{ x: 'max-content', y: 600 }}
                            pagination={false}
                            className="monitoring-table"
                            bordered
                            size="middle"
                            footer={() => (
                                <div style={{ display: 'flex', gap: '32px', fontSize: '12px', padding: '10px' }}>
                                    <Space><Badge color="#52c41a" /> <Text type="secondary">Xavf darajasi: Past</Text></Space>
                                    <Space><Badge color="#faad14" /> <Text type="secondary">Xavf darajasi: O'rta</Text></Space>
                                    <Space><Badge color="#ff4d4f" /> <Text type="secondary">Xavf darajasi: Yuqori</Text></Space>
                                </div>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );

    /* --- ESKI DIZAYN ---
    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        <GlobalOutlined /> Global Epidemiologik Monitoring
                    </Title>
                    <Text type="secondary">Barcha 100+ kasalliklar bo'yicha tumanlararo xavf tahlili (Xar 100k aholiga)</Text>
                </div>
                <Space direction="vertical" align="end">
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
                        style={{ width: 280 }}
                    />
                    <Space>
                        <Input
                            placeholder="Kasallikni qidirish..."
                            prefix={<SearchOutlined />}
                            style={{ width: 200 }}
                            onChange={e => setSearchText(e.target.value)}
                        />
                        <Space style={{ background: '#fff', padding: '4px 12px', borderRadius: '4px', border: '1px solid #d9d9d9' }}>
                            <Text>Faqat yuqori xavf</Text>
                            <Switch size="small" checked={highRiskOnly} onChange={setHighRiskOnly} />
                        </Space>
                    </Space>
                </Space>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card title={<Space><WarningOutlined style={{ color: '#ff4d4f' }} /> Eng yuqori xavf hududlari</Space>} bordered={false}>
                        <Row gutter={16}>
                            {alerts.map((alert, i) => (
                                <Col span={4} key={i}>
                                    <div style={{ padding: '12px', background: '#fff1f0', borderRadius: '8px', borderLeft: '4px solid #ff4d4f' }}>
                                        <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>{alert.district.toUpperCase()}</Text>
                                        <Text strong style={{ display: 'block' }}>{alert.disease}</Text>
                                        <Text type="danger" style={{ fontSize: '20px', fontWeight: 700 }}>{alert.rate}</Text>
                                        <Text type="secondary" style={{ fontSize: '10px' }}> ko'rsatkich</Text>
                                    </div>
                                </Col>
                            ))}
                            {alerts.length === 0 && <Col span={24}><Empty description="Hozircha xavf aniqlanmadi" /></Col>}
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title={<Space><FilterOutlined /> Kasalliklar va Hududlar Matritsasi</Space>} bordered={false}>
                        <Table
                            columns={columns}
                            dataSource={filteredRows}
                            rowKey="disease"
                            loading={loading}
                            scroll={{ x: 1500, y: 600 }}
                            pagination={false}
                            size="small"
                            bordered
                            footer={() => (
                                <div style={{ display: 'flex', gap: '24px', fontSize: '12px' }}>
                                    <Space><Badge color="#52c41a" /> Past xavf (&lt;20)</Space>
                                    <Space><Badge color="#faad14" /> O'rta xavf (20-50)</Space>
                                    <Space><Badge color="#ff4d4f" /> Yuqori xavf (&gt;50)</Space>
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

export default GlobalMonitoringPage;
