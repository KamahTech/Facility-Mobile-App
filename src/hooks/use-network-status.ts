import { useEffect, useRef } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

import { useNetworkStore } from "@/stores/network-store";
import { isOfflineState, NETWORK_RESTORE_DISMISS_DELAY_MS } from "@/lib/network";

const SLIDE_DOWN_ANIMATION_MS = 350;

export function useNetworkStatus() {
  const isOffline = useNetworkStore((state) => state.isOffline);
  const status = useNetworkStore((state) => state.status);
  const isSheetVisible = useNetworkStore((state) => state.isSheetVisible);
  const handleNetworkChange = useNetworkStore((state) => state.handleNetworkChange);
  const dismissSheet = useNetworkStore((state) => state.dismissSheet);
  const resetStatus = useNetworkStore((state) => state.resetStatus);

  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to network connectivity changes
  useEffect(() => {
    const handleState = (state: NetInfoState) => {
      const offline = isOfflineState(state);
      handleNetworkChange(offline);
    };

    // Initial check
    NetInfo.fetch().then(handleState);

    // Subscribe to ongoing changes
    const unsubscribe = NetInfo.addEventListener(handleState);

    return () => {
      unsubscribe();
    };
  }, [handleNetworkChange]);

  // Handle auto-dismiss and reset timer when connection is restored
  useEffect(() => {
    if (status === "restored") {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      if (unmountTimerRef.current) {
        clearTimeout(unmountTimerRef.current);
      }

      dismissTimerRef.current = setTimeout(() => {
        dismissSheet();
        dismissTimerRef.current = null;

        unmountTimerRef.current = setTimeout(() => {
          resetStatus();
          unmountTimerRef.current = null;
        }, SLIDE_DOWN_ANIMATION_MS);
      }, NETWORK_RESTORE_DISMISS_DELAY_MS);
    } else {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      if (unmountTimerRef.current) {
        clearTimeout(unmountTimerRef.current);
        unmountTimerRef.current = null;
      }
    }

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      if (unmountTimerRef.current) {
        clearTimeout(unmountTimerRef.current);
        unmountTimerRef.current = null;
      }
    };
  }, [status, dismissSheet, resetStatus]);

  return {
    isOffline,
    status,
    isSheetVisible,
    dismissSheet,
  };
}
