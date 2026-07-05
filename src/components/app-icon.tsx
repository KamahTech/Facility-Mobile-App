import React from "react";
import type { ColorValue } from "react-native";
import { SymbolView, type SymbolViewProps } from "expo-symbols";

import { appIcons, type AppIconName } from "@/constants/icons";
import { useThemeToken } from "@/hooks/use-theme-token";

import { themeTokens } from "@/constants/theme-vars";

type ThemeTokenName = keyof typeof themeTokens.light;

type AppIconProps = Omit<SymbolViewProps, "name"> & {
  name: AppIconName;
  color?: ColorValue;
  colorToken?: ThemeTokenName;
};

function AppIconComponent({
  name,
  color,
  colorToken = "--foreground",
  tintColor,
  size,
  ...props
}: AppIconProps) {
  const tokenColor = useThemeToken(colorToken);
  const icon = appIcons[name];

  return (
    <SymbolView
      name={{
        ios: icon.ios,
        android: icon.android,
      }}
      size={size}
      tintColor={color ?? tintColor ?? tokenColor}
      {...props}
    />
  );
}

export const AppIcon = React.memo(AppIconComponent, (prevProps, nextProps) => {
  return (
    prevProps.name === nextProps.name &&
    prevProps.color === nextProps.color &&
    prevProps.tintColor === nextProps.tintColor &&
    prevProps.colorToken === nextProps.colorToken &&
    prevProps.size === nextProps.size &&
    prevProps.accessibilityLabel === nextProps.accessibilityLabel
  );
});
