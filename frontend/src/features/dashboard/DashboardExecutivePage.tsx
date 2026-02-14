import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Typography, Spin, Alert, Modal, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { ArrowUpOutlined, ArrowDownOutlined, WarningOutlined, SafetyCertificateOutlined, FireOutlined, BellOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { api } from '../../services/api';

const { Title, Text } = Typography;

interface ExecutiveData {
    totalCasesToday: number;
    totalCasesYesterday: number;
    trend: 'increasing' | 'decreasing';
    trendPercent: number;
    epidemicStatus: 'safe' | 'warning' | 'critical';
    topHotspot: { name: string; cases: number } | null;
    topDiseases: { name: string; count: number }[];
    districtStatuses: { id: string; name: string; cases: number; status: 'safe' | 'warning' | 'critical' }[];
    recentAlerts?: { id: string; diseaseName: string; status: string; district: string; createdAt: string }[];
}

const DashboardExecutivePage: React.FC = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<ExecutiveData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);
    const [districtDetails, setDistrictDetails] = useState<{ topDiseases: { name: string; count: number }[] } | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/analysis/executive/summary');
            if (res.data) {
                setData(res.data);
            } else {
                setError("Serverdan bo'sh ma'lumot keldi");
            }
        } catch (err: any) {
            console.error("Executive summary fetch error", err);
            setError(err.message || "Ma'lumot yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchDistrictDetails = async (id: string) => {
        setLoadingDetails(true);
        setDistrictDetails(null);
        try {
            const res = await api.get(`/analysis/executive/district/${id}`);
            setDistrictDetails(res.data);
        } catch (err) {
            console.error("District details error", err);
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        if (selectedDistrict) {
            fetchDistrictDetails(selectedDistrict.id);
        }
    }, [selectedDistrict]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'safe': return 'green';
            case 'warning': return 'orange';
            case 'critical': return 'red';
            default: return 'blue';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'safe': return <SafetyCertificateOutlined />;
            case 'warning': return <WarningOutlined />;
            case 'critical': return <FireOutlined />;
            default: return null;
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}><Spin size="large" /></div>;

    if (error) {
        return (
            <div style={{ padding: 24 }}>
                <Alert message="Xatolik" description={error} type="error" showIcon />
            </div>
        );
    }

    if (!data) return <Alert message="Ma'lumot topilmadi" type="warning" />;

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>{t('executive.title') || "Rahbar Paneli"}</Title>
                <Text type="secondary">{t('executive.subtitle') || "Viloyat bo'yicha tezkor svodka"}</Text>
            </div>

            {/* SOS Alerts Widget */}
            {data.recentAlerts && data.recentAlerts.length > 0 && (
                <Alert
                    message={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <BellOutlined style={{ fontSize: 20, color: 'red' }} />
                            <span style={{ fontWeight: 'bold', fontSize: 16 }}>FAVQULODDA XABARLAR (SOS)</span>
                        </div>
                    }
                    description={
                        <List
                            size="small"
                            dataSource={data.recentAlerts}
                            renderItem={alert => (
                                <List.Item>
                                    <Text type="danger" strong>[{alert.district}]</Text> {alert.diseaseName} - {alert.status}
                                </List.Item>
                            )}
                        />
                    }
                    type="error"
                    style={{ marginBottom: 24, border: '2px solid red' }}
                />
            )}

            {/* KPI Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title={t('executive.total_cases_today') || "Bugungi jami kasallar"}
                            value={data.totalCasesToday}
                            valueStyle={{ color: data.trend === 'increasing' ? '#cf1322' : '#3f8600' }}
                            prefix={data.trend === 'increasing' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            suffix={<span style={{ fontSize: 14 }}>({data.trendPercent}%)</span>}
                        />
                        <Text type="secondary">{t('executive.daily_trend') || "KUNLIK O'ZGARISH"}</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title={t('executive.epidemic_status') || "Epidemik vaziyat"}
                            value={t(`executive.status_${data.epidemicStatus}`) || data.epidemicStatus}
                            valueStyle={{ color: getStatusColor(data.epidemicStatus) }}
                            prefix={getStatusIcon(data.epidemicStatus)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title={t('executive.top_hotspot') || "Eng faol o'choq"}
                            value={data.topHotspot ? data.topHotspot.name : '-'}
                            valueStyle={{ color: '#cf1322' }}
                            suffix={data.topHotspot ? <Tag color="red">{data.topHotspot.cases}</Tag> : null}
                            prefix={<FireOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                {/* District Status Grid */}
                <Col xs={24} md={16}>
                    <Card title={t('executive.district_status') || "Hududlar nazorati (Batafsil ko'rish uchun bosing)"}>
                        <List
                            grid={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 4, xl: 6 }}
                            dataSource={data.districtStatuses ? data.districtStatuses.sort((a, b) => b.cases - a.cases) : []}
                            renderItem={(item) => (
                                <List.Item>
                                    <Card
                                        hoverable
                                        onClick={() => setSelectedDistrict({ id: item.id, name: item.name })}
                                        size="small"
                                        className={`district-card ${item.status}`}
                                        style={{
                                            textAlign: 'center',
                                            borderTop: `4px solid ${getStatusColor(item.status)}`,
                                            backgroundColor: item.status === 'critical' ? '#fff1f0' : undefined
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{item.name}</div>
                                        <Tag color={getStatusColor(item.status)} style={{ fontSize: 16, padding: '4px 10px' }}>
                                            {item.cases}
                                        </Tag>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* Top Diseases */}
                <Col xs={24} md={8}>
                    <Card title={t('executive.top_diseases') || "Top 5 kasalliklar (Viloyat)"}>
                        <List
                            dataSource={data.topDiseases || []}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <span>
                                            <Tag color="blue">#{index + 1}</Tag>
                                            {item.name}
                                        </span>
                                        <Tag color="volcano">{item.count}</Tag>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Modal for Drill Down */}
            <Modal
                title={<span><EnvironmentOutlined /> {selectedDistrict?.name} - Batafsil</span>}
                open={!!selectedDistrict}
                onCancel={() => setSelectedDistrict(null)}
                footer={[<Button key="close" onClick={() => setSelectedDistrict(null)}>Yopish</Button>]}
            >
                {loadingDetails ? (
                    <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
                ) : districtDetails ? (
                    <div>
                        <Title level={5}>Ushbu tumandagi Top 5 kasalliklar:</Title>
                        <List
                            bordered
                            dataSource={districtDetails.topDiseases}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <Text strong>{index + 1}. {item.name}</Text>
                                    <Tag color="red">{item.count} ta holat</Tag>
                                </List.Item>
                            )}
                        />
                        {districtDetails.topDiseases.length === 0 && <Alert message="Kasalliklar aniqlanmadi" type="success" />}
                    </div>
                ) : (
                    <Alert message="Ma'lumot yuklanmadi" type="error" />
                )}
            </Modal>
        </div>
    );
};

export default DashboardExecutivePage;
