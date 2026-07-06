import React from "react";
import { Pressable, View } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import type { QuickActionIconName } from "@/constants/quick-actions";

type QuickActionCardProps = {
  icon: QuickActionIconName;
  title: string;
  themeColor: string;
  onPress: () => void;
};

export function QuickActionCard({
  icon,
  title,
  themeColor,
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      className="w-full py-5 px-4 rounded-2xl bg-card active:opacity-85 shadow-xs"
    >
      <AppRow className="items-center gap-3">
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

        <AppText
          align="start"
          numberOfLines={2}
          className="text-foreground text-xs font-bold leading-tight flex-1 text-start"
        >
          {title}
        </AppText>
      </AppRow>
    </Pressable>
  );
}
