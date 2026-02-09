import { Table, InputNumber } from 'antd';
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
}

interface HepatitisTabProps {
    data: ReportData[];
    loading: boolean;
    onChange: (value: number | null, rowKey: string, field: keyof ReportData) => void;
}

const HepatitisTab: React.FC<HepatitisTabProps> = ({ data, loading, onChange }) => {
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
            render: (text: string) => t(`orgs.${text}`, { defaultValue: text }),
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
                { title: '1y.', width: 50, render: (_: any, r: any) => renderInput(r, 'age_under_1') },
                { title: '1-3', width: 50, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: '4-6', width: 50, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: '7-14', width: 55, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: '15-19', width: 55, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: '20+', width: 55, render: (_: any, r: any) => renderInput(r, 'age_20_plus') },
            ]
        },
        {
            title: t('daily_reports.hepatitis_occupation') || 'Kasbi bo\'yicha',
            children: [
                { title: 'U-1 uyush.', width: 70, render: (_: any, r: any) => renderInput(r, 'occ_unorganized') },
                { title: '1-6 uyush.', width: 70, render: (_: any, r: any) => renderInput(r, 'occ_unorganized_1_6') },
                { title: '1-6 bog\'cha', width: 70, render: (_: any, r: any) => renderInput(r, 'occ_organized_1_6') },
                { title: 'Maktab uyush.', width: 70, render: (_: any, r: any) => renderInput(r, 'occ_unorganized_school_age') },
                { title: 'O\'quvchi', width: 70, render: (_: any, r: any) => renderInput(r, 'occ_students') },
                { title: 'Talaba', width: 70, render: (_: any, r: any) => renderInput(r, 'occ_college_students') },
                { title: 'Kattalar', width: 70, render: (_: any, r: any) => renderInput(r, 'occ_workers') },
            ]
        },
        {
            title: t('daily_reports.hepatitis_factors') || 'Omillar',
            children: [
                { title: 'Suv', width: 50, render: (_: any, r: any) => renderInput(r, 'factor_water') },
                { title: 'Ovaqt', width: 50, render: (_: any, r: any) => renderInput(r, 'factor_food') },
                { title: 'Muloq.', width: 50, render: (_: any, r: any) => renderInput(r, 'factor_contact') },
            ]
        },
        {
            title: t('daily_reports.hepatitis_lab') || 'Laboratoriya',
            children: [
                { title: t('dashboard_page.total_reports') || 'Jami', width: 50, render: (_: any, r: any) => renderInput(r, 'lab_samples') },
                { title: t('daily_reports.lab_positive') || 'Musbat', width: 55, render: (_: any, r: any) => renderInput(r, 'lab_positive') },
            ]
        },
        { title: t('daily_reports.disinfection') || 'Dez.', dataIndex: 'disinfection_done', width: 50, render: (_: any, r: any) => renderInput(r, 'disinfection_done') },
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
