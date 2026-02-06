import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Descriptions, Badge, Spin, Result } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const VerificationPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/daily-reports/public/verify?token=${token}`);
                setData(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Verification failed');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [token]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><Spin size="large" /></div>;

    if (error) {
        return (
            <Result
                status="error"
                title="Tasdiqlashda xatolik"
                subTitle={error}
            />
        );
    }

    const { data: report, organization_name, verifier_name } = data;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Card>
                <Result
                    status="success"
                    title="Hisobot tasdiqlangan"
                    subTitle="Ushbu hujjat tizimda ro'yxatdan o'tgan va haqiqiy hisoblanadi."
                />

                <Descriptions title="Hisobot ma'lumotlari" bordered column={1}>
                    <Descriptions.Item label="Sana">{report.reportDate}</Descriptions.Item>
                    <Descriptions.Item label="Tashkilot">{organization_name}</Descriptions.Item>
                    <Descriptions.Item label="Holati">
                        <Badge status="processing" text={report.status} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Tekshirdi (Mudir)">{verifier_name || 'Aniqlanmagan'}</Descriptions.Item>
                    <Descriptions.Item label="Tasdiqlangan vaqt">{new Date(report.updatedAt).toLocaleString()}</Descriptions.Item>
                </Descriptions>

                <div style={{ marginTop: '20px', textAlign: 'center', color: '#999' }}>
                    <small>ID: {report.id}</small>
                </div>
            </Card>
        </div>
    );
};

export default VerificationPage;
