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
    const diseasesMap: Record<string, Record<string, number>> = {};
    const districtNames: string[] = data.map(d => d.organizationName);

    data.forEach(districtData => {
        districtData.diseases.forEach((d: any) => {
            if (!diseasesMap[d.disease]) diseasesMap[d.disease] = {};
            diseasesMap[d.disease][districtData.organizationName] = d.rate;
        });
    });

    const diseaseRows = Object.keys(diseasesMap)
        .filter(name => name.toLowerCase().includes(searchText.toLowerCase()))
        .map(name => {
            const row: any = { disease: name };
            districtNames.forEach(dn => {
                row[dn] = diseasesMap[name][dn] || 0;
            });
            return row;
        });

    const filteredRows = highRiskOnly
        ? diseaseRows.filter(row => districtNames.some(dn => row[dn] > 50))
        : diseaseRows;

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

    const columns: any[] = [
        {
            title: 'Kasallik nomi',
            dataIndex: 'disease',
            key: 'disease',
            fixed: 'left',
            width: 200,
            render: (text: string) => <Text strong>{text}</Text>,
            sorter: (a: any, b: any) => a.disease.localeCompare(b.disease),
        },
        ...districtNames.map(dn => ({
            title: dn,
            dataIndex: dn,
            key: dn,
            width: 120,
            align: 'center',
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
    ];

    // Top Alerts: Diseases with highest rates anywhere
    const alerts = data.flatMap(dist => dist.diseases.map((d: any) => ({ ...d, district: dist.organizationName })))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5);

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
                {/* Alerts Section */}
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

                {/* Risk Matrix Section */}
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
};

export default GlobalMonitoringPage;
