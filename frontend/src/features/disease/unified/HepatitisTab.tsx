import { Table, InputNumber, Space, Badge, Button } from 'antd';
import { useTranslation } from 'react-i18next';

interface ReportData {
    key: string;
    district_name: string;
    organizationId: string;
    is_submitted?: boolean;
    total_cases: number;
    age_under_1: number;
    age_1_3: number;
    age_4_6: number;
    age_7_14: number;
    age_15_19: number;
    age_20_plus: number;
    occ_unorganized: number;
    occ_unorganized_1_6: number;
    occ_organized_1_6: number;
    occ_unorganized_school_age: number;
    occ_students: number;
    occ_college_students: number;
    occ_workers: number;
    factor_water: number;
    factor_food: number;
    factor_contact: number;
    lab_samples: number;
    lab_positive: number;
    disinfection_done: number;
    id?: string;
    status?: string;
    verificationToken?: string;
}

interface HepatitisTabProps {
    data: ReportData[];
    loading: boolean;
    isAdmin: boolean;
    onChange: (value: number | null, rowKey: string, field: keyof ReportData) => void;
    onVerify: (id: string) => void;
    onApprove: (id: string) => void;
}

const HepatitisTab: React.FC<HepatitisTabProps> = ({ data, loading, isAdmin, onChange, onVerify, onApprove }) => {
    const { t } = useTranslation();
    const isSubmitted = (record: ReportData) => !!record.is_submitted;

    const renderInput = (record: ReportData, field: keyof ReportData, readOnly = false) => (
        <InputNumber
            size="small"
            min={0}
            value={record[field] as number}
            onChange={(val) => !readOnly && onChange(val || 0, record.key, field)}
            variant="borderless"
            readOnly={readOnly}
            className="report-input"
            style={{ width: '100%', padding: 0, fontWeight: readOnly ? 'bold' : 'normal' }}
            controls={false}
        />
    );

    const columns: any = [
        {
            title: '№', dataIndex: 'key', width: 40, align: 'center', fixed: 'left',
            onCell: (record: ReportData) => ({ style: { backgroundColor: isSubmitted(record) ? '#f6ffed' : '#fff1f0' } })
        },
        {
            title: t('daily_reports.table.district') || 'Hududlar',
            dataIndex: 'district_name',
            width: 150,
            fixed: 'left',
            render: (text: string) => t(`orgs.${text.toLowerCase()}`, { defaultValue: text }),
            onCell: (record: ReportData) => ({
                style: {
                    backgroundColor: isSubmitted(record) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(record) ? '#389e0d' : '#cf1322',
                    fontWeight: '500'
                }
            })
        },
        { title: t('dashboard_page.total_reports') || 'Jami', width: 60, render: (_: any, r: any) => renderInput(r, 'total_cases', true) },
        {
            title: t('daily_reports.hepatitis_age_groups') || 'Yoshlari bo\'yicha',
            children: [
                { title: '1 yoshgacha', width: 60, render: (_: any, r: any) => renderInput(r, 'age_under_1') },
                { title: '1-3 yosh', width: 60, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: '4-6 yosh', width: 60, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: '7-14 yosh', width: 65, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: '15-19 yosh', width: 65, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: '20+ yosh', width: 65, render: (_: any, r: any) => renderInput(r, 'age_20_plus') },
            ]
        },
        {
            title: t('daily_reports.hepatitis_occupation') || 'Kasbi bo\'yicha',
            children: [
                { title: '1 yoshgacha uyushmagan', width: 100, render: (_: any, r: any) => renderInput(r, 'occ_unorganized') },
                { title: '1-6 yosh uyushmagan', width: 100, render: (_: any, r: any) => renderInput(r, 'occ_unorganized_1_6') },
                { title: '1-6 yosh bog\'cha', width: 100, render: (_: any, r: any) => renderInput(r, 'occ_organized_1_6') },
                { title: 'Maktab yoshidagi uyushmagan', width: 110, render: (_: any, r: any) => renderInput(r, 'occ_unorganized_school_age') },
                { title: 'Maktab o\'quvchilari', width: 100, render: (_: any, r: any) => renderInput(r, 'occ_students') },
                { title: 'Litsey/Koll./Olimlar', width: 100, render: (_: any, r: any) => renderInput(r, 'occ_college_students') },
                { title: 'Boshqa muassasa ishchilari', width: 100, render: (_: any, r: any) => renderInput(r, 'occ_workers') },
            ]
        },
        {
            title: t('daily_reports.hepatitis_factors') || 'Omillar',
            children: [
                { title: 'Ichimlik suvi', width: 80, render: (_: any, r: any) => renderInput(r, 'factor_water') },
                { title: 'Oziq-ovqat', width: 80, render: (_: any, r: any) => renderInput(r, 'factor_food') },
                { title: 'Maishiy muloqot', width: 85, render: (_: any, r: any) => renderInput(r, 'factor_contact') },
            ]
        },
        {
            title: t('daily_reports.hepatitis_lab') || 'Laboratoriya',
            children: [
                { title: t('dashboard_page.total_reports') || 'Jami', width: 50, render: (_: any, r: any) => renderInput(r, 'lab_samples') },
                { title: t('daily_reports.lab_positive') || 'Musbat', width: 55, render: (_: any, r: any) => renderInput(r, 'lab_positive') },
            ]
        },
        { title: 'Dezinfeksiya', dataIndex: 'disinfection_done', width: 80, render: (_: any, r: any) => renderInput(r, 'disinfection_done') },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 120,
            fixed: 'right',
            render: (_: any, r: ReportData) => (
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

    const calculateTotal = (field: keyof ReportData) => data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

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

export default HepatitisTab;
