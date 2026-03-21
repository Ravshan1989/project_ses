import React, { useEffect, useState, useContext } from 'react';
import { Table, Tag, Button, Space, message, Card, Row, Col, Statistic, Select, Input, Typography, Badge, Tooltip, Modal } from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    SearchOutlined,
    EyeOutlined,
    RightOutlined,
    SafetyCertificateOutlined,
    WarningOutlined,
    FireOutlined
} from '@ant-design/icons';
import { Column, Area } from '@ant-design/plots'; // UZ: Area va Pie grafiklar qo'shildi
import { api } from '../../services/api'; // UZ: API bilan ishlash uchun
import { Submission, SubmissionStatus } from '../../types';
import GlassLayout, { LayoutContext } from '../../components/layout/GlassLayout';

const { Title, Text } = Typography;
const { Option } = Select;
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

interface DistrictExecutiveSummary {
    totalCasesToday: number;
    totalCasesYesterday: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    trendPercent: number;
    epidemicStatus: 'safe' | 'warning' | 'critical';
    topDiseases: { name: string; count: number }[];
    latestReports: { id: string; type: string; diseaseName: string; district: string; cases: number; createdAt: string }[];
}

const DashboardPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    return (
        <GlassLayout title={t('dashboard_page.title')} subtitle={t('dashboard_page.subtitle')}>
            <DashboardContent
                t={t}
                i18n={i18n}
                submissions={submissions}
                setSubmissions={setSubmissions}
                loading={loading}
                setLoading={setLoading}
                searchText={searchText}
                setSearchText={setSearchText}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />
        </GlassLayout>
    );
};

// Internal component to access Context
const DashboardContent: React.FC<any> = ({ t, i18n, submissions, setSubmissions, loading, setLoading, searchText, setSearchText, statusFilter, setStatusFilter }) => {
    const { isDarkMode } = useContext(LayoutContext);
    const navigate = useNavigate();
    const [allForecasts, setAllForecasts] = useState<any[]>([]); // UZ: Barcha prognozlar (xavf darajasi bo'yicha)
    const [selectedDiseaseType, setSelectedDiseaseType] = useState<string>(''); // UZ: Tanlangan kasallik turi
    const [isModalVisible, setIsModalVisible] = useState(false); // UZ: Modal holati
    const [executiveSummary, setExecutiveSummary] = useState<DistrictExecutiveSummary | null>(null); // UZ: Rahbar uchun qisqacha ma'lumot

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

    const MOCK_FORECASTS: any[] = [
        {
            diseaseType: 'flu',
            diseaseName: 'Gripp (Influenza)',
            emoji: '🤧',
            riskScore: 85,
            riskLevel: 'high',
            predictedValue: 185,
            currentValue: 178,
            trend: 'increasing',
            confidence: '85%',
            historicalData: [120, 135, 142, 158, 165, 178],
            growthRate: 7.8
        },
        {
            diseaseType: 'ari',
            diseaseName: "O'tkir Respirator Infeksiya (YUQTI)",
            emoji: '😷',
            riskScore: 65,
            riskLevel: 'medium',
            predictedValue: 115,
            currentValue: 110,
            trend: 'increasing',
            confidence: '80%',
            historicalData: [85, 92, 88, 95, 102, 110],
            growthRate: 7.8
        },
        {
            diseaseType: 'hepatitis',
            diseaseName: 'Gepatit (Hepatitis) A',
            emoji: '🟡',
            riskScore: 45,
            riskLevel: 'low',
            predictedValue: 75,
            currentValue: 68,
            trend: 'increasing',
            confidence: '90%',
            historicalData: [45, 52, 48, 61, 55, 68],
            growthRate: 23.6
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
            // Fallback to mock data
            setAllForecasts(MOCK_FORECASTS);
            if (MOCK_FORECASTS.length > 0) {
                setSelectedDiseaseType(MOCK_FORECASTS[0].diseaseType);
            }
        }
    };

    const fetchDistrictSummary = async () => {
        try {
            // Get user org id from local storage or context if available
            // For now, we'll try to get it from profile, else fallback
            const orgId = localStorage.getItem('user_org_id');
            if (orgId) {
                const res = await api.get(`/analysis/executive/district-summary/${orgId}`);
                setExecutiveSummary(res.data);
            }
        } catch (e) {
            console.error("Error fetching district summary", e);
        }
    }

    useEffect(() => {
        fetchSubmissions();
        fetchAllForecasts(); // UZ: Barcha prognozlarni yuklash
        fetchDistrictSummary(); // UZ: Tuman svodkasini yuklash
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


    // Derived Statistics (null-safe)
    const totalSubmissions = (submissions || []).length;
    const pendingSubmissions = (submissions || []).filter((s: Submission) => s?.status === SubmissionStatus.SUBMITTED).length;
    const approvedSubmissions = (submissions || []).filter((s: Submission) => s?.status === SubmissionStatus.APPROVED).length;
    const rejectedSubmissions = (submissions || []).filter((s: Submission) => s?.status === SubmissionStatus.REJECTED).length;

    const filteredData = (submissions || []).filter((item: Submission) => {
        if (!item || !item.organization || !item.template) return false;
        const matchesSearch = (item.organization?.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (item.template?.name || '').toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: t('dashboard_page.table.region'),
            dataIndex: ['organization', 'name'],
            key: 'org',
            render: (text: string) => <Text strong>{t(`orgs.${(text || '').toLowerCase()}`, { defaultValue: text || '' })}</Text>
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

                return <Tag icon={icon} color={color} style={{ fontSize: '13px', padding: '4px 8px' }}>{t(`dashboard_page.statuses.${status.toLowerCase()}`, { defaultValue: status })}</Tag>;
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
    const selectedForecast = allForecasts.find(f => f.diseaseType === selectedDiseaseType) || allForecasts[0];
    const trendChartData = selectedForecast?.historicalData?.map((val: number, idx: number) => ({
        month: `${idx + 1}${t('dashboard_page.month_suffix')}`,
        value: val
    })) || [];

    // UZ: Trend Analizi uchun Area chart (To'ldirilgan chiziqli grafik)
    const trendAreaConfig = {
        data: trendChartData,
        xField: 'month',
        yField: 'value',
        seriesField: 'name',
        smooth: true,
        theme: isDarkMode ? 'classicDark' : undefined,
        areaStyle: () => {
            return {
                fill: isDarkMode ? 'l(270) 0:#000 0.5:#11998e 1:#38ef7d' : 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
            };
        },
        line: {
            color: isDarkMode ? '#38ef7d' : '#1890ff',
        },
        point: {
            size: 5,
            shape: 'diamond',
            style: {
                fill: 'white',
                stroke: isDarkMode ? '#38ef7d' : '#1890ff',
                lineWidth: 2,
            },
        },
        tooltip: { showMarkers: true },
        state: {
            active: {
                style: {
                    shadowBlur: 4,
                    stroke: '#000',
                    fill: 'red',
                },
            },
        },
        interactions: [{ type: 'marker-active' }],
    };

    // UZ: Hududlar bo'yicha Bar chart (Rangli)
    const regionColumnConfig = {
        data: regionChartData,
        xField: 'name',
        yField: 'population',
        theme: isDarkMode ? 'classicDark' : undefined,
        label: {
            text: (d: any) => d.population.toLocaleString(),
            position: 'inside',
            style: { fill: '#FFFFFF', opacity: 0.8 }
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
                style: {
                    fill: isDarkMode ? 'rgba(255,255,255,0.65)' : undefined
                }
            },
        },
        meta: { name: { alias: t('dashboard_page.analysis.region_alias') }, population: { alias: t('dashboard_page.analysis.population_alias') } },
        color: ({ name }: any) => {
            if (name === 'Nurafshon sh') return '#1890ff';
            return '#5B8FF9';
        }
    };


    // Mobile-specific styles and layout
    // Mobile-specific layout check

    return (
        <div className="dashboard-page-main">

            {/* --- MOBILE VIEW --- */}
            <div className="mobile-only dashboard-container">
                {/* Header */}
                <div className="mobile-header">
                    <div className="profile-row">
                        <div className="avatar-container">
                            <FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />
                        </div>
                        <div className="user-info">
                            <p>{t('common.welcome')},</p>
                            <h4>{localStorage.getItem('user_full_name') || t('common.user_fallback')}</h4>
                        </div>
                    </div>
                    <div className="org-badge">
                        <CheckCircleOutlined style={{ color: '#38bdf8', marginRight: 6 }} />
                        <span style={{ color: '#bae6fd', fontSize: '13px', fontWeight: 500 }}>{localStorage.getItem('user_org_name') || 'Sanepidqo\'mita'}</span>
                    </div>
                    <button className="sos-btn">
                        <span style={{ marginRight: 8 }}>⚠️</span> FAVQULODDA SOS
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="mobile-stats-grid">
                    <div className="mobile-stat-card">
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(56, 189, 248, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                            <ClockCircleOutlined style={{ fontSize: '24px', color: '#38bdf8' }} />
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc' }}>{pendingSubmissions}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Kutilmoqda</span>
                    </div>
                    <div className="mobile-stat-card">
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(74, 222, 128, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                            <CheckCircleOutlined style={{ fontSize: '24px', color: '#4ade80' }} />
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc' }}>{approvedSubmissions}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Tasdiqlandi</span>
                    </div>
                </div>

                {/* Quick Actions Title */}
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', marginLeft: '4px' }}>Tezkor amallar</h3>

                {/* Quick Action Cards */}
                <div className="action-card" onClick={() => navigate('/reports')}>
                    <div className="action-icon-box" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                        <FileTextOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px' }}>Hisobotlar Tarixi</h4>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>Yuborilgan va tasdiqlangan</span>
                    </div>
                    <div style={{ width: 32, height: 32, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8' }}>›</span>
                    </div>
                </div>

                <div className="action-card" onClick={() => navigate('/daily-flu')}>
                    <div className="action-icon-box" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                        <span style={{ fontSize: '24px' }}>🌡️</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px' }}>Gripp va O'RVI</h4>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>Haftalik o'tkir tahlil</span>
                    </div>
                    <div style={{ width: 32, height: 32, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <RightOutlined style={{ color: '#94a3b8' }} />
                    </div>
                </div>

                <div className="action-card" onClick={() => navigate('/daily-reports')}>
                    <div className="action-icon-box" style={{ background: 'rgba(234, 179, 8, 0.2)' }}>
                        <span style={{ fontSize: '24px' }}>🟡</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px' }}>VGA (Gepatit)</h4>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>Virusli gepatit A</span>
                    </div>
                    <div style={{ width: 32, height: 32, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <RightOutlined style={{ color: '#94a3b8' }} />
                    </div>
                </div>

                <div className="action-card" onClick={() => navigate('/daily-ari')}>
                    <div className="action-icon-box" style={{ background: 'rgba(14, 165, 233, 0.2)' }}>
                        <span style={{ fontSize: '24px' }}>🤧</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px' }}>O'tkir respirator (ARI)</h4>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>O'RVI va pnevmoniya</span>
                    </div>
                    <div style={{ width: 32, height: 32, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <RightOutlined style={{ color: '#94a3b8' }} />
                    </div>
                </div>

                <div className="action-card" onClick={() => navigate('/daily-covid')}>
                    <div className="action-icon-box" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                        <span style={{ fontSize: '24px' }}>🦠</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px' }}>COVID-19</h4>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>Koronavirus monitoringi</span>
                    </div>
                    <div style={{ width: 32, height: 32, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <RightOutlined style={{ color: '#94a3b8' }} />
                    </div>
                </div>

                <div className="action-card" onClick={() => navigate('/daily-diarrhea')}>
                    <div className="action-icon-box" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                        <span style={{ fontSize: '24px' }}>💧</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px' }}>O'tkir diareya</h4>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>Yuqumli ich ketish</span>
                    </div>
                    <div style={{ width: 32, height: 32, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <RightOutlined style={{ color: '#94a3b8' }} />
                    </div>
                </div>

                <div className="action-card" onClick={() => navigate('/daily-epidemiology')}>
                    <div className="action-icon-box" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
                        <span style={{ fontSize: '24px' }}>📋</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px' }}>Epidemiologiya</h4>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>Umumiy epidemiologik holat</span>
                    </div>
                    <div style={{ width: 32, height: 32, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <RightOutlined style={{ color: '#94a3b8' }} />
                    </div>
                </div>

            </div>

            {/* --- DESKTOP VIEW (Original) --- */}
            <div className="desktop-only">

                {/* --- DISTRICT EXECUTIVE SUMMARY SECTION --- */}
                {executiveSummary && (
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ marginBottom: 16 }}>
                            <Title level={4} style={{ margin: 0 }}> <SafetyCertificateOutlined /> Tuman Holati (Svodka)</Title>
                            <Text type="secondary">Bugungi kun uchun tezkor ma'lumotlar</Text>
                        </div>
                        <Row gutter={[24, 24]}>
                            {/* KPI Cards */}
                            <Col xs={24} sm={12} lg={8}>
                                <Card className="glass-card">
                                    <Statistic
                                        title={<span style={{ color: '#64748b' }}>Bugungi jami kasallar</span>}
                                        value={executiveSummary.totalCasesToday}
                                        valueStyle={{ color: executiveSummary.trend === 'increasing' ? '#cf1322' : '#3f8600', fontWeight: 'bold' }}
                                        prefix={executiveSummary.trend === 'increasing' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        suffix={<span style={{ fontSize: 14 }}>({executiveSummary.trendPercent}%)</span>}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <Card className="glass-card">
                                    <Statistic
                                        title={<span style={{ color: '#64748b' }}>Epidemik vaziyat</span>}
                                        value={t(`executive.status_${executiveSummary.epidemicStatus}`) || executiveSummary.epidemicStatus}
                                        valueStyle={{ color: getStatusColor(executiveSummary.epidemicStatus), fontWeight: 'bold' }}
                                        prefix={getStatusIcon(executiveSummary.epidemicStatus)}
                                    />
                                </Card>
                            </Col>

                            {/* Top Diseases List for District */}
                            <Col xs={24} lg={8}>
                                <Card className="glass-card" title="Top Kasalliklar" bodyStyle={{ padding: '12px 24px' }} size="small">
                                    {executiveSummary.topDiseases.length > 0 ? (
                                        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                            {executiveSummary.topDiseases.map((item, index) => (
                                                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: index !== executiveSummary.topDiseases.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                                    <Space>
                                                        <Tag color="blue">#{index + 1}</Tag>
                                                        <Text>{item.name}</Text>
                                                    </Space>
                                                    <Tag color="volcano">{item.count}</Tag>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <Text type="secondary">Ma'lumot yo'q</Text>
                                    )}
                                </Card>
                            </Col>
                        </Row>
                        <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '24px 0' }}></div>
                    </div>
                )}


                <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                    <Col xs={24} sm={12} lg={6} className="animate-fade-in animate-delay-1">
                        <Card className="glass-card stat-card-gradient-1" bordered={false} bodyStyle={{ padding: '24px' }}>
                            <Statistic
                                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>{t('dashboard_page.total_reports')}</span>}
                                value={totalSubmissions}
                                prefix={<FileTextOutlined style={{ fontSize: '24px', opacity: 0.8, marginRight: '8px' }} />}
                                valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
                            />
                            <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
                                <FileTextOutlined style={{ fontSize: '100px', color: '#fff' }} />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6} className="animate-fade-in animate-delay-2">
                        <Card className="glass-card stat-card-gradient-2" bordered={false} bodyStyle={{ padding: '24px' }}>
                            <Statistic
                                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>{t('dashboard_page.approved')}</span>}
                                value={approvedSubmissions}
                                prefix={<CheckCircleOutlined style={{ fontSize: '24px', opacity: 0.8, marginRight: '8px' }} />}
                                valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
                            />
                            <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
                                <CheckCircleOutlined style={{ fontSize: '100px', color: '#fff' }} />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6} className="animate-fade-in animate-delay-3">
                        <Card className="glass-card stat-card-gradient-3" bordered={false} bodyStyle={{ padding: '24px' }}>
                            <Statistic
                                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>{t('dashboard_page.pending')}</span>}
                                value={pendingSubmissions}
                                prefix={<ClockCircleOutlined style={{ fontSize: '24px', opacity: 0.8, marginRight: '8px' }} />}
                                valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
                            />
                            <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
                                <ClockCircleOutlined style={{ fontSize: '100px', color: '#fff' }} />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6} className="animate-fade-in animate-delay-4">
                        <Card className="glass-card stat-card-gradient-4" bordered={false} bodyStyle={{ padding: '24px' }}>
                            <Statistic
                                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>{t('dashboard_page.rejected')}</span>}
                                value={rejectedSubmissions}
                                prefix={<CloseCircleOutlined style={{ fontSize: '24px', opacity: 0.8, marginRight: '8px' }} />}
                                valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
                            />
                            <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
                                <CloseCircleOutlined style={{ fontSize: '100px', color: '#fff' }} />
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16} className="animate-fade-in animate-delay-2">
                        <Card className="glass-card" bordered={false} title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Space><FileTextOutlined style={{ color: '#1677ff' }} /> <span style={{ fontSize: '18px', fontWeight: 600 }}>{t('dashboard_page.incoming_reports')}</span></Space>
                                <Space>
                                    <Input
                                        placeholder={t('dashboard_page.search_placeholder')}
                                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                        style={{ width: 200, borderRadius: '20px', background: 'rgba(255,255,255,0.5)', border: 'none' }}
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                    <Select
                                        placeholder={t('dashboard_page.status_placeholder')}
                                        style={{ width: 120 }}
                                        allowClear
                                        bordered={false}
                                        onChange={setStatusFilter}
                                    >
                                        {Object.values(SubmissionStatus).map(status => (
                                            <Option key={status} value={status}>{t(`dashboard_page.statuses.${status.toLowerCase()}`, { defaultValue: status })}</Option>
                                        ))}
                                    </Select>
                                </Space>
                            </div>
                        }>
                            <Table
                                columns={columns}
                                dataSource={filteredData}
                                rowKey="id"
                                loading={loading}
                                pagination={{ pageSize: 6 }}
                            />
                        </Card>

                        <div style={{ marginTop: '24px' }}>
                            <Row gutter={[24, 24]}>
                                <Col span={12} className="animate-fade-in animate-delay-3">
                                    <Card className="glass-card" title={<Space><span style={{ fontSize: '16px', fontWeight: 600 }}>{t('dashboard_page.trend_analysis')}</span><Badge status="processing" text={t('dashboard_page.live')} /></Space>} bordered={false}>
                                        {trendChartData.length > 0 ? (
                                            <Area {...trendAreaConfig} height={250} />
                                        ) : (
                                            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text type="secondary">{t('dashboard_page.loading_data')}</Text>
                                            </div>
                                        )}
                                    </Card>
                                </Col>
                                <Col span={12} className="animate-fade-in animate-delay-4">
                                    <Card className="glass-card" title={<Space><span style={{ fontSize: '16px', fontWeight: 600 }}>{t('dashboard_page.region_breakdown')}</span></Space>} bordered={false}>
                                        <Column {...regionColumnConfig} height={250} />
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    <Col xs={24} lg={8} className="animate-fade-in animate-delay-3">
                        <Card className="glass-card" style={{ marginBottom: '24px' }} title={
                            <Space><Badge status="warning" /> <span style={{ fontSize: '16px', fontWeight: 600 }}>Smart Analytics (AI)</span></Space>
                        } bordered={false}>
                            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                                {allForecasts.map((f, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            setSelectedDiseaseType(f.diseaseType);
                                            setIsModalVisible(true);
                                        }}
                                        style={{
                                            background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            marginBottom: '12px',
                                            borderLeft: `4px solid ${f.riskLevel === 'high' ? '#ff4d4f' : '#52c41a'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: 'scale(1)'
                                        }}
                                        className="smart-analysis-card"
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <Text strong>{f.diseaseName}</Text>
                                            <Tag color={f.riskLevel === 'high' ? 'red' : 'green'}>{f.riskScore}{t('dashboard_page.risk_percentage')}</Tag>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>{t('dashboard_page.forecast_prefix')} <span style={{ color: '#1677ff', fontWeight: 'bold' }}>{f.predictedValue}</span></Text>
                                            <Text type={f.trend === 'increasing' ? 'danger' : 'success'} style={{ fontSize: '12px' }}>
                                                {f.trend === 'increasing' ? t('dashboard_page.trend_up') : t('dashboard_page.trend_down')} ({f.growthRate}%)
                                            </Text>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="glass-card" title={<Space><span style={{ fontSize: '16px', fontWeight: 600 }}>{t('dashboard_page.region_title')}</span></Space>} bordered={false}>
                            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                {REGION_DATA.sort((a, b) => b.population - a.population).slice(0, 10).map((item, index) => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '12px 0',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                        alignItems: 'center'
                                    }}>
                                        <Space>
                                            <div style={{
                                                width: '24px', height: '24px',
                                                background: index < 3 ? 'linear-gradient(45deg, #FFD700, #FDB931)' : '#f0f0f0',
                                                borderRadius: '50%', color: index < 3 ? '#fff' : '#666',
                                                display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '12px'
                                            }}>
                                                {index + 1}
                                            </div>
                                            <Text strong>{item.name}</Text>
                                        </Space>
                                        <Tag color="blue">{item.population.toLocaleString()}</Tag>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Smart Analysis Detail Modal */}
                <Modal
                    title={
                        <Space>
                            <Badge status={selectedForecast?.riskLevel === 'high' ? 'error' : 'success'} />
                            <span style={{ fontSize: '18px' }}>
                                {selectedForecast?.diseaseName || t('dashboard_page.ai_modal_title')} {t('dashboard_page.ai_modal_title')}
                            </span>
                        </Space>
                    }
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setIsModalVisible(false)}>
                            {t('common.close')}
                        </Button>
                    ]}
                    width={800}
                    centered
                >
                    <div style={{ padding: '20px 0' }}>
                        <div style={{ marginBottom: '20px', padding: '15px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9f9f9', borderRadius: '8px' }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title={t('dashboard_page.analysis.current_status')}
                                        value={selectedForecast?.currentValue || 0}
                                        valueStyle={{ color: isDarkMode ? '#fff' : '#333' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={t('dashboard_page.analysis.forecast_next_month')}
                                        value={selectedForecast?.predictedValue || 0}
                                        prefix={selectedForecast?.trend === 'increasing' ? <ArrowUpOutlined style={{ color: '#cf1322' }} /> : <ArrowDownOutlined style={{ color: '#3f8600' }} />}
                                        valueStyle={{ color: selectedForecast?.trend === 'increasing' ? '#cf1322' : '#3f8600' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={t('dashboard_page.analysis.growth_rate_label')}
                                        value={(selectedForecast?.growthRate || 0) + '%'}
                                        valueStyle={{ fontWeight: 'bold', color: '#1890ff' }}
                                    />
                                </Col>
                            </Row>
                        </div>

                        <Title level={5} style={{ marginBottom: '15px' }}>{t('dashboard_page.ai_modal_chart_title')}</Title>
                        <Area {...trendAreaConfig} height={300} />

                        <div style={{ marginTop: '20px' }}>
                            <Text type="secondary">
                                <InfoCircleOutlined style={{ marginRight: '8px' }} />
                                {selectedForecast?.trend === 'increasing'
                                    ? t('dashboard_page.ai_high_risk_insight')
                                    : t('dashboard_page.ai_stable_risk_insight')}
                            </Text>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default DashboardPage;

/*
ORIGINAL CODE (Append-only rule):
import React, { useEffect, useState, useContext } from 'react';
import { Table, Tag, Button, Space, message, Card, Row, Col, Statistic, Select, Input, Typography, Badge, Tooltip, Modal } from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    SearchOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { Column, Area } from '@ant-design/plots';
import { api } from '../../services/api';
import { Submission, SubmissionStatus } from '../../types';
import GlassLayout, { LayoutContext } from '../../components/layout/GlassLayout';

const { Title, Text } = Typography;
const { Option } = Select;

const DashboardPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    return (
        <GlassLayout title="Statistika Paneli (Toshkent viloyati)" subtitle="Barcha hisobotlar monitoringi va prognozi">
            <DashboardContent
                submissions={submissions}
                setSubmissions={setSubmissions}
                loading={loading}
                setLoading={setLoading}
                searchText={searchText}
                setSearchText={setSearchText}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />
        </GlassLayout>
    );
};

const DashboardContent: React.FC<any> = ({ submissions, setSubmissions, loading, setLoading, searchText, setSearchText, statusFilter, setStatusFilter }) => {
    const { isDarkMode } = useContext(LayoutContext);
    const [allForecasts, setAllForecasts] = useState<any[]>([]);
    const [selectedDiseaseType, setSelectedDiseaseType] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const REGION_DATA = [
        { id: '1', name: 'Nurafshon sh', population: 54100, type: 'Shahar' },
        { id: '2', name: 'Angren sh', population: 191300, type: 'Shahar' },
        { id: '3', name: 'Bekobod sh', population: 102000, type: 'Shahar' },
        { id: '4', name: 'Chirchiq sh', population: 168000, type: 'Shahar' },
        { id: '5', name: 'Olmaliq sh', population: 138500, type: 'Shahar' },
        { id: '6', name: 'Ohangaron sh', population: 42000, type: 'Shahar' },
        { id: '7', name: 'Yangiyo\'l sh', population: 63000, type: 'Shahar' },
        { id: '8', name: 'Oqqo\'rg\'on t', population: 112400, type: 'Tuman' },
        { id: '9', name: 'Ohangaron t', population: 108300, type: 'Tuman' },
        { id: '10', name: 'Bekobod t', population: 163400, type: 'Tuman' },
        { id: '11', name: 'Bo\'stonliq t', population: 175600, type: 'Tuman' },
        { id: '12', name: 'Bo\'ka t', population: 132400, type: 'Tuman' },
        { id: '13', name: 'Quyi Chirchiq t', population: 115800, type: 'Tuman' },
        { id: '14', name: 'Zangiota t', population: 204300, type: 'Tuman' },
        { id: '15', name: 'Yuqori Chirchiq t', population: 142100, type: 'Tuman' },
        { id: '16', name: 'Qibray t', population: 206800, type: 'Tuman' },
        { id: '17', name: 'Parkent t', population: 153000, type: 'Tuman' },
        { id: '18', name: 'Piskent t', population: 102400, type: 'Tuman' },
        { id: '19', name: 'O\'rta Chirchiq t', population: 153500, type: 'Tuman' },
        { id: '20', name: 'Chinoz t', population: 147800, type: 'Tuman' },
        { id: '21', name: 'Yangiyo\'l t', population: 278300, type: 'Tuman' },
        { id: '22', name: 'Toshkent t', population: 194500, type: 'Tuman' },
    ];

    const MOCK_DATA: any[] = [
        {
            id: '1',
            template: { name: 'Forma 1 - Yuqumli kasalliklar' },
            organization: { name: 'Chirchiq shahar SES' },
            reportingPeriod: '2026-01-01',
            status: SubmissionStatus.SUBMITTED,
            data: { total_cases: 50 },
            createdAt: '2026-02-01'
        },
        {
            id: '2',
            template: { name: 'Vaksina qoldiqlari' },
            organization: { name: 'Bo\'stonliq tumani SES' },
            reportingPeriod: '2026-01-01',
            status: SubmissionStatus.APPROVED,
            data: { total_cases: 120 },
            createdAt: '2026-02-01'
        },
        {
            id: '3',
            template: { name: 'Ichimlik suvi tahlili' },
            organization: { name: 'Zangiota tumani SES' },
            reportingPeriod: '2026-01-15',
            status: SubmissionStatus.REJECTED,
            data: { total_samples: 45 },
            createdAt: '2026-02-02'
        },
        {
            id: '4',
            template: { name: 'Maktab oromgohlari nazorati' },
            organization: { name: 'Bekobod shahar SES' },
            reportingPeriod: '2026-02-01',
            status: SubmissionStatus.DRAFT,
            data: { total_samples: 45 },
            createdAt: '2026-02-02'
        }
    ];

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            setTimeout(() => {
                setSubmissions(MOCK_DATA);
            }, 600);
        } catch (error) {
            message.error('Ma\'lumotlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllForecasts = async () => {
        try {
            const res = await api.get('/analysis/forecasts/ranked');
            setAllForecasts(res.data.forecasts || []);
            if (res.data.forecasts && res.data.forecasts.length > 0) {
                setSelectedDiseaseType(res.data.forecasts[0].diseaseType);
            }
        } catch (e) {
            console.error("Ranked forecasts fetch error", e);
            // Fallback to mock data
            setAllForecasts(MOCK_FORECASTS);
            if (MOCK_FORECASTS.length > 0) {
                setSelectedDiseaseType(MOCK_FORECASTS[0].diseaseType);
            }
        }
    };

    useEffect(() => {
        fetchSubmissions();
        fetchAllForecasts();
    }, []);

    const handleAction = async (_id: string, action: 'APPROVE' | 'REJECT') => {
        if (action === 'REJECT') {
            const reason = prompt('Rad etish sababini kiriting:');
            if (!reason) return;
            message.success('Hisobot rad etildi');
        } else {
            message.success('Hisobot tasdiqlandi');
        }
    };

    const totalSubmissions = submissions.length;
    const pendingSubmissions = submissions.filter((s: Submission) => s.status === SubmissionStatus.SUBMITTED).length;
    const approvedSubmissions = submissions.filter((s: Submission) => s.status === SubmissionStatus.APPROVED).length;
    const rejectedSubmissions = submissions.filter((s: Submission) => s.status === SubmissionStatus.REJECTED).length;

    const filteredData = submissions.filter((item: Submission) => {
        const matchesSearch = item.organization.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.template.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            title: 'Tuman/Shahar',
            dataIndex: ['organization', 'name'],
            key: 'org',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Hisobot turi',
            dataIndex: ['template', 'name'],
            key: 'template',
            render: (text: string) => <Text type="secondary">{text}</Text>
        },
        {
            title: 'Hisobot davri',
            dataIndex: 'reportingPeriod',
            key: 'period',
        },
        {
            title: 'Holat',
            dataIndex: 'status',
            key: 'status',
            render: (status: SubmissionStatus) => {
                let color = 'default';
                let icon = null;
                switch (status) {
                    case SubmissionStatus.APPROVED: color = 'success'; icon = <CheckCircleOutlined />; break;
                    case SubmissionStatus.SUBMITTED: color = 'processing'; icon = <ClockCircleOutlined />; break;
                    case SubmissionStatus.REJECTED: color = 'error'; icon = <CloseCircleOutlined />; break;
                    case SubmissionStatus.DRAFT: color = 'default'; icon = <FileTextOutlined />; break;
                }
                return <Tag icon={icon} color={color} style={{ fontSize: '13px', padding: '4px 8px' }}>{status}</Tag>;
            }
        },
        {
            title: 'Amallar',
            key: 'action',
            render: (_: any, record: Submission) => (
                <Space size="small">
                    {record.status === SubmissionStatus.SUBMITTED && (
                        <>
                            <Tooltip title="Tasdiqlash">
                                <Button type="primary" shape="circle" icon={<CheckOutlined />} size="small" onClick={() => handleAction(record.id, 'APPROVE')} />
                            </Tooltip>
                            <Tooltip title="Rad etish">
                                <Button danger shape="circle" icon={<CloseOutlined />} size="small" onClick={() => handleAction(record.id, 'REJECT')} />
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title="Batafsil ko'rish">
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

    const selectedForecast = allForecasts.find(f => f.diseaseType === selectedDiseaseType) || allForecasts[0];
    const trendChartData = selectedForecast?.historicalData?.map((val: number, idx: number) => ({
        month: `${idx + 1}-oy`,
        value: val
    })) || [];

    const trendAreaConfig = {
        data: trendChartData,
        xField: 'month',
        yField: 'value',
        seriesField: 'name',
        smooth: true,
        theme: isDarkMode ? 'classicDark' : undefined,
        areaStyle: () => {
            return {
                fill: isDarkMode ? 'l(270) 0:#000 0.5:#11998e 1:#38ef7d' : 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
            };
        },
        line: { color: isDarkMode ? '#38ef7d' : '#1890ff' },
        point: {
            size: 5,
            shape: 'diamond',
            style: { fill: 'white', stroke: isDarkMode ? '#38ef7d' : '#1890ff', lineWidth: 2 },
        },
        tooltip: { showMarkers: true },
        interactions: [{ type: 'marker-active' }],
    };

    const regionColumnConfig = {
        data: regionChartData,
        xField: 'name',
        yField: 'population',
        theme: isDarkMode ? 'classicDark' : undefined,
        label: {
            text: (d: any) => d.population.toLocaleString(),
            position: 'inside',
            style: { fill: '#FFFFFF', opacity: 0.8 }
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
                style: { fill: isDarkMode ? 'rgba(255,255,255,0.65)' : undefined }
            },
        },
        meta: { name: { alias: 'Hudud' }, population: { alias: 'Aholi' } },
        color: ({ name }: any) => {
            if (name === 'Nurafshon sh') return '#1890ff';
            return '#5B8FF9';
        }
    };

    return (
        <div>
            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                <Col xs={24} sm={12} lg={6} className="animate-fade-in animate-delay-1">
                    <Card className="glass-card stat-card-gradient-1" bordered={false} bodyStyle={{ padding: '24px' }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Jami hisobotlar</span>}
                            value={totalSubmissions}
                            prefix={<FileTextOutlined style={{ fontSize: '24px', opacity: 0.8, marginRight: '8px' }} />}
                            valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6} className="animate-fade-in animate-delay-2">
                    <Card className="glass-card stat-card-gradient-2" bordered={false} bodyStyle={{ padding: '24px' }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Tasdiqlangan</span>}
                            value={approvedSubmissions}
                            prefix={<CheckCircleOutlined style={{ fontSize: '24px', opacity: 0.8, marginRight: '8px' }} />}
                            valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6} className="animate-fade-in animate-delay-3">
                    <Card className="glass-card stat-card-gradient-3" bordered={false} bodyStyle={{ padding: '24px' }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Kutilmoqda</span>}
                            value={pendingSubmissions}
                            prefix={<ClockCircleOutlined style={{ fontSize: '24px', opacity: 0.8, marginRight: '8px' }} />}
                            valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6} className="animate-fade-in animate-delay-4">
                    <Card className="glass-card stat-card-gradient-4" bordered={false} bodyStyle={{ padding: '24px' }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Rad etilgan</span>}
                            value={rejectedSubmissions}
                            prefix={<CloseCircleOutlined style={{ fontSize: '24px', opacity: 0.8, marginRight: '8px' }} />}
                            valueStyle={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16} className="animate-fade-in animate-delay-2">
                    <Card className="glass-card" bordered={false} title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space><FileTextOutlined style={{ color: '#1677ff' }} /> <span style={{ fontSize: '18px', fontWeight: 600 }}>Kelib tushgan hisobotlar</span></Space>
                            <Space>
                                <Input
                                    placeholder="Qidirish..."
                                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                    style={{ width: 200, borderRadius: '20px', background: 'rgba(255,255,255,0.5)', border: 'none' }}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                                <Select
                                    placeholder="Holatni tanlang"
                                    style={{ width: 120 }}
                                    allowClear
                                    bordered={false}
                                    onChange={setStatusFilter}
                                >
                                    {Object.values(SubmissionStatus).map(status => (
                                        <Option key={status} value={status}>{status}</Option>
                                    ))}
                                </Select>
                            </Space>
                        </div>
                    }>
                        <Table columns={columns} dataSource={filteredData} rowKey="id" loading={loading} pagination={{ pageSize: 6 }} />
                    </Card>

                    <div style={{ marginTop: '24px' }}>
                        <Row gutter={[24, 24]}>
                            <Col span={12} className="animate-fade-in animate-delay-3">
                                <Card className="glass-card" title={<Space><span style={{ fontSize: '16px', fontWeight: 600 }}>Trend Analizi</span><Badge status="processing" text="Jonli" /></Space>} bordered={false}>
                                    {trendChartData.length > 0 ? <Area {...trendAreaConfig} height={250} /> : <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text type="secondary">Ma'lumotlar yuklanmoqda...</Text></div>}
                                </Card>
                            </Col>
                            <Col span={12} className="animate-fade-in animate-delay-4">
                                <Card className="glass-card" title={<Space><span style={{ fontSize: '16px', fontWeight: 600 }}>Hududlar bo'yicha tahlil</span></Space>} bordered={false}>
                                    <Column {...regionColumnConfig} height={250} />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </Col>

                <Col xs={24} lg={8} className="animate-fade-in animate-delay-3">
                    <Card className="glass-card" style={{ marginBottom: '24px' }} title={<Space><Badge status="warning" /> <span style={{ fontSize: '16px', fontWeight: 600 }}>Smart Analytics (AI)</span></Space>} bordered={false}>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                            {allForecasts.map((f, i) => (
                                <div key={i} onClick={() => { setSelectedDiseaseType(f.diseaseType); setIsModalVisible(true); }} style={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)', borderRadius: '12px', padding: '12px', marginBottom: '12px', borderLeft: `4px solid ${f.riskLevel === 'high' ? '#ff4d4f' : '#52c41a'}`, cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><Text strong>{f.diseaseName}</Text><Tag color={f.riskLevel === 'high' ? 'red' : 'green'}>{f.riskScore}%</Tag></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Text type="secondary" style={{ fontSize: '12px' }}>Prognoz: <span style={{ color: '#1677ff', fontWeight: 'bold' }}>{f.predictedValue}</span></Text><Text type={f.trend === 'increasing' ? 'danger' : 'success'} style={{ fontSize: '12px' }}>{f.trend === 'increasing' ? 'O\'sish' : 'Kamayish'} ({f.growthRate}%)</Text></div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Modal title={<Space><Badge status={selectedForecast?.riskLevel === 'high' ? 'error' : 'success'} /><span style={{ fontSize: '18px' }}>{selectedForecast?.diseaseName} prognozi va tahlili</span></Space>} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={[<Button key="close" onClick={() => setIsModalVisible(false)}>Yopish</Button>]} width={800} centered>
                <div style={{ padding: '20px 0' }}>
                    <div style={{ marginBottom: '20px', padding: '15px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9f9f9', borderRadius: '8px' }}>
                        <Row gutter={16}>
                            <Col span={8}><Statistic title="Hozirgi holat" value={selectedForecast?.currentValue || 0} /></Col>
                            <Col span={8}><Statistic title="Kelgusi oylik prognoz" value={selectedForecast?.predictedValue || 0} prefix={selectedForecast?.trend === 'increasing' ? <ArrowUpOutlined style={{ color: '#cf1322' }} /> : <ArrowDownOutlined style={{ color: '#3f8600' }} />} valueStyle={{ color: selectedForecast?.trend === 'increasing' ? '#cf1322' : '#3f8600' }} /></Col>
                            <Col span={8}><Statistic title="O'sish sur'ati" value={(selectedForecast?.growthRate || 0) + '%'} valueStyle={{ fontWeight: 'bold', color: '#1890ff' }} /></Col>
                        </Row>
                    </div>
                    <Title level={5} style={{ marginBottom: '15px' }}>Oylik dinamika va prognoz grafigi</Title>
                    <Area {...trendAreaConfig} height={300} />
                    <div style={{ marginTop: '20px' }}><Text type="secondary"><InfoCircleOutlined style={{ marginRight: '8px' }} />{selectedForecast?.trend === 'increasing' ? 'Kelgusi davrda kasallanish xavfi yuqori ekanligi aniqlandi.' : 'Kasallanish holati barqaror darajada kutilmoqda.'}</Text></div>
                </div>
            </Modal>
        </div>
    );
};

export default DashboardPage;
*/

