import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { Appearance, View } from "react-native";

import {
  defaultThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "@/constants/theme";
import { themeVars } from "@/constants/theme-vars";
import {
  getStoredThemePreference,
  storeThemePreference,
} from "@/lib/theme-storage";

type ThemeContextValue = {
  resolvedTheme: ResolvedTheme;
  setThemePreference: (theme: ThemePreference) => void;
  themePreference: ThemePreference;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { setColorScheme } = useNativeWindColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>(
    defaultThemePreference,
  );
  const [hasLoadedStoredTheme, setHasLoadedStoredTheme] = useState(false);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(
    Appearance.getColorScheme() === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === "dark" ? "dark" : "light");
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    getStoredThemePreference()
      .then(setThemePreference)
      .catch(() => setThemePreference(defaultThemePreference))
      .finally(() => setHasLoadedStoredTheme(true));
  }, []);

  useEffect(() => {
    setColorScheme(themePreference);

    if (hasLoadedStoredTheme) {
      void storeThemePreference(themePreference);
    }
  }, [hasLoadedStoredTheme, setColorScheme, themePreference]);

  const value = useMemo<ThemeContextValue>(() => {
    const resolvedTheme =
      themePreference === "system" ? systemTheme : themePreference;

    return {
      resolvedTheme,
      setThemePreference,
      themePreference,
    };
  }, [systemTheme, themePreference]);

  return (
    <ThemeContext.Provider value={value}>
      <View className="flex-1 bg-background" style={themeVars[value.resolvedTheme]}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}
