import React from 'react';
import { Table, InputNumber, Space, Badge, Button } from 'antd';
import { useTranslation } from 'react-i18next';

export interface SanitaryReportData {
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
    is_submitted?: boolean;
    id?: string;
    status?: string;
    verificationToken?: string;
}

interface SanitaryTabProps {
    data: SanitaryReportData[];
    loading: boolean;
    userRole: string;
    onChange: (value: number | null, rowKey: string, field: keyof SanitaryReportData) => void;
    onVerify: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onSubmit: (id: string) => void;
}

const SanitaryTab: React.FC<SanitaryTabProps> = ({ data, loading, userRole, onChange, onVerify, onApprove, onReject, onSubmit }) => {
    const { t } = useTranslation();

    const isAdmin = ['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(userRole);
    // UZ: Yangi rollar (Sanitariya)
    const isMudir = ['SANITARY_HEAD', 'DEPARTMENT_HEAD', 'DISTRICT_HEAD'].includes(userRole);
    const isSpecialist = ['SANITARY_SPECIALIST', 'SANITARY_OPERATOR', 'STAFF', 'DISTRICT_SPECIALIST', 'DISTRICT_OPERATOR'].includes(userRole);

    const canEdit = (record: SanitaryReportData) => {
        if (record.status === 'APPROVED' || record.status === 'VERIFIED') return false;
        if (isSpecialist) return record.status === 'DRAFT' || record.status === 'REJECTED' || !record.status;
        if (isMudir) return record.status === 'SUBMITTED';
        return isAdmin;
    };

    const renderInput = (record: SanitaryReportData, field: keyof SanitaryReportData, forceReadOnly = false) => {
        const readOnly = forceReadOnly || !canEdit(record);
        return (
            <InputNumber
                size="small"
                min={0}
                value={record[field] as number}
                onChange={(val) => !readOnly && onChange(val || 0, record.key, field)}
                variant="borderless"
                readOnly={readOnly}
                className="report-input"
                style={{ width: '100%', textAlign: 'center', fontWeight: readOnly ? 'bold' : 'normal', color: readOnly ? '#595959' : 'inherit' }}
                controls={false}
            />
        );
    };

    const columns: any = [
        {
            title: '№',
            dataIndex: 'key',
            width: 40, align: 'center', fixed: 'left',
            render: (text: string, r: SanitaryReportData) => (
                <div style={{ backgroundColor: r.is_submitted ? '#f6ffed' : '#fff1f0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {text}
                </div>
            )
        },
        {
            title: t('daily_reports.table.district'),
            dataIndex: 'district_name',
            width: 140,
            fixed: 'left',
            render: (text: string, r: SanitaryReportData) => (
                <span style={{ color: r.is_submitted ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            )
        },
        {
            title: t('daily_reports.table.inspected_objects'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'inspected_total', true) },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any) => renderInput(r, 'inspected_mtm') },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any) => renderInput(r, 'inspected_school') },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any) => renderInput(r, 'inspected_dpm') },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any) => renderInput(r, 'inspected_other') },
            ]
        },
        {
            title: t('daily_reports.table.defects_found'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'defects_total', true) },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any) => renderInput(r, 'defects_mtm') },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any) => renderInput(r, 'defects_school') },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any) => renderInput(r, 'defects_dpm') },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any) => renderInput(r, 'defects_other') },
            ]
        },
        {
            title: t('daily_reports.table.fines_issued'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'fines_total', true) },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any) => renderInput(r, 'fines_mtm') },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any) => renderInput(r, 'fines_school') },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any) => renderInput(r, 'fines_dpm') },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any) => renderInput(r, 'fines_other') },
            ]
        },
        {
            title: t('daily_reports.table.suspended_activities'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'suspended_total', true) },
                { title: t('daily_reports.table.mtm'), width: 50, render: (_: any, r: any) => renderInput(r, 'suspended_mtm') },
                { title: t('daily_reports.table.school'), width: 60, render: (_: any, r: any) => renderInput(r, 'suspended_school') },
                { title: t('daily_reports.table.dpm'), width: 50, render: (_: any, r: any) => renderInput(r, 'suspended_dpm') },
                { title: t('daily_reports.table.other'), width: 60, render: (_: any, r: any) => renderInput(r, 'suspended_other') },
            ]
        },
        {
            title: t('daily_reports.table.status'),
            key: 'status',
            width: 140,
            fixed: 'right',
            render: (_: any, r: SanitaryReportData) => (
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Badge status={r.status === 'APPROVED' ? 'success' : r.status === 'VERIFIED' ? 'processing' : 'default'} text={r.status} />
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
                            {isAdmin && r.status === 'VERIFIED' && (
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

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            bordered
            size="small"
            pagination={false}
            scroll={{ x: 1400 }}
            className="premium-table"
        />
    );
};

export default SanitaryTab;
