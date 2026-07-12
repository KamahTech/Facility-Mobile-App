import React from "react";
import { View } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";

type FullScreenLoaderProps = {
  visible?: boolean;
};

export function FullScreenLoader({ visible = true }: FullScreenLoaderProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute top-0 inset-x-0 bottom-0 bg-background/50 z-50 items-center justify-center">
      <AppActivityIndicator size="large"  />
    </View>
  );
}
