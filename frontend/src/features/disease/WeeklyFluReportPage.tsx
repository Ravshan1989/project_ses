import React, { useState, useEffect } from 'react';
import { Table, Typography, DatePicker, Button, notification, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { dailyReportsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';


const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface WeeklySummaryData {
    key: string;
    district_name: string;
    ari_total: number;
    ari_0_1: number;
    ari_1_2: number;
    ari_3_6: number;
    ari_7_14: number;
    ari_adult: number;
    ari_students: number;
    ari_nursery: number;
    pneu_total: number;
    pneu_0_2: number;
    pneu_3_6: number;
    pneu_7_14: number;
    pneu_adult: number;
    pneu_students: number;
    pneu_nursery: number;
    flu_total: number;
    flu_0_1: number;
    flu_1_2: number;
    flu_3_6: number;
    flu_7_14: number;
    flu_adult: number;
    flu_students: number;
    flu_nursery: number;
    sari_total: number;
    sari_0_2: number;
    sari_3_6: number;
    sari_7_14: number;
    sari_adult: number;
    death_total: number;
    death_pregnant: number;
}

const WeeklyFluReportPage: React.FC = () => {
    const { t } = useTranslation();
    const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(6, 'day'), dayjs()]);
    const [data, setData] = useState<WeeklySummaryData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dates[0] && dates[1]) {
            fetchSummary();
        }
    }, [dates]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const startStr = dates[0].format('YYYY-MM-DD');
            const endStr = dates[1].format('YYYY-MM-DD');
            const res = await dailyReportsApi.getWeeklySummary(startStr, endStr);
            console.log('WEEKLY SUMMARY API DATA:', res.data);
            const apiData = res.data || []; // Removed .filter() to include all organizations for debugging

            const tableData = apiData.map((item: any, idx: number) => ({
                key: String(idx + 1),
                district_name: item.organization?.name,
                ...item
            }));

            setData(tableData);
        } catch (error) {
            console.error(error);
            notification.error({
                message: t('daily_reports.actions.error_load'),
                description: t('daily_reports.actions.error_load')
            });
        } finally {
            setLoading(false);
        }
    };



    const columns: any = [
        { title: t('daily_reports.table.no'), dataIndex: 'key', width: 40, align: 'center', fixed: 'left' },
        { title: t('daily_reports.table.district'), dataIndex: 'district_name', width: 140, fixed: 'left', className: 'font-weight-bold' },
        {
            title: t('reports.ari'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, dataIndex: 'ari_total', align: 'center' },
                { title: t('daily_reports.table.age_0_1'), width: 50, dataIndex: 'ari_0_1', align: 'center' },
                { title: t('daily_reports.table.age_1_2'), width: 50, dataIndex: 'ari_1_2', align: 'center' },
                { title: t('daily_reports.table.age_3_6'), width: 50, dataIndex: 'ari_3_6', align: 'center' },
                { title: t('daily_reports.table.age_7_14'), width: 55, dataIndex: 'ari_7_14', align: 'center' },
                { title: t('daily_reports.table.adults_short'), width: 65, dataIndex: 'ari_adult', align: 'center' },
                { title: t('daily_reports.table.students_short'), width: 55, dataIndex: 'ari_students', align: 'center' },
                { title: t('daily_reports.table.nursery_short'), width: 55, dataIndex: 'ari_nursery', align: 'center' },
            ]
        },
        {
            title: t('reports.pneumonia'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, dataIndex: 'pneu_total', align: 'center' },
                { title: t('daily_reports.table.age_0_2'), width: 50, dataIndex: 'pneu_0_2', align: 'center' },
                { title: t('daily_reports.table.age_3_6'), width: 50, dataIndex: 'pneu_3_6', align: 'center' },
                { title: t('daily_reports.table.age_7_14'), width: 55, dataIndex: 'pneu_7_14', align: 'center' },
                { title: t('daily_reports.table.adults_short'), width: 65, dataIndex: 'pneu_adult', align: 'center' },
                { title: t('daily_reports.table.students_short'), width: 55, dataIndex: 'pneu_students', align: 'center' },
                { title: t('daily_reports.table.nursery_short'), width: 55, dataIndex: 'pneu_nursery', align: 'center' },
            ]
        },
        {
            title: t('reports.flu'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, dataIndex: 'flu_total', align: 'center' },
                { title: t('daily_reports.table.age_0_1'), width: 50, dataIndex: 'flu_0_1', align: 'center' },
                { title: t('daily_reports.table.age_1_2'), width: 50, dataIndex: 'flu_1_2', align: 'center' },
                { title: t('daily_reports.table.age_3_6'), width: 50, dataIndex: 'flu_3_6', align: 'center' },
                { title: t('daily_reports.table.age_7_14'), width: 55, dataIndex: 'flu_7_14', align: 'center' },
                { title: t('daily_reports.table.adults_short'), width: 65, dataIndex: 'flu_adult', align: 'center' },
                { title: t('daily_reports.table.students_short'), width: 55, dataIndex: 'flu_students', align: 'center' },
                { title: t('daily_reports.table.nursery_short'), width: 55, dataIndex: 'flu_nursery', align: 'center' },
            ]
        },
        {
            title: t('daily_reports.table.sari'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, dataIndex: 'sari_total', align: 'center' },
                { title: t('daily_reports.table.age_0_2'), width: 50, dataIndex: 'sari_0_2', align: 'center' },
                { title: t('daily_reports.table.age_3_6'), width: 50, dataIndex: 'sari_3_6', align: 'center' },
                { title: t('daily_reports.table.age_7_14'), width: 55, dataIndex: 'sari_7_14', align: 'center' },
                { title: t('daily_reports.table.adults_short'), width: 65, dataIndex: 'sari_adult', align: 'center' },
            ]
        },
        {
            title: t('daily_reports.table.deaths'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, dataIndex: 'death_total', align: 'center' },
                { title: t('daily_reports.table.pregnant'), width: 80, dataIndex: 'death_pregnant', align: 'center' },
            ]
        }
    ];

    const calculateGrandTotal = (field: keyof WeeklySummaryData) => data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

    // --- PREMIUM UI STYLES ---
    const glassStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
        padding: '32px'
    };

    const headerStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        padding: '32px 40px',
        borderRadius: '24px',
        marginBottom: '28px',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(30, 58, 138, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
    };

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: '#f1f5f9' }}>
            <style>{`
                .premium-table .ant-table { background: transparent !important; }
                .premium-table .ant-table-thead > tr > th {
                    background: rgba(255, 255, 255, 0.6) !important;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 11px;
                    letter-spacing: 0.5px;
                    color: #1e3a8a !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                }
                .premium-table .ant-table-tbody > tr > td { padding: 10px 8px !important; }
                .premium-table .ant-table-row:hover > td { background: rgba(59, 130, 246, 0.05) !important; }
                .period-picker { 
                    border-radius: 12px !important; 
                    height: 44px !important; 
                    background: rgba(255,255,255,0.1) !important;
                    border: 1px solid rgba(255,255,255,0.2) !important;
                }
                .period-picker .ant-picker-input > input { color: #fff !important; font-weight: 600 !important; }
                .period-picker .ant-picker-suffix, .period-picker .ant-picker-range-separator { color: rgba(255,255,255,0.8) !important; }
            `}</style>

            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px' }}>
                        <ReloadOutlined style={{ fontSize: '28px', color: '#fff' }} />
                    </div>
                    <div>
                        <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
                            {t('daily_reports.weekly_title')}
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                            {t('daily_reports.period', { start: dates[0].format('DD.MM.YYYY'), end: dates[1].format('DD.MM.YYYY') })}
                        </Text>
                    </div>
                </div>

                <Space size="middle" wrap>
                    <RangePicker
                        value={dates}
                        onChange={(vals) => vals && setDates([vals[0]!, vals[1]!])}
                        format="DD.MM.YYYY"
                        allowClear={false}
                        className="period-picker"
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchSummary}
                        style={{
                            borderRadius: '12px',
                            height: '44px',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 600
                        }}
                    >
                        {t('daily_reports.actions.refresh')}
                    </Button>
                </Space>
            </div>

            <div style={glassStyle}>
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    bordered
                    size="small"
                    pagination={false}
                    scroll={{ x: 1800, y: 600 }}
                    className="premium-table"
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row style={{ backgroundColor: 'rgba(30, 58, 138, 0.05)', fontWeight: 'bold' }}>
                                <Table.Summary.Cell index={0} />
                                <Table.Summary.Cell index={1}>{t('daily_reports.table.total')}</Table.Summary.Cell>
                                {columns.slice(2).flatMap((c: any) => c.children ? c.children : [c]).map((col: any, idx: number) => (
                                    <Table.Summary.Cell key={idx} index={idx + 2} align="center">
                                        {calculateGrandTotal(col.dataIndex as any)}
                                    </Table.Summary.Cell>
                                ))}
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </div>
        </div>
    );
};

export default WeeklyFluReportPage;
