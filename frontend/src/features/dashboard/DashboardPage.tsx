import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, message, Card, Row, Col, Statistic, Select, Input, Typography, Badge, Tooltip } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    SearchOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { Column, Line } from '@ant-design/plots'; // UZ: Line grafik ham qo'shildi
import { api } from '../../services/api'; // UZ: API bilan ishlash uchun
import { Submission, SubmissionStatus } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
import { useTranslation } from 'react-i18next';

const DashboardPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    // ... (REGION_DATA remains same) ...
    // Real Tashkent Region Districts Data
    // Real Tashkent Region Districts Data
    const REGION_DATA = [
        { id: '1', name: t('regions.nurafshon_city'), population: 54100, type: t('regions.type_city') },
        { id: '2', name: t('regions.angren_city'), population: 191300, type: t('regions.type_city') },
        { id: '3', name: t('regions.bekobod_city'), population: 102000, type: t('regions.type_city') },
        { id: '4', name: t('regions.chirchiq_city'), population: 168000, type: t('regions.type_city') },
        { id: '5', name: t('regions.olmaliq_city'), population: 138500, type: t('regions.type_city') },
        { id: '6', name: t('regions.ohangaron_city'), population: 42000, type: t('regions.type_city') },
        { id: '7', name: t('regions.yangiyol_city'), population: 63000, type: t('regions.type_city') },
        { id: '8', name: t('regions.oqqorgon_dist'), population: 112400, type: t('regions.type_district') },
        { id: '9', name: t('regions.ohangaron_dist'), population: 108300, type: t('regions.type_district') },
        { id: '10', name: t('regions.bekobod_dist'), population: 163400, type: t('regions.type_district') },
        { id: '11', name: t('regions.bostonliq_dist'), population: 175600, type: t('regions.type_district') },
        { id: '12', name: t('regions.boka_dist'), population: 132400, type: t('regions.type_district') },
        { id: '13', name: t('regions.quyi_chirchiq_dist'), population: 115800, type: t('regions.type_district') },
        { id: '14', name: t('regions.zangiota_dist'), population: 204300, type: t('regions.type_district') },
        { id: '15', name: t('regions.yuqori_chirchiq_dist'), population: 142100, type: t('regions.type_district') },
        { id: '16', name: t('regions.qibray_dist'), population: 206800, type: t('regions.type_district') },
        { id: '17', name: t('regions.parkent_dist'), population: 153000, type: t('regions.type_district') },
        { id: '18', name: t('regions.piskent_dist'), population: 102400, type: t('regions.type_district') },
        { id: '19', name: t('regions.orta_chirchiq_dist'), population: 153500, type: t('regions.type_district') },
        { id: '20', name: t('regions.chinoz_dist'), population: 147800, type: t('regions.type_district') },
        { id: '21', name: t('regions.yangiyol_dist'), population: 278300, type: t('regions.type_district') },
        { id: '22', name: t('regions.toshkent_dist'), population: 194500, type: t('regions.type_district') },
    ];

    // MOCK SUBMISSIONS mapped to real districts
    const MOCK_DATA: any[] = [
        {
            id: '1',
            template: { name: t('report_templates.form1') },
            organization: { name: `${t('regions.chirchiq_city')} ${t('regions.ses_suffix')}` },
            reportingPeriod: '2026-01-01',
            status: SubmissionStatus.SUBMITTED,
            data: { total_cases: 50 },
            createdAt: '2026-02-01'
        },
        {
            id: '2',
            template: { name: t('report_templates.vaccination') },
            organization: { name: `${t('regions.bostonliq_dist')} ${t('regions.ses_suffix')}` },
            reportingPeriod: '2026-01-01',
            status: SubmissionStatus.APPROVED,
            data: { total_cases: 120 },
            createdAt: '2026-02-01'
        },
        {
            id: '3',
            template: { name: t('report_templates.water') },
            organization: { name: `${t('regions.zangiota_dist')} ${t('regions.ses_suffix')}` },
            reportingPeriod: '2026-01-15',
            status: SubmissionStatus.REJECTED,
            data: { total_samples: 45 },
            createdAt: '2026-02-02'
        },
        {
            id: '4',
            template: { name: t('report_templates.school') },
            organization: { name: `${t('regions.bekobod_city')} ${t('regions.ses_suffix')}` },
            reportingPeriod: '2026-02-01',
            status: SubmissionStatus.DRAFT,
            data: { total_samples: 45 },
            createdAt: '2026-02-02'
        }
    ];

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            // const res = await submissionApi.getAll();
            // setSubmissions(res.data);
            setTimeout(() => { // Simulate network delay
                setSubmissions(MOCK_DATA);
            }, 600);
        } catch (error) {
            message.error(t('common.error_load_data'));
        } finally {
            setLoading(false);
        }
    };

    const [allForecasts, setAllForecasts] = useState<any[]>([]); // UZ: Barcha prognozlar (xavf darajasi bo'yicha)
    const [selectedDiseaseType, setSelectedDiseaseType] = useState<string>(''); // UZ: Tanlangan kasallik turi

    const fetchAllForecasts = async () => {
        try {
            // UZ: Xavf darajasi bo'yicha tartiblangan barcha prognozlarni olish
            const res = await api.get('/analysis/forecasts/ranked');
            setAllForecasts(res.data.forecasts || []);
            // UZ: Birinchi (eng xavfli) kasallikni default tanlash
            if (res.data.forecasts && res.data.forecasts.length > 0) {
                setSelectedDiseaseType(res.data.forecasts[0].diseaseType);
            }
        } catch (e) {
            console.error("Ranked forecasts fetch error", e);
        }
    };

    useEffect(() => {
        fetchSubmissions();
        fetchAllForecasts(); // UZ: Barcha prognozlarni yuklash
    }, [i18n.language]);

    const handleAction = async (_id: string, action: 'APPROVE' | 'REJECT') => {
        if (action === 'REJECT') {
            const reason = prompt(t('dashboard_page.reject_prompt'));
            if (!reason) return;
            // await submissionApi.updateStatus(id, action, reason);
            message.success(t('common.success_reject'));
        } else {
            // await submissionApi.updateStatus(id, action);
            message.success(t('common.success_approve'));
        }
        // fetchSubmissions(); // Refresh
    };


    // Derived Statistics
    const totalSubmissions = submissions.length;
    const pendingSubmissions = submissions.filter(s => s.status === SubmissionStatus.SUBMITTED).length;
    const approvedSubmissions = submissions.filter(s => s.status === SubmissionStatus.APPROVED).length;
    const rejectedSubmissions = submissions.filter(s => s.status === SubmissionStatus.REJECTED).length;

    const filteredData = submissions.filter(item => {
        const matchesSearch = item.organization.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.template.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: t('dashboard_page.table.region'),
            dataIndex: ['organization', 'name'],
            key: 'org',
            render: (text: string) => <Text strong>{t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}</Text>
        },
        {
            title: t('dashboard_page.table.report_type'),
            dataIndex: ['template', 'name'],
            key: 'template',
            render: (text: string) => <Text type="secondary">{text}</Text>
        },
        {
            title: t('dashboard_page.table.period'),
            dataIndex: 'reportingPeriod',
            key: 'period',
        },
        {
            title: t('dashboard_page.table.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: SubmissionStatus) => {
                let color = 'default';
                let icon = null;

                switch (status) {
                    case SubmissionStatus.APPROVED:
                        color = 'success';
                        icon = <CheckCircleOutlined />;
                        break;
                    case SubmissionStatus.SUBMITTED:
                        color = 'processing';
                        icon = <ClockCircleOutlined />;
                        break;
                    case SubmissionStatus.REJECTED:
                        color = 'error';
                        icon = <CloseCircleOutlined />;
                        break;
                    case SubmissionStatus.DRAFT:
                        color = 'default';
                        icon = <FileTextOutlined />;
                        break;
                }

                return <Tag icon={icon} color={color} style={{ fontSize: '13px', padding: '4px 8px' }}>{t(`dashboard_page.statuses.${status}`)}</Tag>;
            }
        },
        {
            title: t('dashboard_page.table.actions'),
            key: 'action',
            render: (_: any, record: Submission) => (
                <Space size="small">
                    {record.status === SubmissionStatus.SUBMITTED && (
                        <>
                            <Tooltip title={t('dashboard_page.table.approve_tooltip')}>
                                <Button type="primary" shape="circle" icon={<CheckOutlined />} size="small" onClick={() => handleAction(record.id, 'APPROVE')} />
                            </Tooltip>
                            <Tooltip title={t('dashboard_page.table.reject_tooltip')}>
                                <Button danger shape="circle" icon={<CloseOutlined />} size="small" onClick={() => handleAction(record.id, 'REJECT')} />
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title={t('dashboard_page.table.view_details_tooltip')}>
                        <Button shape="circle" icon={<EyeOutlined />} size="small" />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const regionChartData = REGION_DATA.slice(0, 10).map(r => ({
        name: r.name,
        population: r.population
    }));

    // UZ: Trend Analizi uchun Line chart ma'lumotlari (Tanlangan yoki eng xavfli kasallik bo'yicha)
    const trendChartData = (allForecasts.find(f => f.diseaseType === selectedDiseaseType) || allForecasts[0])?.historicalData.map((val: number, idx: number) => ({
        month: `${idx + 1}-oy`,
        value: val
    })) || [];

    const trendLineConfig = {
        data: trendChartData,
        xField: 'month',
        yField: 'value',
        point: { shapeField: 'dot', sizeField: 4 },
        interaction: { tooltip: { marker: true } },
        style: { lineWidth: 3, stroke: '#6366f1' },
    };

    const regionColumnConfig = {
        data: regionChartData,
        xField: 'name',
        yField: 'population',
        label: {
            text: (d: any) => d.population.toLocaleString(),
            position: 'middle',
            style: { fill: '#FFFFFF', opacity: 0.8 }
        },
        meta: { name: { alias: t('dashboard_page.analysis.region_alias') }, population: { alias: t('dashboard_page.analysis.population_alias') } },
    };

    // --- PREMIUM UI UPDATE ---
    // UZ: Dashboard dizaynini "Wow" darajaga ko'tarish: Glassmorphism + Neon Glow
    // Eski dizayn pastroqda izoh ko'rinishida saqlab qolindi.

    const premiumCardStyle = (color1: string, color2: string, shadow: string): React.CSSProperties => ({
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
        borderRadius: '24px',
        boxShadow: `0 10px 30px ${shadow}`,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });

    const glassStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
    };

    return (
        <div style={{ padding: '24px', background: '#f8faff', minHeight: '100vh' }}>
            <style>{`
                .premium-stat-card:hover {
                    transform: scale(1.05) translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
                }
                .glow-effect {
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 200px;
                    height: 200px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    filter: blur(50px);
                    pointer-events: none;
                }
                .dashboard-title {
                    background: linear-gradient(135deg, #1f1f1f 0%, #434343 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 800;
                    margin-bottom: 32px;
                }
                .section-card {
                    margin-bottom: 24px;
                    transition: all 0.3s ease;
                }
                .ant-table-wrapper {
                    background: transparent !important;
                }
                .ant-table {
                    background: transparent !important;
                }
                .ant-table-thead > tr > th {
                    background: rgba(230, 244, 255, 0.5) !important;
                    border-radius: 8px !important;
                }
                .premium-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .premium-scroll::-webkit-scrollbar-thumb {
                    background: #d9d9d9;
                    border-radius: 10px;
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <Title level={2} className="dashboard-title">{t('dashboard_page.title')}</Title>
                    <Text type="secondary" style={{ fontSize: '16px' }}>Tizimdagi joriy holat va tahlillar</Text>
                </div>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={premiumCardStyle('#4facfe', '#00f2fe', 'rgba(79, 172, 254, 0.4)')} className="premium-stat-card" bordered={false}>
                        <div className="glow-effect" />
                        <Statistic
                            title={<span style={{ color: '#fff', fontSize: '14px', opacity: 0.9 }}>{t('dashboard_page.total_reports')}</span>}
                            value={totalSubmissions}
                            prefix={<FileTextOutlined style={{ color: '#fff' }} />}
                            valueStyle={{ color: '#fff', fontWeight: 800, fontSize: '36px' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={premiumCardStyle('#43e97b', '#38f9d7', 'rgba(67, 233, 123, 0.4)')} className="premium-stat-card" bordered={false}>
                        <div className="glow-effect" />
                        <Statistic
                            title={<span style={{ color: '#fff', fontSize: '14px', opacity: 0.9 }}>{t('dashboard_page.approved')}</span>}
                            value={approvedSubmissions}
                            prefix={<CheckCircleOutlined style={{ color: '#fff' }} />}
                            valueStyle={{ color: '#fff', fontWeight: 800, fontSize: '36px' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={premiumCardStyle('#f093fb', '#f5576c', 'rgba(240, 147, 251, 0.4)')} className="premium-stat-card" bordered={false}>
                        <div className="glow-effect" />
                        <Statistic
                            title={<span style={{ color: '#fff', fontSize: '14px', opacity: 0.9 }}>{t('dashboard_page.pending')}</span>}
                            value={pendingSubmissions}
                            prefix={<ClockCircleOutlined style={{ color: '#fff' }} />}
                            valueStyle={{ color: '#fff', fontWeight: 800, fontSize: '36px' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={premiumCardStyle('#fa709a', '#fee140', 'rgba(250, 112, 154, 0.4)')} className="premium-stat-card" bordered={false}>
                        <div className="glow-effect" />
                        <Statistic
                            title={<span style={{ color: '#fff', fontSize: '14px', opacity: 0.9 }}>{t('dashboard_page.rejected')}</span>}
                            value={rejectedSubmissions}
                            prefix={<CloseCircleOutlined style={{ color: '#fff' }} />}
                            valueStyle={{ color: '#fff', fontWeight: 800, fontSize: '36px' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card style={glassStyle} className="section-card" title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span><Badge status="processing" /> {t('dashboard_page.incoming_reports')}</span>
                            <Space>
                                <Input
                                    placeholder={t('dashboard_page.search_placeholder')}
                                    prefix={<SearchOutlined />}
                                    style={{ width: 180, borderRadius: '8px' }}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                                <Select
                                    placeholder="Status"
                                    style={{ width: 120 }}
                                    allowClear
                                    onChange={setStatusFilter}
                                >
                                    {Object.values(SubmissionStatus).map(status => (
                                        <Option key={status} value={status}>{status}</Option>
                                    ))}
                                </Select>
                            </Space>
                        </div>
                    } bordered={false}>
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 6 }}
                            size="middle"
                        />
                    </Card>

                    <Row gutter={[24, 24]}>
                        <Col span={11}>
                            <Card style={glassStyle} title={
                                <Space>
                                    <span>Trend Analizi</span>
                                    {allForecasts.length > 0 && (
                                        <Badge status="processing" text={(allForecasts.find(f => f.diseaseType === selectedDiseaseType) || allForecasts[0])?.diseaseName} />
                                    )}
                                </Space>
                            } bordered={false}>
                                {trendChartData.length > 0 ? (
                                    <Line {...trendLineConfig} height={220} />
                                ) : (
                                    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text type="secondary">Ma'lumotlar yuklanmoqda...</Text>
                                    </div>
                                )}
                            </Card>
                        </Col>
                        <Col span={13}>
                            <Card style={glassStyle} title="Hududlar Bo'yicha" bordered={false}>
                                <Column {...regionColumnConfig} height={220} />
                            </Card>
                        </Col>
                    </Row>
                </Col>

                <Col xs={24} lg={8}>
                    <Card style={glassStyle} className="section-card" title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Badge status="warning" /> <span>Smart Analytics</span>
                        </div>
                    } bordered={false}>
                        <div className="premium-scroll" style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
                            {allForecasts.map((f, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    marginBottom: '16px',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <Space>
                                            <span style={{ fontSize: '20px' }}>{f.emoji}</span>
                                            <Text strong>{f.diseaseName}</Text>
                                        </Space>
                                        <Tag color={f.riskLevel === 'high' ? 'error' : (f.riskLevel === 'medium' ? 'warning' : 'success')}>
                                            {f.riskScore}%
                                        </Tag>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Bashorat:</Text>
                                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1677ff' }}>{f.predictedValue}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: f.growthRate > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>
                                                {f.growthRate > 0 ? '+' : ''}{f.growthRate}%
                                            </div>
                                            <Text type="secondary" style={{ fontSize: '11px' }}>{f.trend === 'increasing' ? 'O\'sish' : 'Pasayish'}</Text>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card style={glassStyle} title={t('dashboard_page.region_title')} bordered={false}>
                        <div className="premium-scroll" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {REGION_DATA.sort((a, b) => b.population - a.population).map((item, index) => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '12px 0',
                                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                                }}>
                                    <Space>
                                        <Badge count={index + 1} style={{ backgroundColor: index < 3 ? '#1677ff' : '#d9d9d9' }} />
                                        <Text strong>{item.name}</Text>
                                    </Space>
                                    <Text type="secondary">{item.population.toLocaleString()}</Text>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    /* --- ESKI DIZAYN (O'zgarmas Qoidalar asosida saqlab qolindi) ---
    return (
        <div>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .stat-card {
                    animation: fadeInUp 0.6s ease-out;
                    transition: all 0.3s ease;
                }
                .stat-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
                }
            `}</style>

            <Row gutter={16} style={{ marginBottom: '32px' }}>
                <Col span={6}>
                    <Card
                        className="stat-card"
                        bordered={false}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '100px',
                            height: '100px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            filter: 'blur(20px)'
                        }} />
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500 }}>{t('dashboard_page.total_reports')}</span>}
                            value={totalSubmissions}
                            prefix={<FileTextOutlined style={{ color: '#fff', fontSize: '24px' }} />}
                            valueStyle={{ color: '#fff', fontWeight: 700, fontSize: '32px', position: 'relative', zIndex: 1 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        className="stat-card"
                        bordered={false}
                        style={{
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 16px rgba(56, 239, 125, 0.3)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '100px',
                            height: '100px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            filter: 'blur(20px)'
                        }} />
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500 }}>{t('dashboard_page.approved')}</span>}
                            value={approvedSubmissions}
                            prefix={<CheckCircleOutlined style={{ color: '#fff', fontSize: '24px' }} />}
                            valueStyle={{ color: '#fff', fontWeight: 700, fontSize: '32px', position: 'relative', zIndex: 1 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        className="stat-card"
                        bordered={false}
                        style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 16px rgba(245, 87, 108, 0.3)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '100px',
                            height: '100px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            filter: 'blur(20px)'
                        }} />
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500 }}>{t('dashboard_page.pending')}</span>}
                            value={pendingSubmissions}
                            prefix={<ClockCircleOutlined style={{ color: '#fff', fontSize: '24px' }} />}
                            valueStyle={{ color: '#fff', fontWeight: 700, fontSize: '32px', position: 'relative', zIndex: 1 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        className="stat-card"
                        bordered={false}
                        style={{
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 16px rgba(250, 112, 154, 0.3)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '100px',
                            height: '100px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            filter: 'blur(20px)'
                        }} />
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500 }}>{t('dashboard_page.rejected')}</span>}
                            value={rejectedSubmissions}
                            prefix={<CloseCircleOutlined style={{ color: '#fff', fontSize: '24px' }} />}
                            valueStyle={{ color: '#fff', fontWeight: 700, fontSize: '32px', position: 'relative', zIndex: 1 }}
                        />
                    </Card>
                </Col>
            </Row>

            // ... (Rest of old code) ...
        </div>
    );
    */
};

export default DashboardPage;
