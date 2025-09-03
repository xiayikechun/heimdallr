import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES, STORAGE_KEYS } from '../utils/constants';

// 导入语言文件
import zhTranslations from './zh.json';
import enTranslations from './en.json';

const resources = {
  zh: {
    translation: zhTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

// 获取保存的语言设置
const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
const defaultLanguage = savedLanguage || LANGUAGES.ZH;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: LANGUAGES.ZH,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;