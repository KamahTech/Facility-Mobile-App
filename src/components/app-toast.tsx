import React from "react";
import { View, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useToastStore } from "@/stores/toast-store";

export function AppToast() {
  const { message, type, visible, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 250 });

      const timer = setTimeout(() => {
        hideToast();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-120, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, hideToast, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!message && !visible) {
    return null;
  }

  const toastWidth = Math.min(width * 0.9, 450);
  const leftPosition = (width - toastWidth) / 2;

  const bgClass =
    type === "error"
      ? "bg-rose-600 border border-rose-500"
      : type === "success"
      ? "bg-emerald-600 border border-emerald-500"
      : "bg-zinc-800 border border-zinc-700";

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        animatedStyle,
        {
          position: "absolute",
          top: insets.top + 8,
          left: leftPosition,
          width: toastWidth,
          height: "auto",
          zIndex: 99999,
          elevation: 100,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
        },
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Pressable
        onPress={hideToast}
        className={`w-full flex-row items-center gap-3 px-4 py-3.5 rounded-2xl ${bgClass} active:opacity-90`}
      >
        <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center shrink-0">
          <AppIcon
            name={type === "error" ? "feedback" : type === "success" ? "check" : "facility"}
            size={14}
            color="#FFFFFF"
          />
        </View>

        <AppText
          className="text-white text-sm font-bold leading-tight flex-1 text-start"
          numberOfLines={3}
        >
          {message}
        </AppText>

        <View className="w-5 h-5 items-center justify-center opacity-60 active:opacity-100 shrink-0">
          <AppIcon name="close" size={12} color="#FFFFFF" />
        </View>
      </Pressable>
    </Animated.View>
  );
}
