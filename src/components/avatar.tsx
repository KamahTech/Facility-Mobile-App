import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";

import { AppIcon } from "@/components/app-icon";

type AvatarProps = {
  /** Size of the avatar (width and height). Defaults to 48. */
  size?: number;
  /** Image source for the avatar. If not provided, fallback icon will be shown. */
  source?: string | number | string[] | object;
  /** Additional Tailwind class names for custom styling. */
  className?: string;
};

export function Avatar({ size = 48, source, className = "" }: AvatarProps) {
  const roundedStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View
      style={roundedStyle}
      className={`items-center justify-center overflow-hidden bg-card ${className}`}
    >
      {source ? (
        <Image
          source={source}
          style={roundedStyle}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <AppIcon
          name="profile"
          size={size * 0.6}
          colorToken="--foreground"
        />
      )}
    </View>
  );
}
