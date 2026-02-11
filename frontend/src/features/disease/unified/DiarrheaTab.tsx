import React from 'react';
import { Table, InputNumber, Tag, Space, Button, Tooltip } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface DiarrheaReportData {
    id?: string;
    key: string;
    organizationId: string;
    district: string;
    status?: string;
    verificationToken?: string;
    total_2025: number;
    total_2026: number;
    actively_found: number;
    hospitalized: number;
    illness_days_1_2: number;
    age_under_1: number;
    age_1_3: number;
    age_4_6: number;
    age_7_14: number;
    age_15_19: number;
    age_20_plus: number;
    nursery_org: number;
    nursery_unorg: number;
    kindergarten_org: number;
    kindergarten_unorg: number;
    students: number;
    higher_students: number;
    adults: number;
    open_water_samples: number;
    open_water_isolated: number;
    tap_water_samples: number;
    tap_water_isolated: number;
    is_submitted?: boolean;
}

interface DiarrheaTabProps {
    data: DiarrheaReportData[];
    loading: boolean;
    onChange: (value: number, key: string, field: keyof DiarrheaReportData) => void;
    isAdmin: boolean;
    onVerify?: (id: string) => void;
    onApprove?: (id: string) => void;
}

const DiarrheaTab: React.FC<DiarrheaTabProps> = ({ data, loading, onChange, isAdmin, onVerify, onApprove }) => {
    const { t } = useTranslation();

    const renderInput = (record: DiarrheaReportData, field: keyof DiarrheaReportData, readOnly = false) => (
        <InputNumber
            value={record[field] as number}
            onChange={(val) => !readOnly && onChange(val || 0, record.key, field)}
            variant="borderless"
            readOnly={readOnly}
            className="report-input"
            style={{ width: '100%', textAlign: 'center', fontWeight: readOnly ? 'bold' : 'normal' }}
            controls={false}
        />
    );

    const columns: any = [
        {
            title: '№',
            dataIndex: 'no',
            width: 50,
            fixed: 'left',
            render: (_: any, r: DiarrheaReportData, index: number) => (
                <div style={{ backgroundColor: r.is_submitted ? '#f6ffed' : '#fff1f0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {index + 1}
                </div>
            ),
        },
        {
            title: t('daily_reports.table.district'),
            dataIndex: 'district',
            width: 150,
            fixed: 'left',
            render: (text: string, r: DiarrheaReportData) => (
                <span style={{ color: r.is_submitted ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            ),
        },
        {
            title: "Jami ro'yxatga olingan bemorlar",
            children: [
                { title: '2025', width: 70, render: (_: any, r: any) => renderInput(r, 'total_2025') },
                { title: '2026', width: 70, render: (_: any, r: any) => renderInput(r, 'total_2026') },
            ]
        },
        { title: 'Faol topilganlar', width: 100, render: (_: any, r: any) => renderInput(r, 'actively_found') },
        { title: 'Shifoxonaga yotqizilgan', width: 110, render: (_: any, r: any) => renderInput(r, 'hospitalized') },
        { title: '1-2 kunlari', width: 90, render: (_: any, r: any) => renderInput(r, 'illness_days_1_2') },
        {
            title: "Bemorlarni yoshlari bo'yicha",
            children: [
                { title: '1-yoshgacha', width: 80, render: (_: any, r: any) => renderInput(r, 'age_under_1') },
                { title: '1-3 yosh', width: 70, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: '4-6 yosh', width: 70, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: '7-14 yosh', width: 75, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: '15-19 yosh', width: 80, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: '20+ yosh', width: 75, render: (_: any, r: any) => renderInput(r, 'age_20_plus') },
            ]
        },
        {
            title: "Bemorlarni kasblari bo'yicha",
            children: [
                { title: 'Yasli uyushgan', width: 100, render: (_: any, r: any) => renderInput(r, 'nursery_org') },
                { title: 'Yasli uyushmagan', width: 110, render: (_: any, r: any) => renderInput(r, 'nursery_unorg') },
                { title: 'Bog\'cha uyushgan', width: 110, render: (_: any, r: any) => renderInput(r, 'kindergarten_org') },
                { title: 'Bog\'cha uyushmagan', width: 120, render: (_: any, r: any) => renderInput(r, 'kindergarten_unorg') },
                { title: 'O\'quvchi', width: 80, render: (_: any, r: any) => renderInput(r, 'students') },
                { title: 'Talaba', width: 80, render: (_: any, r: any) => renderInput(r, 'higher_students') },
                { title: 'Kattalar', width: 80, render: (_: any, r: any) => renderInput(r, 'adults') },
            ]
        },
        {
            title: "Patogen qo'zg'atuvchilarga suv namunalari",
            children: [
                {
                    title: "Ochiq suvdan",
                    children: [
                        { title: 'olingan', width: 80, render: (_: any, r: any) => renderInput(r, 'open_water_samples') },
                        { title: 'ajratilgan', width: 80, render: (_: any, r: any) => renderInput(r, 'open_water_isolated') },
                    ]
                },
                {
                    title: "Vodoprovoddan",
                    children: [
                        { title: 'olingan', width: 80, render: (_: any, r: any) => renderInput(r, 'tap_water_samples') },
                        { title: 'ajratilgan', width: 80, render: (_: any, r: any) => renderInput(r, 'tap_water_isolated') },
                    ]
                }
            ]
        },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 120,
            fixed: 'right',
            render: (_: any, record: DiarrheaReportData) => {
                const status = record.status || 'DRAFT';
                let color = 'gold';
                let icon = <ClockCircleOutlined />;
                let label = 'Qoralama';

                if (status === 'VERIFIED') {
                    color = 'blue';
                    icon = <CheckCircleOutlined />;
                    label = t('dashboard_page.statuses.verified', { defaultValue: 'Tekshirildi' });
                } else if (status === 'APPROVED') {
                    color = 'green';
                    icon = <CheckCircleOutlined />;
                    label = t('dashboard_page.statuses.approved', { defaultValue: 'Tasdiqlandi' });
                } else {
                    label = t('dashboard_page.statuses.draft', { defaultValue: 'Qoralama' });
                }

                return (
                    <Space>
                        <Tag icon={icon} color={color}>{label}</Tag>
                        {isAdmin && status === 'DRAFT' && onVerify && (
                            <Tooltip title="Tekshirish">
                                <Button size="small" type="primary" ghost icon={<CheckCircleOutlined />} onClick={() => onVerify(record.id!)} />
                            </Tooltip>
                        )}
                        {isAdmin && status === 'VERIFIED' && onApprove && (
                            <Tooltip title="Tasdiqlash">
                                <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => onApprove(record.id!)} />
                            </Tooltip>
                        )}
                    </Space>
                );
            }
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={false}
            scroll={{ x: 2200, y: 'calc(100vh - 400px)' }}
            size="small"
            bordered
            rowClassName={(record) => record.district.includes('jami') ? 'row-total' : ''}
        />
    );
};

export default DiarrheaTab;
