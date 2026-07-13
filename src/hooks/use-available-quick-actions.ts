import React from "react";

import { quickActions } from "@/constants/quick-actions";
import { useUnitStore } from "@/stores/unit-store";

export function useAvailableQuickActions() {
  const { units } = useUnitStore({ enableUnits: true });
  const hasOwnerUnit = units.some((unit) => unit.ownershipType === "owner");

  return React.useMemo(
    () => quickActions.filter((action) => !action.ownerOnly || hasOwnerUnit),
    [hasOwnerUnit],
  );
}
