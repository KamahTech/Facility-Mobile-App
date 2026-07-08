import React from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type ShimmerPlaceholderProps = {
  className?: string;
  style?: any;
};

/**
 * A reusable Reanimated-powered shimmer placeholder for skeleton loading screens.
 * Animates opacity on the native thread for butter-smooth performance.
 */
export function ShimmerPlaceholder({ className, style }: ShimmerPlaceholderProps) {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.65, { duration: 800 }),
      -1, // Loop infinitely
      true // Reverse direction
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[animatedStyle, style]}
      className={`bg-foreground/10 dark:bg-foreground/5 ${className || ""}`}
    />
  );
}
