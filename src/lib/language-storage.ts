import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type LanguagePreference = "system" | "en" | "ar";

const languagePreferenceStorageKey = "settings.languagePreference";

export function isLanguagePreference(value: unknown): value is LanguagePreference {
  return value === "system" || value === "en" || value === "ar";
}

export function getSystemLanguage(): "en" | "ar" {
  try {
    const locale =
      Platform.OS === "web"
        ? navigator.language
        : Intl.DateTimeFormat().resolvedOptions().locale;

    if (locale && locale.toLowerCase().startsWith("ar")) {
      return "ar";
    }
  } catch {
    // Fallback if Intl or navigator is not available
  }
  return "en";
}

export async function getStoredLanguagePreference(): Promise<LanguagePreference> {
  const storedPreference = await AsyncStorage.getItem(languagePreferenceStorageKey);

  if (!isLanguagePreference(storedPreference)) {
    return "system";
  }

  return storedPreference;
}

export async function storeLanguagePreference(languagePreference: LanguagePreference) {
  await AsyncStorage.setItem(languagePreferenceStorageKey, languagePreference);
}
