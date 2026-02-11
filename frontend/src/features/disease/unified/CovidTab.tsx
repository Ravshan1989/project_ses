import { Table, InputNumber, Space, Badge, Button } from 'antd';
import { useTranslation } from 'react-i18next';

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
    id?: string;
    status?: string;
    verificationToken?: string;
}

interface CovidTabProps {
    data: CovidReportData[];
    loading: boolean;
    isAdmin: boolean;
    onChange: (value: number | null, rowKey: string, field: keyof CovidReportData) => void;
    onVerify: (id: string) => void;
    onApprove: (id: string) => void;
}

const CovidTab: React.FC<CovidTabProps> = ({ data, loading, isAdmin, onChange, onVerify, onApprove }) => {
    const { t } = useTranslation();
    const isSubmitted = (row: CovidReportData) => !!row.is_submitted || row.total_cases > 0 || row.hospitalized_count > 0;

    const renderInput = (record: CovidReportData, field: keyof CovidReportData) => (
        <InputNumber
            size="small"
            min={0}
            value={record[field] as number}
            onChange={(val) => onChange(val || 0, record.key, field)}
            variant="borderless"
            className="report-input"
            style={{ width: '100%', textAlign: 'center' }}
            controls={false}
        />
    );

    const columns: any = [
        {
            title: '№', dataIndex: 'key', width: 40, align: 'center', fixed: 'left',
            onCell: (r: CovidReportData) => ({ style: { backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff' } })
        },
        {
            title: t('daily_reports.table.district') || 'Hududlar',
            dataIndex: 'district_name',
            width: 140,
            fixed: 'left',
            render: (text: string) => t(`orgs.${text.toLowerCase()}`, { defaultValue: text }),
            onCell: (r: CovidReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                    fontWeight: 500
                }
            })
        },
        { title: 'Jami', width: 70, render: (_: any, r: any) => renderInput(r, 'total_cases') },
        { title: 'Qayta kasallanganlar', width: 90, render: (_: any, r: any) => renderInput(r, 'reinfected') },
        { title: 'Emlanganlar orasida', width: 90, render: (_: any, r: any) => renderInput(r, 'vaccinated_infected') },
        {
            title: t('daily_reports.hepatitis_age_groups') || 'Yosh toifalari',
            children: [
                { title: '0-1 yosh', width: 60, render: (_: any, r: any) => renderInput(r, 'age_0_1') },
                { title: '1-3 yosh', width: 60, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: '4-6 yosh', width: 60, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: '7-14 yosh', width: 65, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: '15-19 yosh', width: 65, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: '20-29 yosh', width: 70, render: (_: any, r: any) => renderInput(r, 'age_20_29') },
                { title: '30-39 yosh', width: 70, render: (_: any, r: any) => renderInput(r, 'age_30_39') },
                { title: '40-49 yosh', width: 70, render: (_: any, r: any) => renderInput(r, 'age_40_49') },
                { title: '50-59 yosh', width: 70, render: (_: any, r: any) => renderInput(r, 'age_50_59') },
                { title: '60+ yosh', width: 70, render: (_: any, r: any) => renderInput(r, 'age_60_plus') },
            ]
        },
        {
            title: 'Guruhlar',
            children: [
                { title: 'Bog\'cha (uyushmagan)', width: 120, render: (_: any, r: any) => renderInput(r, 'pre_school_organized') },
                { title: 'Bog\'cha (uyushgan)', width: 120, render: (_: any, r: any) => renderInput(r, 'pre_school_unorganized') },
                { title: 'Maktab o\'quvchilari', width: 120, render: (_: any, r: any) => renderInput(r, 'students') },
                { title: 'Tibbiyot xodimlari', width: 120, render: (_: any, r: any) => renderInput(r, 'medical_workers') },
                { title: 'O\'qituvchilar', width: 100, render: (_: any, r: any) => renderInput(r, 'teachers') },
                { title: 'Boshqa mashg\'ulotli', width: 110, render: (_: any, r: any) => renderInput(r, 'others') },
            ]
        },
        { title: 'Shifoxonaga yotqizilganlar', width: 120, render: (_: any, r: any) => renderInput(r, 'hospitalized_count') },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 120,
            fixed: 'right',
            render: (_: any, r: CovidReportData) => (
                <Space direction="vertical" size={2}>
                    <Badge
                        status={r.status === 'APPROVED' ? 'success' : r.status === 'VERIFIED' ? 'processing' : 'default'}
                        text={r.status || 'DRAFT'}
                    />
                    {isAdmin && r.id && (
                        <Space>
                            {r.status === 'DRAFT' && (
                                <Button size="small" type="link" onClick={() => onVerify(r.id!)} style={{ padding: 0, fontSize: '11px' }}>
                                    Tekshirish
                                </Button>
                            )}
                            {r.status === 'VERIFIED' && (
                                <Button size="small" type="link" onClick={() => onApprove(r.id!)} style={{ padding: 0, fontSize: '11px', color: '#52c41a' }}>
                                    Tasdiqlash
                                </Button>
                            )}
                        </Space>
                    )}
                </Space>
            )
        }
    ];

    const calculateTotal = (field: keyof CovidReportData) => data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

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
