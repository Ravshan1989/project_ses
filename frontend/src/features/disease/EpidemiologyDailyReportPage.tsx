import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, DatePicker, Button, InputNumber, notification, Space } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface EpiReportData {
    key: string;
    district_name: string;
    organizationId: string;
    inspected_total: number;
    inspected_mtm: number;
    inspected_school: number;
    inspected_dpm: number;
    inspected_other: number;
    defects_total: number;
    defects_mtm: number;
    defects_school: number;
    defects_dpm: number;
    defects_other: number;
    fines_total: number;
    fines_mtm: number;
    fines_school: number;
    fines_dpm: number;
    fines_other: number;
    suspended_total: number;
    suspended_mtm: number;
    suspended_school: number;
    suspended_dpm: number;
    suspended_other: number;
}

const EpidemiologyDailyReportPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<EpiReportData[]>([]);
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);

    const userRole = localStorage.getItem('user_role') || 'REGION_HEAD';
    const isAdmin = userRole === 'REGION_HEAD';
    const userOrgName = localStorage.getItem('user_org_name') || "";

    useEffect(() => {
        fetchReports();
    }, [date]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');

            let currentOrgs = organizations;
            if (currentOrgs.length === 0) {
                const orgRes = await organizationsApi.getAll();
                // UZ: User talabiga ko'ra avvalgi holatga qaytarildi (revert)
                // currentOrgs = orgRes.data || [];
                // UZ: Qayta urinish: barcha tumanlar ko'rinishi uchun filterni olib tashlaymiz
                currentOrgs = orgRes.data || [];
                // currentOrgs = (orgRes.data || []).filter((org: any) => !!org.parent);
                setOrganizations(currentOrgs);
            }

            const res = await dailyReportsApi.getEpidemiologyByDate(formattedDate);
            const apiData = res.data || [];

            const tableData = currentOrgs.map((org, idx) => {
                const existing = apiData.find((r: any) => r.organization?.id === org.id);
                return {
                    key: String(idx + 1),
                    district_name: org.name,
                    organizationId: org.id,
                    is_submitted: !!existing,
                    inspected_total: existing?.inspected_total || 0,
                    inspected_mtm: existing?.inspected_mtm || 0,
                    inspected_school: existing?.inspected_school || 0,
                    inspected_dpm: existing?.inspected_dpm || 0,
                    inspected_other: existing?.inspected_other || 0,
                    defects_total: existing?.defects_total || 0,
                    defects_mtm: existing?.defects_mtm || 0,
                    defects_school: existing?.defects_school || 0,
                    defects_dpm: existing?.defects_dpm || 0,
                    defects_other: existing?.defects_other || 0,
                    fines_total: existing?.fines_total || 0,
                    fines_mtm: existing?.fines_mtm || 0,
                    fines_school: existing?.fines_school || 0,
                    fines_dpm: existing?.fines_dpm || 0,
                    fines_other: existing?.fines_other || 0,
                    suspended_total: existing?.suspended_total || 0,
                    suspended_mtm: existing?.suspended_mtm || 0,
                    suspended_school: existing?.suspended_school || 0,
                    suspended_dpm: existing?.suspended_dpm || 0,
                    suspended_other: existing?.suspended_other || 0,
                };
            });

            if (!isAdmin) {
                const filteredData = tableData.filter(d => d.district_name === userOrgName);
                setData(filteredData);
            } else {
                setData(tableData);
            }
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

    const handleCellChange = (value: number | null, rowKey: string, field: keyof EpiReportData) => {
        const newData = [...data];
        const index = newData.findIndex(item => item.key === rowKey);
        if (index > -1) {
            // UZ: O'zgaruvchi qayta qiymatlanmaydi, shuning uchun const ishlatildi - avvalgi kod: let updatedRow = { ...newData[index], [field]: value || 0 };
            const updatedRow = { ...newData[index], [field]: value || 0 };
            if (field.startsWith('inspected_') && field !== 'inspected_total') {
                updatedRow.inspected_total = updatedRow.inspected_mtm + updatedRow.inspected_school + updatedRow.inspected_dpm + updatedRow.inspected_other;
            }
            if (field.startsWith('defects_') && field !== 'defects_total') {
                updatedRow.defects_total = updatedRow.defects_mtm + updatedRow.defects_school + updatedRow.defects_dpm + updatedRow.defects_other;
            }
            if (field.startsWith('fines_') && field !== 'fines_total') {
                updatedRow.fines_total = updatedRow.fines_mtm + updatedRow.fines_school + updatedRow.fines_dpm + updatedRow.fines_other;
            }
            if (field.startsWith('suspended_') && field !== 'suspended_total') {
                updatedRow.suspended_total = updatedRow.suspended_mtm + updatedRow.suspended_school + updatedRow.suspended_dpm + updatedRow.suspended_other;
            }
            newData[index] = updatedRow;
            setData(newData);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            for (const row of data) {
                await dailyReportsApi.upsertEpidemiology({
                    ...row,
                    reportDate: formattedDate,
                    organizationId: row.organizationId
                });
            }
            notification.success({ message: t('user.save') });
        } catch (error) {
            notification.error({
                message: t('auth.error_system'),
                description: t('daily_reports.actions.error_save')
            });
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (record: EpiReportData, field: keyof EpiReportData, readOnly = false) => (
        <InputNumber
            size="small"
            min={0}
            value={record[field] as number}
            onChange={(val) => !readOnly && handleCellChange(val, record.key, field)}
            variant="borderless"
            readOnly={readOnly}
            style={{ width: '100%', textAlign: 'center', fontWeight: readOnly ? 'bold' : 'normal' }}
            controls={false}
        />
    );

    const isSubmitted = (row: any) => {
        return !!row.is_submitted;
    };

    const createSectionColumns = (_title: string, prefix: string) => [
        { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, (prefix + '_total') as any, true) },
        {
            title: t('daily_reports.table.including'),
            children: [
                { title: t('daily_reports.table.mtm'), width: 60, render: (_: any, r: any) => renderInput(r, (prefix + '_mtm') as any) },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any) => renderInput(r, (prefix + '_school') as any) },
                { title: t('daily_reports.table.dpm'), width: 60, render: (_: any, r: any) => renderInput(r, (prefix + '_dpm') as any) },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any) => renderInput(r, (prefix + '_other') as any) },
            ]
        }
    ];

    const columns: any = [
        {
            title: t('daily_reports.table.no'), dataIndex: 'key', width: 40, align: 'center', fixed: 'left',
            onCell: (r: EpiReportData) => ({ style: { backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff' } })
        },
        {
            title: t('daily_reports.table.district'), dataIndex: 'district_name', width: 150, fixed: 'left',
            onCell: (r: EpiReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                    fontWeight: 500
                }
            })
        },
        {
            title: t('daily_reports.table.inspected_objects'),
            children: createSectionColumns('Tekshirilgan ob\'ektlar', 'inspected')
        },
        {
            title: t('daily_reports.table.defects_found'),
            children: createSectionColumns('Aniqlangan kamchiliklar', 'defects')
        },
        {
            title: t('daily_reports.table.fines_issued'),
            children: createSectionColumns('Solingan jarimalar', 'fines')
        },
        {
            title: t('daily_reports.table.suspended_activities'),
            children: createSectionColumns('Ish faoliyati to\'xtatilganlar', 'suspended')
        }
    ];

    const calculateGrandTotal = (field: keyof EpiReportData) => data.reduce((sum, item) => sum + (item[field] as number), 0);

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>
                        {t('reports.epidemiology')}
                    </Title>
                    <Text type="secondary">{t('daily_reports.date_status', { date: date.format('DD.MM.YYYY') })}</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Space>
                        <DatePicker value={date} onChange={(d) => d && setDate(d)} format="DD.MM.YYYY" />
                        <Button icon={<ReloadOutlined />} onClick={fetchReports}>{t('daily_reports.actions.refresh')}</Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>{t('daily_reports.actions.save')}</Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    bordered
                    size="small"
                    pagination={false}
                    scroll={{ x: 1500, y: 600 }}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                                <Table.Summary.Cell index={0} />
                                <Table.Summary.Cell index={1}>{t('daily_reports.table.total')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="center">{calculateGrandTotal('inspected_total')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={3} align="center">{calculateGrandTotal('inspected_mtm')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={4} align="center">{calculateGrandTotal('inspected_school')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={5} align="center">{calculateGrandTotal('inspected_dpm')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={6} align="center">{calculateGrandTotal('inspected_other')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={7} align="center">{calculateGrandTotal('defects_total')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={8} align="center">{calculateGrandTotal('defects_mtm')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={9} align="center">{calculateGrandTotal('defects_school')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={10} align="center">{calculateGrandTotal('defects_dpm')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={11} align="center">{calculateGrandTotal('defects_other')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={12} align="center">{calculateGrandTotal('fines_total')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={13} align="center">{calculateGrandTotal('fines_mtm')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={14} align="center">{calculateGrandTotal('fines_school')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={15} align="center">{calculateGrandTotal('fines_dpm')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={16} align="center">{calculateGrandTotal('fines_other')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={17} align="center">{calculateGrandTotal('suspended_total')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={18} align="center">{calculateGrandTotal('suspended_mtm')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={19} align="center">{calculateGrandTotal('suspended_school')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={20} align="center">{calculateGrandTotal('suspended_dpm')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={21} align="center">{calculateGrandTotal('suspended_other')}</Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </Space>
        </Card>
    );
};

export default EpidemiologyDailyReportPage;
