import type { AppIconName } from "@/constants/icons";
import type { TranslationKey } from "@/constants/translations";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export type ThemeOption = {
  descriptionKey: TranslationKey;
  icon: AppIconName;
  labelKey: TranslationKey;
  value: ThemePreference;
};

export const defaultThemePreference: ThemePreference = "system";

export const themeOptions: ThemeOption[] = [
  {
    descriptionKey: "theme.systemDescription",
    icon: "themeSystem",
    labelKey: "theme.system",
    value: "system",
  },
  {
    descriptionKey: "theme.lightDescription",
    icon: "themeLight",
    labelKey: "theme.light",
    value: "light",
  },
  {
    descriptionKey: "theme.darkDescription",
    icon: "themeDark",
    labelKey: "theme.dark",
    value: "dark",
  },
];
