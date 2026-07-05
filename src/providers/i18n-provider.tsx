import React, { createContext, useEffect, useMemo, useState } from "react";
import { DevSettings, I18nManager, Platform } from "react-native";
import * as Updates from "expo-updates";

import { languages, type LanguageCode } from "@/constants/languages";
import { translations, type TranslationKey } from "@/constants/translations";
import {
  getStoredLanguagePreference,
  storeLanguagePreference,
  getSystemLanguage,
  type LanguagePreference,
} from "@/lib/language-storage";
import { setApiLanguage } from "@/lib/api-client";

type I18nContextValue = {
  direction: (typeof languages)[LanguageCode]["direction"];
  isRTL: boolean;
  language: LanguageCode;
  languagePreference: LanguagePreference;
  setLanguagePreference: (pref: LanguagePreference) => void;
  t: (key: TranslationKey) => string;
  toggleLanguage: () => void;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: React.ReactNode;
};

async function reloadAppForDirectionChange() {
  if (__DEV__) {
    DevSettings.reload();
    return;
  }

  try {
    await Updates.reloadAsync();
  } catch (error) {
    console.error("Failed to reload app after RTL direction change", error);
    DevSettings.reload();
  }
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference>("system");
  const [hasLoadedStoredLanguage, setHasLoadedStoredLanguage] = useState(false);

  useEffect(() => {
    getStoredLanguagePreference()
      .then(setLanguagePreference)
      .catch(() => setLanguagePreference("system"))
      .finally(() => setHasLoadedStoredLanguage(true));
  }, []);

  useEffect(() => {
    if (hasLoadedStoredLanguage) {
      void storeLanguagePreference(languagePreference);
    }
  }, [hasLoadedStoredLanguage, languagePreference]);

  const resolvedLanguage: LanguageCode = useMemo(() => {
    return languagePreference === "system" ? getSystemLanguage() : languagePreference;
  }, [languagePreference]);

  useEffect(() => {
    setApiLanguage(resolvedLanguage);
  }, [resolvedLanguage]);

  // Synchronize dynamic language changes with the React Native native I18nManager
  useEffect(() => {
    // Only check and sync after AsyncStorage loading completes to prevent reload loop
    if (!hasLoadedStoredLanguage) return;

    const isRTL = resolvedLanguage === "ar";
    I18nManager.allowRTL(true);
    I18nManager.swapLeftAndRightInRTL(true);

    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.dir = languages[resolvedLanguage].direction;
      document.documentElement.lang = resolvedLanguage;
    }

    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);

      // Native RTL changes take effect only after the app reloads.
      setTimeout(() => {
        void reloadAppForDirectionChange();
      }, 100);
    }
  }, [resolvedLanguage, hasLoadedStoredLanguage]);

  const value = useMemo<I18nContextValue>(() => {
    const nextLanguage: LanguageCode = resolvedLanguage === "en" ? "ar" : "en";
    const direction = languages[resolvedLanguage].direction;

    return {
      direction,
      isRTL: direction === "rtl",
      language: resolvedLanguage,
      languagePreference,
      setLanguagePreference,
      t: (key) => {
        const trans = translations[resolvedLanguage];
        return (trans && trans[key]) || key;
      },
      toggleLanguage: () => {
        setLanguagePreference(nextLanguage);
      },
    };
  }, [resolvedLanguage, languagePreference]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
