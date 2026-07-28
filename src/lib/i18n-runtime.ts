import {
  translations,
  type TranslationKey,
} from "@/constants/translations";
import type { LanguageCode } from "@/constants/languages";

let runtimeLanguage: LanguageCode = "en";

export function setRuntimeLanguage(language: LanguageCode) {
  runtimeLanguage = language;
}

export function translateRuntime(key: TranslationKey) {
  return translations[runtimeLanguage][key] || key;
}
