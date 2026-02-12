import XLSX from 'xlsx-js-style';

// UZ: Umumiy yordamchi funksiyalar
const getNestedValue = (obj: any, path: string) => {
    if (!path) return '';
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const defaultHeaderStyle = {
    font: { bold: true, sz: 11 },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
    }
};

const dataCellStyle = {
    border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
    },
    alignment: { vertical: 'center' }
};

// --- GEPATIT A EKSPORTI ---
export const exportHepatitisProfessional = (data: any[], date: string, orgName: string = 'Тошкент вилояти') => {
    const workbook = XLSX.utils.book_new();
    const worksheetData: any[][] = [];

    // Title
    worksheetData.push([`${orgName}да вирусли гепатит А касаллиги бўйича кунлик маълумоти`]);
    worksheetData.push([`Sana: ${date}`]);
    worksheetData.push([]);

    // Headers Row 4 (Main)
    worksheetData.push([
        "№", "Маъмурий ҳудудлар", "Жами қайд қилинган ВГ А беморлар",
        "Беморларни ёшлари бўйича", "", "", "", "", "",
        "Беморларни касблари бўйича", "", "", "", "", "", "",
        "Юқиш эхтимоли бўлган омил", "", "",
        "ўчоқлариda ичимлик сувини ВГ А антигенига", "",
        "Дезинфекция ўтказилган ўчоқлар"
    ]);

    // Headers Row 5 (Sub)
    worksheetData.push([
        "", "", "",
        "1 ёшгача", "1-3 ёш", "4-6 ёш", "7-14 ёш", "15-19 ёш", "20 ёш ва ундан катталар",
        "Уюшган ясли ёшдаги болалар", "Уюшмаган ясли ёшдаги болалар", "Уюшган боғча ёшдаги болалар", "Уюшмаган боғча ёшдаги болалар", "Ўқувчилар", "Талабалар", "Катталар",
        "Сув", "Овқат-озиқ маҳсулотлари", "маиший мулоқот",
        "Жами олинган намуналар", "Мусбат натижа",
        ""
    ]);

    // Data
    data.forEach((row, idx) => {
        worksheetData.push([
            idx + 1,
            getNestedValue(row, 'organization.name'),
            row.total_cases ?? 0,
            row.age_under_1 ?? 0,
            row.age_1_3 ?? 0,
            row.age_4_6 ?? 0,
            row.age_7_14 ?? 0,
            row.age_15_19 ?? 0,
            row.age_20_plus ?? 0,
            row.occ_organized_nursery ?? 0,
            row.occ_unorganized_nursery ?? 0,
            row.occ_organized_preschool ?? 0,
            row.occ_unorganized_preschool ?? 0,
            row.occ_students ?? 0,
            row.occ_college_students ?? 0,
            row.occ_workers ?? 0,
            row.factor_water ?? 0,
            row.factor_food ?? 0,
            row.factor_contact ?? 0,
            row.lab_samples ?? 0,
            row.lab_positive ?? 0,
            row.disinfection_done ?? 0
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Merges
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 21 } }, // Main Title
        { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }, // №
        { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } }, // Hudud
        { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } }, // Jami
        { s: { r: 3, c: 3 }, e: { r: 3, c: 8 } }, // Yosh
        { s: { r: 3, c: 9 }, e: { r: 3, c: 15 } }, // Kasbi
        { s: { r: 3, c: 16 }, e: { r: 3, c: 18 } }, // Omillar
        { s: { r: 3, c: 19 }, e: { r: 3, c: 20 } }, // Lab
        { s: { r: 3, c: 21 }, e: { r: 4, c: 21 } }  // Dezinfeksiya
    ];

    // Styling
    ws['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };

    const blueHeader = { ...defaultHeaderStyle, fill: { fgColor: { rgb: 'DDEBF7' } } };
    for (let c = 0; c <= 21; c++) {
        const cell4 = XLSX.utils.encode_cell({ r: 3, c });
        const cell5 = XLSX.utils.encode_cell({ r: 4, c });
        if (ws[cell4]) ws[cell4].s = blueHeader;
        if (ws[cell5]) ws[cell5].s = blueHeader;

        // Data styling
        for (let r = 5; r < worksheetData.length; r++) {
            const dataCell = XLSX.utils.encode_cell({ r, c });
            if (ws[dataCell]) ws[dataCell].s = dataCellStyle;
        }
    }

    ws['!cols'] = [{ wch: 5 }, { wch: 25 }, ...Array(20).fill({ wch: 10 })];

    XLSX.utils.book_append_sheet(workbook, ws, "Gepatit A");
    XLSX.writeFile(workbook, `Gepatit_Hisoboti_${date}.xlsx`);
};

// --- GRIPP VA O'RVI EKSPORTI ---
export const exportFluProfessional = (data: any[], date: string, orgName: string = 'Тошкент вилояти') => {
    const workbook = XLSX.utils.book_new();
    const worksheetData: any[][] = [];

    worksheetData.push([`${orgName}  Грипп ва ЎРВИ касалликлари бўйича кунлик МАЪЛУМОТ  ${date} й`]);
    worksheetData.push([]);

    // Headers Row 3
    worksheetData.push([
        "T/p", "Маъмурий ҳудуд", "Муассаса сони", "Бир кунда аниқланган беморлар сони", "", "шу жумладан", "", "", "", "", "", "", "", ""
    ]);

    // Headers Row 4
    worksheetData.push([
        "", "", "", "", "", "ЎРВИ", "", "Грипп", "", "Зотилжам", "", "ЎОРИ", "", "ва бошқалар", ""
    ]);

    // Headers Row 5 (Sub-categories)
    worksheetData.push([
        "", "", "", "4 ёшгач", "катт алар", "4 ёшгач", "катт алар", "4 ёшгач", "катт алар", "4 ёшгач", "катт алар", "4 ёшгач", "катт алар", "4 ёшгач", "катт алар"
    ]);

    // Data Mapping
    data.forEach((row, idx) => {
        // Aggregate 4 yoshgacha: 0-1 + 1-2 + 3-6 (partially or simplified if specific field not available)
        // In the provided entity: ari_0_1, ari_1_2, ari_3_6, ari_7_14, ari_adult
        const ari_u4 = (row.ari_0_1 || 0) + (row.ari_1_2 || 0) + (row.ari_3_6 || 0);
        const flu_u4 = (row.flu_0_1 || 0) + (row.flu_1_2 || 0) + (row.flu_3_6 || 0);
        const pneu_u4 = (row.pneu_0_2 || 0) + (row.pneu_3_6 || 0);
        const sari_u4 = (row.sari_0_2 || 0) + (row.sari_3_6 || 0);

        worksheetData.push([
            idx + 1,
            getNestedValue(row, 'organization.name'),
            row.institution_count ?? 0,
            (ari_u4 + flu_u4 + pneu_u4 + sari_u4), // Jami u4
            ((row.ari_adult || 0) + (row.flu_adult || 0) + (row.pneu_adult || 0) + (row.sari_adult || 0)), // Jami adult
            ari_u4,
            row.ari_adult ?? 0,
            flu_u4,
            row.flu_adult ?? 0,
            pneu_u4,
            row.pneu_adult ?? 0,
            sari_u4,
            row.sari_adult ?? 0,
            0, 0 // Boshqalar (not in entity currently)
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // Title
        { s: { r: 2, c: 0 }, e: { r: 4, c: 0 } }, // T/p
        { s: { r: 2, c: 1 }, e: { r: 4, c: 1 } }, // Hudud
        { s: { r: 2, c: 2 }, e: { r: 4, c: 2 } }, // Muassasa
        { s: { r: 2, c: 3 }, e: { r: 3, c: 4 } }, // Bir kunda aniqlangan
        { s: { r: 2, c: 5 }, e: { r: 2, c: 14 } }, // Shu jumladan
        { s: { r: 3, c: 5 }, e: { r: 3, c: 6 } }, // ORVI
        { s: { r: 3, c: 7 }, e: { r: 3, c: 8 } }, // Gripp
        { s: { r: 3, c: 9 }, e: { r: 3, c: 10 } }, // Zotiljam
        { s: { r: 3, c: 11 }, e: { r: 3, c: 12 } }, // SARI
        { s: { r: 3, c: 13 }, e: { r: 3, c: 14 } }  // Boshqalar
    ];

    // Styling
    const greenHeader = { ...defaultHeaderStyle, fill: { fgColor: { rgb: 'E2EFDA' } } };
    for (let c = 0; c <= 14; c++) {
        [2, 3, 4].forEach(r => {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (ws[addr]) ws[addr].s = greenHeader;
        });
        for (let r = 5; r < worksheetData.length; r++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (ws[addr]) ws[addr].s = dataCellStyle;
        }
    }

    ws['!cols'] = [{ wch: 5 }, { wch: 25 }, ...Array(13).fill({ wch: 10 })];

    XLSX.utils.book_append_sheet(workbook, ws, "Gripp va O'RVI");
    XLSX.writeFile(workbook, `Gripp_O_RVI_Hisoboti_${date}.xlsx`);
};

// --- EPIDEMIOLOGIYA EKSPORTI ---
export const exportEpidemiologyProfessional = (data: any[], date: string, orgName: string = 'Тошкент вилояти') => {
    const workbook = XLSX.utils.book_new();
    const worksheetData: any[][] = [];

    worksheetData.push([`${orgName} Epidemiologiyaga qarshi tadbirlar bo'yicha kunlik ma'lumot`]);
    worksheetData.push([]);

    // Headers Row 3
    worksheetData.push([
        "№", "Hududlar", "Tekshirilgan ob'ektlar", "", "", "", "", "Aniqlangan kamchiliklar", "", "", "", "", "Solingan jarimalar", "", "", "", "", "Ish faoliyati to'xtatilganlar", "", "", "", ""
    ]);

    // Headers Row 4
    worksheetData.push(["", "", "Jami", "Jumladan", "", "", "", "Jami", "Jumladan", "", "", "", "Jami", "Jumladan", "", "", "", "Jami", "Jumladan", "", "", ""]);

    // Headers Row 5
    worksheetData.push(["", "", "", "MTM", "Maktab", "DPM", "Boshqa", "", "MTM", "Maktab", "DPM", "Boshqa", "", "MTM", "Maktab", "DPM", "Boshqa", "", "MTM", "Maktab", "DPM", "Boshqa"]);

    data.forEach((row, idx) => {
        worksheetData.push([
            idx + 1,
            getNestedValue(row, 'organization.name'),
            row.inspected_total ?? 0, row.inspected_mtm ?? 0, row.inspected_school ?? 0, row.inspected_dpm ?? 0, row.inspected_other ?? 0,
            row.defects_total ?? 0, row.defects_mtm ?? 0, row.defects_school ?? 0, row.defects_dpm ?? 0, row.defects_other ?? 0,
            row.fines_total ?? 0, row.fines_mtm ?? 0, row.fines_school ?? 0, row.fines_dpm ?? 0, row.fines_other ?? 0,
            row.suspended_total ?? 0, row.suspended_mtm ?? 0, row.suspended_school ?? 0, row.suspended_dpm ?? 0, row.suspended_other ?? 0
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 21 } },
        { s: { r: 2, c: 0 }, e: { r: 4, c: 0 } }, // No
        { s: { r: 2, c: 1 }, e: { r: 4, c: 1 } }, // Hudud
        { s: { r: 2, c: 2 }, e: { r: 2, c: 6 } }, // Tekshirilgan
        { s: { r: 2, c: 7 }, e: { r: 2, c: 11 } }, // Kamchilik
        { s: { r: 2, c: 12 }, e: { r: 2, c: 16 } }, // Jarimalar
        { s: { r: 2, c: 17 }, e: { r: 2, c: 21 } }, // To'xtatilgan
        // Sub-merges for "Jami"
        { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } },
        { s: { r: 3, c: 7 }, e: { r: 4, c: 7 } },
        { s: { r: 3, c: 12 }, e: { r: 4, c: 12 } },
        { s: { r: 3, c: 17 }, e: { r: 4, c: 17 } },
        // Sub-merges for "Jumladan"
        { s: { r: 3, c: 3 }, e: { r: 3, c: 6 } },
        { s: { r: 3, c: 8 }, e: { r: 3, c: 11 } },
        { s: { r: 3, c: 13 }, e: { r: 3, c: 16 } },
        { s: { r: 3, c: 18 }, e: { r: 3, c: 21 } }
    ];

    // Styling
    const grayHeader = { ...defaultHeaderStyle, fill: { fgColor: { rgb: 'F2F2F2' } } };
    for (let c = 0; c <= 21; c++) {
        [2, 3, 4].forEach(r => {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (ws[addr]) ws[addr].s = grayHeader;
        });
    }

    ws['!cols'] = [{ wch: 5 }, { wch: 25 }, ...Array(20).fill({ wch: 8 })];

    XLSX.utils.book_append_sheet(workbook, ws, "Epidemiologiya");
    XLSX.writeFile(workbook, `Epidemiologiya_Hisoboti_${date}.xlsx`);
};

// --- ARI SHORT EKSPORTI ---
export const exportAriQuickProfessional = (data: any[], date: string, orgName: string = 'Toshkent viloyati') => {
    const workbook = XLSX.utils.book_new();
    const worksheetData: any[][] = [];

    worksheetData.push([`${orgName}  Grippsimon kasalliklar (GK), O'tkir respirator infeksiyalar(O'RI), O'tkir Zotiljam (O'P) bo'yicha kunlik tezkor ma'lumot`]);
    worksheetData.push([]);

    worksheetData.push(["No", "Xududlar", "GK", "O'RI", "O'P"]);

    data.forEach((row, idx) => {
        worksheetData.push([
            idx + 1,
            getNestedValue(row, 'organization.name'),
            row.gk ?? 0,
            row.ari ?? 0,
            row.pneumonia ?? 0
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Styling
    for (let c = 0; c < 5; c++) {
        const addr = XLSX.utils.encode_cell({ r: 2, c });
        if (ws[addr]) ws[addr].s = defaultHeaderStyle;
        for (let r = 3; r < worksheetData.length; r++) {
            const dAddr = XLSX.utils.encode_cell({ r, c });
            if (ws[dAddr]) ws[dAddr].s = dataCellStyle;
        }
    }

    ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];

    XLSX.utils.book_append_sheet(workbook, ws, "ARI Tezkor");
    XLSX.writeFile(workbook, `ARI_Tezkor_Hisoboti_${date}.xlsx`);
};
