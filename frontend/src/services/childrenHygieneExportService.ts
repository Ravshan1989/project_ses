import XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// UZ: Yordamchi uslublar
const headerStyle = {
    font: { bold: true, sz: 10 },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    fill: { fgColor: { rgb: 'F1F5F9' } },
    border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
    }
};

const cellStyle = {
    font: { sz: 9 },
    alignment: { vertical: 'center', horizontal: 'center' },
    border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
    }
};

// ─── Table 1 Helper (Excel) ──────────────────────────────────────────────────
const getTable1Sheet = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const worksheetData: any[][] = [];
    worksheetData.push([t('reports.children_hygiene') + ' - 1-jadval']);
    worksheetData.push([`Tashkilot: ${orgName}`]);
    worksheetData.push([`Davr: ${month}`]);
    worksheetData.push([]);

    const headers = [
        t('children_hygiene.table1.columns.order'),
        t('children_hygiene.table1.columns.institutions'),
        t('children_hygiene.table1.columns.institutions_count'),
        t('children_hygiene.table1.columns.supervision_plan'),
        t('children_hygiene.table1.columns.total_supervisions'),
        t('children_hygiene.table1.columns.planned_supervisions'),
        t('children_hygiene.table1.columns.unplanned_supervisions'),
        t('children_hygiene.table1.columns.plan_execution_percent'),
        t('children_hygiene.table1.columns.lab_supervisions'),
        t('children_hygiene.table1.columns.lab_supervisions_percent'),
    ];
    worksheetData.push(headers);

    rows.forEach(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        const total = item.totalSupervisionsConducted || 0;
        const plan = item.supervisionPlan || 0;
        const planExec = plan ? ((total / plan) * 100).toFixed(1) : '0';
        const lab = item.labSupervisionsCount || 0;
        const labPct = total ? ((lab / total) * 100).toFixed(1) : '0';

        worksheetData.push([
            rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'),
            t(rowInfo.labelKey),
            item.institutionsCount ?? 0,
            item.supervisionPlan ?? 0,
            item.totalSupervisionsConducted ?? 0,
            item.plannedSupervisionsConducted ?? 0,
            item.unplannedSupervisionsConducted ?? 0,
            planExec + '%',
            item.labSupervisionsCount ?? 0,
            labPct + '%',
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    ws['A1'].s = { font: { bold: true, sz: 14 } };
    const headerRowIdx = 4;
    headers.forEach((_, c) => {
        const cell = XLSX.utils.encode_cell({ r: headerRowIdx, c });
        if (ws[cell]) ws[cell].s = headerStyle;
    });

    for (let r = 5; r < worksheetData.length; r++) {
        for (let c = 0; c < headers.length; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (ws[cell]) {
                const isTotal = rows[r - 5].key === 'total';
                ws[cell].s = {
                    ...cellStyle,
                    font: { ...cellStyle.font, bold: isTotal },
                    alignment: { ...cellStyle.alignment, horizontal: c === 1 ? 'left' : 'center' },
                    fill: isTotal ? { fgColor: { rgb: 'ECFDF5' } } : undefined
                };
            }
        }
    }
    ws['!cols'] = [{ wch: 5 }, { wch: 40 }, ...Array(8).fill({ wch: 12 })];
    return ws;
};

export const exportTable1Excel = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const workbook = XLSX.utils.book_new();
    const ws = getTable1Sheet(data, rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws, '1-jadval');
    XLSX.writeFile(workbook, `Bolalar_va_Osmirlar_Gigiyenasi_1_jadval_${month}.xlsx`);
};

// ─── Table 1 Helper (PDF) ────────────────────────────────────────────────────
const addTable1ToPDF = (doc: jsPDF, data: any[], rows: any[], month: string, orgName: string, t: any) => {
    doc.setFontSize(14);
    doc.text(t('reports.children_hygiene') + ' - 1-jadval', 14, 15);
    doc.setFontSize(10);
    doc.text(`Tashkilot: ${orgName} | Davr: ${month}`, 14, 22);

    const head = [[
        t('children_hygiene.table1.columns.order'),
        t('children_hygiene.table1.columns.institutions'),
        t('children_hygiene.table1.columns.institutions_count'),
        t('children_hygiene.table1.columns.supervision_plan'),
        t('children_hygiene.table1.columns.total_supervisions'),
        t('children_hygiene.table1.columns.planned_supervisions'),
        t('children_hygiene.table1.columns.unplanned_supervisions'),
        t('children_hygiene.table1.columns.plan_execution_percent'),
        t('children_hygiene.table1.columns.lab_supervisions'),
        t('children_hygiene.table1.columns.lab_supervisions_percent'),
    ]];

    const body = rows.map(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        const total = item.totalSupervisionsConducted || 0;
        const plan = item.supervisionPlan || 0;
        const planExec = plan ? ((total / plan) * 100).toFixed(1) : '0';
        const lab = item.labSupervisionsCount || 0;
        const labPct = total ? ((lab / total) * 100).toFixed(1) : '0';

        return [
            rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'),
            t(rowInfo.labelKey),
            item.institutionsCount ?? 0,
            item.supervisionPlan ?? 0,
            item.totalSupervisionsConducted ?? 0,
            item.plannedSupervisionsConducted ?? 0,
            item.unplannedSupervisionsConducted ?? 0,
            planExec + '%',
            item.labSupervisionsCount ?? 0,
            labPct + '%',
        ];
    });

    autoTable(doc, {
        head,
        body,
        startY: 30,
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 60 },
            7: { halign: 'center', fontStyle: 'bold' },
            9: { halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body') {
                const rowKey = rows[data.row.index].key;
                if (rowKey === 'total') {
                    data.cell.styles.fillColor = [236, 253, 245];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        theme: 'grid'
    });
};

export const exportTable1PDF = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    addTable1ToPDF(doc, data, rows, month, orgName, t);
    doc.save(`Bolalar_va_Osmirlar_Gigiyenasi_1_jadval_${month}.pdf`);
};

// ─── Table 2 Helper (Excel) ──────────────────────────────────────────────────
const getTable2Sheet = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const worksheetData: any[][] = [];
    worksheetData.push([t('reports.children_hygiene') + ' - 2-jadval']);
    worksheetData.push([`Tashkilot: ${orgName}`]);
    worksheetData.push([`Davr: ${month}`]);
    worksheetData.push([]);

    worksheetData.push([
        t('children_hygiene.table1.columns.order'),
        t('children_hygiene.table1.columns.institutions'),
        t('children_hygiene.table2.columns.chem'), '', '',
        t('children_hygiene.table2.columns.bact'), '', '',
        t('children_hygiene.table2.columns.para'), '', ''
    ]);

    worksheetData.push([
        '', '',
        t('children_hygiene.table2.columns.total'), t('children_hygiene.table2.columns.non_compliant'), '%',
        t('children_hygiene.table2.columns.total'), t('children_hygiene.table2.columns.non_compliant'), '%',
        t('children_hygiene.table2.columns.total'), t('children_hygiene.table2.columns.non_compliant'), '%'
    ]);

    rows.forEach(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        const getPct = (total: number, non: number) => total ? ((non / total) * 100).toFixed(1) + '%' : '0%';
        worksheetData.push([
            rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'),
            t(rowInfo.labelKey),
            item.chemTotal ?? 0, item.chemNonCompliant ?? 0, getPct(item.chemTotal, item.chemNonCompliant),
            item.bactTotal ?? 0, item.bactNonCompliant ?? 0, getPct(item.bactTotal, item.bactNonCompliant),
            item.paraTotal ?? 0, item.paraNonCompliant ?? 0, getPct(item.paraTotal, item.paraNonCompliant),
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
        { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } },
        { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } },
        { s: { r: 4, c: 2 }, e: { r: 4, c: 4 } },
        { s: { r: 4, c: 5 }, e: { r: 4, c: 7 } },
        { s: { r: 4, c: 8 }, e: { r: 4, c: 10 } }
    ];

    [4, 5].forEach(r => {
        for (let c = 0; c <= 10; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (ws[cell]) ws[cell].s = headerStyle;
        }
    });

    for (let r = 6; r < worksheetData.length; r++) {
        for (let c = 0; c <= 10; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (ws[cell]) {
                const isTotal = rows[r - 6].key === 'total';
                ws[cell].s = {
                    ...cellStyle,
                    font: { ...cellStyle.font, bold: isTotal },
                    alignment: { ...cellStyle.alignment, horizontal: c === 1 ? 'left' : 'center' },
                    fill: isTotal ? { fgColor: { rgb: 'ECFDF5' } } : undefined
                };
            }
        }
    }
    ws['!cols'] = [{ wch: 5 }, { wch: 40 }, ...Array(9).fill({ wch: 10 })];
    return ws;
};

export const exportTable2Excel = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const workbook = XLSX.utils.book_new();
    const ws = getTable2Sheet(data, rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws, '2-jadval');
    XLSX.writeFile(workbook, `Bolalar_va_Osmirlar_Gigiyenasi_2_jadval_${month}.xlsx`);
};

// ─── Table 2 Helper (PDF) ────────────────────────────────────────────────────
const addTable2ToPDF = (doc: jsPDF, data: any[], rows: any[], month: string, orgName: string, t: any) => {
    doc.setFontSize(14);
    doc.text(t('reports.children_hygiene') + ' - 2-jadval', 14, 15);
    doc.setFontSize(10);
    doc.text(`Tashkilot: ${orgName} | Davr: ${month}`, 14, 22);

    const finalHead = [
        [
            t('children_hygiene.table1.columns.order'),
            t('children_hygiene.table1.columns.institutions'),
            t('children_hygiene.table2.columns.chem'), '', '',
            t('children_hygiene.table2.columns.bact'), '', '',
            t('children_hygiene.table2.columns.para'), '', ''
        ],
        [
            '', '',
            t('children_hygiene.table2.columns.total'), t('children_hygiene.table2.columns.non_compliant'), '%',
            t('children_hygiene.table2.columns.total'), t('children_hygiene.table2.columns.non_compliant'), '%',
            t('children_hygiene.table2.columns.total'), t('children_hygiene.table2.columns.non_compliant'), '%'
        ]
    ];

    const body = rows.map(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        const getPct = (total: number, non: number) => total ? ((non / total) * 100).toFixed(1) + '%' : '0%';
        return [
            rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'),
            t(rowInfo.labelKey),
            item.chemTotal ?? 0, item.chemNonCompliant ?? 0, getPct(item.chemTotal, item.chemNonCompliant),
            item.bactTotal ?? 0, item.bactNonCompliant ?? 0, getPct(item.bactTotal, item.bactNonCompliant),
            item.paraTotal ?? 0, item.paraNonCompliant ?? 0, getPct(item.paraTotal, item.paraNonCompliant),
        ];
    });

    autoTable(doc, {
        head: finalHead,
        body,
        startY: 30,
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        didParseCell: (data) => {
            if (data.section === 'body') {
                if (rows[data.row.index].key === 'total') {
                    data.cell.styles.fillColor = [236, 253, 245];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        theme: 'grid'
    });
};

export const exportTable2PDF = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    addTable2ToPDF(doc, data, rows, month, orgName, t);
    doc.save(`Bolalar_va_Osmirlar_Gigiyenasi_2_jadval_${month}.pdf`);
};

// ─── Table 3 Helper (Excel) ──────────────────────────────────────────────────
const getTable3Sheet = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const worksheetData: any[][] = [];
    worksheetData.push([t('reports.children_hygiene') + ' - 3-jadval']);
    worksheetData.push([`Tashkilot: ${orgName}`]);
    worksheetData.push([`Davr: ${month}`]);
    worksheetData.push([]);

    worksheetData.push([
        '№', t('children_hygiene.table1.columns.institutions'),
        t('children_hygiene.table3.columns.air'), '', '', '', '',
        t('children_hygiene.table3.columns.micro'), '', '',
        t('children_hygiene.table3.columns.vib'), '', '',
        t('children_hygiene.table3.columns.emf'), '', '',
        t('children_hygiene.table3.columns.light'), '', '',
        t('children_hygiene.table3.columns.noise'), '', ''
    ]);

    worksheetData.push([
        '', '',
        t('children_hygiene.table3.columns.inspected_count'),
        t('children_hygiene.table3.columns.samples_total'), '',
        t('children_hygiene.table3.columns.rem'), '',
        t('children_hygiene.table3.columns.inspected_count'), t('children_hygiene.table3.columns.samples_total'), t('children_hygiene.table3.columns.non_compliant'),
        t('children_hygiene.table3.columns.inspected_count'), t('children_hygiene.table3.columns.samples_total'), t('children_hygiene.table3.columns.non_compliant'),
        t('children_hygiene.table3.columns.inspected_count'), t('children_hygiene.table3.columns.samples_total'), t('children_hygiene.table3.columns.non_compliant'),
        t('children_hygiene.table3.columns.inspected_count'), t('children_hygiene.table3.columns.samples_total'), t('children_hygiene.table3.columns.non_compliant'),
        t('children_hygiene.table3.columns.inspected_count'), t('children_hygiene.table3.columns.samples_total'), t('children_hygiene.table3.columns.non_compliant'),
    ]);

    worksheetData.push([
        '', '',
        '', t('children_hygiene.table3.columns.total'), t('children_hygiene.table3.columns.samples_12k'),
        t('children_hygiene.table3.columns.total'), t('children_hygiene.table3.columns.samples_12k'),
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    ]);

    rows.forEach(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        worksheetData.push([
            rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'),
            t(rowInfo.labelKey),
            item.airInspectedCount ?? 0, item.airSamplesTotal ?? 0, item.airSamples12k ?? 0, item.airRemExceededTotal ?? 0, item.airRemExceeded12k ?? 0,
            item.microInspectedCount ?? 0, item.microSamplesTotal ?? 0, item.microSamplesNonCompliant ?? 0,
            item.vibInspectedCount ?? 0, item.vibSamplesTotal ?? 0, item.vibSamplesNonCompliant ?? 0,
            item.emfInspectedCount ?? 0, item.emfSamplesTotal ?? 0, item.emfSamplesNonCompliant ?? 0,
            item.lightInspectedCount ?? 0, item.lightSamplesTotal ?? 0, item.lightSamplesNonCompliant ?? 0,
            item.noiseInspectedCount ?? 0, item.noiseSamplesTotal ?? 0, item.noiseSamplesNonCompliant ?? 0,
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 21 } },
        { s: { r: 4, c: 0 }, e: { r: 6, c: 0 } },
        { s: { r: 4, c: 1 }, e: { r: 6, c: 1 } },
        { s: { r: 4, c: 2 }, e: { r: 4, c: 6 } },
        { s: { r: 5, c: 2 }, e: { r: 6, c: 2 } },
        { s: { r: 5, c: 3 }, e: { r: 5, c: 4 } },
        { s: { r: 5, c: 5 }, e: { r: 5, c: 6 } },
        ...[7, 10, 13, 16, 19].map(c => ({ s: { r: 4, c }, e: { r: 4, c: c + 2 } })),
        ...[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(c => ({ s: { r: 5, c }, e: { r: 6, c: c } }))
    ];

    [4, 5, 6].forEach(r => {
        for (let c = 0; c <= 21; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (ws[cell]) ws[cell].s = headerStyle;
        }
    });

    for (let r = 7; r < worksheetData.length; r++) {
        for (let c = 0; c <= 21; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (ws[cell]) {
                const isTotal = rows[r - 7].key === 'total';
                ws[cell].s = {
                    ...cellStyle,
                    font: { ...cellStyle.font, bold: isTotal },
                    alignment: { ...cellStyle.alignment, horizontal: c === 1 ? 'left' : 'center' },
                    fill: isTotal ? { fgColor: { rgb: 'ECFDF5' } } : undefined
                };
            }
        }
    }
    ws['!cols'] = [{ wch: 5 }, { wch: 35 }, ...Array(20).fill({ wch: 8 })];
    return ws;
};

export const exportTable3Excel = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const workbook = XLSX.utils.book_new();
    const ws = getTable3Sheet(data, rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws, '3-jadval');
    XLSX.writeFile(workbook, `Bolalar_va_Osmirlar_Gigiyenasi_3_jadval_${month}.xlsx`);
};

// ─── Table 3.1 Helper (Excel) ────────────────────────────────────────────────
const getTable3_1Sheet = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const worksheetData: any[][] = [];
    worksheetData.push([t('reports.children_hygiene') + ' - 3.1-jadval']);
    worksheetData.push([`Tashkilot: ${orgName}`]);
    worksheetData.push([`Davr: ${month}`]);
    worksheetData.push([]);

    const subcats = ['ration', 'salt', 'nitrate', 'toxic', 'thermal', 'mineral', 'soil', 'water', 'pesticide', 'nutrition'];
    const row1 = ['№', t('children_hygiene.table1.columns.institutions')];
    subcats.forEach(sc => row1.push(t(`children_hygiene.table3_1.columns.${sc}`), ''));
    worksheetData.push(row1);

    const row2 = ['', ''];
    subcats.forEach(() => row2.push(t('children_hygiene.table3_1.columns.total'), t('children_hygiene.table3_1.columns.non_compliant')));
    worksheetData.push(row2);

    rows.forEach(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        const dataRow = [rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'), t(rowInfo.labelKey)];
        subcats.forEach(sc => dataRow.push(item[`${sc}Total`] ?? 0, item[`${sc}NonCompliant`] ?? 0));
        worksheetData.push(dataRow);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 21 } },
        { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } },
        { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } },
        ...subcats.map((_, i) => ({ s: { r: 4, c: 2 + i * 2 }, e: { r: 4, c: 3 + i * 2 } }))
    ];

    [4, 5].forEach(r => {
        for (let c = 0; c <= 21; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (ws[cell]) ws[cell].s = headerStyle;
        }
    });

    for (let r = 6; r < worksheetData.length; r++) {
        for (let c = 0; c <= 21; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (ws[cell]) {
                const isTotal = rows[r - 6].key === 'total';
                ws[cell].s = {
                    ...cellStyle,
                    font: { ...cellStyle.font, bold: isTotal },
                    alignment: { ...cellStyle.alignment, horizontal: c === 1 ? 'left' : 'center' },
                    fill: isTotal ? { fgColor: { rgb: 'ECFDF5' } } : undefined
                };
            }
        }
    }
    ws['!cols'] = [{ wch: 5 }, { wch: 35 }, ...Array(20).fill({ wch: 8 })];
    return ws;
};

export const exportTable3_1Excel = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const workbook = XLSX.utils.book_new();
    const ws = getTable3_1Sheet(data, rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws, '3.1-jadval');
    XLSX.writeFile(workbook, `Bolalar_va_Osmirlar_Gigiyenasi_3_1_jadval_${month}.xlsx`);
};

// ─── Table 3.2 Helper (Excel) ────────────────────────────────────────────────
const getTable3_2Sheet = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const worksheetData: any[][] = [];
    worksheetData.push([t('reports.children_hygiene') + ' - 3.2-jadval']);
    worksheetData.push([`Tashkilot: ${orgName}`]);
    worksheetData.push([`Davr: ${month}`]);
    worksheetData.push([]);

    worksheetData.push([
        '№', t('children_hygiene.table1.columns.institutions'),
        t('children_hygiene.table3_2.columns.para'), '', '', '', '', '',
        t('children_hygiene.table3_2.columns.micro'), '', '', '', '', '', '', ''
    ]);

    const row2 = ['', '',
        t('children_hygiene.table3_2.columns.para_veg'), '',
        t('children_hygiene.table3_2.columns.para_water'), '',
        t('children_hygiene.table3_2.columns.para_soil'), '',
        t('children_hygiene.table3_2.columns.micro_smear'), '',
        t('children_hygiene.table3_2.columns.micro_food'), '',
        t('children_hygiene.table3_2.columns.micro_water'), '',
        t('children_hygiene.table3_2.columns.micro_soil'), ''
    ];
    worksheetData.push(row2);

    const row3 = ['', '',
        t('children_hygiene.table3_2.columns.total'), t('children_hygiene.table3_2.columns.non_compliant'),
        t('children_hygiene.table3_2.columns.total'), t('children_hygiene.table3_2.columns.non_compliant'),
        t('children_hygiene.table3_2.columns.total'), t('children_hygiene.table3_2.columns.non_compliant'),
        t('children_hygiene.table3_2.columns.total'), t('children_hygiene.table3_2.columns.non_compliant'),
        t('children_hygiene.table3_2.columns.total'), t('children_hygiene.table3_2.columns.non_compliant'),
        t('children_hygiene.table3_2.columns.total'), t('children_hygiene.table3_2.columns.non_compliant'),
        t('children_hygiene.table3_2.columns.total'), t('children_hygiene.table3_2.columns.non_compliant')
    ];
    worksheetData.push(row3);

    const cats = ['paraVeg', 'paraWater', 'paraSoil', 'microSmear', 'microFood', 'microWater', 'microSoil'];
    rows.forEach(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        const dataRow = [rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'), t(rowInfo.labelKey)];
        cats.forEach(c => dataRow.push(item[`${c}Total`] ?? 0, item[`${c}NonCompliant`] ?? 0));
        worksheetData.push(dataRow);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 15 } },
        { s: { r: 4, c: 0 }, e: { r: 6, c: 0 } },
        { s: { r: 4, c: 1 }, e: { r: 6, c: 1 } },
        { s: { r: 4, c: 2 }, e: { r: 4, c: 7 } },
        { s: { r: 4, c: 8 }, e: { r: 4, c: 15 } },
        ...[2, 4, 6, 8, 10, 12, 14].map(c => ({ s: { r: 5, c }, e: { r: 5, c: c + 1 } }))
    ];

    [4, 5, 6].forEach(r => {
        for (let c = 0; c <= 15; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (ws[cell]) ws[cell].s = headerStyle;
        }
    });

    for (let r = 7; r < worksheetData.length; r++) {
        for (let c = 0; c <= 15; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (ws[cell]) {
                const isTotal = rows[r - 7].key === 'total';
                ws[cell].s = {
                    ...cellStyle,
                    font: { ...cellStyle.font, bold: isTotal },
                    alignment: { ...cellStyle.alignment, horizontal: c === 1 ? 'left' : 'center' },
                    fill: isTotal ? { fgColor: { rgb: 'ECFDF5' } } : undefined
                };
            }
        }
    }
    ws['!cols'] = [{ wch: 5 }, { wch: 35 }, ...Array(14).fill({ wch: 9 })];
    return ws;
};

export const exportTable3_2Excel = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const workbook = XLSX.utils.book_new();
    const ws = getTable3_2Sheet(data, rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws, '3.2-jadval');
    XLSX.writeFile(workbook, `Bolalar_va_Osmirlar_Gigiyenasi_3_2_jadval_${month}.xlsx`);
};

// ─── Table 4 Helper (Excel) ──────────────────────────────────────────────────
const getTable4Sheet = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const worksheetData: any[][] = [];
    worksheetData.push([t('reports.children_hygiene') + ' - 4-jadval']);
    worksheetData.push([`Tashkilot: ${orgName}`]);
    worksheetData.push([`Davr: ${month}`]);
    worksheetData.push([]);

    worksheetData.push([
        '№', t('children_hygiene.table1.columns.institutions'),
        t('children_hygiene.table4.columns.fines'), '', '', '',
        t('children_hygiene.table4.columns.activity_suspended'),
        t('children_hygiene.table4.columns.employees_suspended'),
        t('children_hygiene.table4.columns.referred_to_investigation'),
        t('children_hygiene.table4.columns.brakera')
    ]);

    worksheetData.push([
        '', '',
        t('children_hygiene.table4.columns.fine_count'), '',
        t('children_hygiene.table4.columns.fine_amount'), '',
        '', '', '', ''
    ]);

    worksheetData.push([
        '', '',
        t('children_hygiene.table4.columns.imposed'), t('children_hygiene.table4.columns.collected'),
        t('children_hygiene.table4.columns.imposed'), t('children_hygiene.table4.columns.collected'),
        '', '', '', ''
    ]);

    rows.forEach(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        worksheetData.push([
            rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'),
            t(rowInfo.labelKey),
            item.fineCountImposed ?? 0, item.fineCountCollected ?? 0,
            item.fineAmountImposed ?? 0, item.fineAmountCollected ?? 0,
            item.activitySuspended ?? 0, item.employeesSuspended ?? 0,
            item.referredToInvestigation ?? 0, item.brakera ?? 0
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
        { s: { r: 4, c: 0 }, e: { r: 6, c: 0 } },
        { s: { r: 4, c: 1 }, e: { r: 6, c: 1 } },
        { s: { r: 4, c: 2 }, e: { r: 4, c: 5 } },
        { s: { r: 5, c: 2 }, e: { r: 5, c: 3 } },
        { s: { r: 5, c: 4 }, e: { r: 5, c: 5 } },
        { s: { r: 4, c: 6 }, e: { r: 6, c: 6 } },
        { s: { r: 4, c: 7 }, e: { r: 6, c: 7 } },
        { s: { r: 4, c: 8 }, e: { r: 6, c: 8 } },
        { s: { r: 4, c: 9 }, e: { r: 6, c: 9 } }
    ];

    [4, 5, 6].forEach(r => {
        for (let c = 0; c <= 9; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (ws[cell]) ws[cell].s = headerStyle;
        }
    });

    for (let r = 7; r < worksheetData.length; r++) {
        for (let c = 0; c <= 9; c++) {
            const cell = XLSX.utils.encode_cell({ r, c });
            if (ws[cell]) {
                const isTotal = rows[r - 7].key === 'total';
                ws[cell].s = {
                    ...cellStyle,
                    font: { ...cellStyle.font, bold: isTotal },
                    alignment: { ...cellStyle.alignment, horizontal: c === 1 ? 'left' : 'center' },
                    fill: isTotal ? { fgColor: { rgb: 'ECFDF5' } } : undefined
                };
            }
        }
    }
    ws['!cols'] = [{ wch: 5 }, { wch: 35 }, ...Array(8).fill({ wch: 10 })];
    return ws;
};

export const exportTable4Excel = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const workbook = XLSX.utils.book_new();
    const ws = getTable4Sheet(data, rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws, '4-jadval');
    XLSX.writeFile(workbook, `Bolalar_va_Osmirlar_Gigiyenasi_4_jadval_${month}.xlsx`);
};

// ─── PDF Exports (Table 3, 3.1, 3.2, 4) ──────────────────────────────────────

// ─── Table 3 Helper (PDF) ──────────────────────────────────────────────────
const addTable3ToPDF = (doc: jsPDF, data: any[], rows: any[], month: string, orgName: string, t: any) => {
    doc.setFontSize(14);
    doc.text(t('reports.children_hygiene') + ' - 3-jadval', 14, 15);
    doc.setFontSize(10);
    doc.text(`Tashkilot: ${orgName} | Davr: ${month}`, 14, 22);

    const head = [
        ['№', t('children_hygiene.table1.columns.institutions'), t('children_hygiene.table3.columns.air'), '', '', '', '', t('children_hygiene.table3.columns.micro'), '', '', t('children_hygiene.table3.columns.vib'), '', '', t('children_hygiene.table3.columns.emf'), '', '', t('children_hygiene.table3.columns.light'), '', '', t('children_hygiene.table3.columns.noise'), '', ''],
        ['', '', t('children_hygiene.table3.columns.inspected_count'), t('children_hygiene.table3.columns.samples_total'), '', t('children_hygiene.table3.columns.rem'), '', t('children_hygiene.table3.columns.inspected_count'), t('children_hygiene.table3.columns.samples_total'), t('children_hygiene.table3.columns.non_compliant'), t('children_hygiene.table3.columns.inspected_count'), t('children_hygiene.table3.columns.samples_total'), t('children_hygiene.table3.columns.non_compliant'), t('children_hygiene.table3.columns.inspected_count'), t('children_hygiene.table3.columns.samples_total'), t('children_hygiene.table3.columns.non_compliant'), t('children_hygiene.table3.columns.inspected_count'), t('children_hygiene.table3.columns.samples_total'), t('children_hygiene.table3.columns.non_compliant'), t('children_hygiene.table3.columns.inspected_count'), t('children_hygiene.table3.columns.samples_total'), t('children_hygiene.table3.columns.non_compliant')]
    ];

    const body = rows.map(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        return [
            rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'),
            t(rowInfo.labelKey),
            item.airInspectedCount ?? 0, item.airSamplesTotal ?? 0, item.airSamples12k ?? 0, item.airRemExceededTotal ?? 0, item.airRemExceeded12k ?? 0,
            item.microInspectedCount ?? 0, item.microSamplesTotal ?? 0, item.microSamplesNonCompliant ?? 0,
            item.vibInspectedCount ?? 0, item.vibSamplesTotal ?? 0, item.vibSamplesNonCompliant ?? 0,
            item.emfInspectedCount ?? 0, item.emfSamplesTotal ?? 0, item.emfSamplesNonCompliant ?? 0,
            item.lightInspectedCount ?? 0, item.lightSamplesTotal ?? 0, item.lightSamplesNonCompliant ?? 0,
            item.noiseInspectedCount ?? 0, item.noiseSamplesTotal ?? 0, item.noiseSamplesNonCompliant ?? 0,
        ];
    });

    autoTable(doc, {
        head,
        body,
        startY: 30,
        styles: { fontSize: 5.5, cellPadding: 1 },
        headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        theme: 'grid'
    });
};

export const exportTable3PDF = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    addTable3ToPDF(doc, data, rows, month, orgName, t);
    doc.save(`Bolalar_va_Osmirlar_Gigiyenasi_3_jadval_${month}.pdf`);
};

// ─── Table 3.1 Helper (PDF) ──────────────────────────────────────────────────
const addTable3_1ToPDF = (doc: jsPDF, data: any[], rows: any[], month: string, orgName: string, t: any) => {
    doc.setFontSize(14);
    doc.text(t('reports.children_hygiene') + ' - 3.1-jadval', 14, 15);
    doc.setFontSize(10);
    doc.text(`Tashkilot: ${orgName} | Davr: ${month}`, 14, 22);

    const subcats = ['ration', 'salt', 'nitrate', 'toxic', 'thermal', 'mineral', 'soil', 'water', 'pesticide', 'nutrition'];
    const h1 = ['№', t('children_hygiene.table1.columns.institutions')];
    subcats.forEach(sc => h1.push(t(`children_hygiene.table3_1.columns.${sc}`), ''));

    const h2 = ['', ''];
    subcats.forEach(() => h2.push(t('children_hygiene.table3_1.columns.total'), t('children_hygiene.table3_1.columns.non_compliant')));

    const body = rows.map(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        const dataRow = [rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'), t(rowInfo.labelKey)];
        subcats.forEach(sc => dataRow.push(item[`${sc}Total`] ?? 0, item[`${sc}NonCompliant`] ?? 0));
        return dataRow;
    });

    autoTable(doc, {
        head: [h1, h2],
        body,
        startY: 30,
        styles: { fontSize: 6, cellPadding: 1 },
        headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        theme: 'grid'
    });
};

export const exportTable3_1PDF = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    addTable3_1ToPDF(doc, data, rows, month, orgName, t);
    doc.save(`Bolalar_va_Osmirlar_Gigiyenasi_3_1_jadval_${month}.pdf`);
};

// ─── Table 3.2 Helper (PDF) ──────────────────────────────────────────────────
const addTable3_2ToPDF = (doc: jsPDF, data: any[], rows: any[], month: string, orgName: string, t: any) => {
    doc.setFontSize(14);
    doc.text(t('reports.children_hygiene') + ' - 3.2-jadval', 14, 15);
    doc.setFontSize(10);
    doc.text(`Tashkilot: ${orgName} | Davr: ${month}`, 14, 22);

    const cats = ['paraVeg', 'paraWater', 'paraSoil', 'microSmear', 'microFood', 'microWater', 'microSoil'];
    const h1 = ['№', t('children_hygiene.table1.columns.institutions'), t('children_hygiene.table3_2.columns.para'), '', '', '', '', '', t('children_hygiene.table3_2.columns.micro'), '', '', '', '', '', '', ''];
    const h2 = ['', '', t('children_hygiene.table3_2.columns.para_veg'), '', t('children_hygiene.table3_2.columns.para_water'), '', t('children_hygiene.table3_2.columns.para_soil'), '', t('children_hygiene.table3_2.columns.micro_smear'), '', t('children_hygiene.table3_2.columns.micro_food'), '', t('children_hygiene.table3_2.columns.micro_water'), '', t('children_hygiene.table3_2.columns.micro_soil'), ''];

    const body = rows.map(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        const dataRow = [rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'), t(rowInfo.labelKey)];
        cats.forEach(c => dataRow.push(item[`${c}Total`] ?? 0, item[`${c}NonCompliant`] ?? 0));
        return dataRow;
    });

    autoTable(doc, {
        head: [h1, h2],
        body,
        startY: 30,
        styles: { fontSize: 6, cellPadding: 1 },
        headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        theme: 'grid'
    });
};

export const exportTable3_2PDF = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    addTable3_2ToPDF(doc, data, rows, month, orgName, t);
    doc.save(`Bolalar_va_Osmirlar_Gigiyenasi_3_2_jadval_${month}.pdf`);
};

// ─── Table 4 Helper (PDF) ────────────────────────────────────────────────────
const addTable4ToPDF = (doc: jsPDF, data: any[], rows: any[], month: string, orgName: string, t: any) => {
    doc.setFontSize(14);
    doc.text(t('reports.children_hygiene') + ' - 4-jadval', 14, 15);
    doc.setFontSize(10);
    doc.text(`Tashkilot: ${orgName} | Davr: ${month}`, 14, 22);

    const h1 = ['№', t('children_hygiene.table1.columns.institutions'), t('children_hygiene.table4.columns.fines'), '', '', '', t('children_hygiene.table4.columns.activity_suspended'), t('children_hygiene.table4.columns.employees_suspended'), t('children_hygiene.table4.columns.referred_to_investigation'), t('children_hygiene.table4.columns.brakera')];
    const h2 = ['', '', t('children_hygiene.table4.columns.fine_count'), '', t('children_hygiene.table4.columns.fine_amount'), '', '', '', '', ''];

    const body = rows.map(rowInfo => {
        const item = data.find(r => r.row_key === rowInfo.key) || {};
        return [
            rowInfo.key === 'total' ? 'I' : rowInfo.key.replace(/_/g, '.'),
            t(rowInfo.labelKey),
            item.fineCountImposed ?? 0, item.fineCountCollected ?? 0,
            item.fineAmountImposed ?? 0, item.fineAmountCollected ?? 0,
            item.activitySuspended ?? 0, item.employeesSuspended ?? 0,
            item.referredToInvestigation ?? 0, item.brakera ?? 0
        ];
    });

    autoTable(doc, {
        head: [h1, h2],
        body,
        startY: 30,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        theme: 'grid'
    });
};

export const exportTable4PDF = (data: any[], rows: any[], month: string, orgName: string, t: any) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    addTable4ToPDF(doc, data, rows, month, orgName, t);
    doc.save(`Bolalar_va_Osmirlar_Gigiyenasi_4_jadval_${month}.pdf`);
};

// ─── Consolidated Export (All Tables) ────────────────────────────────────────

export const exportAllPDF = (allData: any, rows: any[], month: string, orgName: string, t: any) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    addTable1ToPDF(doc, allData.table1 || [], rows, month, orgName, t);
    doc.addPage();
    addTable2ToPDF(doc, allData.table2 || [], rows, month, orgName, t);
    doc.addPage();
    addTable3ToPDF(doc, allData.table3 || [], rows, month, orgName, t);
    doc.addPage();
    addTable3_1ToPDF(doc, allData.table3_1 || [], rows, month, orgName, t);
    doc.addPage();
    addTable3_2ToPDF(doc, allData.table3_2 || [], rows, month, orgName, t);
    doc.addPage();
    addTable4ToPDF(doc, allData.table4 || [], rows, month, orgName, t);

    doc.save(`Bolalar_va_Osmirlar_Gigiyenasi_Barchasi_${month}.pdf`);
};

// ─── Consolidated Export (All Tables) ────────────────────────────────────────

export const exportAllExcel = (allData: any, rows: any[], month: string, orgName: string, t: any) => {
    const workbook = XLSX.utils.book_new();

    const ws1 = getTable1Sheet(allData.table1 || [], rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws1, '1-jadval');

    const ws2 = getTable2Sheet(allData.table2 || [], rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws2, '2-jadval');

    const ws3 = getTable3Sheet(allData.table3 || [], rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws3, '3-jadval');

    const ws4 = getTable3_1Sheet(allData.table3_1 || [], rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws4, '3.1-jadval');

    const ws5 = getTable3_2Sheet(allData.table3_2 || [], rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws5, '3.2-jadval');

    const ws6 = getTable4Sheet(allData.table4 || [], rows, month, orgName, t);
    XLSX.utils.book_append_sheet(workbook, ws6, '4-jadval');

    XLSX.writeFile(workbook, `Bolalar_va_Osmirlar_Gigiyenasi_Barchasi_${month}.xlsx`);
};



