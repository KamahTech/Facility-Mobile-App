import { View, type ViewProps } from "react-native";

import { useI18n } from "@/hooks/use-i18n";
import { getDirectionalRowStyle } from "@/lib/i18n-layout";

export function AppRow({
  className = "",
  style,
  ...props
}: ViewProps) {
  const { direction } = useI18n();

  return (
    <View
      {...props}
      className={`flex-row ${className}`}
      style={[getDirectionalRowStyle(direction), style]}
    />
  );
}
