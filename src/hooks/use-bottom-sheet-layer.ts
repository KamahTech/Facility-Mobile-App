import React from "react";

import { useBottomSheetStore } from "@/stores/bottom-sheet-store";

export function useBottomSheetLayer(isPresented: boolean) {
  const setBottomSheetOpen = useBottomSheetStore((state) => state.setBottomSheetOpen);

  React.useEffect(() => {
    if (!isPresented) {
      return;
    }

    setBottomSheetOpen(true);

    return () => {
      setBottomSheetOpen(false);
    };
  }, [isPresented, setBottomSheetOpen]);
}
