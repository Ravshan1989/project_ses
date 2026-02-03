import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, DatePicker, Button, InputNumber, notification, Space } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { dailyReportsApi, organizationsApi } from '../../services/api';
import { useTranslation } from 'react-i18next';

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
<<<<<<< HEAD
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
                // Tumanlarni ajratib olish (logikani yumshatamiz)
                // currentOrgs = allOrgs.filter((org: any) => !!org.parent); <- ESKI (balki noto'g'ri)

                // YANGI: Shunchaki hammasini olib, Viloyat boshqarmasini olib tashlaymiz (agar ID si 1 bo'lsa yoki nomi "Viloyat" bo'lsa)
                // Lekin ishonchli bo'lishi uchun, keling hozircha hammasini ko'rsatamiz, user o'zi tushunadi.
                // Yoki: District ID lari odatda > 1 yoki parent_id not null.

                currentOrgs = allOrgs.filter((org: any) => org.id !== '1' && !org.name.toLowerCase().includes("boshqarma"));

=======
                // UZ: User talabiga ko'ra avvalgi holatga qaytarildi (revert)
                // currentOrgs = orgRes.data || [];
                // UZ: Qayta urinish: barcha tumanlar ko'rinishi uchun filterni olib tashlaymiz
                currentOrgs = orgRes.data || [];
                // currentOrgs = (orgRes.data || []).filter((org: any) => !!org.parent);
>>>>>>> 04d1ba4b5e8d11ee2778fbb0c1c6956d26c3a354
                setOrganizations(currentOrgs);
            }

            const res = await dailyReportsApi.getByDate(formattedDate);
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

    // @ts-ignore
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
            onCell: (record: ReportData) => ({
                style: {
                    backgroundColor: isSubmitted(record) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(record) ? '#389e0d' : '#cf1322',
                    fontWeight: '500'
                }
            })
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
            title: 'Ma\'muriy hududlar',
            dataIndex: 'district_name',
            width: 150, fixed: 'left',
            onCell: (record: ReportData) => ({
                style: {
                    backgroundColor: isSubmitted(record) ? '#f6ffed' : '#fff1f0',
                    color: isSubmitted(record) ? '#389e0d' : '#cf1322',
                    fontWeight: '500'
                }
            })
        },
        {
            title: 'Jami qayd qilingan VG A bemorlar',
            dataIndex: 'total_cases',
            width: 90,
            render: (_: any, r: any) => renderInput(r, 'total_cases', true)
        },
        {
            title: 'Bemorlarni yoshlari bo\'yicha',
            children: [
                { title: '1 yoshgacha', width: 70, render: (_: any, r: any) => renderInput(r, 'age_under_1') },
                { title: '1-3 yosh', width: 70, render: (_: any, r: any) => renderInput(r, 'age_1_3') },
                { title: '4-6 yosh', width: 70, render: (_: any, r: any) => renderInput(r, 'age_4_6') },
                { title: '7-14 yosh', width: 70, render: (_: any, r: any) => renderInput(r, 'age_7_14') },
                { title: '15-19 yosh', width: 70, render: (_: any, r: any) => renderInput(r, 'age_15_19') },
                { title: '20 yoshdan kattalar', width: 80, render: (_: any, r: any) => renderInput(r, 'age_20_plus') },
            ]
        },
        {
            title: 'Bemorlarni kasblari bo\'yicha',
            children: [
                // 'Uyushgan yasli' uchun maydon (hozircha 'occ_organized_1_6' ishlatilmoqda yoki yangi maydon kerak)
                // Mavjud 'occ_organized_1_6' ni 'Uyushgan bog'cha' deb oldik. 'Uyushgan yasli' uchun vaqtincha placeholder.
                // Hozirgi ma'lumotlar bazasi strukturasiga moslash uchun mavjud maydonlarni map qilamiz.

                // Izoh: Skrinshotda "Uyushgan yasli" va "Uyushmagan yasli" bor.
                // Bizda 'occ_unorganized' (uyushmagan) va 'occ_organized_1_6' (bog'cha) bor.
                // Yangi ustunlar qo'shish kerak bo'ladi, lekin hozircha mavjudlarini ishlatamiz.

                { title: 'Uyushgan yasli yoshidagi bolalar', width: 100, render: (_: any, _r: any) => <span style={{ color: 'gray' }}>-</span> }, // Backendda yo'q
                { title: 'Uyushmagan yasli yoshidagi bolalar', width: 100, render: (_: any, r: any) => renderInput(r, 'occ_unorganized') },
                { title: 'Uyushgan bog\'cha yoshidagi bolalar', width: 100, render: (_: any, r: any) => renderInput(r, 'occ_organized_1_6') },
                { title: 'Uyushmagan bog\'cha yoshidagi bolalar', width: 100, render: (_: any, r: any) => renderInput(r, 'occ_unorganized_1_6') },
                { title: 'O\'quvchilar', width: 80, render: (_: any, r: any) => renderInput(r, 'occ_students') },
                { title: 'Talabalar', width: 80, render: (_: any, r: any) => renderInput(r, 'occ_college_students') },
                { title: 'Kattalar', width: 80, render: (_: any, r: any) => renderInput(r, 'occ_workers') },
            ]
        },
        {
            title: 'Yuqish ehtimoli bo\'lgan omil',
            children: [
                { title: 'Suv', width: 60, render: (_: any, r: any) => renderInput(r, 'factor_water') },
                { title: 'Ovqat-oziq mahsulotlari', width: 90, render: (_: any, r: any) => renderInput(r, 'factor_food') },
                { title: 'Maishiy muloqot', width: 80, render: (_: any, r: any) => renderInput(r, 'factor_contact') },
            ]
        },
        {
            title: 'O\'choqlarda i.suvini VGA ant.',
            children: [
                { title: 'Jami olingan namunalar', width: 90, render: (_: any, r: any) => renderInput(r, 'lab_samples') },
                { title: 'Musbat natija', width: 80, render: (_: any, r: any) => renderInput(r, 'lab_positive') },
                { title: 'Dezinfeksiya o\'tkazilgan o\'choqlar', width: 100, render: (_: any, r: any) => renderInput(r, 'disinfection_done') },
            ]
        },
    ];

    const handleSave = async () => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            for (const row of data) {
                await dailyReportsApi.upsert({
                    ...row,
                    reportDate: formattedDate,
                    organizationId: row.organizationId
                });
            }
            notification.success({
                message: t('user.save'),
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

    // @ts-ignore
    const provinceTotals = data.reduce((acc, curr) => {
        const fields = Object.keys(curr).filter(k => k !== 'key' && k !== 'district_name' && k !== 'organizationId' && k !== 'is_submitted') as (keyof ReportData)[];
        fields.forEach(f => { acc[f] = (acc[f] || 0) + (curr[f] as number); });
        return acc;
    }, { district_name: t('daily_reports.table.total_province') } as any);

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={4}>{t('daily_reports.hepatitis_title')}</Title>
                        <Text type="secondary">{t('daily_reports.date_status', { date: date.format('DD.MM.YYYY') })}</Text>
                    </div>
                    <Space>
                        <DatePicker
                            value={date}
                            onChange={(d) => d && setDate(d)}
                            format="DD.MM.YYYY"
                        />
                        <Button icon={<ReloadOutlined />} onClick={fetchReports}>{t('daily_reports.actions.refresh')}</Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>{t('daily_reports.actions.save')}</Button>
                    </Space>
                </div>

                {/* ESKI TABLE KODI SAQLAB QOLINDI (COMMENTGA OLINMADI, LEKIN KO'RINMASLIGI MUMKIN YOKI YANGISI ISHLATILADI) */}
                {/* 
                <Table
                    columns={columns}
                    dataSource={data}
                    ...
                />
                */}

                {/* YANGI TABLE KODI (03.02.2026) - columnsV2 ishlatilmoqda */}
                <Table
                    columns={columnsV2}
                    dataSource={data}
                    loading={loading}
                    bordered
                    size="small"
                    pagination={false}
<<<<<<< HEAD
                    scroll={{ x: 2000, y: 600 }}
                /* SUMMARY VAQTINCHA O'CHIRILDI (DEBUG)
                summary={() => (
                    <Table.Summary fixed>
                        <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
                            <Table.Summary.Cell index={0} align="center">-</Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>Viloyat bo'yicha jami</Table.Summary.Cell>
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
                */
=======
                    scroll={{ x: 1800, y: 600 }}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
                                <Table.Summary.Cell index={0} align="center">-</Table.Summary.Cell>
                                <Table.Summary.Cell index={1}>{t('daily_reports.table.total_province')}</Table.Summary.Cell>
                                <Table.Summary.Cell index={2}>{provinceTotals.total_cases}</Table.Summary.Cell>
                                <Table.Summary.Cell index={3}>{provinceTotals.age_under_1}</Table.Summary.Cell>
                                <Table.Summary.Cell index={4}>{provinceTotals.age_1_3}</Table.Summary.Cell>
                                <Table.Summary.Cell index={5}>{provinceTotals.age_4_6}</Table.Summary.Cell>
                                <Table.Summary.Cell index={6}>{provinceTotals.age_7_14}</Table.Summary.Cell>
                                <Table.Summary.Cell index={7}>{provinceTotals.age_15_19}</Table.Summary.Cell>
                                <Table.Summary.Cell index={8}>{provinceTotals.age_20_plus}</Table.Summary.Cell>
                                <Table.Summary.Cell index={9}>{provinceTotals.occ_unorganized}</Table.Summary.Cell>
                                <Table.Summary.Cell index={10}>{provinceTotals.occ_unorganized_1_6}</Table.Summary.Cell>
                                <Table.Summary.Cell index={11}>{provinceTotals.occ_organized_1_6}</Table.Summary.Cell>
                                <Table.Summary.Cell index={12}>{provinceTotals.occ_unorganized_school_age}</Table.Summary.Cell>
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
>>>>>>> 04d1ba4b5e8d11ee2778fbb0c1c6956d26c3a354
                />
            </Space>
        </Card>
    );
};

export default DailyHepatitisPage;
