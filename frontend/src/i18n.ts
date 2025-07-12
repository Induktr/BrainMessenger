import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from '../public/locales/en/translation.json';
import uaTranslation from '../public/locales/ua/translation.json';
import ruTranslation from '../public/locales/ru/translation.json';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ua: {
        translation: uaTranslation,
      },
      ru: {
        translation: ruTranslation,
      },
    },
    lng: 'en', // default language
    fallbackLng: 'en', // fallback language if translation is not found
    interpolation: {
      escapeValue: false, // react already escapes by default
    },
  });

export default i18n;