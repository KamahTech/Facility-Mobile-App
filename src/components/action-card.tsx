import { Pressable, View, type PressableProps } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import type { AppIconName } from "@/constants/icons";

type ActionCardProps = PressableProps & {
  description: string;
  icon: AppIconName;
  title: string;
};

export function ActionCard({
  description,
  icon,
  title,
  ...props
}: ActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-24 rounded-lg bg-card px-5 py-4 active:opacity-80"
      {...props}
    >
      <AppRow className="items-start gap-3">
        <View className="mt-1 size-9 items-center justify-center rounded-lg bg-secondary">
          <AppIcon
            accessibilityLabel={title}
            name={icon}
            size={22}
          />
        </View>
        <View className="min-w-0 flex-1">
          <AppText className="text-start text-lg font-semibold text-card-foreground">
            {title}
          </AppText>
          <AppText className="mt-1 text-start text-sm leading-5 text-muted-foreground">
            {description}
          </AppText>
        </View>
      </AppRow>
    </Pressable>
  );
}
