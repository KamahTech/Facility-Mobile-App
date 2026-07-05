import React from "react";
import { useSharedValue, useAnimatedScrollHandler, withTiming, type SharedValue } from "react-native-reanimated";

type ScrollAnimationContextType = {
  headerTranslateY: SharedValue<number>;
  tabBarTranslateY: SharedValue<number>;
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  resetScrollAnimation: () => void;
};

const ScrollAnimationContext = React.createContext<ScrollAnimationContextType | undefined>(undefined);

export function ScrollAnimationProvider({ children }: { children: React.ReactNode }) {
  const lastOffset = useSharedValue(0);
  const scrollAccumulator = useSharedValue(0);
  const isHidden = useSharedValue(false);

  const headerTranslateY = useSharedValue(0);
  const tabBarTranslateY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentOffset = event.contentOffset.y;

      // Ignore rubber-band bounce at top
      if (currentOffset < 0) {
        return;
      }

      // Ignore rubber-band bounce at bottom
      const maxScroll = event.contentSize.height - event.layoutMeasurement.height;
      if (currentOffset > maxScroll) {
        return;
      }

      // Force showing when scrolling near top to avoid getting stuck
      if (currentOffset <= 30) {
        if (isHidden.value) {
          isHidden.value = false;
          headerTranslateY.value = withTiming(0, { duration: 180 });
          tabBarTranslateY.value = withTiming(0, { duration: 180 });
        }
        lastOffset.value = currentOffset;
        scrollAccumulator.value = 0;
        return;
      }

      const diff = currentOffset - lastOffset.value;

      // If scroll direction changed, reset the accumulator
      if ((diff > 0 && scrollAccumulator.value < 0) || (diff < 0 && scrollAccumulator.value > 0)) {
        scrollAccumulator.value = 0;
      }

      scrollAccumulator.value += diff;

      // Scroll down: hide after 60px of continuous downward scroll
      if (scrollAccumulator.value > 60 && !isHidden.value) {
        isHidden.value = true;
        headerTranslateY.value = withTiming(-160, { duration: 220 });
        tabBarTranslateY.value = withTiming(160, { duration: 220 });
        scrollAccumulator.value = 0;
      } 
      // Scroll up: show after 30px of continuous upward scroll
      else if (scrollAccumulator.value < -30 && isHidden.value) {
        isHidden.value = false;
        headerTranslateY.value = withTiming(0, { duration: 180 });
        tabBarTranslateY.value = withTiming(0, { duration: 180 });
        scrollAccumulator.value = 0;
      }

      lastOffset.value = currentOffset;
    },
  });

  const resetScrollAnimation = React.useCallback(() => {
    isHidden.value = false;
    lastOffset.value = 0;
    scrollAccumulator.value = 0;
    headerTranslateY.value = 0;
    tabBarTranslateY.value = 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = React.useMemo(() => ({
    headerTranslateY,
    tabBarTranslateY,
    scrollHandler,
    resetScrollAnimation,
  }), [headerTranslateY, tabBarTranslateY, scrollHandler, resetScrollAnimation]);

  return (
    <ScrollAnimationContext.Provider value={value}>
      {children}
    </ScrollAnimationContext.Provider>
  );
}

export function useScrollAnimation() {
  const context = React.useContext(ScrollAnimationContext);
  if (context === undefined) {
    throw new Error("useScrollAnimation must be used within a ScrollAnimationProvider");
  }
  return context;
}
