const fs = require('fs');

const orgs = JSON.parse(fs.readFileSync('d:/323/project_ses/backend/org_list.json', 'utf8'));

// Latn -> { cyrl, ru, en, kaa }
const orgTranslations = {
    "Angren sh": { cyrl: "Ангрен ш.", ru: "г. Ангрен", en: "Angren city", kaa: "Angren sh." },
    "Bekobod sh": { cyrl: "Бекобод ш.", ru: "г. Бекабад", en: "Bekabad city", kaa: "Bekobod sh." },
    "Bekobod t": { cyrl: "Бекобод т.", ru: "Бекабадский р-н", en: "Bekabad district", kaa: "Bekobod t." },
    "Bo'ka t": { cyrl: "Бўка т.", ru: "Букинский р-н", en: "Buka district", kaa: "Bo'ka t." },
    "Bo'stonliq t": { cyrl: "Бўстонлиқ т.", ru: "Бостанлыкский р-н", en: "Bostanlyk district", kaa: "Bo'stonliq t." },
    "Chinoz t": { cyrl: "Чиноз т.", ru: "Чиназский р-н", en: "Chinaz district", kaa: "Chinoz t." },
    "Chirchiq sh": { cyrl: "Чирчиқ ш.", ru: "г. Чирчик", en: "Chirchik city", kaa: "Chirchiq sh." },
    "Nurafshon sh": { cyrl: "Нурафшон ш.", ru: "г. Нурафшан", en: "Nurafshan city", kaa: "Nurafshon sh." },
    "Ohangaron sh": { cyrl: "Оҳангарон ш.", ru: "г. Ахангаран", en: "Akhangaran city", kaa: "Ohangaron sh." },
    "Ohangaron t": { cyrl: "Оҳангарон т.", ru: "Ахангаранский р-н", en: "Akhangaran district", kaa: "Ohangaron t." },
    "Olmaliq sh": { cyrl: "Олмалиқ ш.", ru: "г. Алмалык", en: "Almalyk city", kaa: "Olmaliq sh." },
    "Oqqo'rg'on t": { cyrl: "Оққўрғон т.", ru: "Аккурганский р-н", en: "Akkurgan district", kaa: "Oqqo'rg'on t." },
    "O'rta Chirchiq t": { cyrl: "Ўрта Чирчиқ т.", ru: "Среднечирчикский р-н", en: "Middle Chirchik district", kaa: "O'rta Chirchiq t." },
    "Parkent t": { cyrl: "Паркент т.", ru: "Паркентский р-н", en: "Parkent district", kaa: "Parkent t." },
    "Piskent t": { cyrl: "Пискент т.", ru: "Пскентский р-н", en: "Pskent district", kaa: "Piskent t." },
    "Qibray t": { cyrl: "Қибрай т.", ru: "Кибрайский р-н", en: "Kibray district", kaa: "Qibray t." },
    "Quyi chirchiq t": { cyrl: "Қуйи Чирчиқ т.", ru: "Нижнечирчикский р-н", en: "Lower Chirchik district", kaa: "Quyi chirchiq t." },
    "Toshkent t": { cyrl: "Тошкент т.", ru: "Ташкентский р-н", en: "Tashkent district", kaa: "Toshkent t." },
    "Yangiyo'l sh": { cyrl: "Янгийўл ш.", ru: "г. Янгиюль", en: "Yangiyul city", kaa: "Yangiyo'l sh." },
    "Yangiyo'l t": { cyrl: "Янгийўл т.", ru: "Янгиюльский р-н", en: "Yangiyul district", kaa: "Yangiyo'l t." },
    "Yuqori Chirchiq t": { cyrl: "Юқори Чирчиқ т.", ru: "Верхнечирчикский р-н", en: "Upper Chirchik district", kaa: "Yuqori Chirchiq t." },
    "Zangiota t": { cyrl: "Зангиота т.", ru: "Зангиатинский р-н", en: "Zangiata district", kaa: "Zangiota t." }
};

const finalOrgs = {
    uz_latn: {},
    uz_cyrl: {},
    ru: {},
    kaa: {},
    en: {}
};

orgs.forEach(o => {
    const name = o.name;
    finalOrgs.uz_latn[name] = name;
    if (orgTranslations[name]) {
        finalOrgs.uz_cyrl[name] = orgTranslations[name].cyrl;
        finalOrgs.ru[name] = orgTranslations[name].ru;
        finalOrgs.kaa[name] = orgTranslations[name].kaa;
        finalOrgs.en[name] = orgTranslations[name].en;
    } else {
        finalOrgs.uz_cyrl[name] = name;
        finalOrgs.ru[name] = name;
        finalOrgs.kaa[name] = name;
        finalOrgs.en[name] = name;
    }
});

const baseDir = 'd:/323/project_ses/frontend/src/i18n/locales';

['en', 'kaa', 'ru', 'uz_cyrl', 'uz_latn'].forEach(lang => {
    const filePath = `${baseDir}/${lang}.json`;
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    content.orgs = finalOrgs[lang === 'en' ? 'en' : (lang === 'kaa' ? 'kaa' : (lang === 'ru' ? 'ru' : lang))];
    fs.writeFileSync(filePath, JSON.stringify(content, null, 4), 'utf8');
    console.log(`Updated orgs in ${lang}.json`);
});
