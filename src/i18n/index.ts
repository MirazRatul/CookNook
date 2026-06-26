import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import es from './locales/es.json';

const locales = Localization.getLocales();
const deviceLanguage = locales && locales.length > 0 ? locales[0].languageCode ?? 'en' : 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
  });

export default i18n;
