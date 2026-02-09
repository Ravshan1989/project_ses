import React from 'react';
import { Table, InputNumber } from 'antd';

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
}

interface CovidTabProps {
    data: CovidReportData[];
    loading: boolean;
    onChange: (value: number | null, rowKey: string, field: keyof CovidReportData) => void;
}

const CovidTab: React.FC<CovidTabProps> = ({ data, loading, onChange }) => {
    const isSubmitted = (row: CovidReportData) => !!row.is_submitted || row.total_cases > 0 || row.hospitalized_count > 0;

    const renderInput = (record: CovidReportData, field: keyof CovidReportData) => (
        <InputNumber
            size="small"
            min={0}
            value={record[field] as number}
            onChange={(val) => onChange(val || 0, record.key, field)}
            variant="borderless"
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
            title: 'Hududlar', dataIndex: 'district_name', width: 140, fixed: 'left',
            onCell: (r: CovidReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                    fontWeight: 500
                }
            })
        },
        { title: 'Jami', width: 70, render: (_: any, r: any) => renderInput(r, 'total_cases') },
        { title: 'Qayta', width: 60, render: (_: any, r: any) => renderInput(r, 'reinfected') },
        { title: 'Emlan.', width: 60, render: (_: any, r: any) => renderInput(r, 'vaccinated_infected') },
        {
            title: 'Yosh toifalari',
            children: [
                { title: '1y.', width: 45, render: (_: any, r: any) => renderInput(r, 'age_0_1') },
                { title: '1-3', width: 45, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: '4-6', width: 45, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: '7-14', width: 50, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: '15-19', width: 50, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: '20-29', width: 55, render: (_: any, r: any) => renderInput(r, 'age_20_29') },
                { title: '30-39', width: 55, render: (_: any, r: any) => renderInput(r, 'age_30_39') },
                { title: '40-49', width: 55, render: (_: any, r: any) => renderInput(r, 'age_40_49') },
                { title: '50-59', width: 55, render: (_: any, r: any) => renderInput(r, 'age_50_59') },
                { title: '60+', width: 55, render: (_: any, r: any) => renderInput(r, 'age_60_plus') },
            ]
        },
        {
            title: 'Guruhlar',
            children: [
                { title: 'Uyushmagan', width: 85, render: (_: any, r: any) => renderInput(r, 'pre_school_organized') },
                { title: 'Uyushgan', width: 85, render: (_: any, r: any) => renderInput(r, 'pre_school_unorganized') },
                { title: 'O\'quvchi', width: 70, render: (_: any, r: any) => renderInput(r, 'students') },
                { title: 'Tibbiyot', width: 70, render: (_: any, r: any) => renderInput(r, 'medical_workers') },
                { title: 'O\'qituvchi', width: 70, render: (_: any, r: any) => renderInput(r, 'teachers') },
                { title: 'Boshqa', width: 70, render: (_: any, r: any) => renderInput(r, 'others') },
            ]
        },
        { title: 'Shifoxona', width: 80, render: (_: any, r: any) => renderInput(r, 'hospitalized_count') },
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
                        <Table.Summary.Cell index={1}>Jami</Table.Summary.Cell>
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
