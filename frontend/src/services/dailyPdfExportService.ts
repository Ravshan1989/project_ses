import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// UZ: Nested keylardan qiymat olish uchun yordamchi funksiya
const getNestedValue = (obj: any, path: string) => {
    if (!path) return '';
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// --- GEPATIT A PDF EKSPORTI ---
export const exportHepatitisProfessionalPDF = (data: any[], date: string, orgName: string = 'O\'zbekiston Respublikasi') => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(14);
    doc.text(`${orgName}da virusli gepatit A kasalligi bo'yicha kunlik ma'lumoti`, 148, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Sana: ${date}`, 148, 22, { align: 'center' });

    autoTable(doc, {
        head: [
            [
                { content: '№', rowSpan: 2 },
                { content: 'Ma\'muriy hududlar', rowSpan: 2 },
                { content: 'Jami qayd qilingan VG A bemorlar', rowSpan: 2 },
                { content: 'Bemorlarni yoshlari bo\'yicha', colSpan: 6 },
                { content: 'Bemorlarni kasblari bo\'yicha', colSpan: 7 },
                { content: 'Yuqish ehtimoli bo\'lgan omil', colSpan: 3 },
                { content: 'O\'choqlarida ichimlik suvini VG A antigeniga', colSpan: 2 },
                { content: 'Dezinfeksiya o\'tkazilgan o\'choqlar', rowSpan: 2 }
            ],
            [
                '1 yoshgacha', '1-3 yosh', '4-6 yosh', '7-14 yosh', '15-19 yosh', '20 yosh+',
                'U.yasli', 'U-man yasli', 'U.bog\'cha', 'U-man bog\'cha', 'O\'quvchi', 'Talaba', 'Katta',
                'Suv', 'Oziq-ovqat', 'Muloqot',
                'Namuna', 'Musbat'
            ]
        ],
        body: data.map((row, idx) => [
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
        ]),
        startY: 30,
        styles: { fontSize: 6, cellPadding: 1.5, halign: 'center', valign: 'middle', lineWidth: 0.1 },
        headStyles: { fillColor: [22, 119, 255], textColor: 255, fontStyle: 'bold' }
    });

    doc.save(`Gepatit_Hisoboti_${date}.pdf`);
};

// --- GRIPP VA O'RVI PDF EKSPORTI ---
export const exportFluProfessionalPDF = (data: any[], date: string, orgName: string = 'O\'zbekiston Respublikasi') => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(14);
    doc.text(`${orgName} Gripp va O'RVI kasalliklari bo'yicha kunlik MA'LUMOT ${date} y`, 148, 15, { align: 'center' });

    autoTable(doc, {
        head: [
            [
                { content: 'T/p', rowSpan: 3 },
                { content: 'Ma\'muriy hudud', rowSpan: 3 },
                { content: 'Muassasa soni', rowSpan: 3 },
                { content: 'Bir kunda aniqlangan bemorlar soni', colSpan: 2 },
                { content: 'shu jumladan', colSpan: 10 }
            ],
            [
                { content: '', colSpan: 2 },
                { content: 'O\'RVI', colSpan: 2 },
                { content: 'Gripp', colSpan: 2 },
                { content: 'Zotiljam', colSpan: 2 },
                { content: 'SARI', colSpan: 2 },
                { content: 'va boshqalar', colSpan: 2 }
            ],
            [
                '4 yoshgacha', 'kattalar',
                '4 yoshgacha', 'kattalar',
                '4 yoshgacha', 'kattalar',
                '4 yoshgacha', 'kattalar',
                '4 yoshgacha', 'kattalar',
                '4 yoshgacha', 'kattalar'
            ]
        ],
        body: data.map((row, idx) => {
            const ari_u4 = (row.ari_0_1 || 0) + (row.ari_1_2 || 0) + (row.ari_3_6 || 0);
            const flu_u4 = (row.flu_0_1 || 0) + (row.flu_1_2 || 0) + (row.flu_3_6 || 0);
            const pneu_u4 = (row.pneu_0_2 || 0) + (row.pneu_3_6 || 0);
            const sari_u4 = (row.sari_0_2 || 0) + (row.sari_3_6 || 0);
            const total_u4 = ari_u4 + flu_u4 + pneu_u4 + sari_u4;
            const total_adult = (row.ari_adult || 0) + (row.flu_adult || 0) + (row.pneu_adult || 0) + (row.sari_adult || 0);

            return [
                idx + 1,
                getNestedValue(row, 'organization.name'),
                row.institution_count ?? 0,
                total_u4, total_adult,
                ari_u4, row.ari_adult ?? 0,
                flu_u4, row.flu_adult ?? 0,
                pneu_u4, row.pneu_adult ?? 0,
                sari_u4, row.sari_adult ?? 0,
                0, 0
            ];
        }),
        startY: 25,
        styles: { fontSize: 7, cellPadding: 2, halign: 'center', valign: 'middle', lineWidth: 0.1 },
        headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: 'bold' }
    });

    doc.save(`Gripp_O_RVI_Hisoboti_${date}.pdf`);
};

// --- EPIDEMIOLOGIYA PDF EKSPORTI ---
export const exportEpidemiologyProfessionalPDF = (data: any[], date: string, orgName: string = 'O\'zbekiston Respublikasi') => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(14);
    doc.text(`${orgName} Epidemiologiyaga qarshi tadbirlar bo'yicha kunlik ma'lumot`, 148, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Sana: ${date}`, 148, 22, { align: 'center' });

    autoTable(doc, {
        head: [
            [
                { content: '№', rowSpan: 3 },
                { content: 'Hududlar', rowSpan: 3 },
                { content: 'Tekshirilgan ob\'ektlar', colSpan: 5 },
                { content: 'Aniqlangan kamchiliklar', colSpan: 5 },
                { content: 'Solingan jarimalar', colSpan: 5 },
                { content: 'Ish faoliyati to\'xtatilganlar', colSpan: 5 }
            ],
            [
                { content: 'Jami', rowSpan: 2 }, { content: 'Jumladan', colSpan: 4 },
                { content: 'Jami', rowSpan: 2 }, { content: 'Jumladan', colSpan: 4 },
                { content: 'Jami', rowSpan: 2 }, { content: 'Jumladan', colSpan: 4 },
                { content: 'Jami', rowSpan: 2 }, { content: 'Jumladan', colSpan: 4 }
            ],
            [
                'MTM', 'Maktab', 'DPM', 'Boshqa',
                'MTM', 'Maktab', 'DPM', 'Boshqa',
                'MTM', 'Maktab', 'DPM', 'Boshqa',
                'MTM', 'Maktab', 'DPM', 'Boshqa'
            ]
        ],
        body: data.map((row, idx) => [
            idx + 1,
            getNestedValue(row, 'organization.name'),
            row.inspected_total ?? 0, row.inspected_mtm ?? 0, row.inspected_school ?? 0, row.inspected_dpm ?? 0, row.inspected_other ?? 0,
            row.defects_total ?? 0, row.defects_mtm ?? 0, row.defects_school ?? 0, row.defects_dpm ?? 0, row.defects_other ?? 0,
            row.fines_total ?? 0, row.fines_mtm ?? 0, row.fines_school ?? 0, row.fines_dpm ?? 0, row.fines_other ?? 0,
            row.suspended_total ?? 0, row.suspended_mtm ?? 0, row.suspended_school ?? 0, row.suspended_dpm ?? 0, row.suspended_other ?? 0
        ]),
        startY: 30,
        styles: { fontSize: 6, cellPadding: 1, halign: 'center', valign: 'middle', lineWidth: 0.1 },
        headStyles: { fillColor: [100, 100, 100], textColor: 255, fontStyle: 'bold' }
    });

    doc.save(`Epidemiologiya_Hisoboti_${date}.pdf`);
};

// --- ARI QUICK PDF EKSPORTI ---
export const exportAriQuickProfessionalPDF = (data: any[], date: string, orgName: string = 'O\'zbekiston Respublikasi') => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(12);
    doc.text(`${orgName} Grippsimon kasalliklar (GK), O'tkir respirator infeksiyalar (O'RI), O'tkir Zotiljam (O'P) bo'yicha kunlik tezkor ma'lumot`, 148, 15, { align: 'center', maxWidth: 220 });

    autoTable(doc, {
        head: [['№', 'Xududlar', 'GK', 'O\'RI', 'O\'P']],
        body: data.map((row, idx) => [
            idx + 1,
            getNestedValue(row, 'organization.name'),
            row.gk ?? 0,
            row.ari ?? 0,
            row.pneumonia ?? 0
        ]),
        startY: 25,
        styles: { fontSize: 10, cellPadding: 3, halign: 'center', valign: 'middle', lineWidth: 0.1 },
        headStyles: { fillColor: [60, 60, 60], textColor: 255, fontStyle: 'bold' }
    });

    doc.save(`ARI_Tezkor_Hisoboti_${date}.pdf`);
};
