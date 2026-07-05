import React from "react";
import { Keyboard } from "react-native";

import { runOnIdle } from "@/lib/idle";

type UseBottomSheetPresentationOptions = {
  delayMs?: number;
  dismissKeyboard?: boolean;
};

export function useBottomSheetPresentation({
  delayMs = 120,
  dismissKeyboard = true,
}: UseBottomSheetPresentationOptions = {}) {
  const [isPresented, setIsPresented] = React.useState(false);
  const openTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionTaskRef = React.useRef<ReturnType<typeof runOnIdle> | null>(null);

  const clearPendingOpen = React.useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }

    interactionTaskRef.current?.cancel();
    interactionTaskRef.current = null;
  }, []);

  React.useEffect(() => clearPendingOpen, [clearPendingOpen]);

  const present = React.useCallback(() => {
    clearPendingOpen();

    if (dismissKeyboard) {
      Keyboard.dismiss();
    }

    interactionTaskRef.current = runOnIdle(() => {
      openTimeoutRef.current = setTimeout(() => {
        setIsPresented(true);
        openTimeoutRef.current = null;
        interactionTaskRef.current = null;
      }, delayMs);
    });
  }, [clearPendingOpen, delayMs, dismissKeyboard]);

  const dismiss = React.useCallback(() => {
    clearPendingOpen();
    setIsPresented(false);
  }, [clearPendingOpen]);

  return {
    isPresented,
    present,
    dismiss,
  };
}
