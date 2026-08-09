import type { NetInfoState } from "@react-native-community/netinfo";

export const NETWORK_RESTORE_DISMISS_DELAY_MS = 2000;

/**
 * Determines whether a given NetInfo state represents an offline state.
 * Offline occurs when `isConnected` is explicitly false or `isInternetReachable` is explicitly false.
 */
export function isOfflineState(state: NetInfoState | null): boolean {
  if (!state) {
    return false;
  }

  if (state.isConnected === false) {
    return true;
  }

  if (state.isConnected === true && state.isInternetReachable === false) {
    return true;
  }

  return false;
}
