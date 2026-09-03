import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useOptions } from "./useOptions";
import { detectBrowserLanguage, TRANSLATIONS, type Language, type TranslationKey } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { options, setOption } = useOptions();
  // Kaydedilmiş özel bir dil yoksa tarayıcı dilini tespit et
  const [lang, setLang] = useState<Language>(options.language || detectBrowserLanguage());

  useEffect(() => {
    if (options.language) {
      setLang(options.language);
    } else {
      setLang(detectBrowserLanguage());
    }
  }, [options.language]);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    setOption("language", newLang);
  };

  const t = (key: TranslationKey): string => {
    const table = TRANSLATIONS[lang] || TRANSLATIONS.tr;
    return table[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: lang, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    const fallbackLang = detectBrowserLanguage();
    return {
      language: fallbackLang,
      setLanguage: () => {},
      t: (key: TranslationKey) => {
        const table = TRANSLATIONS[fallbackLang] || TRANSLATIONS.en;
        return table[key] || TRANSLATIONS.en[key] || key;
      },
    };
  }
  return ctx;
}
