import React from 'react';
import { Table, InputNumber } from 'antd';

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
}

interface FluAriTabProps {
    data: FluReportData[];
    loading: boolean;
    onChange: (value: number | null, rowKey: string, field: keyof FluReportData) => void;
}

const FluAriTab: React.FC<FluAriTabProps> = ({ data, loading, onChange }) => {
    const isSubmitted = (row: FluReportData) => !!row.is_submitted || (row.ari_total + row.flu_total + row.pneu_total + row.sari_total + row.death_total) > 0;

    const renderInput = (record: FluReportData, field: keyof FluReportData, readOnly = false) => (
        <InputNumber
            size="small"
            min={0}
            value={record[field] as number}
            onChange={(val) => !readOnly && onChange(val || 0, record.key, field)}
            variant="borderless"
            readOnly={readOnly}
            style={{ width: '100%', textAlign: 'center', fontWeight: readOnly ? 'bold' : 'normal' }}
            controls={false}
        />
    );

    const columns: any = [
        {
            title: '№', dataIndex: 'key', width: 40, align: 'center', fixed: 'left',
            onCell: (r: FluReportData) => ({ style: { backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff' } })
        },
        {
            title: 'Hududlar', dataIndex: 'district_name', width: 140, fixed: 'left',
            onCell: (r: FluReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(r) ? '#389e0d' : '#cf1322',
                    fontWeight: 500
                }
            })
        },
        {
            title: 'O\'RI',
            children: [
                { title: 'Jami', width: 60, render: (_: any, r: any) => renderInput(r, 'ari_total', true) },
                { title: '0-1y', width: 50, render: (_: any, r: any) => renderInput(r, 'ari_0_1') },
                { title: '1-2y', width: 50, render: (_: any, r: any) => renderInput(r, 'ari_1_2') },
                { title: '3-6y', width: 50, render: (_: any, r: any) => renderInput(r, 'ari_3_6') },
                { title: '7-14y', width: 55, render: (_: any, r: any) => renderInput(r, 'ari_7_14') },
                { title: 'kattalar', width: 65, render: (_: any, r: any) => renderInput(r, 'ari_adult') },
            ]
        },
        {
            title: 'O\'P (Zotiljam)',
            children: [
                { title: 'Jami', width: 60, render: (_: any, r: any) => renderInput(r, 'pneu_total', true) },
                { title: '0-2y', width: 50, render: (_: any, r: any) => renderInput(r, 'pneu_0_2') },
                { title: '3-6y', width: 50, render: (_: any, r: any) => renderInput(r, 'pneu_3_6') },
                { title: '7-14y', width: 55, render: (_: any, r: any) => renderInput(r, 'pneu_7_14') },
                { title: 'kattalar', width: 65, render: (_: any, r: any) => renderInput(r, 'pneu_adult') },
            ]
        },
        {
            title: 'GK (Grippga o\'xshash)',
            children: [
                { title: 'Jami', width: 60, render: (_: any, r: any) => renderInput(r, 'flu_total', true) },
                { title: '0-1y', width: 50, render: (_: any, r: any) => renderInput(r, 'flu_0_1') },
                { title: '1-2y', width: 50, render: (_: any, r: any) => renderInput(r, 'flu_1_2') },
                { title: '3-6y', width: 50, render: (_: any, r: any) => renderInput(r, 'flu_3_6') },
                { title: '7-14y', width: 55, render: (_: any, r: any) => renderInput(r, 'flu_7_14') },
                { title: 'kattalar', width: 65, render: (_: any, r: any) => renderInput(r, 'flu_adult') },
            ]
        },
        {
            title: 'SARI (Og\'ir o\'tkir)',
            children: [
                { title: 'Jami', width: 60, render: (_: any, r: any) => renderInput(r, 'sari_total', true) },
                { title: '0-2y', width: 50, render: (_: any, r: any) => renderInput(r, 'sari_0_2') },
                { title: '3-6y', width: 50, render: (_: any, r: any) => renderInput(r, 'sari_3_6') },
                { title: '7-14y', width: 55, render: (_: any, r: any) => renderInput(r, 'sari_7_14') },
                { title: 'Kattalar', width: 60, render: (_: any, r: any) => renderInput(r, 'sari_adult') },
            ]
        },
        {
            title: 'Vafot',
            children: [
                { title: 'Jami', width: 50, render: (_: any, r: any) => renderInput(r, 'death_total') },
                { title: 'Homil.', width: 60, render: (_: any, r: any) => renderInput(r, 'death_pregnant') },
            ]
        }
    ];

    const calculateTotal = (field: keyof FluReportData) => data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            bordered
            size="small"
            pagination={false}
            scroll={{ x: 1800, y: 550 }}
            summary={() => (
                <Table.Summary fixed>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                        <Table.Summary.Cell index={0} />
                        <Table.Summary.Cell index={1}>Jami</Table.Summary.Cell>
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
