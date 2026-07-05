import type { ColorValue } from "react-native";

import { themeTokens } from "@/constants/theme-vars";
import { useTheme } from "@/hooks/use-theme";

type ThemeTokenName = keyof typeof themeTokens.light;

export function useThemeToken(tokenName: ThemeTokenName): ColorValue {
  const { resolvedTheme } = useTheme();

  return themeTokens[resolvedTheme][tokenName];
}
