import { Pressable, View, Text, type ColorValue, type PressableProps } from "react-native";

import { AppChevron } from "@/components/app-chevron";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import type { AppIconName } from "@/constants/icons";

type SettingsRowProps = PressableProps & {
  accentColor?: string;
  chevronColor?: ColorValue;
  icon: AppIconName;
  iconClassName: string;
  title: string;
  titleClassName?: string;
};

export function SettingsRow({
  accentColor,
  chevronColor,
  icon,
  iconClassName,
  title,
  titleClassName = "text-foreground",
  ...props
}: SettingsRowProps) {
  const { isRTL } = useI18n();

  return (
    <Pressable
      className="mx-5 sm:mx-8 p-4 rounded-2xl bg-card mb-3 active:opacity-75"
      {...props}
    >
      <AppRow className="items-center justify-between">
        <AppRow className="items-center gap-3 min-w-0 flex-1">
          <View className={`size-9 rounded-xl items-center justify-center ${iconClassName}`}>
            <AppIcon name={icon} size={20} color={accentColor} />
          </View>
          <Text
            className={`text-base font-semibold ${titleClassName}`}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {title}
          </Text>
        </AppRow>
        <AppChevron color={chevronColor ?? accentColor} />
      </AppRow>
    </Pressable>
  );
}
