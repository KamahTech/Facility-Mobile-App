import React from "react";
import { Pressable, View, Text } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import type { QuickActionIconName } from "@/constants/quick-actions";

type QuickActionCardProps = {
  icon: QuickActionIconName;
  title: string;
  themeColor: string;
  onPress: () => void;
  showArrow?: boolean;
};

export function QuickActionCard({
  icon,
  title,
  themeColor,
  onPress,
  showArrow = false,
}: QuickActionCardProps) {
  const { isRTL } = useI18n();

  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      className="w-full py-5 px-4 rounded-2xl bg-card active:opacity-85 shadow-xs"
    >
      <View className="flex-row items-center gap-3">
        <View
          style={{ backgroundColor: themeColor + "15" }}
          className="w-10 h-10 rounded-xl items-center justify-center shrink-0"
        >
          <AppIcon
            accessibilityLabel={title}
            name={icon}
            size={20}
            color={themeColor}
          />
        </View>

        <View className="flex-row flex-1">
          <Text
            numberOfLines={2}
            className="w-full  text-foreground text-xs font-bold leading-tight flex-1"
            style={{
              writingDirection: isRTL ? "rtl" : "ltr",
            }}
          >
            {title}
          </Text>
        </View>

        {showArrow && (
          <AppIcon
            name={isRTL ? "chevronLeft" : "chevronRight"}
            size={18}
            colorToken="--muted-foreground"
          />
        )}
      </View>
    </Pressable>
  );
}
