import React from "react";
import { useFocusEffect, useNavigation } from "expo-router";

import { runOnIdle } from "@/lib/idle";

const DEFAULT_TRANSITION_TIMEOUT_MS = 450;

type ScreenTransitionOptions = {
  fallbackDelayMs?: number;
};

/**
 * A hook that returns true only after the screen's transition animations have finished.
 * This is useful for deferring heavy UI rendering (like loading spinners) to keep transitions smooth.
 */
export function useScreenTransition({
  fallbackDelayMs = DEFAULT_TRANSITION_TIMEOUT_MS,
}: ScreenTransitionOptions = {}) {
  const navigation = useNavigation();
  const [isTransitionFinished, setIsTransitionFinished] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      let interactionDone = false;
      let transitionDone = false;

      setIsTransitionFinished(false);

      const finish = () => {
        if (isActive && interactionDone && transitionDone) {
          setIsTransitionFinished(true);
        }
      };

      const interactionTask = runOnIdle(() => {
        interactionDone = true;
        finish();
      });

      const fallbackTimer = setTimeout(() => {
        transitionDone = true;
        finish();
      }, fallbackDelayMs);

      const unsubscribeTransitionEnd = navigation.addListener(
        "transitionEnd" as never,
        ((event: { data?: { closing?: boolean } }) => {
          if (event.data?.closing) {
            return;
          }

          clearTimeout(fallbackTimer);
          transitionDone = true;
          finish();
        }) as never,
      );

      return () => {
        isActive = false;
        clearTimeout(fallbackTimer);
        interactionTask.cancel();
        unsubscribeTransitionEnd();
      };
    }, [fallbackDelayMs, navigation]),
  );

  return isTransitionFinished;
}

export function useTransitionDelayedLoading(loading: boolean, options?: ScreenTransitionOptions) {
  const isTransitionFinished = useScreenTransition(options);

  return loading && isTransitionFinished;
}
