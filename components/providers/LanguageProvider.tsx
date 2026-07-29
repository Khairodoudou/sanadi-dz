"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "@/lib/i18n";

interface LanguageContextType {
  lang: Language;
  dir: "ltr" | "rtl";
  changeLanguage: (newLang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Language;
}) {
  const [lang, setLang] = useState<Language>(initialLang);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    setLang(initialLang);
    if (typeof document !== "undefined") {
      document.documentElement.dir = initialLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = initialLang;
    }
  }, [initialLang]);

  const changeLanguage = (newLang: Language) => {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `lang=${newLang};path=/;expires=${expires.toUTCString()};SameSite=Lax`;

    setLang(newLang);
    if (typeof document !== "undefined") {
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLang;
    }
    window.location.reload();
  };

  const t = (key: string): string => {
    const dict = translations[lang] || translations.fr;
    return (dict as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, changeLanguage, t }}>
      <div dir={dir}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
