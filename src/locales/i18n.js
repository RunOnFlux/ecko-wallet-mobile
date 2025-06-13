import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Yup from 'yup';
import af from './translations/af.json';
import bg from './translations/bg.json';
import bn from './translations/bn.json';
import ca from './translations/ca.json';
import cs from './translations/cs.json';
import de from './translations/de.json';
import el from './translations/el.json';
import en from './translations/en.json';
import es from './translations/es.json';
import fi from './translations/fi.json';
import fil from './translations/fil.json';
import fr from './translations/fr.json';
import hi from './translations/hi.json';
import hr from './translations/hr.json';
import hu from './translations/hu.json';
import id from './translations/id.json';
import it from './translations/it.json';
import ja from './translations/ja.json';
import ko from './translations/ko.json';
import ms from './translations/ms.json';
import nl from './translations/nl.json';
import no from './translations/no.json';
import pl from './translations/pl.json';
import pt from './translations/pt.json';
import ro from './translations/ro.json';
import ru from './translations/ru.json';
import sk from './translations/sk.json';
import sl from './translations/sl.json';
import sv from './translations/sv.json';
import ta from './translations/ta.json';
import th from './translations/th.json';
import uk from './translations/uk.json';
import vi from './translations/vi.json';
import zh from './translations/zh.json';
import zh_TW from './translations/zh_TW.json';

const resources = {
  af: {translation: af},
  bg: {translation: bg},
  bn: {translation: bn},
  ca: {translation: ca},
  cs: {translation: cs},
  de: {translation: de},
  el: {translation: el},
  en: {translation: en},
  es: {translation: es},
  fi: {translation: fi},
  fil: {translation: fil},
  fr: {translation: fr},
  hi: {translation: hi},
  hr: {translation: hr},
  hu: {translation: hu},
  id: {translation: id},
  it: {translation: it},
  ja: {translation: ja},
  ko: {translation: ko},
  ms: {translation: ms},
  nl: {translation: nl},
  no: {translation: no},
  pl: {translation: pl},
  pt: {translation: pt},
  ro: {translation: ro},
  ru: {translation: ru},
  sk: {translation: sk},
  sl: {translation: sl},
  sv: {translation: sv},
  ta: {translation: ta},
  th: {translation: th},
  uk: {translation: uk},
  vi: {translation: vi},
  zh: {translation: zh},
  zh_TW: {translation: zh_TW},
};

const fallbackLng = 'en';

const STORAGE_KEY = 'USER_LANGUAGE';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async callback => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        return callback(saved);
      }
      const locales = RNLocalize.getLocales();
      callback(locales[0]?.languageCode || 'en');
    } catch (e) {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async lang => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  },
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

Yup.setLocale({
  mixed: {
    default: () => i18n.t('validation.default'),
    required: () => i18n.t('validation.required'),
  },
  string: {
    email: () => i18n.t('validation.email'),
    min: ({min}) => i18n.t('validation.min', {count: min}),
    max: ({max}) => i18n.t('validation.max', {count: max}),
    matches: () => i18n.t('validation.matches'),
  },
  number: {
    min: ({min}) => i18n.t('validation.minNumber', {count: min}),
    max: ({max}) => i18n.t('validation.maxNumber', {count: max}),
  },
});

export default i18n;
