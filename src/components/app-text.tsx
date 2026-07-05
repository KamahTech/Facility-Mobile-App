import { Text, type TextProps } from "react-native";

import { useI18n } from "@/hooks/use-i18n";
import { getCenteredTextStyle, getDirectionalTextStyle } from "@/lib/i18n-layout";

type AppTextProps = TextProps & {
  align?: "center" | "start";
};

export function AppText({
  align = "start",
  style,
  ...props
}: AppTextProps) {
  const { direction } = useI18n();
  const directionStyle =
    align === "center"
      ? getCenteredTextStyle(direction)
      : getDirectionalTextStyle(direction);

  return (
    <Text
      {...props}
      style={[directionStyle, style]}
    />
  );
}
