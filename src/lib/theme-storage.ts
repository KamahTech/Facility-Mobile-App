import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  defaultThemePreference,
  type ThemePreference,
} from "@/constants/theme";

const themePreferenceStorageKey = "settings.themePreference";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export async function getStoredThemePreference() {
  const storedPreference = await AsyncStorage.getItem(themePreferenceStorageKey);

  if (!isThemePreference(storedPreference)) {
    return defaultThemePreference;
  }

  return storedPreference;
}

export async function storeThemePreference(themePreference: ThemePreference) {
  await AsyncStorage.setItem(themePreferenceStorageKey, themePreference);
}
