"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ArrayTranslationKey,
  LANGUAGE_COOKIE_NAME,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  StringTranslationKey,
  translations,
  type AppLanguage,
} from "@/lib/i18n";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: {
    (key: StringTranslationKey): string;
    (key: ArrayTranslationKey): string[];
  };
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  children: ReactNode;
  initialLanguage: AppLanguage;
};

function persistLanguagePreference(language: AppLanguage) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = language;
}

export default function LanguageProvider({
  children,
  initialLanguage,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (typeof window === "undefined") {
      return initialLanguage;
    }

    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    return savedLanguage ? normalizeLanguage(savedLanguage) : initialLanguage;
  });

  useEffect(() => {
    persistLanguagePreference(language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage: (nextLanguage) => {
        const normalizedLanguage = normalizeLanguage(nextLanguage);

        setLanguageState(normalizedLanguage);
        persistLanguagePreference(normalizedLanguage);
      },
      t: ((key: StringTranslationKey | ArrayTranslationKey) =>
        translations[language][key]) as LanguageContextValue["t"],
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
