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

const dataStyle = (isBold = false) => ({
    font: { bold: isBold, sz: 10 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
    }
});

// ─── Table 1 Helper (Excel) ──────────────────────────────────────────────────
const getTable1Sheet = (data: any[], t: any) => {
    const worksheetData: any[][] = [];
    const merges: any[] = [];

    // Header structure
    // Row 1
    worksheetData.push([
        t('kommunal_hygiene.water_table.headers.pipeline'),
        t('kommunal_hygiene.water_table.headers.total_samples'),
        t('kommunal_hygiene.water_table.headers.chemical'), '', '', '', '', '', '', '', '', '', '', '',
        t('kommunal_hygiene.water_table.headers.total_samples') + ' (Bakt)',
        t('kommunal_hygiene.water_table.headers.bacteriology'), '', '', '', '', '', ''
    ]);
    merges.push({ s: { r: 0, c: 0 }, e: { r: 2, c: 0 } }); // Pipeline
    merges.push({ s: { r: 0, c: 1 }, e: { r: 2, c: 1 } }); // Total chem
    merges.push({ s: { r: 0, c: 2 }, e: { r: 0, c: 13 } }); // Chemical group
    merges.push({ s: { r: 0, c: 14 }, e: { r: 2, c: 14 } }); // Total bact
    merges.push({ s: { r: 0, c: 15 }, e: { r: 0, c: 21 } }); // Bacteriology group

    // Row 2
    const row2 = ['', '', t('kommunal_hygiene.water_table.headers.points_samples'), '', '', '', t('kommunal_hygiene.water_table.headers.not_compliant_sanitary'), '', '', '', '', '', '', '', '', t('kommunal_hygiene.water_table.headers.points_samples'), '', '', '', t('kommunal_hygiene.water_table.headers.not_compliant_sanitary'), '', ''];
    worksheetData.push(row2);
    merges.push({ s: { r: 1, c: 2 }, e: { r: 1, c: 5 } }); // Points chem
    merges.push({ s: { r: 1, c: 6 }, e: { r: 1, c: 13 } }); // Not compliant chem
    merges.push({ s: { r: 1, c: 15 }, e: { r: 1, c: 18 } }); // Points bact
    merges.push({ s: { r: 1, c: 19 }, e: { r: 1, c: 21 } }); // Not compliant bact

    // Row 3
    const row3 = [
        '', '',
        t('kommunal_hygiene.water_table.headers.source'), t('kommunal_hygiene.water_table.headers.before_network'), t('kommunal_hygiene.water_table.headers.control_points'), t('kommunal_hygiene.water_table.headers.consumer'),
        t('kommunal_hygiene.water_table.headers.ammonia'), t('kommunal_hygiene.water_table.headers.nitrate'), t('kommunal_hygiene.water_table.headers.nitrite'), t('kommunal_hygiene.water_table.headers.dry_residue'), t('kommunal_hygiene.water_table.headers.chloride'), t('kommunal_hygiene.water_table.headers.sulfate'), t('kommunal_hygiene.water_table.headers.turbidity'), t('kommunal_hygiene.water_table.headers.hardness'),
        '',
        t('kommunal_hygiene.water_table.headers.source'), t('kommunal_hygiene.water_table.headers.before_network'), t('kommunal_hygiene.water_table.headers.control_points'), t('kommunal_hygiene.water_table.headers.consumer'),
        t('kommunal_hygiene.water_table.headers.umc'), t('kommunal_hygiene.water_table.headers.coli'), t('kommunal_hygiene.water_table.headers.sfz')
    ];
    worksheetData.push(row3);

    // Row 4: Numbers
    worksheetData.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 1, 2, 3, 4, 5, 6, 7, 8]);

    // Data rows
    const rowTypes = [
        { key: 'kommunal', labelKey: 'kommunal_hygiene.rows.kommunal' },
        { key: 'kommunal_norm', labelKey: 'kommunal_hygiene.rows.kommunal_norm' },
        { key: 'departmental', labelKey: 'kommunal_hygiene.rows.departmental' },
        { key: 'departmental_norm', labelKey: 'kommunal_hygiene.rows.departmental_norm' },
    ];

    const fields = [
        'chem_total', 'chem_src_manba', 'chem_src_tarmok_oldin', 'chem_src_tarmok_point', 'chem_src_consumer',
        'chem_bad_ammiak', 'chem_bad_nitrat', 'chem_bad_nitrit', 'chem_bad_qoldiq', 'chem_bad_xlorid',
        'chem_bad_sulfat', 'chem_bad_loyqa', 'chem_bad_qattiq', 'chem_bad_other',
        'total_inspected_samples', 'bact_src_manba', 'bact_src_tarmok_oldin', 'bact_src_tarmok_point', 'bact_src_consumer',
        'bact_bad_umc', 'bact_bad_koli', 'bact_bad_sfz'
    ];

    rowTypes.forEach(rt => {
        const item = data.find(r => r.row_type === rt.key) || {};
        const dataRow = [t(rt.labelKey)];
        // chem_total is index 1, chem_src_manba is index 2... 14
        // then total_inspected_samples is 15...
        dataRow.push(item.chem_total ?? 0);
        dataRow.push(item.chem_src_manba ?? 0, item.chem_src_tarmok_oldin ?? 0, item.chem_src_tarmok_point ?? 0, item.chem_src_consumer ?? 0);
        dataRow.push(item.chem_bad_ammiak ?? 0, item.chem_bad_nitrat ?? 0, item.chem_bad_nitrit ?? 0, item.chem_bad_qoldiq ?? 0, item.chem_bad_xlorid ?? 0, item.chem_bad_sulfat ?? 0, item.chem_bad_loyqa ?? 0, item.chem_bad_qattiq ?? 0);
        dataRow.push(item.total_inspected_samples ?? 0);
        dataRow.push(item.bact_src_manba ?? 0, item.bact_src_tarmok_oldin ?? 0, item.bact_src_tarmok_point ?? 0, item.bact_src_consumer ?? 0);
        dataRow.push(item.bact_bad_umc ?? 0, item.bact_bad_koli ?? 0, item.bact_bad_sfz ?? 0);
        worksheetData.push(dataRow);
    });

    // Totals
    const jamiKI = [t('kommunal_hygiene.rows.total_ki')];
    const jamiTKD = [t('kommunal_hygiene.rows.total_tkb')];

    fields.forEach(f => {
        const kiVal = (data.find(r => r.row_type === 'kommunal')?.[f] || 0) + (data.find(r => r.row_type === 'departmental')?.[f] || 0);
        const tkdVal = (data.find(r => r.row_type === 'kommunal_norm')?.[f] || 0) + (data.find(r => r.row_type === 'departmental_norm')?.[f] || 0);
        jamiKI.push(kiVal);
        jamiTKD.push(tkdVal);
    });
    worksheetData.push(jamiKI);
    worksheetData.push(jamiTKD);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!merges'] = merges;

    // Apply styles
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!worksheet[cellAddress]) continue;
            if (R < 4) {
                worksheet[cellAddress].s = headerStyle;
            } else {
                const isTotal = R >= range.e.r - 1;
                worksheet[cellAddress].s = dataStyle(isTotal);
                if (C === 0) worksheet[cellAddress].s.alignment.horizontal = 'left';
            }
        }
    }

    worksheet['!cols'] = [{ wch: 45 }, ...Array(21).fill({ wch: 10 })];
    return worksheet;
};

// ─── Table 2 Helper (Excel) ──────────────────────────────────────────────────
const getTable2Sheet = (data: any[], t: any) => {
    const worksheetData: any[][] = [];
    const merges: any[] = [];

    // Header structure
    worksheetData.push([
        t('kommunal_hygiene.open_water_table.headers.water_body'),
        t('kommunal_hygiene.open_water_table.headers.object_name'),
        t('kommunal_hygiene.open_water_table.headers.treatment_system'),
        t('kommunal_hygiene.open_water_table.headers.lab_control'), '', '', '', '', '', '', '', '', ''
    ]);
    merges.push({ s: { r: 0, c: 3 }, e: { r: 0, c: 12 } });

    worksheetData.push([
        '', '', '',
        t('kommunal_hygiene.open_water_table.headers.chem'), '', '', '', '',
        t('kommunal_hygiene.open_water_table.headers.bact'), '', '', '', ''
    ]);
    merges.push({ s: { r: 1, c: 3 }, e: { r: 1, c: 7 } });
    merges.push({ s: { r: 1, c: 8 }, e: { r: 1, c: 12 } });

    worksheetData.push([
        '', '', '',
        t('kommunal_hygiene.open_water_table.headers.before'), '', t('kommunal_hygiene.open_water_table.headers.after'), '', t('kommunal_hygiene.open_water_table.headers.efficiency'),
        t('kommunal_hygiene.open_water_table.headers.before'), '', t('kommunal_hygiene.open_water_table.headers.after'), '', t('kommunal_hygiene.open_water_table.headers.efficiency')
    ]);
    merges.push({ s: { r: 2, c: 3 }, e: { r: 2, c: 4 } });
    merges.push({ s: { r: 2, c: 5 }, e: { r: 2, c: 6 } });
    merges.push({ s: { r: 2, c: 8 }, e: { r: 2, c: 9 } });
    merges.push({ s: { r: 2, c: 10 }, e: { r: 2, c: 11 } });

    worksheetData.push([
        '', '', '',
        t('kommunal_hygiene.open_water_table.headers.total_samples'), t('kommunal_hygiene.open_water_table.headers.not_meet'),
        t('kommunal_hygiene.open_water_table.headers.total_samples'), t('kommunal_hygiene.open_water_table.headers.not_meet'),
        '',
        t('kommunal_hygiene.open_water_table.headers.total_samples'), t('kommunal_hygiene.open_water_table.headers.not_meet'),
        t('kommunal_hygiene.open_water_table.headers.total_samples'), t('kommunal_hygiene.open_water_table.headers.not_meet'),
        ''
    ]);

    // Data rows
    let totalCbt = 0, totalCbb = 0, totalCat = 0, totalCab = 0;
    let totalBbt = 0, totalBbb = 0, totalBat = 0, totalBab = 0;

    data.forEach(r => {
        totalCbt += Number(r.chem_before_total) || 0;
        totalCbb += Number(r.chem_before_bad) || 0;
        totalCat += Number(r.chem_after_total) || 0;
        totalCab += Number(r.chem_bad_total) || 0;
        totalBbt += Number(r.bact_before_total) || 0;
        totalBbb += Number(r.bact_before_bad) || 0;
        totalBat += Number(r.bact_after_total) || 0;
        totalBab += Number(r.bact_after_bad) || 0;

        worksheetData.push([
            r.water_body_name, r.object_name, r.treatment_system,
            r.chem_before_total, r.chem_before_bad, r.chem_after_total, r.chem_after_bad, (r.chem_efficiency || 0) + '%',
            r.bact_before_total, r.bact_before_bad, r.bact_after_total, r.bact_after_bad, (r.bact_efficiency || 0) + '%'
        ]);
    });

    const chemEff = totalCbb > 0 ? (((totalCbb - totalCab) / totalCbb) * 100).toFixed(1) : '0';
    const bactEff = totalBbb > 0 ? (((totalBbb - totalBab) / totalBbb) * 100).toFixed(1) : '0';

    worksheetData.push([
        t('common.total'), '', '',
        totalCbt, totalCbb, totalCat, totalCab, chemEff + '%',
        totalBbt, totalBbb, totalBat, totalBab, bactEff + '%'
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!merges'] = merges;
    rangeStyle(worksheet, 0, 4, 0, 12);
    return worksheet;
};

// ─── Table 3 Helper (Excel) ──────────────────────────────────────────────────
const getTable3Sheet = (data: any[], t: any) => {
    const worksheetData: any[][] = [];
    const merges: any[] = [];

    // Header
    worksheetData.push([
        t('kommunal_hygiene.usage_table.headers.water_body'),
        t('kommunal_hygiene.usage_table.headers.category'),
        t('kommunal_hygiene.usage_table.title'), '', '', '', '', '', '', '', ''
    ]);
    merges.push({ s: { r: 0, c: 2 }, e: { r: 0, c: 10 } });

    worksheetData.push([
        '', '',
        t('kommunal_hygiene.usage_table.headers.samples_taken'),
        t('kommunal_hygiene.usage_table.headers.samples_bad'),
        t('kommunal_hygiene.usage_table.headers.pathogens'), '', '',
        t('kommunal_hygiene.usage_table.headers.chem_pesticide'), '', '', ''
    ]);
    merges.push({ s: { r: 1, c: 4 }, e: { r: 1, c: 6 } });
    merges.push({ s: { r: 1, c: 7 }, e: { r: 1, c: 10 } });

    worksheetData.push([
        '', '', '', '',
        t('kommunal_hygiene.usage_table.headers.inf_disease'),
        t('kommunal_hygiene.usage_table.headers.cholera'),
        t('kommunal_hygiene.usage_table.headers.parasite'),
        t('kommunal_hygiene.usage_table.headers.presence') + ' (T)',
        t('kommunal_hygiene.usage_table.headers.presence') + ' (P)',
        t('kommunal_hygiene.usage_table.headers.bad_pesticide') + ' (T)',
        t('kommunal_hygiene.usage_table.headers.bad_pesticide') + ' (P)'
    ]);

    // Data
    let t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0, t8 = 0, t9 = 0;
    data.forEach(r => {
        t1 += Number(r.samples_taken) || 0;
        t2 += Number(r.samples_bad) || 0;
        t3 += Number(r.pathogen_inf_disease) || 0;
        t4 += Number(r.pathogen_cholera) || 0;
        t5 += Number(r.pathogen_parasite) || 0;
        t6 += Number(r.chem_samples_total) || 0;
        t7 += Number(r.chem_pesticide_presence) || 0;
        t8 += Number(r.chem_bad_total) || 0;
        t9 += Number(r.chem_bad_pesticide) || 0;

        worksheetData.push([
            r.water_body_name, r.category,
            r.samples_taken, r.samples_bad, r.pathogen_inf_disease, r.pathogen_cholera, r.pathogen_parasite,
            r.chem_samples_total, r.chem_pesticide_presence, r.chem_bad_total, r.chem_bad_pesticide
        ]);
    });

    worksheetData.push([t('common.total'), '', t1, t2, t3, t4, t5, t6, t7, t8, t9]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!merges'] = merges;
    rangeStyle(worksheet, 0, 3, 0, 10);
    return worksheet;
};

// Internal utility to apply styles to a range
const rangeStyle = (ws: any, startRow: number, headerRows: number, startCol: number, endCol: number) => {
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[addr]) continue;
            if (R < headerRows) {
                ws[addr].s = headerStyle;
            } else {
                const isTotal = R === range.e.r;
                ws[addr].s = dataStyle(isTotal);
                if (C <= 2) ws[addr].s.alignment.horizontal = 'left';
            }
        }
    }
};

// ─── Main Export Functions (Excel) ───────────────────────────────────────────
export const exportAllExcel = (allData: any, month: string, orgName: string, t: any) => {
    const workbook = XLSX.utils.book_new();

    const s1 = getTable1Sheet(allData.table1 || [], t);
    XLSX.utils.book_append_sheet(workbook, s1, '1-Jadval');

    const s2 = getTable2Sheet(allData.table2 || [], t);
    XLSX.utils.book_append_sheet(workbook, s2, '2-Jadval');

    const s3 = getTable3Sheet(allData.table3 || [], t);
    XLSX.utils.book_append_sheet(workbook, s3, '3-Jadval');

    XLSX.writeFile(workbook, `Kommunal_Gigiyena_Monitoring_${month}_${orgName}.xlsx`);
};

// ─── PDF Helpers ─────────────────────────────────────────────────────────────
const addTable1ToPDF = (doc: jsPDF, data: any[], month: string, orgName: string, t: any) => {
    doc.setFontSize(14);
    doc.text(t('kommunal_hygiene.tabs.water'), 14, 15);
    doc.setFontSize(10);
    doc.text(`Tashkilot: ${orgName} | Davr: ${month}`, 14, 22);

    const rowTypes = [
        { key: 'kommunal', labelKey: 'kommunal_hygiene.rows.kommunal' },
        { key: 'kommunal_norm', labelKey: 'kommunal_hygiene.rows.kommunal_norm' },
        { key: 'departmental', labelKey: 'kommunal_hygiene.rows.departmental' },
        { key: 'departmental_norm', labelKey: 'kommunal_hygiene.rows.departmental_norm' },
    ];
    const fields = [
        'chem_total', 'chem_src_manba', 'chem_src_tarmok_oldin', 'chem_src_tarmok_point', 'chem_src_consumer',
        'chem_bad_ammiak', 'chem_bad_nitrat', 'chem_bad_nitrit', 'chem_bad_qoldiq', 'chem_bad_xlorid',
        'chem_bad_sulfat', 'chem_bad_loyqa', 'chem_bad_qattiq', 'chem_bad_other',
        'total_inspected_samples', 'bact_src_manba', 'bact_src_tarmok_oldin', 'bact_src_tarmok_point', 'bact_src_consumer',
        'bact_bad_umc', 'bact_bad_koli', 'bact_bad_sfz'
    ];

    const body = rowTypes.map(rt => {
        const item = data.find(r => r.row_type === rt.key) || {};
        return [t(rt.labelKey), ...fields.map(f => item[f] ?? 0)];
    });

    // Add totals JAMI KI, JAMI TKD
    const jamiKI = [t('kommunal_hygiene.rows.total_ki')];
    const jamiTKD = [t('kommunal_hygiene.rows.total_tkb')];
    fields.forEach(f => {
        const kiVal = (data.find(r => r.row_type === 'kommunal')?.[f] || 0) + (data.find(r => r.row_type === 'departmental')?.[f] || 0);
        const tkdVal = (data.find(r => r.row_type === 'kommunal_norm')?.[f] || 0) + (data.find(r => r.row_type === 'departmental_norm')?.[f] || 0);
        jamiKI.push(kiVal);
        jamiTKD.push(tkdVal);
    });
    body.push(jamiKI, jamiTKD);

    autoTable(doc, {
        startY: 28,
        head: [[t('kommunal_hygiene.water_table.headers.pipeline'), ...Array(22).fill('').map((_, i) => i + 1)]],
        body: body,
        theme: 'grid',
        styles: { fontSize: 7, font: 'Inter' },
        headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 35 } }
    });
};

const addTable2ToPDF = (doc: jsPDF, data: any[], month: string, orgName: string, t: any) => {
    doc.addPage();
    doc.setFontSize(14);
    doc.text(t('kommunal_hygiene.tabs.open_water'), 14, 15);
    doc.setFontSize(10);
    doc.text(`Tashkilot: ${orgName} | Davr: ${month}`, 14, 22);

    const body = data.map(r => [
        r.water_body_name, r.object_name, r.treatment_system,
        r.chem_before_total, r.chem_before_bad, r.chem_after_total, r.chem_after_bad, (r.chem_efficiency || 0) + '%',
        r.bact_before_total, r.bact_before_bad, r.bact_after_total, r.bact_after_bad, (r.bact_efficiency || 0) + '%'
    ]);

    autoTable(doc, {
        startY: 28,
        head: [[
            t('kommunal_hygiene.open_water_table.headers.water_body'),
            t('kommunal_hygiene.open_water_table.headers.object_name'),
            t('kommunal_hygiene.open_water_table.headers.treatment_system'),
            'C-BT', 'C-BB', 'C-AT', 'C-AB', 'C-EFF',
            'B-BT', 'B-BB', 'B-AT', 'B-AB', 'B-EFF'
        ]],
        body: body,
        theme: 'grid',
        styles: { fontSize: 8, font: 'Inter' }
    });
};

const addTable3ToPDF = (doc: jsPDF, data: any[], month: string, orgName: string, t: any) => {
    doc.addPage();
    doc.setFontSize(14);
    doc.text(t('kommunal_hygiene.tabs.usage_objects'), 14, 15);
    doc.setFontSize(10);
    doc.text(`Tashkilot: ${orgName} | Davr: ${month}`, 14, 22);

    const body = data.map(r => [
        r.water_body_name, r.category,
        r.samples_taken, r.samples_bad, r.pathogen_inf_disease, r.pathogen_cholera, r.pathogen_parasite,
        r.chem_samples_total, r.chem_pesticide_presence, r.chem_bad_total, r.chem_bad_pesticide
    ]);

    autoTable(doc, {
        startY: 28,
        head: [[
            t('kommunal_hygiene.usage_table.headers.water_body'),
            t('kommunal_hygiene.usage_table.headers.category'),
            'ST', 'SB', 'ID', 'CH', 'PA', 'C-TOT', 'C-PRE', 'C-BT', 'C-BP'
        ]],
        body: body,
        theme: 'grid',
        styles: { fontSize: 8, font: 'Inter' }
    });
};

export const exportAllPDF = (allData: any, month: string, orgName: string, t: any) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    addTable1ToPDF(doc, allData.table1 || [], month, orgName, t);
    addTable2ToPDF(doc, allData.table2 || [], month, orgName, t);
    addTable3ToPDF(doc, allData.table3 || [], month, orgName, t);
    doc.save(`Kommunal_Gigiyena_Monitoring_${month}_${orgName}.pdf`);
};
