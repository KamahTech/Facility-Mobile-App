import React from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { Avatar } from "@/components/avatar";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";

const logoDark = require("@/assets/app-brand/logo-dark.svg");
const logoLight = require("@/assets/app-brand/logo-light.svg");

type HomeHeaderProps = {
  /** Source for the user avatar image. */
  avatarSource?: string | number | string[] | object;
  /** Callback function when notification button is pressed. */
  onNotificationPress?: () => void;
  /** Callback function when avatar is pressed. */
  onAvatarPress?: () => void;
  /** Callback function when logo is pressed. */
  onLogoPress?: () => void;
};

export function HomeHeader({
  avatarSource,
  onNotificationPress,
  onAvatarPress,
  onLogoPress,
}: HomeHeaderProps) {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();

  // Select the appropriate SVG logo depending on whether the dark or light theme is active
  const logoSource = resolvedTheme === "dark" ? logoDark : logoLight;

  return (
    <AppRow className="w-full items-center justify-between relative">
      {/* Left/Start side: Avatar */}
      <Pressable onPress={onAvatarPress}>
        <Avatar size={40} source={avatarSource} />
      </Pressable>

      {/* Center: App Logo (Dynamic Theme-Based SVG) */}
      <View
        className="absolute inset-x-0 top-0 bottom-0 items-center justify-center"
        pointerEvents="box-none"
      >
        <Pressable onPress={onLogoPress}>
          <Image
            source={logoSource}
            style={{ width: 40, height: 40 }}
            contentFit="contain"
          />
        </Pressable>
      </View>

      {/* Right/End side: Notification Button */}
      <Pressable
        accessibilityLabel={t("notifications.title")}
        onPress={onNotificationPress}
        style={{ width: 44, height: 44 }}
        className="items-center justify-center rounded-full active:opacity-70"
      >
        <AppIcon name="notification" size={28} colorToken="--foreground" />
      </Pressable>
    </AppRow>
  );
}
