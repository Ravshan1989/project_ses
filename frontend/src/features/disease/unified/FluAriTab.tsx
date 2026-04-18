import React from 'react';
import { Table, Space, Badge, Button } from 'antd';
import EditCell from '../../../components/common/EditCell';
import { useTranslation } from 'react-i18next';

interface FluReportData {
    key: string;
    district_name: string;
    organizationId: string;
    is_submitted?: boolean;
    institution_count: number;
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
    isParent?: boolean;
    children?: FluReportData[];
    id?: string;
    status?: string;
    verificationToken?: string;
}

interface FluAriTabProps {
    data: FluReportData[];
    loading: boolean;
    userRole: string;
    onChange: (value: number | null, rowKey: string, field: keyof FluReportData) => void;
    onVerify: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onSubmit: (id: string) => void;
}

const FluAriTab: React.FC<FluAriTabProps> = ({ data, loading, userRole, onChange, onVerify, onApprove, onReject, onSubmit }) => {
    const { t } = useTranslation();

    const isAdmin = ['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(userRole);
    const isMudir = ['DEPARTMENT_HEAD', 'LAB_HEAD', 'DISTRICT_HEAD'].includes(userRole);
    const isSpecialist = ['STAFF', 'DISTRICT_SPECIALIST', 'DISTRICT_OPERATOR'].includes(userRole);

    const isSubmitted = (row: FluReportData) => !!row.is_submitted || row.status !== 'DRAFT';

    const canEdit = (record: FluReportData) => {
        if (record.isParent) return false;
        if (record.status === 'APPROVED' || record.status === 'VERIFIED') return false;
        if (isSpecialist) return record.status === 'DRAFT' || record.status === 'REJECTED' || !record.status;
        if (isMudir) return record.status === 'SUBMITTED';
        return isAdmin;
    };

    const renderInput = (record: FluReportData, field: keyof FluReportData, rowIdx: number, colIdx: number, forceReadOnly = false) => {
        const disabled = forceReadOnly || !canEdit(record);
        return (
            <EditCell
                value={record[field] as number}
                onChange={(val) => !disabled && onChange(val, record.key, field)}
                rowIdx={rowIdx}
                colIdx={colIdx}
                disabled={disabled}
            />
        );
    };

    const columns: any = [
        {
            title: '№', dataIndex: 'key', width: 40, align: 'center', fixed: 'left',
            render: (_: any, r: FluReportData, index: number) => (
                <div style={{ backgroundColor: r.isParent ? '#e6f7ff' : (isSubmitted(r) ? '#f6ffed' : '#fff'), height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {r.isParent ? '*' : index + 1}
                </div>
            )
        },
        {
            title: t('daily_reports.table.district') || 'Hududlar',
            dataIndex: 'district_name',
            width: 150,
            fixed: 'left',
            render: (text: string, r: FluReportData) => (
                <span style={{ fontWeight: r.isParent ? 800 : 500 }}>
                    {text ? t(`orgs.${text.toLowerCase()}`, { defaultValue: text }) : ''}
                    {r.isParent && <Badge count={r.children?.length || 0} style={{ backgroundColor: '#1890ff', marginLeft: 8 }} />}
                </span>
            ),
            onCell: (r: FluReportData) => ({
                style: {
                    backgroundColor: r.isParent ? '#e6f7ff' : (isSubmitted(r) ? '#f6ffed' : '#fff1f0'),
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                }
            })
        },
        {
            title: t('daily_reports.tabs.flu.ari_title'),
            children: [
                { title: t('export_page.table_headers.total') || 'Jami', width: 65, render: (_: any, r: any, i: number) => renderInput(r, 'ari_total', i, 0, true) },
                { title: t('daily_reports.tabs.common.age_0_1'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'ari_0_1', i, 1) },
                { title: t('daily_reports.tabs.common.age_1_2'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'ari_1_2', i, 2) },
                { title: t('daily_reports.tabs.common.age_3_6'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'ari_3_6', i, 3) },
                { title: t('daily_reports.tabs.common.age_7_14'), width: 65, render: (_: any, r: any, i: number) => renderInput(r, 'ari_7_14', i, 4) },
                { title: t('daily_reports.tabs.flu.adults'), width: 70, render: (_: any, r: any, i: number) => renderInput(r, 'ari_adult', i, 5) },
            ]
        },
        {
            title: t('daily_reports.tabs.flu.pneu_title'),
            children: [
                { title: t('export_page.table_headers.total') || 'Jami', width: 65, render: (_: any, r: any, i: number) => renderInput(r, 'pneu_total', i, 6, true) },
                { title: t('daily_reports.tabs.common.age_0_2'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'pneu_0_2', i, 7) },
                { title: t('daily_reports.tabs.common.age_3_6'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'pneu_3_6', i, 8) },
                { title: t('daily_reports.tabs.common.age_7_14'), width: 65, render: (_: any, r: any, i: number) => renderInput(r, 'pneu_7_14', i, 9) },
                { title: t('daily_reports.tabs.flu.adults'), width: 70, render: (_: any, r: any, i: number) => renderInput(r, 'pneu_adult', i, 10) },
            ]
        },
        {
            title: t('daily_reports.tabs.flu.gk_title'),
            children: [
                { title: t('export_page.table_headers.total') || 'Jami', width: 65, render: (_: any, r: any, i: number) => renderInput(r, 'flu_total', i, 11, true) },
                { title: t('daily_reports.tabs.common.age_0_1'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'flu_0_1', i, 12) },
                { title: t('daily_reports.tabs.common.age_1_2'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'flu_1_2', i, 13) },
                { title: t('daily_reports.tabs.common.age_3_6'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'flu_3_6', i, 14) },
                { title: t('daily_reports.tabs.common.age_7_14'), width: 65, render: (_: any, r: any, i: number) => renderInput(r, 'flu_7_14', i, 15) },
                { title: t('daily_reports.tabs.flu.adults'), width: 70, render: (_: any, r: any, i: number) => renderInput(r, 'flu_adult', i, 16) },
            ]
        },
        {
            title: t('daily_reports.tabs.flu.sari_title'),
            children: [
                { title: t('export_page.table_headers.total') || 'Jami', width: 65, render: (_: any, r: any, i: number) => renderInput(r, 'sari_total', i, 17, true) },
                { title: t('daily_reports.tabs.common.age_0_2'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'sari_0_2', i, 18) },
                { title: t('daily_reports.tabs.common.age_3_6'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'sari_3_6', i, 19) },
                { title: t('daily_reports.tabs.common.age_7_14'), width: 65, render: (_: any, r: any, i: number) => renderInput(r, 'sari_7_14', i, 20) },
                { title: t('daily_reports.tabs.flu.adults'), width: 70, render: (_: any, r: any, i: number) => renderInput(r, 'sari_adult', i, 21) },
            ]
        },
        {
            title: t('daily_reports.tabs.flu.deaths_title'),
            children: [
                { title: t('export_page.table_headers.total') || 'Jami', width: 65, render: (_: any, r: any, i: number) => renderInput(r, 'death_total', i, 22) },
                { title: t('daily_reports.tabs.flu.pregnant'), width: 90, render: (_: any, r: any, i: number) => renderInput(r, 'death_pregnant', i, 23) },
            ]
        },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 140,
            fixed: 'right',
            render: (_: any, r: FluReportData) => (
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Badge
                        status={r.status === 'APPROVED' ? 'success' : r.status === 'VERIFIED' ? 'processing' : r.status === 'REJECTED' ? 'error' : r.status === 'SUBMITTED' ? 'warning' : 'default'}
                        text={r.status ? t(`dashboard_page.statuses.${r.status.toLowerCase()}`, { defaultValue: r.status }) : t('dashboard_page.statuses.draft', { defaultValue: 'DRAFT' })}
                    />
                    {r.id && (
                        <Space wrap>
                            {isSpecialist && (r.status === 'DRAFT' || r.status === 'REJECTED' || !r.status) && (
                                <Button size="small" type="primary" onClick={() => onSubmit(r.id!)} style={{ fontSize: '10px', height: '22px' }}>
                                    {t('common.submit') || 'Yuborish'}
                                </Button>
                            )}
                            {isMudir && r.status === 'SUBMITTED' && (
                                <>
                                    <Button size="small" type="primary" onClick={() => onVerify(r.id!)} style={{ fontSize: '10px', height: '22px', background: '#52c41a' }}>
                                        {t('common.verify') || 'Tekshirish'}
                                    </Button>
                                    <Button size="small" danger onClick={() => onReject(r.id!)} style={{ fontSize: '10px', height: '22px' }}>
                                        {t('common.reject') || 'Rad etish'}
                                    </Button>
                                </>
                            )}
                            {isAdmin && (r.status === 'VERIFIED' || r.status === 'SUBMITTED') && (
                                <>
                                    <Button size="small" type="primary" onClick={() => onApprove(r.id!)} style={{ fontSize: '10px', height: '22px', background: '#722ed1' }}>
                                        {t('common.approve') || 'Tasdiqlash'}
                                    </Button>
                                    <Button size="small" danger onClick={() => onReject(r.id!)} style={{ fontSize: '10px', height: '22px' }}>
                                        {t('common.reject') || 'Rad etish'}
                                    </Button>
                                </>
                            )}
                        </Space>
                    )}
                </Space>
            )
        }
    ];

    const calculateTotal = (field: keyof FluReportData) => 
        (data || []).reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            bordered
            size="small"
            pagination={false}
            scroll={{ x: 1800, y: 550 }}
            className="premium-table"
            expandable={{
                defaultExpandAllRows: true,
            }}
            summary={() => (
                <Table.Summary fixed>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                        <Table.Summary.Cell index={0} />
                        <Table.Summary.Cell index={1}>{t('dashboard_page.total_reports') || 'Jami'}</Table.Summary.Cell>
                        {columns.slice(2).flatMap((c: any) => c.children ? c.children : [c]).map((col: any, idx: number) => (
                            <Table.Summary.Cell key={idx} index={idx + 2} align="center">
                                {calculateTotal(col.dataIndex || (col.render ? 'ari_total' : 'ari_total') as any)}
                            </Table.Summary.Cell>
                        ))}
                    </Table.Summary.Row>
                </Table.Summary>
            )}

        />
    );
};

export default FluAriTab;
