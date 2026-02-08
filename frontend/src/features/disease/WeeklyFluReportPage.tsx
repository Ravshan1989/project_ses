import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, DatePicker, Button, notification, Space } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { dailyReportsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { exportWeeklyReport } from '../../services/excelExportService';

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

    const handleExcelExport = () => {
        const fileName = `Haftalik_Gripp_${dates[0].format('DD.MM.YYYY')}_${dates[1].format('DD.MM.YYYY')}`;
        const title = t('daily_reports.weekly_title');
        const period = `${dates[0].format('DD.MM.YYYY')} - ${dates[1].format('DD.MM.YYYY')}`;
        exportWeeklyReport(data, fileName, title, period, columns);
        notification.success({ message: t('common.success_export') });
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

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>
                        {t('daily_reports.weekly_title')}
                    </Title>
                    <Text type="secondary">
                        {t('daily_reports.period', { start: dates[0].format('DD.MM.YYYY'), end: dates[1].format('DD.MM.YYYY') })}
                    </Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Space>
                        <RangePicker
                            value={dates}
                            onChange={(vals) => vals && setDates([vals[0]!, vals[1]!])}
                            format="DD.MM.YYYY"
                            allowClear={false}
                        />
                        <Button icon={<ReloadOutlined />} onClick={fetchSummary}>{t('daily_reports.actions.refresh')}</Button>
                        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExcelExport}>{t('common.export')} (Excel)</Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    bordered
                    size="small"
                    pagination={false}
                    scroll={{ x: 1800, y: 600 }}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
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
            </Space>
        </Card>
    );
};

export default WeeklyFluReportPage;
