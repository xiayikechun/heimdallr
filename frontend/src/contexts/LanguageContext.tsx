import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, STORAGE_KEYS } from '../utils/constants';

type Language = typeof LANGUAGES[keyof typeof LANGUAGES];

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  availableLanguages: { value: Language; label: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n, t } = useTranslation();
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
    return saved && Object.values(LANGUAGES).includes(saved) ? saved : LANGUAGES.ZH;
  });

  const availableLanguages = [
    { value: LANGUAGES.ZH, label: t('language.zh') },
    { value: LANGUAGES.EN, label: t('language.en') },
  ];

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [i18n, language]);

  const value = {
    language,
    setLanguage,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}