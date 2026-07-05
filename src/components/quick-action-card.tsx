import React from "react";
import { Pressable } from "react-native";

import { AppIcon } from "@/components/app-icon";
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
      style={{
        backgroundColor: themeColor,
      }}
      className="w-full h-32 rounded-2xl p-4 flex-col justify-center items-center gap-3 active:opacity-75"
    >
      {/* Centered Icon */}
      <AppIcon
        accessibilityLabel={title}
        name={icon}
        size={28}
        color="#FFFFFF"
      />

      {/* Centered Title Text */}
      <AppText
        align="center"
        numberOfLines={2}
        className="text-center text-sm font-bold leading-5 text-white w-full"
      >
        {title}
      </AppText>
    </Pressable>
  );
}
