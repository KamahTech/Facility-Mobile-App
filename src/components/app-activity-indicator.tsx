import React from "react";
import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";
import { useThemeToken } from "@/hooks/use-theme-token";

type AppActivityIndicatorProps = Omit<ActivityIndicatorProps, "color"> & {
  colorToken?: Parameters<typeof useThemeToken>[0];
  color?: string;
};

/**
 * Reusable ActivityIndicator component that dynamically styles the spinner using the active theme variables.
 * Defaults to the primary color of the app (`--primary`).
 */
export function AppActivityIndicator({
  colorToken = "--primary",
  color,
  ...props
}: AppActivityIndicatorProps) {
  const resolvedColor = useThemeToken(colorToken);

  return (
    <ActivityIndicator
      color={color || (typeof resolvedColor === "string" ? resolvedColor : "#4F46E5")}
      {...props}
    />
  );
}
