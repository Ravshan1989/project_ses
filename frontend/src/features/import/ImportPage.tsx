import React, { useState } from 'react';
import { Card, Typography, Upload, Button, Select, message, Alert, Result } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { importsApi } from '../../services/api';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const REPORT_TYPES = [
    { label: 'Virusli Gepatit A (VGA)', value: 'hepatitis' },
    { label: 'Gripp va O\'RVI', value: 'flu' },
    { label: 'Shakl 1 (Oylik)', value: 'form1' },
];

const ImportPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [reportType, setReportType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const userRole = localStorage.getItem('user_role');
    const isAllowed = userRole === 'REGION_HEAD' || userRole === 'ADMIN';

    if (!isAllowed) {
        return (
            <Result
                status="403"
                title="403"
                subTitle="Kechirasiz, bu sahifaga kirish huquqingiz yo'q. Faqat viloyat darajasida ruxsat berilgan."
            />
        );
    }

    const handleUpload = async () => {
        if (!file) {
            message.error("Iltimos, fayl tanlang!");
            return;
        }
        if (!reportType) {
            message.error("Iltimos, hisobot turini tanlang!");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await importsApi.importGlobal(file, reportType);
            setResult(res.data);
            message.success("Muvaffaqiyatli yuklandI!");
            setFile(null); // Reset
        } catch (error: any) {
            console.error("Import error", error);
            message.error(error.response?.data?.message || "Yuklashda xatolik yuz berdi");
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
                message.error(`${file.name} - noto'g'ri fayl formati. Faqat .xlsx fayllar qabul qilinadi.`);
                return Upload.LIST_IGNORE;
            }
            setFile(file);
            return false;
        },
        fileList: file ? [file] : [],
        maxCount: 1
    };

    return (
        <Card>
            <Title level={3}>Ma'lumotlarni Yuklash (Import)</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
                Real ma'lumotlarni tizimga yuklash. Faqat .xlsx formatdagi fayllar qabul qilinadi.
            </Text>

            <Alert
                message="DIQQAT"
                description="Yuklanayotgan faylda 'Tuman' va 'Sanasi' ustunlari bo'lishi shart. Aks holda ma'lumot qabul qilinmaydi."
                type="warning"
                showIcon
                style={{ marginBottom: 20 }}
            />

            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <Text strong>Hisobot turi:</Text>
                <Select
                    style={{ width: '100%', marginBottom: 20, marginTop: 5 }}
                    placeholder="Hisobot turini tanlang"
                    options={REPORT_TYPES}
                    onChange={(val) => setReportType(val)}
                />

                <Dragger {...(props as any)} style={{ marginBottom: 20 }}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Faylni shu yerga tashlang yoki tanlash uchun bosing</p>
                    <p className="ant-upload-hint">
                        Faqat bitta fayl yuklash mumkin.
                    </p>
                </Dragger>

                <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={handleUpload}
                    loading={loading}
                    disabled={!file || !reportType}
                    block
                    size="large"
                >
                    Tizimga Yuklash
                </Button>

                {result && (
                    <div style={{ marginTop: 30, padding: 15, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                        <Text strong style={{ color: '#389e0d', fontSize: 16 }}>Natija:</Text>
                        <p>Yuklangan qatorlar soni: <strong>{result.imported_count}</strong></p>
                        {result.errors && result.errors.length > 0 && (
                            <div style={{ marginTop: 10 }}>
                                <Text type="danger">Xato bo'lgan qatorlar:</Text>
                                <ul>
                                    {result.errors.map((err: string, idx: number) => (
                                        <li key={idx} style={{ color: '#cf1322' }}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ImportPage;
