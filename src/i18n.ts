import i18n from 'i18next';
import {initReactI18next} from "react-i18next";

import en from './locales/en/translation.json'
import es from './locales/es/translation.json'

// Get saved language preference or default to 'en'
const getInitialLanguage = () => {
    const saved = localStorage.getItem('preferredLanguage');
    return (saved === 'en' || saved === 'es') ? saved : 'en';
};

i18n
.use(initReactI18next)
.init({
    resources: {
        en: { translation: en},
        es: {translation: es}
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
})


export default i18n;