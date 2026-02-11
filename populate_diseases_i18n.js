const fs = require('fs');

const diseases = JSON.parse(fs.readFileSync('d:/323/project_ses/backend/disease_list.json', 'utf8'));

// Manual mapping for some key terms to ensure quality
// Latn -> { cyrl, ru, en, kaa }
const translations = {
    "Ichterlama": { cyrl: "Ичтерлама", ru: "Брюшной тиф", en: "Typhoid fever", kaa: "Ishterleme" },
    "Paratiflar A, B, C (Barchasi)": { cyrl: "Паратифлар А, Б, С (Барчаси)", ru: "Паратифы А, Б, С (Все)", en: "Paratyphoids A, B, C (All)", kaa: "Paratiflar A, B, C" },
    "Boshqa salmonellez infeksiyalari": { cyrl: "Бошқа салмонеллез инфекциялари", ru: "Другие сальмонеллезные инфекции", en: "Other salmonella infections", kaa: "Basqa salmonellez infektsiyaları" },
    "Bakterial ichburug' (shigellez)": { cyrl: "Бактериал ичбуруғ (шигеллез)", ru: "Бактериальная дизентерия (шигеллез)", en: "Bacterial dysentery (shigellosis)", kaa: "Bakterial ishburıw (shigellez)" },
    "O'tkir virusli gepatit (jami)": { cyrl: "Ўткир вирусли гепатит (жами)", ru: "Острый вирусный гепатит (всего)", en: "Acute viral hepatitis (total)", kaa: "Ótkir vıruslı gepatıt (jámi)" },
    "gepatit A": { cyrl: "гепатит А", ru: "гепатит А", en: "Hepatitis A", kaa: "gepatıt A" },
    "Grippga o'xshash kasalliklar": { cyrl: "Гриппга ўхшаш касалликлар", ru: "Гриппоподобные заболевания", en: "Influenza-like illnesses", kaa: "Grippke uqsas kesellikler" },
    "Sil (birinchi marta aniqlangan, barcha formasi)": { cyrl: "Сил (биринчи марта аниқланган, барча формаси)", ru: "Туберкулез (впервые выявленный, все формы)", en: "Tuberculosis (first time, all forms)", kaa: "Sil (birinshi márte anıqlangan, barlıq forması)" },
    "Aniqlangan koronavirus infeksiyasi": { cyrl: "Аниқланган коронавирус инфекцияси", ru: "Выявленная коронавирусная инфекция", en: "Confirmed coronavirus infection", kaa: "Anıqlangan koronavırus infektsiyası" }
};

// Simple auto-converter for the rest (Latn -> Cyrl approximation)
function autoLatnToCyrl(text) {
    const map = {
        'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'E': 'Е', 'Yo': 'Ё', 'J': 'Ж', 'Z': 'З', 'I': 'И', 'Y': 'Й',
        'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'F': 'Ф',
        'Kh': 'Х', 'Ts': 'Ц', 'Ch': 'Ч', 'Sh': 'Ш', 'Shch': 'Щ', 'E': 'Э', 'Yu': 'Ю', 'Ya': 'Я',
        'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е', 'yo': 'ё', 'j': 'ж', 'z': 'з', 'i': 'и', 'y': 'й',
        'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'f': 'ф',
        'kh': 'х', 'ts': 'ц', 'ch': 'ч', 'sh': 'ш', 'shch': 'щ', 'y': 'ы', 'e': 'э', 'yu': 'ю', 'ya': 'я',
        'O\'': 'Ў', 'o\'': 'ў', 'G\'': 'Ғ', 'g\'': 'ғ', 'H': 'Ҳ', 'h': 'ҳ', 'Q': 'Қ', 'q': 'қ'
    };
    return text.split('').map(char => map[char] || char).join('');
}

const finalDiseases = {
    uz_latn: {},
    uz_cyrl: {},
    ru: {},
    kaa: {},
    en: {}
};

diseases.forEach(d => {
    const code = d.code;
    const name = d.name;
    finalDiseases.uz_latn[code] = name;

    if (translations[name]) {
        finalDiseases.uz_cyrl[code] = translations[name].cyrl;
        finalDiseases.ru[code] = translations[name].ru;
        finalDiseases.kaa[code] = translations[name].kaa;
        finalDiseases.en[code] = translations[name].en;
    } else {
        // Fallback to auto-cyrillic for Uzbek Cyrl
        finalDiseases.uz_cyrl[code] = autoLatnToCyrl(name);
        // Fallback to Latin for others if no better manual mapping exists for now
        finalDiseases.ru[code] = name;
        finalDiseases.kaa[code] = name;
        finalDiseases.en[code] = name;
    }
});

// Write to individual files in the locales folder
const baseDir = 'd:/323/project_ses/frontend/src/i18n/locales';

['en', 'kaa', 'ru', 'uz_cyrl', 'uz_latn'].forEach(lang => {
    const filePath = `${baseDir}/${lang}.json`;
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    content.diseases = finalDiseases[lang === 'en' ? 'en' : (lang === 'kaa' ? 'kaa' : (lang === 'ru' ? 'ru' : lang))];
    fs.writeFileSync(filePath, JSON.stringify(content, null, 4), 'utf8');
    console.log(`Updated ${lang}.json`);
});
