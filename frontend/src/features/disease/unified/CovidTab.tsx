import React from 'react';
import { Table, Space, Badge, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import EditCell from '../../../components/common/EditCell';

interface CovidReportData {
    key: string;
    district_name: string;
    organizationId: string;
    is_submitted?: boolean;
    total_cases: number;
    reinfected: number;
    vaccinated_infected: number;
    age_0_1: number;
    age_1_3: number;
    age_4_6: number;
    age_7_14: number;
    age_15_19: number;
    age_20_29: number;
    age_30_39: number;
    age_40_49: number;
    age_50_59: number;
    age_60_plus: number;
    pre_school_organized: number;
    pre_school_unorganized: number;
    students: number;
    medical_workers: number;
    teachers: number;
    others: number;
    hospitalized_count: number;
    isParent?: boolean;
    children?: CovidReportData[];
    id?: string;
    status?: string;
    verificationToken?: string;
}

interface CovidTabProps {
    data: CovidReportData[];
    loading: boolean;
    userRole: string;
    onChange: (value: number | null, rowKey: string, field: keyof CovidReportData) => void;
    onVerify: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onSubmit: (id: string) => void;
}

const CovidTab: React.FC<CovidTabProps> = ({ data, loading, userRole, onChange, onVerify, onApprove, onReject, onSubmit }) => {
    const { t } = useTranslation();

    const isAdmin = ['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(userRole);
    const isMudir = ['DEPARTMENT_HEAD', 'LAB_HEAD', 'DISTRICT_HEAD'].includes(userRole);
    const isSpecialist = ['STAFF', 'DISTRICT_SPECIALIST', 'DISTRICT_OPERATOR'].includes(userRole);

    const isSubmitted = (row: CovidReportData) => !!row.is_submitted || row.status !== 'DRAFT';

    const canEdit = (record: CovidReportData) => {
        if (record.isParent) return false;
        if (record.status === 'APPROVED' || record.status === 'VERIFIED') return false;
        if (isSpecialist) return record.status === 'DRAFT' || record.status === 'REJECTED' || !record.status;
        if (isMudir) return record.status === 'SUBMITTED';
        return isAdmin;
    };

    const renderInput = (record: CovidReportData, field: keyof CovidReportData, rowIdx: number, colIdx: number, forceReadOnly = false) => {
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
            render: (_: any, r: CovidReportData, index: number) => (
                <div style={{ backgroundColor: r.isParent ? '#e6f7ff' : (isSubmitted(r) ? '#f6ffed' : '#fff'), height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {r.isParent ? '*' : index + 1}
                </div>
            )
        },
        {
            title: t('daily_reports.table.district') || 'Hududlar',
            dataIndex: 'district_name',
            width: 140,
            fixed: 'left',
            render: (text: string, r: CovidReportData) => (
                <span style={{ fontWeight: r.isParent ? 800 : 500 }}>
                    {text ? t(`orgs.${text.toLowerCase()}`, { defaultValue: text }) : ''}
                    {r.isParent && <Badge count={r.children?.length || 0} style={{ backgroundColor: '#1890ff', marginLeft: 8 }} />}
                </span>
            ),
            onCell: (r: CovidReportData) => ({
                style: {
                    backgroundColor: r.isParent ? '#e6f7ff' : (isSubmitted(r) ? '#f6ffed' : '#fff1f0'),
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                }
            })
        },
        { title: t('export_page.table_headers.total') || 'Jami', width: 70, render: (_: any, r: any, i: number) => renderInput(r, 'total_cases', i, 0) },
        { title: t('daily_reports.tabs.covid.reinfected'), width: 90, render: (_: any, r: any, i: number) => renderInput(r, 'reinfected', i, 1) },
        { title: t('daily_reports.tabs.covid.vaccinated_infected'), width: 90, render: (_: any, r: any, i: number) => renderInput(r, 'vaccinated_infected', i, 2) },
        {
            title: t('daily_reports.hepatitis_age_groups') || 'Yosh toifalari',
            children: [
                { title: t('daily_reports.tabs.common.age_0_1'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'age_0_1', i, 3) },
                { title: t('daily_reports.tabs.common.age_1_3'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'age_1_3', i, 4) },
                { title: t('daily_reports.tabs.common.age_4_6'), width: 60, render: (_: any, r: any, i: number) => renderInput(r, 'age_4_6', i, 5) },
                { title: t('daily_reports.tabs.common.age_7_14'), width: 65, render: (_: any, r: any, i: number) => renderInput(r, 'age_7_14', i, 6) },
                { title: t('daily_reports.tabs.common.age_15_19'), width: 65, render: (_: any, r: any, i: number) => renderInput(r, 'age_15_19', i, 7) },
                { title: t('daily_reports.tabs.common.age_20_29'), width: 70, render: (_: any, r: any, i: number) => renderInput(r, 'age_20_29', i, 8) },
                { title: t('daily_reports.tabs.common.age_30_39'), width: 70, render: (_: any, r: any, i: number) => renderInput(r, 'age_30_39', i, 9) },
                { title: t('daily_reports.tabs.common.age_40_49'), width: 70, render: (_: any, r: any, i: number) => renderInput(r, 'age_40_49', i, 10) },
                { title: t('daily_reports.tabs.common.age_50_59'), width: 70, render: (_: any, r: any, i: number) => renderInput(r, 'age_50_59', i, 11) },
                { title: t('daily_reports.tabs.common.age_60_plus'), width: 70, render: (_: any, r: any, i: number) => renderInput(r, 'age_60_plus', i, 12) },
            ]
        },
        {
            title: t('daily_reports.tabs.covid.groups'),
            children: [
                { title: t('daily_reports.tabs.covid.pre_school_unorganized'), width: 120, render: (_: any, r: any, i: number) => renderInput(r, 'pre_school_organized', i, 13) },
                { title: t('daily_reports.tabs.covid.pre_school_organized'), width: 120, render: (_: any, r: any, i: number) => renderInput(r, 'pre_school_unorganized', i, 14) },
                { title: t('daily_reports.tabs.covid.students'), width: 120, render: (_: any, r: any, i: number) => renderInput(r, 'students', i, 15) },
                { title: t('daily_reports.tabs.covid.medical_workers'), width: 120, render: (_: any, r: any, i: number) => renderInput(r, 'medical_workers', i, 16) },
                { title: t('daily_reports.tabs.covid.teachers'), width: 100, render: (_: any, r: any, i: number) => renderInput(r, 'teachers', i, 17) },
                { title: t('daily_reports.tabs.covid.others'), width: 110, render: (_: any, r: any, i: number) => renderInput(r, 'others', i, 18) },
            ]
        },
        { title: t('daily_reports.tabs.covid.hospitalized_count'), width: 120, render: (_: any, r: any, i: number) => renderInput(r, 'hospitalized_count', i, 19) },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 140,
            fixed: 'right',
            render: (_: any, r: CovidReportData) => (
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

    const calculateTotal = (field: keyof CovidReportData) => 
        (data || []).reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            bordered
            size="small"
            pagination={false}
            scroll={{ x: 2000, y: 550 }}
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
                                {calculateTotal(col.dataIndex || (col.render ? 'total_cases' : 'total_cases') as any)}
                            </Table.Summary.Cell>
                        ))}
                    </Table.Summary.Row>
                </Table.Summary>

            )}
        />
    );
};

export default CovidTab;
