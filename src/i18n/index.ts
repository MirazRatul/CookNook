import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import es from './locales/es.json';
import bn from './locales/bn.json';

const locales = Localization.getLocales();
const deviceLanguage = locales && locales.length > 0 ? locales[0].languageCode ?? 'en' : 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      en: { translation: en },
      es: { translation: es },
      bn: { translation: bn },
    },
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
  });

// Load stored language preference asynchronously
AsyncStorage.getItem('APP_LANGUAGE').then((storedLanguage) => {
  if (storedLanguage) {
    i18n.changeLanguage(storedLanguage);
  }
});

export default i18n;
