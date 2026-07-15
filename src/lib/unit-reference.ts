import type { ConnectedUnit } from "@/stores/unit-store";

export type ConnectedUnitReference =
  | { unitId: number | string; mobileUnitLinkId?: never }
  | { unitId?: never; mobileUnitLinkId: number | string };

function normalizeUnitReferenceId(value: string): number | string {
  const numericValue = Number(value);
  return Number.isSafeInteger(numericValue) ? numericValue : value;
}

export function getConnectedUnitReference(
  unit: ConnectedUnit,
): ConnectedUnitReference {
  if (unit.source === "mobile_unit_link") {
    return {
      mobileUnitLinkId: normalizeUnitReferenceId(
        unit.mobileUnitLinkId || unit.id,
      ),
    };
  }

  return {
    unitId: normalizeUnitReferenceId(unit.unitId || unit.id),
  };
}
