import { Pressable, View, Text, type PressableProps } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import type { AppIconName } from "@/constants/icons";

type SettingOptionCardProps = PressableProps & {
  description: string;
  icon?: AppIconName;
  iconNode?: React.ReactNode;
  selected: boolean;
  title: string;
};

export function SettingOptionCard({
  description,
  icon,
  iconNode,
  selected,
  title,
  ...props
}: SettingOptionCardProps) {
  const { isRTL } = useI18n();

  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-24 rounded-lg bg-card px-5 py-4 active:opacity-80"
      {...props}
    >
      <AppRow className="items-start gap-3">
        <View className="mt-1 size-9 items-center justify-center rounded-lg bg-secondary">
          {iconNode ? (
            iconNode
          ) : icon ? (
            <AppIcon
              accessibilityLabel={title}
              name={icon}
              size={22}
            />
          ) : null}
        </View>
        <View className="min-w-0 flex-1">
          <Text
            className="text-lg font-semibold text-card-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {title}
          </Text>
          <Text
            className="mt-1 text-sm leading-5 text-muted-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {description}
          </Text>
        </View>
        {selected ? (
          <View className="mt-1 size-8 items-center justify-center rounded-lg bg-primary">
            <AppIcon
              accessibilityLabel={title}
              colorToken="--primary-foreground"
              name="check"
              size={18}
            />
          </View>
        ) : null}
      </AppRow>
    </Pressable>
  );
}
