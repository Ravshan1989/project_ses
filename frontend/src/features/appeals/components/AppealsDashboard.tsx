import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { Pie, Column } from '@ant-design/plots';
import { useTranslation } from 'react-i18next';

const {  } = Typography;

interface AppealsDashboardProps {
    data: any;
    month: string;
    isLoading?: boolean;
    orgId?: string | null;
}

const AppealsDashboard: React.FC<AppealsDashboardProps> = ({ data, isLoading, orgId }) => {
    const { t } = useTranslation();

    if (!orgId) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <Typography.Title level={4} style={{ color: '#8c8c8c' }}>
                    {t('appeals.dashboard.select_org')}
                </Typography.Title>
            </div>
        );
    }

    if (isLoading || !data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        return <div style={{ padding: 20 }}>{t('appeals.dashboard.loading')}</div>;
    }

    // 1. Data for Appeal Types (Ariza, Shikoyat, Taklif)
    const typeData = [
        { type: t('appeals.table5.columns.ariza'), value: (data.table5?.phys_ariza_curr || 0) + (data.table5?.legal_ariza_curr || 0) },
        { type: t('appeals.table5.columns.shikoyat'), value: (data.table5?.phys_shikoyat_curr || 0) + (data.table5?.legal_shikoyat_curr || 0) },
        { type: t('appeals.table5.columns.taklif'), value: (data.table5?.phys_taklif_curr || 0) + (data.table5?.legal_taklif_curr || 0) },
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
        { status: t('appeals.table6.columns.satisfied'), value: data.table2?.measures_taken || 0 },
        { status: t('appeals.table6.columns.explained'), value: data.table2?.explained || 0 },
        { status: t('appeals.table6.columns.rejected'), value: data.table2?.rejected || 0 },
        { status: t('appeals.table6.columns.pending'), value: data.table2?.being_considered || 0 },
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
        { channel: t('appeals.table2.columns.written'), value: data.table3?.written || 0 },
        { channel: t('appeals.table2.columns.electronic'), value: data.table3?.electronic || 0 },
        { channel: t('appeals.table2.columns.oral'), value: data.table3?.oral_total || 0 },
        { channel: t('appeals.table6.columns.virtual'), value: data.table6?.virtual?.curr?.total || 0 },
        { channel: t('appeals.table6.columns.people'), value: data.table6?.people?.curr?.total || 0 },
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
                if (channel === t('appeals.table2.columns.written')) return '#1890ff';
                if (channel === t('appeals.table2.columns.electronic')) return '#52c41a';
                if (channel === t('appeals.table2.columns.oral')) return '#faad14';
                if (channel === t('appeals.table6.columns.virtual')) return '#13c2c2';
                if (channel === t('appeals.table6.columns.people')) return '#eb2f96';
                return '#8c8c8c';
            },
        },
    };

    return (
        <div style={{ padding: '20px 0' }}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: 16 }}>
                        <Statistic 
                            title={t('appeals.table2.columns.jami')} 
                            value={data?.records_count || 0} 
                            valueStyle={{ color: '#1890ff', fontSize: 32, fontWeight: 'bold' }} 
                        />
                    </Card>
                </Col>
                
                <Col xs={24} md={12}>
                    <Card title={t('appeals.dashboard.by_type')} style={{ height: '100%', borderRadius: 16 }}>
                        {typeData.length > 0 ? <Pie {...typeConfig as any} /> : <div style={{textAlign: 'center', padding: 40}}>{t('appeals.dashboard.no_data')}</div>}
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title={t('appeals.dashboard.by_status')} style={{ height: '100%', borderRadius: 16 }}>
                        {statusData.length > 0 ? <Pie {...statusConfig as any} /> : <div style={{textAlign: 'center', padding: 40}}>{t('appeals.dashboard.no_data')}</div>}
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title={t('appeals.dashboard.by_channel')} style={{ borderRadius: 16 }}>
                        <Column {...channelConfig as any} height={300} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AppealsDashboard;
