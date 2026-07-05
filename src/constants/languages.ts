export const languages = {
  en: {
    code: "en",
    label: "English",
    nativeLabel: "English",
    direction: "ltr",
  },
  ar: {
    code: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    direction: "rtl",
  },
} as const;

export type LanguageCode = keyof typeof languages;
export type LanguageDirection = (typeof languages)[LanguageCode]["direction"];
