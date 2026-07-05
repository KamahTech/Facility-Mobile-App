import type { ColorValue } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";

type AppChevronProps = {
  accessibilityLabel?: string;
  color?: ColorValue;
  colorToken?: "--foreground" | "--primary-foreground";
  size?: number;
  type?: "back" | "forward";
};

export function AppChevron({
  accessibilityLabel,
  color,
  colorToken = "--foreground",
  size = 18,
  type = "forward",
}: AppChevronProps) {
  const { isRTL } = useI18n();
  const name =
    type === "back"
      ? isRTL ? "chevronRight" : "chevronLeft"
      : isRTL ? "chevronLeft" : "chevronRight";

  return (
    <AppIcon
      accessibilityLabel={accessibilityLabel}
      color={color}
      colorToken={colorToken}
      name={name}
      size={size}
    />
  );
}
