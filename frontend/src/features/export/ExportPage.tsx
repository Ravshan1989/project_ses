import React, { useState, useEffect } from 'react';
import { Card, Typography, DatePicker, Select, Button, message, Row, Col, Switch, Alert } from 'antd';
import { DownloadOutlined, ExperimentOutlined } from '@ant-design/icons';
import XLSX from 'xlsx-js-style';

import { exportsApi, diseasesApi, API_BASE_URL } from '../../services/api';
// Fallback if not re-exported from services/api
// import { API_BASE_URL } from '../../config';

const { Title, Text } = Typography;

// Professional styling constants
const HEADER_STYLE = {
    font: { bold: true, size: 9, name: 'Times New Roman' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
    },
    fill: { fgColor: { rgb: "E9E9E9" } }
};

const PREV_HEADER_STYLE = {
    ...HEADER_STYLE,
    fill: { fgColor: { rgb: "B7EB8F" } }
};

const CURR_HEADER_STYLE = {
    ...HEADER_STYLE,
    fill: { fgColor: { rgb: "FFFB8F" } }
};

const DATA_STYLE = {
    font: { size: 9, name: 'Times New Roman' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
    }
};

const PREV_DATA_STYLE = {
    ...DATA_STYLE,
    fill: { fgColor: { rgb: "B7EB8F" } }
};

const CURR_DATA_STYLE = {
    ...DATA_STYLE,
    fill: { fgColor: { rgb: "FFFB8F" } }
};

const NAME_STYLE = {
    ...DATA_STYLE,
    alignment: { horizontal: 'left', vertical: 'center' }
};

const TITLE_STYLE = {
    font: { bold: true, size: 12, name: 'Times New Roman' },
    alignment: { horizontal: 'center', vertical: 'center' }
};

// Report Types
const REPORT_TYPES = [
    { label: 'Virusli Gepatit A (VGA)', value: 'hepatitis' },
    { label: 'Gripp va O\'RVI', value: 'flu' },
    { label: 'Shakl 1 (Oylik)', value: 'form1' },
];

const ExportPage: React.FC = () => {
    const [dates, setDates] = useState<any>(null);
    const [reportType, setReportType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [diseases, setDiseases] = useState<any[]>([]);
    const [isTestMode, setIsTestMode] = useState(false); // UZ: Test rejimi holati

    useEffect(() => {
        fetchDiseases();
    }, []);

    const fetchDiseases = async () => {
        try {
            const res = await diseasesApi.getAll();
            setDiseases(res.data);
        } catch (e) {
            console.error("Failed to fetch diseases", e);
        }
    };

    // UZ: "Smart" (aqlli) o'sish/kamayish formulasi (Excel uchun ham bir xil)
    const calculateSmartGrowth = (curr: number, prev: number) => {
        if (curr === prev) return "teng";
        if (!prev || prev === 0) return `+${curr}`;
        if (!curr || curr === 0) return `-${prev}`;

        const diffPercent = Math.abs((curr / prev - 1) * 100);

        if (diffPercent < 50) {
            const val = ((curr / prev - 1) * 100).toFixed(1);
            return `${val}%`;
        } else {
            if (curr > prev) {
                return `${(curr / prev).toFixed(1)} marta o'sdi`;
            } else {
                return `-${(prev / curr).toFixed(1)} marta kamaydi`;
            }
        }
    };

    const applyStyles = (ws: any, rowCount: number, colCount: number, headerRows: number) => {
        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < colCount; c++) {
                const addr = XLSX.utils.encode_cell({ r, c });
                if (!ws[addr]) ws[addr] = { v: '' };

                if (r === 0) {
                    ws[addr].s = TITLE_STYLE;
                } else if (r === 1) {
                    // Spacer row
                } else if (r < headerRows) {
                    // Header rows coloring logic
                    if ([2, 3, 8, 9, 14, 15, 20, 21].includes(c)) ws[addr].s = PREV_HEADER_STYLE;
                    else if ([4, 5, 10, 11, 16, 17, 22, 23].includes(c)) ws[addr].s = CURR_HEADER_STYLE;
                    else ws[addr].s = HEADER_STYLE;
                } else {
                    // Data rows coloring logic
                    if (c === 0) ws[addr].s = NAME_STYLE;
                    else if ([2, 3, 8, 9, 14, 15, 20, 21].includes(c)) ws[addr].s = PREV_DATA_STYLE;
                    else if ([4, 5, 10, 11, 16, 17, 22, 23].includes(c)) ws[addr].s = CURR_DATA_STYLE;
                    else ws[addr].s = DATA_STYLE;
                }
            }
        }
    };

    const handleExport = async () => {
        if (!dates || !reportType) {
            message.warning("Iltimos, vaqt oralig'i va hisobot turini tanlang.");
            return;
        }

        const startDate = dates[0].format('YYYY-MM-DD');
        const endDate = dates[1].format('YYYY-MM-DD');

        setLoading(true);
        try {
            let data: any[] = [];
            let fileName = 'report';

            if (reportType === 'hepatitis') {
                const url = `${API_BASE_URL}/exports/hepatitis/excel?startDate=${startDate}&endDate=${endDate}&isTest=${isTestMode}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', `VGA_Report_${startDate}_${endDate}${isTestMode ? '_TEST' : ''}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
            } else if (reportType === 'flu') {
                const url = `${API_BASE_URL}/exports/flu/excel?startDate=${startDate}&endDate=${endDate}&isTest=${isTestMode}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', `Flu_Report_${startDate}_${endDate}${isTestMode ? '_TEST' : ''}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
            } else if (reportType === 'ari') {
                const url = `${API_BASE_URL}/exports/ari/excel?startDate=${startDate}&endDate=${endDate}&isTest=${isTestMode}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', `ARI_Report_${startDate}_${endDate}${isTestMode ? '_TEST' : ''}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
            } else if (reportType === 'form1') {
                const res = await exportsApi.getForm1(startDate, endDate, isTestMode);
                data = res.data;
                fileName = `Form1_Report_${startDate}_${endDate}${isTestMode ? '_TEST' : ''}`;
                if (!data || data.length === 0) {
                    message.info("Tanlangan oraliqda ma'lumot topilmadi.");
                    setLoading(false);
                    return;
                }
                exportToExcel(data, fileName, reportType);
            }

            message.success("Muvaffaqiyatli yuklab olindi!");
        } catch (error) {
            console.error("Export failed", error);
            message.error("Xatolik yuz berdi.");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = (data: any[], fileName: string, type: string) => {
        const workbook = XLSX.utils.book_new();

        if (type === 'form1') {
            const diseaseMap: any = {};
            diseases.forEach(d => { diseaseMap[d.code] = d.name; });

            const year = dates?.[0]?.year() || new Date().getFullYear();
            const month = (dates?.[0]?.month() || 0) + 1;
            const currentYear = year;
            const prevYear = currentYear - 1;

            const titleRow = [`Toshkent viloyati bo'yicha yuqumli va parazitar kasalliklar JAMLANMA hisoboti, ${year} yil ${month}-oy`, ...Array(25).fill('')];
            const spacerRow = Array(26).fill('');

            const head1 = ['Ko\'rsatkichlar nomi', 'Kod stroki', 'joriy oy', ...Array(11).fill(''), 'yil boshidan jami', ...Array(11).fill('')];
            const head2 = ['', '', 'Jami', ...Array(5).fill(''), '14 yoshgacha bo\'lganlar', ...Array(5).fill(''), 'Jami', ...Array(5).fill(''), '14 yoshgacha bo\'lganlar', ...Array(5).fill('')];
            const head3 = ['', '', `${prevYear} yil`, '', `${currentYear} yil`, '', 'ko\'tar/pasayish', '', `${prevYear} yil`, '', `${currentYear} yil`, '', 'ko\'tar/pasayish', '', `${prevYear} yil`, '', `${currentYear} yil`, '', 'ko\'tar/pasayish', '', `${prevYear} yil`, '', `${currentYear} yil`, '', 'ko\'tar/pasayish', ''];
            const head4 = ['', '', ...Array(12).fill(['abs.ko\'r', 'int.ko\'r']).flat()];

            // 1. DATA AGGREGATION
            const aggregated: any = {};
            if (data.length > 0) {
                data.forEach(sub => {
                    const records = Array.isArray(sub.data) ? sub.data : [sub.data];
                    records.forEach((d: any) => {
                        if (!d || !d.code) return;
                        if (!aggregated[d.code]) {
                            aggregated[d.code] = {
                                name: diseaseMap[d.code] || d.name || `Kasallik ${d.code}`,
                                code: d.code
                            };
                        }
                        Object.keys(d).forEach(k => {
                            if (typeof d[k] === 'number') {
                                aggregated[d.code][k] = (aggregated[d.code][k] || 0) + d[k];
                            }
                        });
                    });
                });
            }

            // Sheet 1: Jamlanma (List 1)
            const mainSheetData: any[] = [];
            mainSheetData.push(titleRow, spacerRow, head1, head2, head3, head4);

            const sorted = Object.values(aggregated).sort((a: any, b: any) => (a.code || '').localeCompare(b.code || ''));
            sorted.forEach((d: any) => {
                mainSheetData.push([
                    d.name, d.code,
                    d.m_t_p_a || 0, d.m_t_p_i || 0, d.m_t_c_a || 0, d.m_t_c_i || 0, d.m_t_g_a || 0, calculateSmartGrowth(d.m_t_c_a || 0, d.m_t_p_a || 0),
                    d.m_u_p_a || 0, d.m_u_p_i || 0, d.m_u_c_a || 0, d.m_u_c_i || 0, d.m_u_g_a || 0, calculateSmartGrowth(d.m_u_c_a || 0, d.m_u_p_a || 0),
                    d.y_t_p_a || 0, d.y_t_p_i || 0, d.y_t_c_a || 0, d.y_t_c_i || 0, d.y_t_g_a || 0, calculateSmartGrowth(d.y_t_c_a || 0, d.y_t_p_a || 0),
                    d.y_u_p_a || 0, d.y_u_p_i || 0, d.y_u_c_a || 0, d.y_u_c_i || 0, d.y_u_g_a || 0, calculateSmartGrowth(d.y_u_c_a || 0, d.y_u_p_a || 0)
                ]);
            });

            const ws1 = XLSX.utils.aoa_to_sheet(mainSheetData);
            ws1['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 25 } },
                { s: { r: 2, c: 0 }, e: { r: 5, c: 0 } },
                { s: { r: 2, c: 1 }, e: { r: 5, c: 1 } },
                { s: { r: 2, c: 2 }, e: { r: 2, c: 13 } },
                { s: { r: 2, c: 14 }, e: { r: 2, c: 25 } },
                { s: { r: 3, c: 2 }, e: { r: 3, c: 7 } },
                { s: { r: 3, c: 8 }, e: { r: 3, c: 13 } },
                { s: { r: 3, c: 14 }, e: { r: 3, c: 19 } },
                { s: { r: 3, c: 20 }, e: { r: 3, c: 25 } },
                ...[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map(c => ({ s: { r: 4, c }, e: { r: 4, c: c + 1 } }))
            ];
            applyStyles(ws1, mainSheetData.length, 26, 6);
            ws1['!cols'] = [{ wch: 50 }, { wch: 10 }, ...Array(24).fill({ wch: 10 })];
            XLSX.utils.book_append_sheet(workbook, ws1, "Jamlanma (List 1)");

            // Permissions Check
            const userRole = localStorage.getItem('user_role');
            const userLevel = localStorage.getItem('user_level');
            const permissionsStr = localStorage.getItem('user_permissions');
            const permissions = permissionsStr ? JSON.parse(permissionsStr) : [];
            const isAdmin = ['ADMIN', 'REGION_HEAD', 'REPUBLIC_HEAD'].includes(userRole || '');

            // UZ: Tuman darajasida (Level 3) 2 va 3-jadvallarni qat'iy bloklash (talabga asosan)
            const isLevel3 = userLevel === '3';

            // Dinamik ruxsatlarni tekshirish (Yangi tizim)
            const rolePermsStr = localStorage.getItem('user_role_permissions');
            const rolePerms = rolePermsStr ? JSON.parse(rolePermsStr) : [];
            const checkRole = (code: string) => {
                const rp = rolePerms.find((p: any) => p.permissionCode === code);
                return rp ? (rp.canView || rp.canEdit) : true; // default true if no dynamic role
            };

            const canViewTable2 = !isLevel3 && (isAdmin || (permissions.includes('VIEW_FORM1_TABLE2') && checkRole('VIEW_FORM1_TABLE2')));
            const canViewTable3 = !isLevel3 && (isAdmin || (permissions.includes('VIEW_FORM1_TABLE3') && checkRole('VIEW_FORM1_TABLE3')));

            // Sheet 2: Tumanlar kesimida (List 2 - Detailed Templates)
            if (canViewTable2) {
                const territorySheetData: any[] = [];
                const territoryMerges: any[] = [];
                let currentRow = 0;

                // Updated loop to use ALL diseases, ensuring List 2 is never empty
                const sortedAllDiseases = [...diseases].sort((a: any, b: any) => (a.code || '').localeCompare(b.code || ''));

                sortedAllDiseases.forEach((diseaseObj: any) => {
                    const code = diseaseObj.code;
                    const dName = diseaseObj.name || `Kasallik ${code}`;

                    // Disease Block Header
                    const dTitle = [{ v: dName, s: TITLE_STYLE }, ...Array(25).fill('')];
                    const dHead1 = ['Administrativnye territorii', `Stroka ${code}`, 'tekushiy oy (joriy oy)', ...Array(11).fill(''), 'narastayushiy itog (yil boshidan)', ...Array(11).fill('')];
                    const dHead2 = ['', '', 'Jami', ...Array(5).fill(''), 'deti do 14 let (bolalar)', ...Array(5).fill(''), 'Jami', ...Array(5).fill(''), 'deti do 14 let (bolalar)', ...Array(5).fill('')];
                    const dHead3 = ['', '', '2025 yil', '', '2026 yil', '', 'ko\'tar/pasayish', '', '2025 yil', '', '2026 yil', '', 'ko\'tar/pasayish', '', '2025 yil', '', '2026 yil', '', 'ko\'tar/pasayish', '', '2025 yil', '', '2026 yil', '', 'ko\'tar/pasayish', ''];
                    const dHead4 = ['', '', ...Array(12).fill(['abs.ko\'r', 'int.ko\'r']).flat()];

                    territorySheetData.push(dTitle, dHead1, dHead2, dHead3, dHead4);

                    territoryMerges.push(
                        { s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 25 } },
                        { s: { r: currentRow + 1, c: 0 }, e: { r: currentRow + 4, c: 0 } },
                        { s: { r: currentRow + 1, c: 1 }, e: { r: currentRow + 4, c: 1 } },
                        { s: { r: currentRow + 1, c: 2 }, e: { r: currentRow + 1, c: 13 } },
                        { s: { r: currentRow + 1, c: 14 }, e: { r: currentRow + 1, c: 25 } },
                        { s: { r: currentRow + 2, c: 2 }, e: { r: currentRow + 2, c: 7 } },
                        { s: { r: currentRow + 2, c: 8 }, e: { r: currentRow + 2, c: 13 } },
                        { s: { r: currentRow + 2, c: 14 }, e: { r: currentRow + 2, c: 19 } },
                        { s: { r: currentRow + 2, c: 20 }, e: { r: currentRow + 2, c: 25 } },
                        ...[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map(c => ({ s: { r: currentRow + 3, c }, e: { r: currentRow + 3, c: c + 1 } }))
                    );

                    // Add header row count offset
                    currentRow += 5;

                    // Push blank or real data for each district
                    data.forEach(sub => {
                        const d = (Array.isArray(sub.data) ? sub.data : [sub.data]).find((x: any) => x && x.code === code) || {};
                        territorySheetData.push([
                            sub.organization?.name, code,
                            d.m_t_p_a || 0, d.m_t_p_i || 0, d.m_t_c_a || 0, d.m_t_c_i || 0, d.m_t_g_a || 0, calculateSmartGrowth(d.m_t_c_a || 0, d.m_t_p_a || 0),
                            d.m_u_p_a || 0, d.m_u_p_i || 0, d.m_u_c_a || 0, d.m_u_c_i || 0, d.m_u_g_a || 0, calculateSmartGrowth(d.m_u_c_a || 0, d.m_u_p_a || 0),
                            d.y_t_p_a || 0, d.y_t_p_i || 0, d.y_t_c_a || 0, d.y_t_c_i || 0, d.y_t_g_a || 0, calculateSmartGrowth(d.y_t_c_a || 0, d.y_t_p_a || 0),
                            d.y_u_p_a || 0, d.y_u_p_i || 0, d.y_u_c_a || 0, d.y_u_c_i || 0, d.y_u_g_a || 0, calculateSmartGrowth(d.y_u_c_a || 0, d.y_u_p_a || 0)
                        ]);
                        currentRow++;
                    });

                    // Spacer row
                    territorySheetData.push(Array(26).fill(''));
                    currentRow++;
                });

                const ws2 = XLSX.utils.aoa_to_sheet(territorySheetData);

                // Re-apply styles row by row for List 2
                let rPos = 0;
                sortedAllDiseases.forEach(() => {
                    const tAddr = XLSX.utils.encode_cell({ r: rPos, c: 0 });
                    if (ws2[tAddr]) ws2[tAddr].s = TITLE_STYLE;
                    for (let r = rPos + 1; r < rPos + 5; r++) {
                        for (let c = 0; c < 26; c++) {
                            const addr = XLSX.utils.encode_cell({ r, c });
                            if (!ws2[addr]) ws2[addr] = { v: '' };

                            // Header coloring
                            if ([2, 3, 8, 9, 14, 15, 20, 21].includes(c)) ws2[addr].s = PREV_HEADER_STYLE;
                            else if ([4, 5, 10, 11, 16, 17, 22, 23].includes(c)) ws2[addr].s = CURR_HEADER_STYLE;
                            else ws2[addr].s = HEADER_STYLE;
                        }
                    }
                    for (let r = rPos + 5; r < rPos + 5 + data.length; r++) {
                        for (let c = 0; c < 26; c++) {
                            const addr = XLSX.utils.encode_cell({ r, c });
                            if (!ws2[addr]) ws2[addr] = { v: '' };

                            // Data coloring
                            if (c === 0) ws2[addr].s = NAME_STYLE;
                            else if ([2, 3, 8, 9, 14, 15, 20, 21].includes(c)) ws2[addr].s = PREV_DATA_STYLE;
                            else if ([4, 5, 10, 11, 16, 17, 22, 23].includes(c)) ws2[addr].s = CURR_DATA_STYLE;
                            else ws2[addr].s = DATA_STYLE;
                        }
                    }
                    rPos += (5 + data.length + 1);
                });

                ws2['!merges'] = territoryMerges;
                ws2['!cols'] = [{ wch: 40 }, { wch: 10 }, ...Array(24).fill({ wch: 10 })];
                XLSX.utils.book_append_sheet(workbook, ws2, "Tumanlar kesimida (List 2)");
            }

            // Sheet 3: Matrix (List 3)
            if (canViewTable3) {
                // Use ALL diseases for headers
                const matrixData: any[] = [];
                // Updated loop to use ALL diseases, ensuring List 2 is never empty - DUPLICATE NEEDED IF TABLE 2 SKIPPED
                const sortedAllDiseases = [...diseases].sort((a: any, b: any) => (a.code || '').localeCompare(b.code || ''));

                // Header 1: Disease Names
                const mHead1 = ['Hududlar', ...sortedAllDiseases.flatMap((d: any) => [d.name || `Kasallik ${d.code}`, ''])];
                // Header 2: Disease Codes
                const mHead2 = ['', ...sortedAllDiseases.flatMap((d: any) => [`Kod ${d.code}`, ''])];
                // Header 3: Metrics
                const mHead3 = ['', ...sortedAllDiseases.flatMap(() => ['abs.ko\'r', 'int.ko\'r'])];

                matrixData.push(mHead1, mHead2, mHead3);

                data.forEach(sub => {
                    const row = [sub.organization?.name];
                    const records = Array.isArray(sub.data) ? sub.data : [sub.data];

                    // For this row (territory), go through ALL diseases in order
                    sortedAllDiseases.forEach((dObj: any) => {
                        // Find record for this disease in this territory
                        const rowData = records.find((x: any) => x && x.code === dObj.code) || {};
                        // Push metric values (using monthly total stats as default based on previous impl)
                        row.push(rowData.m_t_c_a || 0, rowData.m_t_c_i || 0);
                    });
                    matrixData.push(row);
                });

                const ws3 = XLSX.utils.aoa_to_sheet(matrixData);

                // Style application
                // Header is 3 rows
                const mColCount = 1 + (sortedAllDiseases.length * 2);
                const mRowCount = matrixData.length;

                applyStyles(ws3, mRowCount, mColCount, 3);

                // Merges
                // Title row merges? Not using a top title row inside the grid based on code above, starting with Headers.
                // But we need to merge Disease Names and Codes horizontally (2 cells wide)
                const mMerges: any[] = [
                    { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } } // 'Hududlar' merges vertical 3 rows
                ];

                sortedAllDiseases.forEach((_, i) => {
                    const startCol = 1 + (i * 2);
                    // Merge Disease Name (Row 0)
                    mMerges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: startCol + 1 } });
                    // Merge Disease Code (Row 1)
                    mMerges.push({ s: { r: 1, c: startCol }, e: { r: 1, c: startCol + 1 } });
                });

                ws3['!merges'] = mMerges;

                // Auto-width for first column, smaller for numbers
                ws3['!cols'] = [{ wch: 30 }, ...Array(sortedAllDiseases.length * 2).fill({ wch: 8 })];

                XLSX.utils.book_append_sheet(workbook, ws3, "Matrix (List 3)");
            }

        } else {
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Hisobot");
        }

        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Title level={2}>Hisobotlarni Eksport Qilish</Title>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">Vaqt oralig'i va hisobot turini tanlang, so'ngra Excel faylni yuklab oling.</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #d9d9d9', padding: '4px 12px', borderRadius: '6px' }}>
                        <ExperimentOutlined style={{ color: isTestMode ? '#f5222d' : '#8c8c8c' }} />
                        <Text strong={isTestMode} type={isTestMode ? "danger" : "secondary"}>Test Ma'lumotlari</Text>
                        <Switch size="small" checked={isTestMode} onChange={setIsTestMode} />
                    </div>
                </div>

                {isTestMode && (
                    <Alert
                        message="DIQQAT: TEST MA'LUMOTLARI EKSPORTI"
                        description="Hozirgi sozlamalar faqat 'Test' rejimidagi ma'lumotlarni eksport qilish uchun. Real hisobotlar yuklanmaydi."
                        type="error"
                        showIcon
                        icon={<ExperimentOutlined />}
                        style={{ marginTop: 16 }}
                    />
                )}
                <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                    <Col xs={24} md={8}>
                        <div style={{ marginBottom: '8px' }}><Text strong>Vaqt oralig'i:</Text></div>
                        <DatePicker.RangePicker style={{ width: '100%' }} onChange={(vals) => setDates(vals)} />
                    </Col>
                    <Col xs={24} md={8}>
                        <div style={{ marginBottom: '8px' }}><Text strong>Hisobot turi:</Text></div>
                        <Select style={{ width: '100%' }} placeholder="Turini tanlang" onChange={(val) => setReportType(val)} options={REPORT_TYPES} />
                    </Col>
                    <Col xs={24} md={8} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button type="primary" icon={<DownloadOutlined />} size="large" loading={loading} onClick={handleExport} block>
                            Yuklab olish
                        </Button>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default ExportPage;
