import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import uzLatn from './locales/uz_latn.json';
import uzCyrl from './locales/uz_cyrl.json';
import ru from './locales/ru.json';
import kaa from './locales/kaa.json';
import en from './locales/en.json';

i18n
    // .use(LanguageDetector) // O'chirib turamiz, Netlify da xato bermasligi uchun
    .use(initReactI18next)
    .init({
        resources: {
            uz_latn: { translation: uzLatn },
            uz_cyrl: { translation: uzCyrl },
            ru: { translation: ru },
            kaa: { translation: kaa },
            en: { translation: en }
        },
        fallbackLng: 'uz_latn',
        interpolation: {
            escapeValue: false // React already escapes by default
        }
    });

export default i18n;
