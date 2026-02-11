import React, { useState, useEffect } from 'react';
import { SaveOutlined, ReloadOutlined, CheckCircleOutlined, AuditOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Table, Typography, DatePicker, Button, InputNumber, notification, Space, Badge, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';

import PermissionGate from '../../components/PermissionGate';

const { Title, Text } = Typography;

interface ReportData {
    key: string;
    district_name: string;
    organizationId: string;
    total_cases: number;
    // Ages
    age_under_1: number;
    age_1_3: number;
    age_4_6: number;
    age_7_14: number;
    age_15_19: number;
    age_20_plus: number;
    // Occ
    occ_unorganized: number;
    occ_unorganized_1_6: number;
    occ_organized_1_6: number;
    occ_unorganized_school_age: number;
    occ_students: number;
    occ_college_students: number;
    occ_workers: number;
    // Factors
    factor_water: number;
    factor_food: number;
    factor_contact: number;
    // Lab
    lab_samples: number;
    lab_positive: number;
    disinfection_done: number;
    is_submitted?: boolean;
    id?: string;
    status?: string;
    verificationToken?: string;
}

const DailyHepatitisPage: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(dayjs());
    const [data, setData] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);


    // Auth context (simulated)
    // Auth context (simulated)
    const userRole = localStorage.getItem('user_role') || 'REGION_HEAD';
    // const isAdmin = userRole === 'REGION_HEAD'; <- ESKI
    // YANGI: Admin yoki Region Head hammasini ko'radi
    const isAdmin = ['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(userRole);

    // User Org Name ni local storage dan olish kerak aslida
    // Hozircha hardcode qilingan "Olmaliq sh" ni olib tashlaymiz va dynamic qilamiz
    // const userOrgName = "Olmaliq sh"; 
    const connectedOrgId = localStorage.getItem('user_org_id'); // Agar bor bo'lsa

    useEffect(() => {
        fetchReports();
    }, [date]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');

            let currentOrgs = organizations;
            if (currentOrgs.length === 0) {
                const orgRes = await organizationsApi.getAll();
                // Viloyatni (parent darajasi) hisobotdan olib tashlaymiz
                // TUZATISH: Agar API dan 'parent' maydoni kemasa, demak bu viloyat (yoki aksincha).
                // Logikani tekshiramiz: Bizga TUMANLAR kerak. Tumanlarda parent bo'lishi kerak yoki 'tuman' so'zi qatnashishi kerak.
                // Keling, barcha tashkilotlarni olib, keyin filter qilamiz.

                // Debug uchun: console.log(orgRes.data);

                // Hozircha barcha tashkilotlarni ko'rsatamiz va kerak bo'lmasa filter qilamiz
                // Agar org.parent bo'lsa -> bu tuman (taxminan)
                // Yoki org.type === 'DISTRICT' bo'lsa

                // Qat'iy qoida bo'yicha eski kodni saqlaymiz, lekin filtered logic o'zgartiriladi
                const allOrgs = orgRes.data || [];
                // YANGI: Faqat tumanlarni (ota-onasi bor tashkilotlarni) olamiz
                currentOrgs = allOrgs.filter((org: any) => !!org.parent);
                setOrganizations(currentOrgs);
            }

            const res = await dailyReportsApi.getByDate(formattedDate, false);
            const apiData = res.data || [];

            let tableData = currentOrgs.map((org, idx) => {
                const existing = apiData.find((r: any) => r.organization?.id === org.id);
                return {
                    key: String(idx + 1),
                    district_name: org.name,
                    organizationId: org.id,
                    is_submitted: !!existing,
                    total_cases: existing?.total_cases || 0,
                    age_under_1: existing?.age_under_1 || 0,
                    age_1_3: existing?.age_1_3 || 0,
                    age_4_6: existing?.age_4_6 || 0,
                    age_7_14: existing?.age_7_14 || 0,
                    age_15_19: existing?.age_15_19 || 0,
                    age_20_plus: existing?.age_20_plus || 0,
                    occ_unorganized: existing?.occ_unorganized || 0,
                    occ_unorganized_1_6: existing?.occ_unorganized_1_6 || 0,
                    occ_organized_1_6: existing?.occ_organized_1_6 || 0,
                    occ_unorganized_school_age: existing?.occ_unorganized_school_age || 0,
                    occ_students: existing?.occ_students || 0,
                    occ_college_students: existing?.occ_college_students || 0,
                    occ_workers: existing?.occ_workers || 0,
                    factor_water: existing?.factor_water || 0,
                    factor_food: existing?.factor_food || 0,
                    factor_contact: existing?.factor_contact || 0,
                    lab_samples: existing?.lab_samples || 0,
                    lab_positive: existing?.lab_positive || 0,
                    disinfection_done: existing?.disinfection_done || 0,
                    id: existing?.id,
                    status: existing?.status || 'DRAFT',
                    verificationToken: existing?.verificationToken,
                };
            });

            if (!isAdmin) {
                // tableData = tableData.filter(d => d.district_name === userOrgName); <- ESKI

                // YANGI: Agar user admin bo'lmasa, faqat o'zini tashkilotini ko'radi
                if (connectedOrgId) {
                    tableData = tableData.filter(d => d.organizationId === connectedOrgId);
                } else {
                    // Fallback: Agar org id topilmasa, lekin role district bo'lsa, 
                    // ehtimol userOrgName bilan solishtirish kerak (lekin bu ishonchsiz)
                    // Hozircha bu yerni ochiq qoldiramiz (hammasini ko'rsatmaslik uchun)
                    // Yoki bo'sh array qaytaramiz xavfsizlik uchun
                    // tableData = []; 

                    // UZ: Xavfsizlik uchun, agar ID topilmasa, bo'sh jadval qaytarish ma'qul, 
                    // lekin hozircha eski mantiq (display all) ni o'chirib, qat'iy tekshiruv qo'yamiz
                    tableData = [];
                }
            }

            setData(tableData);
        } catch (error) {
            console.error("Failed to fetch reports", error);
            notification.error({
                message: t('daily_reports.actions.error_load'),
                description: t('daily_reports.actions.error_load')
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCellChange = (value: number | null, rowKey: string, field: keyof ReportData) => {
        const newData = [...data];
        const index = newData.findIndex(item => item.key === rowKey);
        if (index > -1) {
            const updatedRow = { ...newData[index], [field]: value || 0 };
            const ageFields: (keyof ReportData)[] = [
                'age_under_1', 'age_1_3', 'age_4_6', 'age_7_14', 'age_15_19', 'age_20_plus'
            ];
            if (ageFields.includes(field)) {
                updatedRow.total_cases = ageFields.reduce((sum, f) => sum + (updatedRow[f] as number), 0);
            }
            newData[index] = updatedRow;
            setData(newData);
        }
    };

    const renderInput = (record: ReportData, field: keyof ReportData, readOnly = false) => (
        <InputNumber
            size="small"
            min={0}
            value={record[field] as number}
            onChange={(val) => !readOnly && handleCellChange(val, record.key, field)}
            variant="borderless"
            readOnly={readOnly}
            style={{ width: '100%', padding: 0, fontWeight: readOnly ? 'bold' : 'normal' }}
            controls={false}
        />
    );

    const isSubmitted = (record: ReportData) => {
        return !!record.is_submitted;
    };

    // @ts-expect-error: suppressing complex type error
    const columns: any = [
        {
            title: t('daily_reports.table.no'),
            dataIndex: 'key',
            width: 40, align: 'center', fixed: 'left',
            onCell: (record: ReportData) => ({
                style: { backgroundColor: isSubmitted(record) ? '#f6ffed' : '#fff1f0' }
            })
        },
        {
            title: t('daily_reports.table.district'),
            dataIndex: 'district_name',
            width: 150, fixed: 'left',
            render: (text: string, r: ReportData) => (
                <span style={{ color: r.is_submitted ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            ),
        },
        {
            title: t('daily_reports.table.total_cases'),
            dataIndex: 'total_cases',
            width: 80,
            render: (_: any, r: any) => renderInput(r, 'total_cases', true)
        },
        {
            title: t('daily_reports.table.by_age'),
            children: [
                { title: t('daily_reports.table.age_1'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_under_1') },
                { title: t('daily_reports.table.age_1_3'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: t('daily_reports.table.age_4_6'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: t('daily_reports.table.age_7_14'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: t('daily_reports.table.age_15_19'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: t('daily_reports.table.age_20'), width: 60, render: (_: any, r: any) => renderInput(r, 'age_20_plus') },
            ]
        },
        {
            title: t('daily_reports.table.by_occupation'),
            children: [
                { title: t('daily_reports.table.unorganized'), width: 80, render: (_: any, r: any) => renderInput(r, 'occ_unorganized') },
                { title: t('daily_reports.table.unorg_preschool'), width: 80, render: (_: any, r: any) => renderInput(r, 'occ_unorganized_1_6') },
                { title: t('daily_reports.table.org_preschool'), width: 80, render: (_: any, r: any) => renderInput(r, 'occ_organized_1_6') },
                { title: t('daily_reports.table.unorg_school'), width: 80, render: (_: any, r: any) => renderInput(r, 'occ_unorganized_school_age') },
                { title: t('daily_reports.table.students'), width: 80, render: (_: any, r: any) => renderInput(r, 'occ_students') },
                { title: t('daily_reports.table.college_students'), width: 80, render: (_: any, r: any) => renderInput(r, 'occ_college_students') },
                { title: t('daily_reports.table.adults'), width: 80, render: (_: any, r: any) => renderInput(r, 'occ_workers') },
            ]
        },
        {
            title: t('daily_reports.table.factors'),
            children: [
                { title: t('daily_reports.table.water'), width: 60, render: (_: any, r: any) => renderInput(r, 'factor_water') },
                { title: t('daily_reports.table.food'), width: 60, render: (_: any, r: any) => renderInput(r, 'factor_food') },
                { title: t('daily_reports.table.contact'), width: 60, render: (_: any, r: any) => renderInput(r, 'factor_contact') },
            ]
        },
        {
            title: t('daily_reports.table.lab'),
            children: [
                { title: t('daily_reports.table.lab_total'), width: 60, render: (_: any, r: any) => renderInput(r, 'lab_samples') },
                { title: t('daily_reports.table.lab_positive'), width: 60, render: (_: any, r: any) => renderInput(r, 'lab_positive') },
            ]
        },
        {
            title: t('daily_reports.table.disinfection'),
            dataIndex: 'disinfection_done',
            width: 80,
            render: (_: any, r: any) => renderInput(r, 'disinfection_done')
        },
    ];
    // YANGI TALAB (03.02.2026): Skrinshot asosida yangi ustunlar tuzilmasi
    // Bu yerda biz eski columns o'zgaruvchisini saqlab qolamiz va yangi columnsV2 ni qo'shamiz
    const columnsV2: any = [
        {
            title: '№',
            dataIndex: 'key',
            width: 40, align: 'center', fixed: 'left',
            onCell: (record: ReportData) => ({
                style: { backgroundColor: isSubmitted(record) ? '#f6ffed' : '#fff1f0' }
            })
        },
        {
            title: t('daily_reports.table.district'),
            dataIndex: 'district_name',
            width: 150, fixed: 'left',
            render: (text: string, r: ReportData) => (
                <span style={{ color: r.is_submitted ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {t(`orgs.${text.toLowerCase()}`, { defaultValue: text })}
                </span>
            ),
        },
        {
            title: t('daily_reports.table_v2.total_hepatitis'),
            dataIndex: 'total_cases',
            width: 90,
            render: (_: any, r: any) => renderInput(r, 'total_cases', true)
        },
        {
            title: t('daily_reports.table.by_age'),
            children: [
                { title: t('daily_reports.table_v2.age_under_1_yr'), width: 70, render: (_: any, r: any) => renderInput(r, 'age_under_1') },
                { title: t('daily_reports.table.age_1_3'), width: 70, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: t('daily_reports.table.age_4_6'), width: 70, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: t('daily_reports.table.age_7_14'), width: 70, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: t('daily_reports.table.age_15_19'), width: 70, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: t('daily_reports.table_v2.age_20_plus_yrs'), width: 80, render: (_: any, r: any) => renderInput(r, 'age_20_plus') },
            ]
        },
        {
            title: t('daily_reports.table.by_occupation'),
            children: [
                { title: t('daily_reports.table_v2.occ_organized_nursery'), width: 100, render: (_: any, _r: any) => <span style={{ color: 'gray' }}>-</span> },
                { title: t('daily_reports.table_v2.occ_unorganized_nursery'), width: 100, render: (_: any, r: any) => renderInput(r, 'occ_unorganized') },
                { title: t('daily_reports.table_v2.occ_organized_preschool'), width: 100, render: (_: any, r: any) => renderInput(r, 'occ_organized_1_6') },
                { title: t('daily_reports.table_v2.occ_unorganized_preschool'), width: 100, render: (_: any, r: any) => renderInput(r, 'occ_unorganized_1_6') },
                { title: t('daily_reports.table.students'), width: 80, render: (_: any, r: any) => renderInput(r, 'occ_students') },
                { title: t('daily_reports.table.college_students'), width: 80, render: (_: any, r: any) => renderInput(r, 'occ_college_students') },
                { title: t('daily_reports.table.adults'), width: 80, render: (_: any, r: any) => renderInput(r, 'occ_workers') },
            ]
        },
        {
            title: t('daily_reports.table.factors'),
            children: [
                { title: t('daily_reports.table.water'), width: 60, render: (_: any, r: any) => renderInput(r, 'factor_water') },
                { title: t('daily_reports.table_v2.factor_food_detailed'), width: 90, render: (_: any, r: any) => renderInput(r, 'factor_food') },
                { title: t('daily_reports.table_v2.factor_contact_detailed'), width: 80, render: (_: any, r: any) => renderInput(r, 'factor_contact') },
            ]
        },
        {
            title: t('daily_reports.table_v2.disinfection_detailed'),
            children: [
                { title: t('daily_reports.table_v2.lab_samples_detailed'), width: 90, render: (_: any, r: any) => renderInput(r, 'lab_samples') },
                { title: t('daily_reports.table_v2.lab_positive_detailed'), width: 80, render: (_: any, r: any) => renderInput(r, 'lab_positive') },
                { title: t('daily_reports.table_v2.disinfection_detailed'), width: 100, render: (_: any, r: any) => renderInput(r, 'disinfection_done') },
            ]
        },
        {
            title: t('daily_reports.table.status') || 'Holat',
            key: 'status',
            width: 120, fixed: 'right',
            render: (_: any, r: ReportData) => (
                <Space>
                    <Badge
                        status={r.status === 'APPROVED' ? 'success' : r.status === 'VERIFIED' ? 'processing' : 'default'}
                        text={r.status}
                    />
                    {r.verificationToken && (
                        <Tooltip title="QR orqali tekshirish">
                            <Button
                                size="small"
                                icon={<QrcodeOutlined />}
                                onClick={() => window.open(`/verify/${r.verificationToken}`, '_blank')}
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        },
        {
            title: t('common.actions') || 'Amallar',
            key: 'actions',
            width: 160, fixed: 'right',
            render: (_: any, r: ReportData) => {
                const canVerify = (userRole === 'DEPARTMENT_HEAD' || userRole === 'ADMIN') && r.is_submitted && r.status === 'DRAFT';
                const canApprove = (userRole === 'DISTRICT_HEAD' || userRole === 'ADMIN') && r.status === 'VERIFIED';

                return (
                    <Space>
                        {canVerify && (
                            <Button
                                size="small"
                                type="primary"
                                icon={<AuditOutlined />}
                                onClick={() => r.id && handleVerify(r.id)}
                            >
                                {t('daily_reports.actions.verify')}
                            </Button>
                        )}
                        {canApprove && (
                            <Button
                                size="small"
                                type="primary"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                icon={<CheckCircleOutlined />}
                                onClick={() => r.id && handleApprove(r.id)}
                            >
                                {t('daily_reports.actions.approve')}
                            </Button>
                        )}
                    </Space>
                );
            }
        }
    ];

    const handleSave = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            for (const row of data) {
                await dailyReportsApi.upsert({
                    ...row,
                    reportDate: formattedDate,
                    organizationId: row.organizationId,

                });
            }
            notification.success({
                message: t('daily_reports.actions.save'),
                description: t('daily_reports.actions.success_save')
            });
            fetchReports();
        } catch (error) {
            console.error("Failed to save", error);
            notification.error({
                message: t('auth.error_system'),
                description: t('daily_reports.actions.error_save')
            });
        } finally {
            setLoading(false);
        }
    };




    const handleVerify = async (id: string) => {
        try {
            await dailyReportsApi.verify('hepatitis', id);
            notification.success({ message: t('daily_reports.actions.verify_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.verify_error') });
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await dailyReportsApi.approve('hepatitis', id);
            notification.success({ message: t('daily_reports.actions.approve_success') });
            fetchReports();
        } catch (error) {
            notification.error({ message: t('daily_reports.actions.approve_error') });
        }
    };

    const provinceTotals = data.reduce((acc, curr) => {
        const fields = Object.keys(curr).filter(k => k !== 'key' && k !== 'district_name' && k !== 'organizationId' && k !== 'is_submitted') as (keyof ReportData)[];
        fields.forEach(f => { acc[f] = (acc[f] || 0) + (curr[f] as number); });
        return acc;
    }, { district_name: t('daily_reports.table.total_province') } as any);

    // --- PREMIUM UI STYLES ---
    const glassStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.05)',
        padding: '24px'
    };

    const headerStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
        padding: '32px',
        borderRadius: '24px',
        marginBottom: '24px',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
    };

    return (
        <PermissionGate permission="VIEW_HEPATITIS">
            <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
                <style>{`
                    .clinical-table .ant-table { background: transparent !important; }
                    .clinical-table .ant-table-thead > tr > th {
                        background: rgba(255, 255, 255, 0.5) !important;
                        font-weight: 700;
                        text-transform: uppercase;
                        font-size: 11px;
                        letter-spacing: 0.5px;
                        color: #1e3c72;
                    }
                    .clinical-table .ant-table-tbody > tr > td {
                        padding: 8px 4px !important;
                    }
                    .input-hover:hover {
                        background: rgba(24, 144, 255, 0.05) !important;
                        border-radius: 4px;
                    }
                `}</style>

                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '16px' }}>
                            <AuditOutlined style={{ fontSize: '28px', color: '#fff' }} />
                        </div>
                        <div>
                            <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 800 }}>
                                {t('daily_reports.hepatitis_title')}
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                                {t('daily_reports.date_status', { date: date.format('DD.MM.YYYY') })}
                            </Text>
                        </div>
                    </div>

                    <Space wrap>
                        <DatePicker
                            value={date}
                            onChange={(d) => d && setDate(d)}
                            format="DD.MM.YYYY"
                            allowClear={false}
                            inputReadOnly
                            style={{
                                borderRadius: '12px',
                                height: '40px',
                                width: 150,
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#fff'
                            }}
                            className="custom-datepicker"
                        />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchReports}
                            style={{
                                borderRadius: '12px',
                                height: '40px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#fff'
                            }}
                        >
                            {t('daily_reports.actions.refresh')}
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            style={{
                                borderRadius: '12px',
                                height: '40px',
                                padding: '0 24px',
                                fontWeight: 700,
                                background: '#1890ff',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(24, 144, 255, 0.3)'
                            }}
                        >
                            {t('daily_reports.actions.save')}
                        </Button>
                    </Space>
                </div>

                {!isAdmin && !connectedOrgId && (
                    <div style={{ marginBottom: 24 }}>
                        <Badge status="warning" text={t('daily_reports.errors.no_org_context') || "Tashkilot ma'lumotlari topilmadi."} />
                    </div>
                )}

                <div style={glassStyle}>
                    <Table
                        columns={columnsV2}
                        dataSource={data}
                        loading={loading}
                        bordered
                        size="small"
                        pagination={false}
                        scroll={{ x: 2000, y: 600 }}
                        className="clinical-table"
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row style={{ background: 'rgba(24, 144, 255, 0.05)', fontWeight: 'bold' }}>
                                    <Table.Summary.Cell index={0} align="center">-</Table.Summary.Cell>
                                    <Table.Summary.Cell index={1}>{t('daily_reports.table.total_province')}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={2}>{provinceTotals.total_cases}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={3}>{provinceTotals.age_under_1}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={4}>{provinceTotals.age_1_3}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={5}>{provinceTotals.age_4_6}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={6}>{provinceTotals.age_7_14}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={7}>{provinceTotals.age_15_19}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={8}>{provinceTotals.age_20_plus}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={9}>-</Table.Summary.Cell>
                                    <Table.Summary.Cell index={10}>{provinceTotals.occ_unorganized}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={11}>{provinceTotals.occ_organized_1_6}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={12}>{provinceTotals.occ_unorganized_1_6}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={13}>{provinceTotals.occ_students}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={14}>{provinceTotals.occ_college_students}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={15}>{provinceTotals.occ_workers}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={16}>{provinceTotals.factor_water}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={17}>{provinceTotals.factor_food}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={18}>{provinceTotals.factor_contact}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={19}>{provinceTotals.lab_samples}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={20}>{provinceTotals.lab_positive}</Table.Summary.Cell>
                                    <Table.Summary.Cell index={21}>{provinceTotals.disinfection_done}</Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                </div>
            </div>
        </PermissionGate >
    );
};

export default DailyHepatitisPage;
