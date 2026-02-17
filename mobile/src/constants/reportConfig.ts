// REPORT_CONFIG sharing between entry and detail screens
export interface FieldDef {
    key: string;
    label: string;
    placeholder?: string;
}

export interface SectionDef {
    title: string;
    fields: FieldDef[];
}

export const REPORT_CONFIG: Record<string, SectionDef[]> = {
    flu: [
        {
            title: "Muassasalar",
            fields: [{ key: 'institution_count', label: "Muassasa soni", placeholder: '0' }]
        },
        {
            title: "O'RI (ARI)",
            fields: [
                { key: 'ari_total', label: "Jami O'RI", placeholder: '0' },
                { key: 'ari_0_1', label: "0-1 yosh", placeholder: '0' },
                { key: 'ari_1_2', label: "1-2 yosh", placeholder: '0' },
                { key: 'ari_3_6', label: "3-6 yosh", placeholder: '0' },
                { key: 'ari_7_14', label: "7-14 yosh", placeholder: '0' },
                { key: 'ari_adult', label: "Kattalar", placeholder: '0' },
                { key: 'ari_students', label: "O'quvchilar", placeholder: '0' },
                { key: 'ari_nursery', label: "Bog'cha yoshidagilar", placeholder: '0' },
            ]
        },
        {
            title: "O'tkir zotiljam (Pneumonia)",
            fields: [
                { key: 'pneu_total', label: "Jami Zotiljam", placeholder: '0' },
                { key: 'pneu_0_2', label: "0-2 yosh", placeholder: '0' },
                { key: 'pneu_3_6', label: "3-6 yosh", placeholder: '0' },
                { key: 'pneu_7_14', label: "7-14 yosh", placeholder: '0' },
                { key: 'pneu_adult', label: "Kattalar", placeholder: '0' },
                { key: 'pneu_students', label: "O'quvchilar", placeholder: '0' },
                { key: 'pneu_nursery', label: "Bog'cha yoshidagilar", placeholder: '0' },
            ]
        },
        {
            title: "Gripp (Flu)",
            fields: [
                { key: 'flu_total', label: "Jami Gripp", placeholder: '0' },
                { key: 'flu_0_1', label: "0-1 yosh", placeholder: '0' },
                { key: 'flu_1_2', label: "1-2 yosh", placeholder: '0' },
                { key: 'flu_3_6', label: "3-6 yosh", placeholder: '0' },
                { key: 'flu_7_14', label: "7-14 yosh", placeholder: '0' },
                { key: 'flu_adult', label: "Kattalar", placeholder: '0' },
                { key: 'flu_students', label: "O'quvchilar", placeholder: '0' },
                { key: 'flu_nursery', label: "Bog'cha yoshidagilar", placeholder: '0' },
            ]
        },
        {
            title: "Og'ir o'tkir respirator infeksiya (SARI)",
            fields: [
                { key: 'sari_total', label: "Jami SARI", placeholder: '0' },
                { key: 'sari_0_2', label: "0-2 yosh", placeholder: '0' },
                { key: 'sari_3_6', label: "3-6 yosh", placeholder: '0' },
                { key: 'sari_7_14', label: "7-14 yosh", placeholder: '0' },
                { key: 'sari_adult', label: "Kattalar", placeholder: '0' },
            ]
        },
        {
            title: "Vafot etganlar",
            fields: [
                { key: 'death_total', label: "Jami vafot", placeholder: '0' },
                { key: 'death_pregnant', label: "Homiladorlar", placeholder: '0' },
            ]
        }
    ],
    ari: [
        {
            title: "Asosiy Ko'rsatkichlar",
            fields: [
                { key: 'ari', label: "O'RVI (ARI)", placeholder: '0' },
                { key: 'pneumonia', label: "Zotiljam (Pneumonia)", placeholder: '0' },
                { key: 'gk', label: "Grippga o'xshash (GK)", placeholder: '0' },
            ]
        }
    ],
    covid: [
        {
            title: "Asosiy Ko'rsatkichlar",
            fields: [
                { key: 'total_cases', label: "Jami holatlar", placeholder: '0' },
                { key: 'reinfected', label: "Qayta kasallanganlar", placeholder: '0' },
                { key: 'vaccinated_infected', label: "Emlanganlar orasida", placeholder: '0' },
            ]
        },
        {
            title: "Yosh Kesimi",
            fields: [
                { key: 'age_0_1', label: "0-1 yosh", placeholder: '0' },
                { key: 'age_1_3', label: "1-3 yosh", placeholder: '0' },
                { key: 'age_4_6', label: "4-6 yosh", placeholder: '0' },
                { key: 'age_7_14', label: "7-14 yosh", placeholder: '0' },
                { key: 'age_15_19', label: "15-19 yosh", placeholder: '0' },
                { key: 'age_20_29', label: "20-29 yosh", placeholder: '0' },
                { key: 'age_30_39', label: "30-39 yosh", placeholder: '0' },
                { key: 'age_40_49', label: "40-49 yosh", placeholder: '0' },
                { key: 'age_50_59', label: "50-59 yosh", placeholder: '0' },
                { key: 'age_60_plus', label: "60 yoshdan yuqori", placeholder: '0' },
            ]
        },
        {
            title: "Ijtimoiy Guruhlar",
            fields: [
                { key: 'pre_school_organized', label: "Bog'cha (Uyushgan)", placeholder: '0' },
                { key: 'pre_school_unorganized', label: "Bog'cha (Uyushmagan)", placeholder: '0' },
                { key: 'students', label: "O'quvchilar", placeholder: '0' },
                { key: 'medical_workers', label: "Tibbiyot xodimlari", placeholder: '0' },
                { key: 'teachers', label: "O'qituvchilar", placeholder: '0' },
                { key: 'others', label: "Boshqalar", placeholder: '0' },
            ]
        },
        {
            title: "Gospitalizatsiya",
            fields: [
                { key: 'hospitalized_count', label: "Shifoxonaga yotqizilgan", placeholder: '0' },
            ]
        }
    ],
    hepatitis: [
        {
            title: "Umumiy",
            fields: [
                { key: 'total_cases', label: "Jami Aniqlanganlar", placeholder: '0' },
                { key: 'lab_samples', label: "Lab.ga olingan namunalar", placeholder: '0' },
                { key: 'lab_positive', label: "Lab. musbat natijalar", placeholder: '0' },
                { key: 'disinfection_done', label: "Dezinfeksiya o'tkazildi", placeholder: '0' },
            ]
        },
        {
            title: "Yoshlar Kesimi",
            fields: [
                { key: 'age_under_1', label: "1 yoshgacha", placeholder: '0' },
                { key: 'age_1_3', label: "1-3 yosh", placeholder: '0' },
                { key: 'age_4_6', label: "4-6 yosh", placeholder: '0' },
                { key: 'age_7_14', label: "7-14 yosh", placeholder: '0' },
                { key: 'age_15_19', label: "15-19 yosh", placeholder: '0' },
                { key: 'age_20_plus', label: "20 yoshdan katta", placeholder: '0' },
            ]
        },
        {
            title: "Aholi Guruhi / Kasbi",
            fields: [
                { key: 'occ_unorganized', label: "Uyushmagan", placeholder: '0' },
                { key: 'occ_unorganized_1_6', label: "Uyushmagan (1-6 yosh)", placeholder: '0' },
                { key: 'occ_organized_1_6', label: "Bog'cha (Uyushgan)", placeholder: '0' },
                { key: 'occ_unorganized_school_age', label: "Uyushmagan (Maktab yosh)", placeholder: '0' },
                { key: 'occ_students', label: "Maktab O'quvchilari", placeholder: '0' },
                { key: 'occ_college_students', label: "Talabalar", placeholder: '0' },
                { key: 'occ_workers', label: "Ishchi / Xizmatchi", placeholder: '0' },
            ]
        },
        {
            title: "Yuqish Omili",
            fields: [
                { key: 'factor_water', label: "Suv orqali", placeholder: '0' },
                { key: 'factor_food', label: "Oziq-ovqat orqali", placeholder: '0' },
                { key: 'factor_contact', label: "Muloqot orqali", placeholder: '0' },
            ]
        }
    ],
    epidemiology: [
        {
            title: "Tekshirilgan Ob'ektlar",
            fields: [
                { key: 'inspected_total', label: "Jami", placeholder: '0' },
                { key: 'inspected_mtm', label: "Bog'chalar (MTM)", placeholder: '0' },
                { key: 'inspected_school', label: "Maktablar", placeholder: '0' },
                { key: 'inspected_dpm', label: "Shifoxonalar (DPM)", placeholder: '0' },
                { key: 'inspected_other', label: "Boshqa ob'ektlar", placeholder: '0' },
            ]
        },
        {
            title: "Aniqlangan Kamchiliklar",
            fields: [
                { key: 'defects_total', label: "Jami", placeholder: '0' },
                { key: 'defects_mtm', label: "MTM", placeholder: '0' },
                { key: 'defects_school', label: "Maktablar", placeholder: '0' },
                { key: 'defects_dpm', label: "DPM", placeholder: '0' },
                { key: 'defects_other', label: "Boshqa", placeholder: '0' },
            ]
        },
        {
            title: "Choralar",
            fields: [
                { key: 'fines_total', label: "Jarima (Jami)", placeholder: '0' },
                { key: 'fines_mtm', label: "MTM (Jarima)", placeholder: '0' },
                { key: 'fines_school', label: "Maktablar (Jarima)", placeholder: '0' },
                { key: 'fines_dpm', label: "DPM (Jarima)", placeholder: '0' },
                { key: 'fines_other', label: "Boshqa (Jarima)", placeholder: '0' },
                { key: 'suspended_total', label: "Ish to'xtatilgan (Jami)", placeholder: '0' },
                { key: 'suspended_mtm', label: "MTM (Ish to'xtatildi)", placeholder: '0' },
                { key: 'suspended_school', label: "Maktablar (Ish to'xtatildi)", placeholder: '0' },
                { key: 'suspended_dpm', label: "DPM (Ish to'xtatildi)", placeholder: '0' },
                { key: 'suspended_other', label: "Boshqa (Ish to'xtatildi)", placeholder: '0' },
            ]
        }
    ],
    diarrhea: [
        {
            title: "Umumiy",
            fields: [
                { key: 'total_cases', label: "Jami Diareya", placeholder: '0' },
                { key: 'hospitalized', label: "Shifoxonaga yotqizildi", placeholder: '0' },
            ]
        },
        {
            title: "Yoshlar Kesimi",
            fields: [
                { key: 'age_under_1', label: "1 yoshgacha", placeholder: '0' },
                { key: 'age_1_14', label: "1-14 yosh", placeholder: '0' },
                { key: 'age_15_plus', label: "15 yoshdan katta", placeholder: '0' },
            ]
        },
        {
            title: "Aholi Guruhi",
            fields: [
                { key: 'occ_organized', label: "Bog'cha/Maktab", placeholder: '0' },
                { key: 'occ_unorganized', label: "Uyushmagan", placeholder: '0' },
                { key: 'occ_student', label: "Talabalar", placeholder: '0' },
                { key: 'occ_others', label: "Boshqalar", placeholder: '0' },
            ]
        },
        {
            title: "Laboratoriya",
            fields: [
                { key: 'lab_examined', label: "Tekshirildi", placeholder: '0' },
                { key: 'lab_positive', label: "Musbat natija", placeholder: '0' },
            ]
        }
    ]
};

// Helper function to get label for a key
export const getFieldLabel = (type: string, key: string): string => {
    const config = REPORT_CONFIG[type];
    if (!config) return key;
    for (const section of config) {
        const field = section.fields.find(f => f.key === key);
        if (field) return field.label;
    }
    return key;
};
