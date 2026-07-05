import React from "react";
import type {
  ColorValue,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPlatformPressable =
  Animated.createAnimatedComponent(Pressable);

type AnimatedTabBarButtonProps = Omit<
  PressableProps,
  "style"
> & {
  children: React.ReactNode;
  href?: string;
  hoverEffect?: { color?: ColorValue };
  pressColor?: ColorValue;
  pressOpacity?: number;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedTabBarButton({
  android_ripple: _androidRipple,
  hoverEffect: _hoverEffect,
  onPressIn,
  onPressOut,
  pressColor: _pressColor,
  pressOpacity: _pressOpacity,
  style,
  ...props
}: AnimatedTabBarButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPlatformPressable
      {...props}
      onPressIn={(event) => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withTiming(0.96, { duration: 80 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(1, {
          damping: 16,
          mass: 0.6,
          stiffness: 220,
        });
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
