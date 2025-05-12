import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import en from './translations/en.json';
import it from './translations/it.json';

const resources = {
  en: {translation: en},
  // es: {translation: es},
  it: {translation: it},
};

const fallbackLng = 'it';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: callback => {
    const locales = RNLocalize.getLocales();
    callback(locales[0]?.languageCode || fallbackLng);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
