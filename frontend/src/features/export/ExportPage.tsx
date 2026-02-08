import React, { useState, useEffect } from 'react';
import { Card, Typography, DatePicker, Select, Button, message, Row, Col, Badge, Space } from 'antd';
import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { exportsApi, dailyReportsApi, api, organizationsApi, API_BASE_URL } from '../../services/api';
import { exportDailyReport, exportWeeklyReport } from '../../services/excelExportService';
import { exportDailyReportPDF } from '../../services/pdfExportService';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

// Report Types
const REPORT_TYPES = [
    { label: 'Virusli Gepatit A (VGA)', value: 'hepatitis' },
    { label: 'Gripp va O\'RVI', value: 'flu' },
    { label: 'Gripp (Haftalik/Yig\'ma)', value: 'weekly_flu' },
    { label: 'O\'RVI (Ari)', value: 'ari' },
    { label: 'Koronavirus (Covid)', value: 'covid' },
    { label: 'Epidemiologiya', value: 'epidemiology' },
    { label: 'Shakl 1 (Oylik)', value: 'form1' },
];

const ExportPage: React.FC = () => {
    const { t } = useTranslation();
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
        // If user is Admin or Region level, they should see districts.
        // We will assume if they can view these reports, they might want to filter.
        try {
            const res = await organizationsApi.getAll();
            // Filter: detailed districts are those with a parent (usually). 
            // Or just show all except the current user's organization if appropriate.
            // Let's show organizations that are 'below' the current user.
            // For simplicity in this project (as per seed):
            // Districts have parents. Regions have parents (Republic). 
            // If I am Region, I want to see *my* districts.
            // Backend `getAll` returns all. 
            // Front-end filtering:
            // If I am Level 2 (Region), I want to see orgs where parent.id === my.org.id.

            const allOrgs = res.data;
            let childOrgs = [];

            if (u.organization) {
                childOrgs = allOrgs.filter((o: any) => o.parent?.id === u.organization.id);
            } else {
                // Admin case?
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
            message.warning(t('common.select_filter_warning') || "Iltimos, vaqt oralig'i va hisobot turini tanlang.");
            return;
        }

        const startDate = dates[0].format('YYYY-MM-DD');
        const endDate = dates[1].format('YYYY-MM-DD');

        setLoading(true);
        try {
            let data: any[] = [];
            // UZ: Fayl nomiga tuman nomini qo'shish (agar tanlangan bo'lsa)
            let districtName = "";
            if (selectedDistrict) {
                const d = districts.find(x => x.id === selectedDistrict);
                if (d) districtName = `_${d.name}`;
            }

            const fileName = `${reportType}_report_${startDate}_${endDate}${districtName}`;
            let title = '';
            let columns: any[] = [];

            // Params object
            // UZ: API chaqiruvlarda districtId parametrini qo'shamiz (hozircha export funksiyalari o'zgartirilmagan, lekin `getAll` tipidagilar districtId qabul qilishi kerak)
            // Backend controller update qilingan.

            // Helper to get params
            // Note: services/api.ts methods might not accept districtId argument directly yet in the interface definition?
            // Need to check api.ts. I updated backend, but not frontend api.ts signature?
            // I should update api.ts signature generally, or just append query string manually if needed.
            // But wait, I didn't update api.ts in this plan. I should have. 
            // The `api.ts` file shows: `getFlu: (startDate, endDate, isTest)`
            // I can pass it by modifying the URL inside the function or updating the function signature.
            // I will update the function signature in api.ts NEXT. For now, assuming they will support it.
            // Actually, I can allow extra args or just update api.ts as part of this TASK.

            // I will assume I will update api.ts in the next step.
            // Passing extra arg here.
            const distId = selectedDistrict || undefined;

            // 1. Fetch Data based on type
            if (reportType === 'hepatitis') {
                const res = await exportsApi.getHepatitis(startDate, endDate, false, distId);
                data = res.data;

                title = "Virusli Gepatit A bo'yicha kunlik hisobot";
                columns = [
                    { header: "№", key: "index", width: 5 },
                    { header: "Hudud", key: "organization.name", width: 20 },
                    { header: "Sana", key: "reportDate", width: 12 },
                    { header: "Holat", key: "status", width: 10 },
                    { header: "Jami (VGA)", key: "total_cases", width: 10 },
                    { header: "1 yoshgacha", key: "age_under_1", width: 10 },
                    { header: "1-3 yosh", key: "age_1_3", width: 10 },
                    { header: "4-6 yosh", key: "age_4_6", width: 10 },
                    { header: "7-14 yosh", key: "age_7_14", width: 10 },
                    { header: "15-19 yosh", key: "age_15_19", width: 10 },
                    { header: "20-29 yosh", key: "age_20_29", width: 10 },
                    { header: "30+ yosh", key: "age_30_plus", width: 10 }
                ];
            } else if (reportType === 'flu') {
                const res = await exportsApi.getFlu(startDate, endDate, false, distId);
                data = res.data;
                title = "Gripp va O'RVI bo'yicha kunlik hisobot";
                columns = [
                    { header: "№", key: "index", width: 5 },
                    { header: "Hudud", key: "organization.name", width: 20 },
                    { header: "Sana", key: "reportDate", width: 12 },
                    { header: "Holat", key: "status", width: 10 },
                    { header: "Jami (ARI)", key: "ari_total", width: 10 },
                    { header: "0-1 yosh", key: "ari_0_1", width: 10 },
                    { header: "1-2 yosh", key: "ari_1_2", width: 10 },
                    { header: "3-6 yosh", key: "ari_3_6", width: 10 },
                    { header: "7-14 yosh", key: "ari_7_14", width: 10 },
                    { header: "Kattalar", key: "ari_adult", width: 10 }
                ];
            } else if (reportType === 'ari') {
                const res = await exportsApi.getAri(startDate, endDate, false, distId);
                data = res.data;
                title = "O'RVI (Qisqa) bo'yicha kunlik hisobot";
                columns = [
                    { header: "№", key: "index", width: 5 },
                    { header: "Hudud", key: "organization.name", width: 20 },
                    { header: "Sana", key: "reportDate", width: 12 },
                    { header: "Holat", key: "status", width: 10 },
                    { header: "Gospitalizatsiya", key: "gk", width: 15 },
                    { header: "ARI jami", key: "ari", width: 10 },
                    { header: "Pnevmoniya", key: "pneumonia", width: 10 }
                ];
            } else if (reportType === 'covid') {
                const res = await exportsApi.getCovid(startDate, endDate, false, distId);
                data = res.data;
                title = "Koronavirus bo'yicha kunlik hisobot";
                columns = [
                    { header: "№", key: "index", width: 5 },
                    { header: "Hudud", key: "organization.name", width: 20 },
                    { header: "Sana", key: "reportDate", width: 12 },
                    { header: "Holat", key: "status", width: 10 },
                    { header: "Jami", key: "total_cases", width: 10 },
                    { header: "Hospital", key: "hospitalized_count", width: 10 },
                    { header: "Qayta", key: "reinfected", width: 10 }
                ];
            } else if (reportType === 'epidemiology') {
                const res = await exportsApi.getEpidemiology(startDate, endDate, false, distId);
                data = res.data;
                title = "Epidemiologiya bo'yicha kunlik hisobot";
                columns = [
                    { header: "№", key: "index", width: 5 },
                    { header: "Hudud", key: "organization.name", width: 20 },
                    { header: "Sana", key: "reportDate", width: 12 },
                    { header: "Holat", key: "status", width: 10 },
                    { header: "Tekshirildi", key: "inspected_total", width: 12 },
                    { header: "Kamchilik", key: "defects_total", width: 12 },
                    { header: "Jarima", key: "fines_total", width: 12 },
                    { header: "To'xtatildi", key: "suspended_total", width: 12 }
                ];
            } else if (reportType === 'weekly_flu') {
                const res = await dailyReportsApi.getWeeklySummary(startDate, endDate, false); // Weekly summary aggregation usually ignores district filter or shows all. 
                // If user wants filtered weekly summary, we need to support it in getWeeklySummary too.
                // But for now, let's keep it as is, or filter on frontend? 
                // getWeeklySummary returns data grouped by organization.
                let apiData = res.data || [];

                if (selectedDistrict) {
                    apiData = apiData.filter((d: any) => d.organization?.id === selectedDistrict);
                }

                data = apiData.map((item: any, idx: number) => ({
                    key: String(idx + 1),
                    district_name: item.organization?.name,
                    ...item
                }));
                title = t('daily_reports.weekly_export_title');

                columns = [
                    { title: t('daily_reports.table.no'), dataIndex: 'key', width: 40 },
                    { title: t('daily_reports.table.district'), dataIndex: 'district_name', width: 140 },
                    {
                        title: t('reports.ari'),
                        children: [
                            { title: t('daily_reports.table.lab_total'), width: 60, dataIndex: 'ari_total' },
                            { title: t('daily_reports.table.age_0_1'), width: 50, dataIndex: 'ari_0_1' },
                            { title: t('daily_reports.table.age_1_2'), width: 50, dataIndex: 'ari_1_2' },
                            { title: t('daily_reports.table.age_3_6'), width: 50, dataIndex: 'ari_3_6' },
                            { title: t('daily_reports.table.age_7_14'), width: 55, dataIndex: 'ari_7_14' },
                            { title: t('daily_reports.table.adults'), width: 65, dataIndex: 'ari_adult' },
                            { title: t('daily_reports.table.students'), width: 55, dataIndex: 'ari_students' },
                            { title: t('daily_reports.table.nursery'), width: 55, dataIndex: 'ari_nursery' },
                        ]
                    },
                    {
                        title: t('reports.pneumonia'),
                        children: [
                            { title: t('daily_reports.table.lab_total'), width: 60, dataIndex: 'pneu_total' },
                            { title: t('daily_reports.table.age_0_2'), width: 50, dataIndex: 'pneu_0_2' },
                            { title: t('daily_reports.table.age_3_6'), width: 50, dataIndex: 'pneu_3_6' },
                            { title: t('daily_reports.table.age_7_14'), width: 55, dataIndex: 'pneu_7_14' },
                            { title: t('daily_reports.table.adults'), width: 65, dataIndex: 'pneu_adult' },
                            { title: t('daily_reports.table.students'), width: 55, dataIndex: 'pneu_students' },
                            { title: t('daily_reports.table.nursery'), width: 55, dataIndex: 'pneu_nursery' },
                        ]
                    },
                    {
                        title: t('reports.flu'),
                        children: [
                            { title: t('daily_reports.table.lab_total'), width: 60, dataIndex: 'flu_total' },
                            { title: t('daily_reports.table.age_0_1'), width: 50, dataIndex: 'flu_0_1' },
                            { title: t('daily_reports.table.age_1_2'), width: 50, dataIndex: 'flu_1_2' },
                            { title: t('daily_reports.table.age_3_6'), width: 50, dataIndex: 'flu_3_6' },
                            { title: t('daily_reports.table.age_7_14'), width: 55, dataIndex: 'flu_7_14' },
                            { title: t('daily_reports.table.adults'), width: 65, dataIndex: 'flu_adult' },
                            { title: t('daily_reports.table.students'), width: 55, dataIndex: 'flu_students' },
                            { title: t('daily_reports.table.nursery'), width: 55, dataIndex: 'flu_nursery' },
                        ]
                    },
                    {
                        title: t('daily_reports.table.sari'),
                        children: [
                            { title: t('daily_reports.table.lab_total'), width: 60, dataIndex: 'sari_total' },
                            { title: t('daily_reports.table.age_0_2'), width: 50, dataIndex: 'sari_0_2' },
                            { title: t('daily_reports.table.age_3_6'), width: 50, dataIndex: 'sari_3_6' },
                            { title: t('daily_reports.table.age_7_14'), width: 55, dataIndex: 'sari_7_14' },
                            { title: t('daily_reports.table.adults'), width: 65, dataIndex: 'sari_adult' },
                        ]
                    },
                    {
                        title: t('daily_reports.table.deaths'),
                        children: [
                            { title: t('daily_reports.table.lab_total'), width: 60, dataIndex: 'death_total' },
                            { title: t('daily_reports.table.pregnant'), width: 80, dataIndex: 'death_pregnant' },
                        ]
                    }
                ];

                if (format === 'excel') {
                    exportWeeklyReport(data, fileName, title, `${startDate} - ${endDate}`, columns);
                    setLoading(false);
                    message.success(t('common.success_export'));
                    return;
                } else {
                    // PDF for Weekly Summary (Simplified)
                    const pdfColumns = [
                        { header: t('daily_reports.table.no'), key: 'key' },
                        { header: t('daily_reports.table.district'), key: 'district_name' },
                        { header: `${t('reports.ari')} (${t('daily_reports.table.lab_total')})`, key: 'ari_total' },
                        { header: `${t('reports.pneumonia')} (${t('daily_reports.table.lab_total')})`, key: 'pneu_total' },
                        { header: `${t('reports.flu')} (${t('daily_reports.table.lab_total')})`, key: 'flu_total' },
                        { header: `${t('daily_reports.table.sari')} (${t('daily_reports.table.lab_total')})`, key: 'sari_total' },
                        { header: `${t('daily_reports.table.deaths')} (${t('daily_reports.table.lab_total')})`, key: 'death_total' }
                    ];
                    exportDailyReportPDF(data, pdfColumns, title, `${startDate} - ${endDate}`, true);
                    setLoading(false);
                    message.success(t('common.success_export'));
                    return;
                }
            } else if (reportType === 'form1') {
                if (format === 'pdf') {
                    message.info("Forma-1 uchun PDF hozircha mavjud emas.");
                    setLoading(false);
                    return;
                }
                // Use backend Excel generation for Form 1
                const downloadUrl = `${API_BASE_URL}/exports/form1/excel?startDate=${startDate}&endDate=${endDate}&isTest=false&districtId=${distId || ''}`;
                window.open(downloadUrl, '_blank');
                setLoading(false);
                return;
            }

            // Universal Add Index for other reports
            data = data.map((item, index) => ({ ...item, index: index + 1 }));

            // 2. Export Generation
            if (format === 'excel') {
                exportDailyReport(data, fileName, title, `${startDate} - ${endDate}`, columns);
            } else {
                exportDailyReportPDF(data, columns, title, `${startDate} - ${endDate}`);
            }

            message.success(t('common.success_export') || "Muvaffaqiyatli yuklab olindi!");
        } catch (error) {
            console.error("Export failed", error);
            message.error(t('common.error_load_data'));
        } finally {
            setLoading(false);
        }
    };

    // --- PREMIUM UI UPDATE ---
    // UZ: Dizaynni "Wow" darajaga ko'tarish uchun yangi interfeys qo'shildi.
    // Eski dizayn pastroqda izoh ko'rinishida saqlab qolindi (O'zgarmas Qoidalar).

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
                    <Title level={1} style={gradientText}>{t('common.export_title') || 'Hisobotlarni Eksport Qilish'}</Title>
                    <div>
                        <Text type="secondary" style={{ fontSize: '18px' }}>
                            {t('common.export_subtitle') || "Vaqt oralig'i va hisobot turini tanlang, so'ngra faylni yuklab oling."}
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
                                            <Badge status="processing" color="#1677ff" /> {t('common.date_range') || "Vaqt oralig'i:"}
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
                                            <Badge status="processing" color="#722ed1" /> {t('common.report_type') || "Hisobot turi:"}
                                        </Text>
                                    </div>
                                    <Select
                                        style={{ width: '100%', height: '50px' }}
                                        placeholder={t('common.select_type') || "Turini tanlang"}
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
                                                <Badge status="processing" color="#faad14" /> {t('common.district') || "Hudud (Tuman/Shahar):"}
                                            </Text>
                                        </div>
                                        <Select
                                            style={{ width: '100%', height: '50px' }}
                                            placeholder={t('common.all_districts') || "Barcha hududlar"}
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
                                <Title level={4} style={{ marginBottom: '24px', textAlign: 'center' }}>Yuklab Olish</Title>
                                <Space direction="vertical" style={{ width: '100%' }} size="large">
                                    <Button
                                        type="primary"
                                        icon={<FileExcelOutlined />}
                                        loading={loading}
                                        onClick={() => handleExport('excel')}
                                        className="premium-btn excel-btn"
                                        block
                                    >
                                        EXCEL formatida yuklash
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<FilePdfOutlined />}
                                        loading={loading}
                                        onClick={() => handleExport('pdf')}
                                        className="premium-btn pdf-btn"
                                        block
                                    >
                                        PDF formatida yuklash
                                    </Button>
                                </Space>
                                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        * Hisobotlar avtomatik tarzda generatsiya qilinadi.
                                    </Text>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );

    /* --- ESKI DIZAYN (O'zgarmas Qoidalar asosida saqlab qolindi) ---
    return (
        <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '24px' }}>
                <Title level={3} style={{ margin: 0 }}>{t('common.export_title') || 'Hisobotlarni Eksport Qilish'}</Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                    {t('common.export_subtitle') || "Vaqt oralig'i va hisobot turini tanlang, so'ngra Excel yoki PDF faylni yuklab oling."}
                </Text>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <div style={{ marginBottom: '8px' }}><Text strong>{t('common.date_range') || "Vaqt oralig'i:"}</Text></div>
                    <DatePicker.RangePicker style={{ width: '100%' }} onChange={(vals) => setDates(vals)} />
                </Col>
                <Col xs={24} md={8}>
                    <div style={{ marginBottom: '8px' }}><Text strong>{t('common.report_type') || "Hisobot turi:"}</Text></div>
                    <Select style={{ width: '100%' }} placeholder={t('common.select_type') || "Turini tanlang"} onChange={(val) => setReportType(val)} options={REPORT_TYPES} />
                </Col>

                {canSelectDistrict && (
                    <Col xs={24} md={8}>
                        <div style={{ marginBottom: '8px' }}><Text strong>{t('common.district') || "Hudud (Tuman/Shahar):"}</Text></div>
                        <Select
                            style={{ width: '100%' }}
                            placeholder={t('common.all_districts') || "Barcha hududlar"}
                            allowClear
                            onChange={(val) => setSelectedDistrict(val)}
                            options={districts.map(d => ({ label: d.name, value: d.id }))}
                        />
                    </Col>
                )}

                <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                    <Button
                        type="primary"
                        icon={<FileExcelOutlined />}
                        size="large"
                        loading={loading}
                        onClick={() => handleExport('excel')}
                        style={{ backgroundColor: '#217346', borderColor: '#217346' }}
                        block
                    >
                        Excel
                    </Button>
                    <Button
                        type="primary"
                        danger
                        icon={<FilePdfOutlined />}
                        size="large"
                        loading={loading}
                        onClick={() => handleExport('pdf')}
                        block
                    >
                        PDF
                    </Button>
                </Col>
            </Row>
        </Card>
    );
    */
};

export default ExportPage;
