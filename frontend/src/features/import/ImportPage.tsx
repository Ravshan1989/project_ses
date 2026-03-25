import React, { useState } from 'react';
import { Card, Typography, Button, Select, message, Alert, Result, Space, Divider } from 'antd';
import { Upload } from 'antd';
import { CloudUploadOutlined, InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

import { importsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const REPORT_TYPES = [
    { label: 'Virusli Gepatit A (VGA)', value: 'hepatitis' },
    { label: 'Gripp va O\'RVI', value: 'flu' },
    { label: 'Shakl 1 (Oylik)', value: 'form1' },
    { label: 'Aholi soni (Population)', value: 'population' },
];

const ImportPage: React.FC = () => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [reportType, setReportType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const userRole = localStorage.getItem('user_role');
    const isAllowed = userRole === 'REGION_HEAD' || userRole === 'ADMIN';

    if (!isAllowed) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Result
                    status="403"
                    title="403"
                    subTitle={t('import.no_access') || "Kechirasiz, bu sahifaga kirish huquqingiz yo'q. Faqat viloyat darajasida ruxsat berilgan."}
                    extra={<Button type="primary" onClick={() => window.history.back()}>{t('common.back')}</Button>}
                />
            </div>
        );
    }

    const handleUpload = async () => {
        if (!file) {
            message.error(t('import.error_no_file') || "Iltimos, fayl tanlang!");
            return;
        }
        if (!reportType) {
            message.error(t('import.error_no_type') || "Iltimos, hisobot turini tanlang!");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await importsApi.importGlobal(file, reportType);
            setResult(res.data);
            message.success(t('import.success') || "Muvaffaqiyatli yuklandi!");
            setFile(null); // Reset
        } catch (error: any) {
            console.error("Import error", error);
            message.error(error.response?.data?.message || t('import.error_failed') || "Yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const props = {
        onRemove: () => {
            setFile(null);
        },
        beforeUpload: (file: File) => {
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx');
            if (!isExcel) {
                message.error(`${file.name} - ${t('import.error_format') || "noto'g'ri fayl formati. Faqat .xlsx fayllar qabul qilinadi."}`);
                return Upload.LIST_IGNORE;
            }
            setFile(file);
            return false;
        },
        fileList: file ? [file] : [],
        maxCount: 1
    };

    const cardStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.08)',
        padding: '10px',
        overflow: 'hidden'
    };

    const headerGradient: React.CSSProperties = {
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        padding: '40px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: '#f8fafc' }}>
            <style>{`
                .import-select .ant-select-selector {
                    border-radius: 12px !important;
                    height: 50px !important;
                    display: flex !important;
                    align-items: center !important;
                    border: 1px solid #e2e8f0 !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
                }
                .import-dragger {
                    background: rgba(248, 250, 252, 0.5) !important;
                    border: 2px dashed #cbd5e1 !important;
                    border-radius: 20px !important;
                    transition: all 0.3s ease !important;
                }
                .import-dragger:hover {
                    border-color: #6366f1 !important;
                    background: rgba(99, 102, 241, 0.02) !important;
                }
                .upload-btn {
                    height: 56px !important;
                    border-radius: 16px !important;
                    font-weight: 700 !important;
                    font-size: 16px !important;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
                    border: none !important;
                    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.25) !important;
                    transition: all 0.3s ease !important;
                }
                .upload-btn:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 15px 30px rgba(79, 70, 229, 0.35) !important;
                }
                .upload-btn:disabled {
                    background: #e2e8f0 !important;
                    box-shadow: none !important;
                }
                .result-card {
                    animation: slideUp 0.5s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            <Card style={cardStyle}>
                <div style={headerGradient}>
                    <div style={{ position: 'absolute', right: '-50px', top: '-50px', opacity: 0.1 }}>
                        <CloudUploadOutlined style={{ fontSize: '250px' }} />
                    </div>
                    <Space direction="vertical" size={4}>
                        <Title level={1} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
                            {t('import.title') || "Ma'lumotlarni Yuklash (Import)"}
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px' }}>
                            {t('import.subtitle') || "Real ma'lumotlarni tizimga tezkor yuklash va yangilash"}
                        </Text>
                    </Space>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 40px' }}>
                    <Alert
                        message={
                            <Space>
                                <InfoCircleOutlined style={{ color: '#0ea5e9' }} />
                                <Text strong>{t('import.alert_title') || "DIQQAT VA QOIDA"}</Text>
                            </Space>
                        }
                        description={
                            <div style={{ marginTop: 8 }}>
                                <Text style={{ fontSize: '14px' }}>
                                    {t('import.alert_desc') || "Yuklanayotgan faylda 'Tuman' va 'Sanasi' ustunlari bo'lishi shart. Aholi soni uchun 'Aholi soni' va 'Bolalar soni' ustunlari kutiladi."}
                                </Text>
                            </div>
                        }
                        type="info"
                        style={{ borderRadius: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: '32px' }}
                    />

                    <Space direction="vertical" size={32} style={{ width: '100%' }}>
                        <div>
                            <Text strong style={{ fontSize: '16px', color: '#1e293b', marginBottom: '12px', display: 'block' }}>
                                1. {t('import.select_type') || "Hisobot turini tanlang"}:
                            </Text>
                            <Select
                                className="import-select"
                                style={{ width: '100%' }}
                                placeholder={t('import.placeholder') || "Hisobot turini tanlang"}
                                options={REPORT_TYPES}
                                onChange={(val) => setReportType(val)}
                                size="large"
                            />
                        </div>

                        <div>
                            <Text strong style={{ fontSize: '16px', color: '#1e293b', marginBottom: '12px', display: 'block' }}>
                                2. {t('import.upload_file') || "Excel faylni yuklang"}:
                            </Text>
                            <Dragger {...(props as any)} className="import-dragger" style={{ padding: '40px 0' }}>
                                <p className="ant-upload-drag-icon">
                                    <CloudUploadOutlined style={{ color: '#6366f1', fontSize: '48px' }} />
                                </p>
                                <Title level={4} style={{ marginBottom: 8 }}>
                                    {t('import.drag_text') || "Faylni shu yerga tashlang yoki tanlash uchun bosing"}
                                </Title>
                                <Text type="secondary">
                                    {t('import.drag_hint') || "Faqat .xlsx formatidagi bitta fayl yuklanishi mumkin"}
                                </Text>
                            </Dragger>
                        </div>

                        <Button
                            type="primary"
                            icon={<CloudUploadOutlined />}
                            onClick={handleUpload}
                            loading={loading}
                            disabled={!file || !reportType}
                            className="upload-btn"
                            block
                        >
                            {t('import.submit_btn') || "Tizimga Yuklash"}
                        </Button>
                    </Space>

                    {result && (
                        <div className="result-card" style={{ marginTop: 40, padding: 32, background: result.errors?.length > 0 ? '#fff1f0' : '#f0fdf4', border: `1px solid ${result.errors?.length > 0 ? '#ffa39e' : '#bbf7d0'}`, borderRadius: '24px' }}>
                            <Space align="start" size={16} style={{ marginBottom: 20 }}>
                                {result.errors?.length > 0 ?
                                    <InfoCircleOutlined style={{ color: '#dc2626', fontSize: '24px' }} /> :
                                    <CheckCircleOutlined style={{ color: '#16a34a', fontSize: '24px' }} />
                                }
                                <div>
                                    <Title level={4} style={{ margin: 0, color: result.errors?.length > 0 ? '#991b1b' : '#166534' }}>
                                        {t('import.result_title') || "Yuklash Natijasi"}
                                    </Title>
                                    <Text style={{ fontSize: '16px' }}>
                                        {t('import.imported_rows') || "Muvaffaqiyatli yuklangan qatorlar"}: <strong>{result.imported_count}</strong>
                                    </Text>
                                </div>
                            </Space>

                            {result.errors && result.errors.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    <Divider style={{ margin: '16px 0' }} />
                                    <Text strong type="danger" style={{ display: 'block', marginBottom: 12 }}>
                                        {t('import.error_list') || "Xato bo'lgan qatorlar"}:
                                    </Text>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(255,255,255,0.5)', padding: 16, borderRadius: '12px' }}>
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            {result.errors.map((err: string, idx: number) => (
                                                <li key={idx} style={{ color: '#dc2626', marginBottom: 4 }}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ImportPage;
