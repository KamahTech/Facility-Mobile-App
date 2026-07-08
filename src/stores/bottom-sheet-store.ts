import { create } from "zustand";

type BottomSheetState = {
  openCount: number;
  isAnyBottomSheetOpen: boolean;
  setBottomSheetOpen: (isOpen: boolean) => void;
};

export const useBottomSheetStore = create<BottomSheetState>((set) => ({
  openCount: 0,
  isAnyBottomSheetOpen: false,
  setBottomSheetOpen: (isOpen) =>
    set((state) => {
      const openCount = Math.max(0, state.openCount + (isOpen ? 1 : -1));

      return {
        openCount,
        isAnyBottomSheetOpen: openCount > 0,
      };
    }),
}));
