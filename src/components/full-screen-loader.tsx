import React from "react";
import { ActivityIndicator, View } from "react-native";

type FullScreenLoaderProps = {
  visible?: boolean;
};

export function FullScreenLoader({ visible = true }: FullScreenLoaderProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute top-0 inset-x-0 bottom-0 bg-background/50 z-50 items-center justify-center">
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
}
