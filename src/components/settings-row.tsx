import { TouchableOpacity, View, type TouchableOpacityProps, type ColorValue } from "react-native";

import { AppChevron } from "@/components/app-chevron";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import type { AppIconName } from "@/constants/icons";

type SettingsRowProps = TouchableOpacityProps & {
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
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="mx-5 sm:mx-8 p-4 rounded-2xl bg-card border border-border mb-3 active:opacity-75"
      {...props}
    >
      <AppRow className="items-center justify-between">
        <AppRow className="items-center gap-3 min-w-0 flex-1">
          <View className={`size-9 rounded-xl items-center justify-center ${iconClassName}`}>
            <AppIcon name={icon} size={20} color={accentColor} />
          </View>
          <AppText className={`text-base font-semibold ${titleClassName}`}>
            {title}
          </AppText>
        </AppRow>
        <AppChevron color={chevronColor ?? accentColor} />
      </AppRow>
    </TouchableOpacity>
  );
}
