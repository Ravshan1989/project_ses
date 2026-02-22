import React, { useState, useEffect } from 'react';
// import { Card, Typography, DatePicker, Select, Button, message, Row, Col, Badge, Space } from 'antd';
// UZ: 'Card' komponenti import qilingan lekin ishlatilmagani uchun ESLint warning (ogohlantirish) berayotgan edi.
// UZ: O'zgarmas qoidalarga muvofiq, eski kod saqlab qolindi va yangi blok sifatida to'g'ri variant qo'shildi.
import { Typography, DatePicker, Select, Button, message, Row, Col, Badge, Space } from 'antd';
import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { exportsApi, dailyReportsApi, api, organizationsApi } from '../../services/api';
import { exportDailyReport, exportWeeklyReport } from '../../services/excelExportService';
import {
    exportHepatitisProfessional,
    exportFluProfessional,
    exportEpidemiologyProfessional,
    exportAriQuickProfessional
} from '../../services/dailyExcelExportService';
import { exportDailyReportPDF } from '../../services/pdfExportService';
import {
    exportHepatitisProfessionalPDF,
    exportFluProfessionalPDF,
    exportEpidemiologyProfessionalPDF,
    exportAriQuickProfessionalPDF
} from '../../services/dailyPdfExportService';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

// Report Types
const ExportPage: React.FC = () => {
    const { t } = useTranslation();

    // Moved inside component to use 't'
    const REPORT_TYPES = [
        { label: t('export_page.report_titles.hepatitis'), value: 'hepatitis' },
        { label: t('export_page.report_titles.flu'), value: 'flu' },
        { label: t('export_page.report_titles.weekly_flu') === 'export_page.report_titles.weekly_flu' ? "Gripp (Haftalik/Yig'ma)" : t('export_page.report_titles.weekly_flu'), value: 'weekly_flu' },
        { label: t('export_page.report_titles.ari'), value: 'ari' },
        { label: t('export_page.report_titles.covid'), value: 'covid' },
        { label: t('export_page.report_titles.epidemiology'), value: 'epidemiology' },
        { label: t('export_page.report_titles.form1'), value: 'form1' },
    ];

    const [dates, setDates] = useState<any>(null);
    const [reportType, setReportType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [districts, setDistricts] = useState<any[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [canSelectDistrict, setCanSelectDistrict] = useState(false);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const res = await api.get('/auth/profile');
            checkPermissionsAndLoadDistricts(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const checkPermissionsAndLoadDistricts = async (u: any) => {
        try {
            const res = await organizationsApi.getAll();
            const allOrgs = res.data;
            let childOrgs = [];

            if (u.organization) {
                childOrgs = allOrgs.filter((o: any) => o.parent?.id === u.organization.id);
            } else {
                childOrgs = allOrgs;
            }

            if (childOrgs.length > 0) {
                setDistricts(childOrgs);
                setCanSelectDistrict(true);
            }
        } catch (e) {
            console.error("Failed to load districts", e);
        }
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        if (!dates || !reportType) {
            message.warning(t('common.select_filter_warning'));
            return;
        }

        const startDate = dates[0].format('YYYY-MM-DD');
        const endDate = dates[1].format('YYYY-MM-DD');

        setLoading(true);
        try {
            let data: any[] = [];
            let districtName = "";
            if (selectedDistrict) {
                const d = districts.find(x => x.id === selectedDistrict);
                if (d) districtName = `_${d.name}`;
            }

            const fileName = `${reportType}_report_${startDate}_${endDate}${districtName}`;
            let title = '';
            let columns: any[] = [];
            const distId = selectedDistrict || undefined;

            // 1. Fetch Data based on type
            if (reportType === 'hepatitis') {
                const res = await exportsApi.getHepatitis(startDate, endDate, false, distId);
                data = res.data;
                title = t('export_page.report_titles.hepatitis');
                columns = [
                    { header: "№", key: "index", width: 5 },
                    { header: t('export_page.table_headers.region'), key: "organization.name", width: 20 },
                    { header: t('export_page.table_headers.date'), key: "reportDate", width: 12 },
                    { header: t('export_page.table_headers.status'), key: "status", width: 10 },
                    { header: t('export_page.table_headers.total_vga'), key: "total_cases", width: 10 },
                    { header: t('export_page.table_headers.age_under_1'), key: "age_under_1", width: 10 },
                    { header: t('export_page.table_headers.age_1_3'), key: "age_1_3", width: 10 },
                    { header: t('export_page.table_headers.age_4_6'), key: "age_4_6", width: 10 },
                    { header: t('export_page.table_headers.age_7_14'), key: "age_7_14", width: 10 },
                    { header: t('export_page.table_headers.age_15_19'), key: "age_15_19", width: 10 },
                    { header: t('export_page.table_headers.age_20_29'), key: "age_20_29", width: 10 },
                    { header: t('export_page.table_headers.age_30_plus'), key: "age_30_plus", width: 10 }
                ];
            } else if (reportType === 'flu') {
                const res = await exportsApi.getFlu(startDate, endDate, false, distId);
                data = res.data;
                title = t('export_page.report_titles.flu');
                columns = [
                    { header: "№", key: "index", width: 5 },
                    { header: t('export_page.table_headers.region'), key: "organization.name", width: 20 },
                    { header: t('export_page.table_headers.date'), key: "reportDate", width: 12 },
                    { header: t('export_page.table_headers.status'), key: "status", width: 10 },
                    { header: t('export_page.table_headers.ari_total'), key: "ari_total", width: 10 },
                    { header: t('export_page.table_headers.ari_0_1'), key: "ari_0_1", width: 10 },
                    { header: t('export_page.table_headers.ari_1_2'), key: "ari_1_2", width: 10 },
                    { header: t('export_page.table_headers.ari_3_6'), key: "ari_3_6", width: 10 },
                    { header: t('export_page.table_headers.ari_7_14'), key: "ari_7_14", width: 10 },
                    { header: t('export_page.table_headers.ari_adult'), key: "ari_adult", width: 10 }
                ];
            } else if (reportType === 'ari') {
                const res = await exportsApi.getAri(startDate, endDate, false, distId);
                data = res.data;
                title = t('export_page.report_titles.ari');
                columns = [
                    { header: "№", key: "index", width: 5 },
                    { header: t('export_page.table_headers.region'), key: "organization.name", width: 20 },
                    { header: t('export_page.table_headers.date'), key: "reportDate", width: 12 },
                    { header: t('export_page.table_headers.status'), key: "status", width: 10 },
                    { header: t('export_page.table_headers.hospitalization'), key: "gk", width: 15 },
                    { header: t('export_page.table_headers.ari_short'), key: "ari", width: 10 },
                    { header: t('export_page.table_headers.pneumonia'), key: "pneumonia", width: 10 }
                ];
            } else if (reportType === 'covid') {
                const res = await exportsApi.getCovid(startDate, endDate, false, distId);
                data = res.data;
                title = t('export_page.report_titles.covid');
                columns = [
                    { header: "№", key: "index", width: 5 },
                    { header: t('export_page.table_headers.region'), key: "organization.name", width: 20 },
                    { header: t('export_page.table_headers.date'), key: "reportDate", width: 12 },
                    { header: t('export_page.table_headers.status'), key: "status", width: 10 },
                    { header: t('export_page.table_headers.total'), key: "total_cases", width: 10 },
                    { header: t('export_page.table_headers.hospital_count'), key: "hospitalized_count", width: 10 },
                    { header: t('export_page.table_headers.reinfected'), key: "reinfected", width: 10 }
                ];
            } else if (reportType === 'epidemiology') {
                const res = await exportsApi.getEpidemiology(startDate, endDate, false, distId);
                data = res.data;
                title = t('export_page.report_titles.epidemiology');
                columns = [
                    { header: "№", key: "index", width: 5 },
                    { header: t('export_page.table_headers.region'), key: "organization.name", width: 20 },
                    { header: t('export_page.table_headers.date'), key: "reportDate", width: 12 },
                    { header: t('export_page.table_headers.status'), key: "status", width: 10 },
                    { header: t('export_page.table_headers.inspected_total'), key: "inspected_total", width: 12 },
                    { header: t('export_page.table_headers.defects_total'), key: "defects_total", width: 12 },
                    { header: t('export_page.table_headers.fines_total'), key: "fines_total", width: 12 },
                    { header: t('export_page.table_headers.suspended_total'), key: "suspended_total", width: 12 }
                ];
            } else if (reportType === 'weekly_flu') {
                const res = await dailyReportsApi.getWeeklySummary(startDate, endDate, false);
                let apiData = res.data || [];
                if (selectedDistrict) {
                    apiData = apiData.filter((d: any) => d.organization?.id === selectedDistrict);
                }
                data = apiData.map((item: any, idx: number) => ({
                    key: String(idx + 1),
                    district_name: item.organization?.name,
                    ...item
                }));
                title = t('export_page.report_titles.weekly_flu') === 'export_page.report_titles.weekly_flu' ? "Gripp (Haftalik/Yig'ma)" : t('export_page.report_titles.weekly_flu');
                // Weekly report export logic uses specialized service
                if (format === 'excel') {
                    exportWeeklyReport(data, fileName, title, `${startDate} - ${endDate}`, []); // Columns are predefined in service usually
                    setLoading(false);
                    message.success(t('common.success_export'));
                    return;
                }
                if (format === 'pdf') {
                    message.info(t('common.not_available_pdf') || "Forma-1 uchun PDF hozircha mavjud emas.");
                    setLoading(false);
                    return;
                }

                const response = await exportsApi.downloadForm1Excel(startDate, endDate, false, distId);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Form1_${startDate}_${endDate}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                setLoading(false);
                return;
            }

            data = data.map((item, index) => ({ ...item, index: index + 1 }));

            const orgLabel = selectedDistrict
                ? (districts.find(d => d.id === selectedDistrict)?.name || t('common.tashkent_region'))
                : t('common.tashkent_region');

            if (format === 'excel') {
                if (reportType === 'hepatitis') {
                    exportHepatitisProfessional(data, startDate, orgLabel);
                } else if (reportType === 'flu') {
                    exportFluProfessional(data, startDate, orgLabel);
                } else if (reportType === 'epidemiology') {
                    exportEpidemiologyProfessional(data, startDate, orgLabel);
                } else if (reportType === 'ari') {
                    exportAriQuickProfessional(data, startDate, orgLabel);
                } else {
                    await exportDailyReport(data, fileName, title, `${startDate} - ${endDate}`, columns);
                }
            } else {
                if (reportType === 'hepatitis') {
                    exportHepatitisProfessionalPDF(data, startDate, orgLabel);
                } else if (reportType === 'flu') {
                    exportFluProfessionalPDF(data, startDate, orgLabel);
                } else if (reportType === 'epidemiology') {
                    exportEpidemiologyProfessionalPDF(data, startDate, orgLabel);
                } else if (reportType === 'ari') {
                    exportAriQuickProfessionalPDF(data, startDate, orgLabel);
                } else {
                    await exportDailyReportPDF(data, columns, title, `${startDate} - ${endDate}`);
                }
            }

            message.success(t('common.success_export'));
        } catch (error) {
            console.error("Export failed", error);
            message.error(t('common.error_load_data'));
        } finally {
            setLoading(false);
        }
    };

    const cardStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        padding: '32px',
        marginTop: '20px'
    };

    const gradientText: React.CSSProperties = {
        background: 'linear-gradient(90deg, #1677ff 0%, #722ed1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
        fontWeight: 800
    };

    return (
        <div style={{ padding: '20px', minHeight: '80vh', background: 'radial-gradient(circle at top right, #f0f5ff, #ffffff)' }}>
            <style>{`
                .export-option-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    border: 2px solid transparent;
                    height: 100%;
                }
                .export-option-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                    border-color: #1677ff;
                }
                .premium-btn {
                    height: 50px;
                    border-radius: 12px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    transition: all 0.3s ease;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .excel-btn {
                    background: linear-gradient(135deg, #1d976c 0%, #93f9b9 100%);
                    color: white;
                }
                .excel-btn:hover {
                    box-shadow: 0 4px 15px rgba(29, 151, 108, 0.4);
                    filter: brightness(1.05);
                }
                .pdf-btn {
                    background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
                    color: white;
                }
                .pdf-btn:hover {
                    box-shadow: 0 4px 15px rgba(255, 65, 108, 0.4);
                    filter: brightness(1.05);
                }
            `}</style>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <Title level={1} style={gradientText}>{t('export_page.title')}</Title>
                    <div>
                        <Text type="secondary" style={{ fontSize: '18px' }}>
                            {t('export_page.subtitle')}
                        </Text>
                    </div>
                </div>

                <div style={cardStyle}>
                    <Row gutter={[32, 32]}>
                        <Col xs={24} lg={16}>
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={12}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <Text strong style={{ fontSize: '16px', color: '#434343' }}>
                                            <Badge status="processing" color="#1677ff" /> {t('common.date_range')}
                                        </Text>
                                    </div>
                                    <DatePicker.RangePicker
                                        style={{ width: '100%', height: '50px', borderRadius: '12px' }}
                                        onChange={(vals) => setDates(vals)}
                                        size="large"
                                    />
                                </Col>
                                <Col xs={24} md={12}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <Text strong style={{ fontSize: '16px', color: '#434343' }}>
                                            <Badge status="processing" color="#722ed1" /> {t('common.report_type')}
                                        </Text>
                                    </div>
                                    <Select
                                        style={{ width: '100%', height: '50px' }}
                                        placeholder={t('common.select_type')}
                                        onChange={(val) => setReportType(val)}
                                        options={REPORT_TYPES}
                                        size="large"
                                        className="premium-select"
                                    />
                                </Col>

                                {canSelectDistrict && (
                                    <Col span={24}>
                                        <div style={{ marginBottom: '12px' }}>
                                            <Text strong style={{ fontSize: '16px', color: '#434343' }}>
                                                <Badge status="processing" color="#faad14" /> {t('common.district')}
                                            </Text>
                                        </div>
                                        <Select
                                            style={{ width: '100%', height: '50px' }}
                                            placeholder={t('common.all_districts')}
                                            allowClear
                                            onChange={(val) => setSelectedDistrict(val)}
                                            options={districts.map(d => ({ label: d.name, value: d.id }))}
                                            size="large"
                                        />
                                    </Col>
                                )}
                            </Row>
                        </Col>

                        <Col xs={24} lg={8}>
                            <div style={{
                                background: 'rgba(240, 245, 255, 0.5)',
                                padding: '24px',
                                borderRadius: '20px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}>
                                <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>{t('export_page.download_title')}</Title>
                                <Space direction="vertical" style={{ width: '100%' }} size="large">
                                    <Button
                                        type="primary"
                                        icon={<FileExcelOutlined />}
                                        loading={loading}
                                        onClick={() => handleExport('excel')}
                                        className="premium-btn excel-btn"
                                        block
                                    >
                                        {t('export_page.download_excel')}
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<FilePdfOutlined />}
                                        loading={loading}
                                        onClick={() => handleExport('pdf')}
                                        className="premium-btn pdf-btn"
                                        block
                                    >
                                        {t('export_page.download_pdf')}
                                    </Button>
                                </Space>
                                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {t('export_page.auto_generate_hint')}
                                    </Text>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default ExportPage;
