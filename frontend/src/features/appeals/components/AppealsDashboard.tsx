import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { Pie, Column } from '@ant-design/plots';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

interface AppealsDashboardProps {
    data: any;
    month: string;
    isLoading?: boolean;
    orgId?: string | null;
}

const AppealsDashboard: React.FC<AppealsDashboardProps> = ({ data, month, isLoading, orgId }) => {
    const { t } = useTranslation();

    if (!orgId) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <Typography.Title level={4} style={{ color: '#8c8c8c' }}>
                    Tahlilni ko'rish uchun tashkilotni tanlang
                </Typography.Title>
            </div>
        );
    }

    if (isLoading || !data) {
        return <div style={{ padding: 20 }}>Ma'lumotlar yuklanmoqda...</div>;
    }

    // 1. Data for Appeal Types (Ariza, Shikoyat, Taklif)
    const typeData = [
        { type: 'Ariza', value: data.table5?.phys_ariza_curr + data.table5?.legal_ariza_curr || 0 },
        { type: 'Shikoyat', value: data.table5?.phys_shikoyat_curr + data.table5?.legal_shikoyat_curr || 0 },
        { type: 'Taklif', value: data.table5?.phys_taklif_curr + data.table5?.legal_taklif_curr || 0 },
    ].filter(d => d.value > 0);

    const typeConfig = {
        data: typeData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            text: 'value',
            position: 'outside',
        },
        legend: {
            color: {
                title: false,
                position: 'right',
                rowPadding: 5,
            },
        },
    };

    // 2. Data for Status (Simplified from Table 2)
    const statusData = [
        { status: 'Qanoatlantirildi', value: data.table2?.measures_taken || 0 },
        { status: 'Tushuntirildi', value: data.table2?.explained || 0 },
        { status: 'Rad etildi', value: data.table2?.rejected || 0 },
        { status: 'Ko\'rilmoqda', value: data.table2?.being_considered || 0 },
    ].filter(d => d.value > 0);

    const statusConfig = {
        data: statusData,
        angleField: 'value',
        colorField: 'status',
        innerRadius: 0.6,
        label: {
            text: 'value',
            style: { fontWeight: 'bold' },
        },
        legend: {
            color: {
                title: false,
                position: 'right',
                rowPadding: 5,
            },
        },
    };

    // 3. Data for Channels (Table 3)
    const channelData = [
        { channel: 'Yozma', value: data.table3?.written || 0 },
        { channel: 'Elektron', value: data.table3?.electronic || 0 },
        { channel: 'Og\'zaki', value: data.table3?.oral_total || 0 },
    ];

    const channelConfig = {
        data: channelData,
        xField: 'channel',
        yField: 'value',
        label: {
            text: 'value',
            position: 'top',
        },
        style: {
            fill: ({ channel }: any) => {
                if (channel === 'Yozma') return '#1890ff';
                if (channel === 'Elektron') return '#52c41a';
                return '#faad14';
            },
        },
    };

    return (
        <div style={{ padding: '20px 0' }}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: 16 }}>
                        <Statistic 
                            title="Jami murojaatlar soni" 
                            value={data.records_count} 
                            valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 'bold' }} 
                        />
                    </Card>
                </Col>
                
                <Col xs={24} md={12}>
                    <Card title="Murojaat turi bo'yicha" style={{ height: '100%', borderRadius: 16 }}>
                        {typeData.length > 0 ? <Pie {...typeConfig as any} /> : <div style={{textAlign: 'center', padding: 40}}>Ma'lumot yo'q</div>}
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title="Murojaatlar holati" style={{ height: '100%', borderRadius: 16 }}>
                        {statusData.length > 0 ? <Pie {...statusConfig as any} /> : <div style={{textAlign: 'center', padding: 40}}>Ma'lumot yo'q</div>}
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="Murojaat kanallari taqsimoti" style={{ borderRadius: 16 }}>
                        <Column {...channelConfig as any} height={300} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AppealsDashboard;
