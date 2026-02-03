import React from 'react';
import { Table, InputNumber } from 'antd';

interface EpiReportData {
    key: string;
    district_name: string;
    organizationId: string;
    is_submitted?: boolean;
    objects_inspected: number;
    violations_found: number;
    fines_count: number;
    fines_amount: number;
    objects_closed: number;
    cases_to_court: number;
    cases_to_prosecutor: number;
    health_warnings: number;
    media_articles: number;
    media_tv: number;
    media_radio: number;
    seminars: number;
}

interface EpiTabProps {
    data: EpiReportData[];
    loading: boolean;
    onChange: (value: number | null, rowKey: string, field: keyof EpiReportData) => void;
}

const EpiTab: React.FC<EpiTabProps> = ({ data, loading, onChange }) => {
    const isSubmitted = (row: EpiReportData) => !!row.is_submitted || row.objects_inspected > 0 || row.violations_found > 0;

    const renderInput = (record: EpiReportData, field: keyof EpiReportData) => (
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
            onCell: (r: EpiReportData) => ({ style: { backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff' } })
        },
        {
            title: 'Hududlar', dataIndex: 'district_name', width: 140, fixed: 'left',
            onCell: (r: EpiReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                    fontWeight: 500
                }
            })
        },
        {
            title: 'Tekshiruvlar',
            children: [
                { title: 'Ob\'ekt', width: 70, render: (_: any, r: any) => renderInput(r, 'objects_inspected') },
                { title: 'Qoida b.', width: 70, render: (_: any, r: any) => renderInput(r, 'violations_found') },
            ]
        },
        {
            title: 'Choralar',
            children: [
                { title: 'Jarima(son)', width: 80, render: (_: any, r: any) => renderInput(r, 'fines_count') },
                { title: 'Jarima(sum)', width: 100, render: (_: any, r: any) => renderInput(r, 'fines_amount') },
                { title: 'Yopish', width: 70, render: (_: any, r: any) => renderInput(r, 'objects_closed') },
                { title: 'Sudga', width: 70, render: (_: any, r: any) => renderInput(r, 'cases_to_court') },
                { title: 'Prok.', width: 70, render: (_: any, r: any) => renderInput(r, 'cases_to_prosecutor') },
            ]
        },
        {
            title: 'Targ\'ibot',
            children: [
                { title: 'Ogohl.', width: 70, render: (_: any, r: any) => renderInput(r, 'health_warnings') },
                { title: 'Gazeta', width: 70, render: (_: any, r: any) => renderInput(r, 'media_articles') },
                { title: 'TV', width: 60, render: (_: any, r: any) => renderInput(r, 'media_tv') },
                { title: 'Radio', width: 60, render: (_: any, r: any) => renderInput(r, 'media_radio') },
                { title: 'Semin.', width: 70, render: (_: any, r: any) => renderInput(r, 'seminars') },
            ]
        }
    ];

    const calculateTotal = (field: keyof EpiReportData) => data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            bordered
            size="small"
            pagination={false}
            scroll={{ x: 1400, y: 550 }}
            summary={() => (
                <Table.Summary fixed>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                        <Table.Summary.Cell index={0} />
                        <Table.Summary.Cell index={1}>Jami</Table.Summary.Cell>
                        {columns.slice(2).flatMap((c: any) => c.children ? c.children : [c]).map((col: any, idx: number) => (
                            <Table.Summary.Cell key={idx} index={idx + 2} align="center">
                                {calculateTotal(col.dataIndex || (col.render ? 'objects_inspected' : 'objects_inspected') as any)}
                            </Table.Summary.Cell>
                        ))}
                    </Table.Summary.Row>
                </Table.Summary>
            )}
        />
    );
};

export default EpiTab;
