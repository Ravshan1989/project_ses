const fs = require('fs');

const diseasesLatn = JSON.parse(fs.readFileSync('d:/323/project_ses/backend/disease_list.json', 'utf8'));

// A simplified mapping for Cyrillic (standard conversion for common terms in medical context)
function toCyrl(text) {
    const map = {
        'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'E': 'Е', 'Yo': 'Ё', 'J': 'Ж', 'Z': 'З', 'I': 'И', 'Y': 'Й',
        'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'F': 'Ф',
        'Kh': 'Х', 'Ts': 'Ц', 'Ch': 'Ч', 'Sh': 'Ш', 'Shch': 'Щ', 'Y': 'Ы', 'E': 'Э', 'Yu': 'Ю', 'Ya': 'Я',
        'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е', 'yo': 'ё', 'j': 'ж', 'z': 'з', 'i': 'и', 'y': 'й',
        'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'f': 'ф',
        'kh': 'х', 'ts': 'ц', 'ch': 'ч', 'sh': 'ш', 'shch': 'щ', 'y': 'ы', 'e': 'э', 'yu': 'ю', 'ya': 'я',
        'O\'': 'Ў', 'o\'': 'ў', 'G\'': 'Ғ', 'g\'': 'ғ', 'H': 'Ҳ', 'h': 'ҳ', 'Q': 'Қ', 'q': 'қ', '\'': 'ъ'
    };
    // Note: This is an approximation. Real translation should use a dictionary for medical terms.
    // However, for the sake of speed and accuracy, I will use a manual dictionary for the key names based on common medical terms in UZ/RU.
    return text; // Placeholder
}

// Since I have 97 diseases, I will generate a script that helps the LLM (me) mapping them.
// I'll manually provide the most important ones and use standard translations for others.

const results = {
    uz_latn: {},
    uz_cyrl: {},
    ru: {},
    kaa: {},
    en: {}
};

diseasesLatn.forEach(d => {
    results.uz_latn[d.code] = d.name;
    // I will populate others in the next step using a more specialized approach or manual mapping for the key ones.
});

console.log(JSON.stringify(results, null, 2));
