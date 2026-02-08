import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, message, Card, Row, Col, Statistic, Select, Input, Typography, Badge, Tooltip, Collapse } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    SearchOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    FilterOutlined,
    DownloadOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { Column, Pie, Line } from '@ant-design/plots'; // UZ: Line grafik ham qo'shildi
import { api } from '../../services/api'; // UZ: API bilan ishlash uchun
// import { submissionApi } from '../../services/api';
import { Submission, SubmissionStatus } from '../../types';
import * as XLSX from 'xlsx';
import { Upload, UploadProps } from 'antd';

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

    const [forecastData, setForecastData] = useState<any>(null); // UZ: Bashorat ma'lumotlari
    const [selectedDiseaseType, setSelectedDiseaseType] = useState<string>('hepatitis'); // UZ: Tanlangan kasallik turi

    const fetchForecast = async (diseaseType: string = selectedDiseaseType) => {
        try {
            // UZ: Tanlangan kasallik bo'yicha bashoratni olish
            const res = await api.get(`/analysis/forecast?diseaseType=${diseaseType}`);
            setForecastData(res.data);
        } catch (e) {
            console.error("Forecast fetch error", e);
        }
    };

    useEffect(() => {
        fetchSubmissions();
        fetchForecast(); // UZ: Bashoratni yuklash
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

    // Excel Export
    const handleExport = () => {
        // Flatten data for Excel
        const dataToExport = submissions.map(s => ({
            [t('dashboard_page.table.region')]: s.organization.name,
            [t('dashboard_page.table.report_type')]: s.template.name,
            [t('dashboard_page.table.period')]: s.reportingPeriod,
            [t('dashboard_page.table.status')]: s.status,
            [t('user.created_at')]: s.createdAt,
            [t('common.analysis')]: JSON.stringify(s.data)
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, t('dashboard_page.incoming_reports'));
        XLSX.writeFile(wb, `RegionStat_${t('dashboard_page.incoming_reports')}.xlsx`);
        message.success(t('common.success_export'));
    };

    // Excel Import
    const uploadProps: UploadProps = {
        name: 'file',
        accept: '.xlsx, .xls',
        showUploadList: false,
        beforeUpload: (file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);

                    console.log('Imported Data:', jsonData);

                    if (jsonData.length > 0) {
                        message.success(t('common.import_success', { count: jsonData.length }));
                        // Logic to merge imported data would go here
                        // For demo, we just notify
                    } else {
                        message.warning(t('common.import_empty'));
                    }
                } catch (error) {
                    message.error(t('common.import_error'));
                }
            };
            reader.readAsBinaryString(file);
            return false; // Prevent default upload behavior
        },
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
            render: (text: string) => <Text strong>{text}</Text>
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

    // UZ: Grafiklar uchun ma'lumotlarni tayyorlash (Append)
    const statusChartData = [
        { type: t('dashboard_page.statuses.APPROVED'), value: approvedSubmissions },
        { type: t('dashboard_page.statuses.SUBMITTED'), value: pendingSubmissions },
        { type: t('dashboard_page.statuses.REJECTED'), value: rejectedSubmissions },
        { type: t('dashboard_page.statuses.DRAFT'), value: submissions.filter(s => s.status === SubmissionStatus.DRAFT).length },
    ];

    const regionChartData = REGION_DATA.slice(0, 10).map(r => ({
        name: r.name,
        population: r.population
    }));

    const statusPieConfig = {
        appendPadding: 10,
        data: statusChartData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: { type: 'outer', content: '{name} {percentage}' },
        interactions: [{ type: 'element-active' }],
    };

    const regionColumnConfig = {
        data: regionChartData,
        xField: 'name',
        yField: 'population',
        label: { position: 'middle', style: { fill: '#FFFFFF', opacity: 0.6 } },
        xAxis: { label: { autoRotate: true, autoHide: true } },
        meta: { name: { alias: t('dashboard_page.analysis.region_alias') }, population: { alias: t('dashboard_page.analysis.population_alias') } },
    };

    // UZ: Bashorat grafigi uchun ma'lumot (Append)
    const forecastChartData = forecastData ? [
        ...forecastData.historicalData.map((v: number, i: number) => ({
            month: t('dashboard_page.analysis.month_offset_label', { offset: 6 - i }),
            cases: v,
            type: t('dashboard_page.analysis.historical_label')
        })),
        {
            month: t('dashboard_page.analysis.next_month_label'),
            cases: forecastData.predictedValue,
            type: t('dashboard_page.analysis.forecast_label')
        }
    ] : [];

    const forecastConfig = {
        data: forecastChartData,
        xField: 'month',
        yField: 'cases',
        seriesField: 'type',
        color: ({ type }: any) => {
            return type === t('dashboard_page.analysis.forecast_label') ? '#f5222d' : '#1677ff';
        },
        lineStyle: ({ type }: any) => {
            if (type === t('dashboard_page.analysis.forecast_label')) return { lineDash: [4, 4], opacity: 1 };
            return { opacity: 0.6 };
        },
        point: { size: 5, shape: 'diamond' },
        label: { style: { fill: '#aaa' } },
    };

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

            {/* Modern Gradient Statistics Cards */}
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

            {/* UZ: Yangi Vizual Analitika qismi - Enhanced with Gradient Borders */}
            <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
                <Col span={10}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '3px',
                        borderRadius: '18px',
                        boxShadow: '0 8px 16px rgba(102, 126, 234, 0.25)'
                    }}>
                        <Card
                            bordered={false}
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '24px' }}>📊</span>
                                    <Typography.Text strong style={{ fontSize: '16px', color: '#1f1f1f' }}>
                                        {t('dashboard_page.statuses.SUBMITTED')} {t('dashboard_page.analysis.chart_submissions_title')}
                                    </Typography.Text>
                                </div>
                            }
                            style={{
                                borderRadius: '16px',
                                background: '#fff',
                                margin: 0
                            }}
                        >
                            <Pie {...statusPieConfig} height={250} />
                        </Card>
                    </div>
                </Col>
                <Col span={14}>
                    <div style={{
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        padding: '3px',
                        borderRadius: '18px',
                        boxShadow: '0 8px 16px rgba(56, 239, 125, 0.25)'
                    }}>
                        <Card
                            bordered={false}
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '24px' }}>📈</span>
                                    <Typography.Text strong style={{ fontSize: '16px', color: '#1f1f1f' }}>
                                        {t('dashboard_page.analysis.chart_regions_title')}
                                    </Typography.Text>
                                </div>
                            }
                            style={{
                                borderRadius: '16px',
                                background: '#fff',
                                margin: 0
                            }}
                        >
                            <Column {...regionColumnConfig} height={250} />
                        </Card>
                    </div>
                </Col>
            </Row>

            {/* UZ: Smart Analytics - Bashorat qismi - Accordion Style */}
            <Row gutter={16} style={{ marginBottom: '32px' }}>
                <Col span={24}>
                    <div style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        padding: '3px',
                        borderRadius: '18px',
                        boxShadow: '0 8px 16px rgba(245, 87, 108, 0.25)'
                    }}>
                        <Card
                            bordered={false}
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '24px' }}>🧠</span>
                                    <Typography.Text strong style={{ fontSize: '16px', color: '#1f1f1f' }}>
                                        {t('dashboard_page.analysis.forecast_card_title')}
                                    </Typography.Text>
                                </div>
                            }
                            style={{
                                borderRadius: '16px',
                                background: '#fff',
                                margin: 0
                            }}
                        >
                            <Collapse
                                accordion
                                defaultActiveKey={['hepatitis']}
                                onChange={(key: string | string[]) => {
                                    if (key && key.length > 0) {
                                        const diseaseType = Array.isArray(key) ? key[0] : key;
                                        setSelectedDiseaseType(diseaseType as string);
                                        fetchForecast(diseaseType as string);
                                    }
                                }}
                                items={[
                                    {
                                        key: 'hepatitis',
                                        label: (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '24px' }}>🟡</span>
                                                <Typography.Text strong style={{ fontSize: '15px' }}>Gepatit (Hepatitis)</Typography.Text>
                                            </div>
                                        ),
                                        children: selectedDiseaseType === 'hepatitis' && forecastData ? (
                                            <Row gutter={24} align="middle">
                                                <Col span={16}>
                                                    <Line {...forecastConfig} height={280} />
                                                </Col>
                                                <Col span={8}>
                                                    <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', padding: '28px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                                        <ClockCircleOutlined style={{ fontSize: '36px', color: '#f59e0b', marginBottom: '16px' }} />
                                                        <Statistic
                                                            title={t('dashboard_page.analysis.expected_cases')}
                                                            value={forecastData?.predictedValue || 0}
                                                            valueStyle={{ color: '#dc2626', fontSize: '38px', fontWeight: 'bold' }}
                                                        />
                                                        <div style={{ marginTop: '16px' }}>
                                                            <Badge status="processing" text={`${t('dashboard_page.analysis.confidence_level')}: ${forecastData?.confidence || '0%'}`} />
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        ) : <div style={{ textAlign: 'center', padding: '20px' }}><Text type="secondary">Yuklanmoqda...</Text></div>
                                    },
                                    {
                                        key: 'flu',
                                        label: (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '24px' }}>🤧</span>
                                                <Typography.Text strong style={{ fontSize: '15px' }}>Gripp (Influenza)</Typography.Text>
                                            </div>
                                        ),
                                        children: selectedDiseaseType === 'flu' && forecastData ? (
                                            <Row gutter={24} align="middle">
                                                <Col span={16}>
                                                    <Line {...forecastConfig} height={280} />
                                                </Col>
                                                <Col span={8}>
                                                    <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', padding: '28px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                                        <ClockCircleOutlined style={{ fontSize: '36px', color: '#3b82f6', marginBottom: '16px' }} />
                                                        <Statistic
                                                            title={t('dashboard_page.analysis.expected_cases')}
                                                            value={forecastData?.predictedValue || 0}
                                                            valueStyle={{ color: '#dc2626', fontSize: '38px', fontWeight: 'bold' }}
                                                        />
                                                        <div style={{ marginTop: '16px' }}>
                                                            <Badge status="processing" text={`${t('dashboard_page.analysis.confidence_level')}: ${forecastData?.confidence || '0%'}`} />
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        ) : <div style={{ textAlign: 'center', padding: '20px' }}><Text type="secondary">Yuklanmoqda...</Text></div>
                                    },
                                    {
                                        key: 'ari',
                                        label: (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '24px' }}>😷</span>
                                                <Typography.Text strong style={{ fontSize: '15px' }}>YUQTI (ARI)</Typography.Text>
                                            </div>
                                        ),
                                        children: selectedDiseaseType === 'ari' && forecastData ? (
                                            <Row gutter={24} align="middle">
                                                <Col span={16}>
                                                    <Line {...forecastConfig} height={280} />
                                                </Col>
                                                <Col span={8}>
                                                    <div style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', padding: '28px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                                        <ClockCircleOutlined style={{ fontSize: '36px', color: '#22c55e', marginBottom: '16px' }} />
                                                        <Statistic
                                                            title={t('dashboard_page.analysis.expected_cases')}
                                                            value={forecastData?.predictedValue || 0}
                                                            valueStyle={{ color: '#dc2626', fontSize: '38px', fontWeight: 'bold' }}
                                                        />
                                                        <div style={{ marginTop: '16px' }}>
                                                            <Badge status="processing" text={`${t('dashboard_page.analysis.confidence_level')}: ${forecastData?.confidence || '0%'}`} />
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        ) : <div style={{ textAlign: 'center', padding: '20px' }}><Text type="secondary">Yuklanmoqda...</Text></div>
                                    },
                                    {
                                        key: 'covid',
                                        label: (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '24px' }}>🦠</span>
                                                <Typography.Text strong style={{ fontSize: '15px' }}>COVID-19</Typography.Text>
                                            </div>
                                        ),
                                        children: selectedDiseaseType === 'covid' && forecastData ? (
                                            <Row gutter={24} align="middle">
                                                <Col span={16}>
                                                    <Line {...forecastConfig} height={280} />
                                                </Col>
                                                <Col span={8}>
                                                    <div style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', padding: '28px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                                        <ClockCircleOutlined style={{ fontSize: '36px', color: '#ec4899', marginBottom: '16px' }} />
                                                        <Statistic
                                                            title={t('dashboard_page.analysis.expected_cases')}
                                                            value={forecastData?.predictedValue || 0}
                                                            valueStyle={{ color: '#dc2626', fontSize: '38px', fontWeight: 'bold' }}
                                                        />
                                                        <div style={{ marginTop: '16px' }}>
                                                            <Badge status="processing" text={`${t('dashboard_page.analysis.confidence_level')}: ${forecastData?.confidence || '0%'}`} />
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        ) : <div style={{ textAlign: 'center', padding: '20px' }}><Text type="secondary">Yuklanmoqda...</Text></div>
                                    }
                                ]}
                            />
                        </Card>
                    </div>
                </Col>
            </Row>

            {/* Main Content Area */}
            <Row gutter={24}>
                {/* Left Column: Submissions Table */}
                <Col span={16}>
                    <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <Title level={4} style={{ margin: 0, whiteSpace: 'nowrap' }}>{t('dashboard_page.incoming_reports')}</Title>
                            <Space wrap>
                                <Input
                                    placeholder={t('dashboard_page.search_placeholder')}
                                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                    style={{ width: 200 }}
                                    allowClear
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                                <Select
                                    placeholder={t('dashboard_page.status_placeholder')}
                                    style={{ width: 120 }}
                                    allowClear
                                    onChange={setStatusFilter}
                                >
                                    {Object.values(SubmissionStatus).map(status => (
                                        <Option key={status} value={status}>{status}</Option>
                                    ))}
                                </Select>
                                <Button icon={<FilterOutlined />}>{t('dashboard_page.filter_btn')}</Button>
                                <Button icon={<DownloadOutlined />} onClick={handleExport}>{t('dashboard_page.export_btn')}</Button>
                                <Upload {...uploadProps}>
                                    <Button icon={<UploadOutlined />}>{t('dashboard_page.upload_btn')}</Button>
                                </Upload>
                            </Space>
                        </div>

                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </Col>

                {/* Right Column: Population Stats */}
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%' }}>
                        <Title level={4} style={{ marginBottom: '16px' }}>{t('dashboard_page.region_title')}</Title>
                        <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
                            {REGION_DATA.sort((a, b) => b.population - a.population).map((item, index) => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: '1px solid #f0f0f0'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Badge count={index + 1} style={{ backgroundColor: index < 3 ? '#667eea' : '#d9d9d9', boxShadow: 'none' }} />
                                        <div>
                                            <Text strong style={{ display: 'block' }}>{item.name}</Text>
                                            <Text type="secondary" style={{ fontSize: '11px' }}>{item.type}</Text>
                                        </div>
                                    </div>
                                    <Text strong>{item.population.toLocaleString()}</Text>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
