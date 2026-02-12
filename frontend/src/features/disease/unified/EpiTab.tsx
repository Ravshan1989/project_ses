import { Table, InputNumber, Space, Badge, Button } from 'antd';
import { useTranslation } from 'react-i18next';

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
    id?: string;
    status?: string;
    verificationToken?: string;
}

interface EpiTabProps {
    data: EpiReportData[];
    loading: boolean;
    isAdmin: boolean;
    onChange: (value: number | null, rowKey: string, field: keyof EpiReportData) => void;
    onVerify: (id: string) => void;
    onApprove: (id: string) => void;
}

const EpiTab: React.FC<EpiTabProps> = ({ data, loading, isAdmin, onChange, onVerify, onApprove }) => {
    const { t } = useTranslation();
    const isSubmitted = (row: EpiReportData) => !!row.is_submitted || row.objects_inspected > 0 || row.violations_found > 0;

    const renderInput = (record: EpiReportData, field: keyof EpiReportData) => (
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
            render: (text: string, r: EpiReportData) => (
                <div style={{ backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {text}
                </div>
            )
        },
        {
            title: t('daily_reports.table.district') || 'Hududlar',
            dataIndex: 'district_name',
            width: 140,
            fixed: 'left',
            render: (text: string, r: EpiReportData) => (
                <span style={{ color: isSubmitted(r) ? '#389e0d' : '#cf1322', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            ),
            onCell: (r: EpiReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                }
            })
        },
        {
            title: t('daily_reports.tabs.epi.results_title'),
            children: [
                { title: t('daily_reports.tabs.epi.objects_inspected'), width: 120, render: (_: any, r: any) => renderInput(r, 'objects_inspected') },
                { title: t('daily_reports.tabs.epi.violations_found'), width: 120, render: (_: any, r: any) => renderInput(r, 'violations_found') },
            ]
        },
        {
            title: t('daily_reports.tabs.epi.measures_title'),
            children: [
                { title: t('daily_reports.tabs.epi.fines_count'), width: 110, render: (_: any, r: any) => renderInput(r, 'fines_count') },
                { title: t('daily_reports.tabs.epi.fines_amount'), width: 130, render: (_: any, r: any) => renderInput(r, 'fines_amount') },
                { title: t('daily_reports.tabs.epi.objects_closed'), width: 120, render: (_: any, r: any) => renderInput(r, 'objects_closed') },
                { title: t('daily_reports.tabs.epi.cases_to_court'), width: 110, render: (_: any, r: any) => renderInput(r, 'cases_to_court') },
                { title: t('daily_reports.tabs.epi.cases_to_prosecutor'), width: 130, render: (_: any, r: any) => renderInput(r, 'cases_to_prosecutor') },
            ]
        },
        {
            title: t('daily_reports.tabs.epi.propaganda_title'),
            children: [
                { title: t('daily_reports.tabs.epi.health_warnings'), width: 130, render: (_: any, r: any) => renderInput(r, 'health_warnings') },
                { title: t('daily_reports.tabs.epi.media_articles'), width: 100, render: (_: any, r: any) => renderInput(r, 'media_articles') },
                { title: t('daily_reports.tabs.epi.media_tv'), width: 100, render: (_: any, r: any) => renderInput(r, 'media_tv') },
                { title: t('daily_reports.tabs.epi.media_radio'), width: 110, render: (_: any, r: any) => renderInput(r, 'media_radio') },
                { title: t('daily_reports.tabs.epi.seminars'), width: 110, render: (_: any, r: any) => renderInput(r, 'seminars') },
            ]
        },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 120,
            fixed: 'right',
            render: (_: any, r: EpiReportData) => (
                <Space direction="vertical" size={2}>
                    <Badge
                        status={r.status === 'APPROVED' ? 'success' : r.status === 'VERIFIED' ? 'processing' : 'default'}
                        text={r.status ? t(`dashboard_page.statuses.${r.status.toLowerCase()}`, { defaultValue: r.status }) : t('dashboard_page.statuses.draft', { defaultValue: 'DRAFT' })}
                    />
                    {isAdmin && r.id && (
                        <Space>
                            {r.status === 'DRAFT' && (
                                <Button size="small" type="link" onClick={() => onVerify(r.id!)} style={{ padding: 0, fontSize: '11px' }}>
                                    {t('dashboard_page.table.approve_tooltip') || 'Tekshirish'}
                                </Button>
                            )}
                            {r.status === 'VERIFIED' && (
                                <Button size="small" type="link" onClick={() => onApprove(r.id!)} style={{ padding: 0, fontSize: '11px', color: '#52c41a' }}>
                                    {t('common.approved') || 'Tasdiqlash'}
                                </Button>
                            )}
                        </Space>
                    )}
                </Space>
            )
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
            className="premium-table"
            summary={() => (
                <Table.Summary fixed>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                        <Table.Summary.Cell index={0} />
                        <Table.Summary.Cell index={1}>{t('dashboard_page.total_reports') || 'Jami'}</Table.Summary.Cell>
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

/*
ORIGINAL CODE (Append-only rule):
import { Table, InputNumber, Space, Badge, Button } from 'antd';
import { useTranslation } from 'react-i18next';

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
    id?: string;
    status?: string;
    verificationToken?: string;
}

interface EpiTabProps {
    data: EpiReportData[];
    loading: boolean;
    isAdmin: boolean;
    onChange: (value: number | null, rowKey: string, field: keyof EpiReportData) => void;
    onVerify: (id: string) => void;
    onApprove: (id: string) => void;
}

const EpiTab: React.FC<EpiTabProps> = ({ data, loading, isAdmin, onChange, onVerify, onApprove }) => {
    const { t } = useTranslation();
    const isSubmitted = (row: EpiReportData) => !!row.is_submitted || row.objects_inspected > 0 || row.violations_found > 0;

    const renderInput = (record: EpiReportData, field: keyof EpiReportData) => (
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
            render: (text: string, r: EpiReportData) => (
                <div style={{ backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {text}
                </div>
            )
        },
        {
            title: t('daily_reports.table.district') || 'Hududlar',
            dataIndex: 'district_name',
            width: 140,
            fixed: 'left',
            render: (text: string, r: EpiReportData) => (
                <span style={{ color: isSubmitted(r) ? '#389e0d' : '#cf1322', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            ),
            onCell: (r: EpiReportData) => ({
                style: {
                    backgroundColor: isSubmitted(r) ? '#f6ffed' : '#fff1f0',
                }
            })
        },
        {
            title: 'Tekshiruvlar natijasi',
            children: [
                { title: 'Tekshirilgan ob\'ektlar soni', width: 120, render: (_: any, r: any) => renderInput(r, 'objects_inspected') },
                { title: 'Aniqlangan qoida buzilishlar', width: 120, render: (_: any, r: any) => renderInput(r, 'violations_found') },
            ]
        },
        {
            title: 'Ko\'rilgan choralar',
            children: [
                { title: 'Solingan jarimalar (soni)', width: 110, render: (_: any, r: any) => renderInput(r, 'fines_count') },
                { title: 'Solingan jarimalar (summasi)', width: 130, render: (_: any, r: any) => renderInput(r, 'fines_amount') },
                { title: 'Ish faoliyati to\'xtatilganlar', width: 120, render: (_: any, r: any) => renderInput(r, 'objects_closed') },
                { title: 'Sudga yuborilganlar', width: 110, render: (_: any, r: any) => renderInput(r, 'cases_to_court') },
                { title: 'Prokuraturaga yuborilganlar', width: 130, render: (_: any, r: any) => renderInput(r, 'cases_to_prosecutor') },
            ]
        },
        {
            title: 'Targ\'ibot va tashviqot ishlari',
            children: [
                { title: 'Sog\'lomlashtirish ogohlantirishlari', width: 130, render: (_: any, r: any) => renderInput(r, 'health_warnings') },
                { title: 'Gazeta va jurnallar', width: 100, render: (_: any, r: any) => renderInput(r, 'media_articles') },
                { title: 'Televideniye', width: 100, render: (_: any, r: any) => renderInput(r, 'media_tv') },
                { title: 'Radioeshittirishlar', width: 110, render: (_: any, r: any) => renderInput(r, 'media_radio') },
                { title: 'Seminar va yig\'ilishlar', width: 110, render: (_: any, r: any) => renderInput(r, 'seminars') },
            ]
        },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 120,
            fixed: 'right',
            render: (_: any, r: EpiReportData) => (
                <Space direction="vertical" size={2}>
                    <Badge
                        status={r.status === 'APPROVED' ? 'success' : r.status === 'VERIFIED' ? 'processing' : 'default'}
                        text={r.status ? t(`dashboard_page.statuses.${r.status.toLowerCase()}`, { defaultValue: r.status }) : t('dashboard_page.statuses.draft', { defaultValue: 'DRAFT' })}
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
            className="premium-table"
            summary={() => (
                <Table.Summary fixed>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                        <Table.Summary.Cell index={0} />
                        <Table.Summary.Cell index={1}>{t('dashboard_page.total_reports') || 'Jami'}</Table.Summary.Cell>
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
*/
