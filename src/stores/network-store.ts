import { create } from "zustand";

export type NetworkSheetStatus = "idle" | "offline" | "restored";

type NetworkState = {
  isOffline: boolean;
  status: NetworkSheetStatus;
  isSheetVisible: boolean;
  handleNetworkChange: (isOfflineNow: boolean) => void;
  dismissSheet: () => void;
  resetStatus: () => void;
};

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isOffline: false,
  status: "idle",
  isSheetVisible: false,

  handleNetworkChange: (isOfflineNow: boolean) => {
    const currentState = get();

    if (isOfflineNow) {
      set({
        isOffline: true,
        status: "offline",
        isSheetVisible: true,
      });
    } else {
      // If we were offline or sheet was visible, transition to restored
      if (currentState.isOffline || currentState.status === "offline" || currentState.isSheetVisible) {
        set({
          isOffline: false,
          status: "restored",
          isSheetVisible: true,
        });
      } else {
        set({
          isOffline: false,
          status: "idle",
          isSheetVisible: false,
        });
      }
    }
  },

  dismissSheet: () => {
    set({
      isSheetVisible: false,
    });
  },

  resetStatus: () => {
    set({
      status: "idle",
      isSheetVisible: false,
    });
  },
}));
