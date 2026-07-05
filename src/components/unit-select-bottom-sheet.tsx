import { BottomSheet, BottomSheetView } from "@expo/ui/community/bottom-sheet";
import type { BottomSheetMethods } from "@expo/ui/community/bottom-sheet";
import React from "react";
import { View, TouchableOpacity } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import type { ConnectedUnit } from "@/stores/unit-store";

type UnitSelectBottomSheetProps = {
  isPresented: boolean;
  units: ConnectedUnit[];
  selectedUnitId?: string;
  onDismiss: () => void;
  onSelect: (unit: ConnectedUnit) => void;
};

export function UnitSelectBottomSheet({
  isPresented,
  units,
  selectedUnitId,
  onDismiss,
  onSelect,
}: UnitSelectBottomSheetProps) {
  const { t } = useI18n();
  const sheetRef = React.useRef<BottomSheetMethods>(null);

  const handleSelect = (unit: ConnectedUnit) => {
    onSelect(unit);
    onDismiss();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={isPresented ? 0 : -1}
      snapPoints={["45%", "90%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      onClose={onDismiss}
    >
      <BottomSheetView style={{ width: "100%", paddingHorizontal: 20, paddingBottom: 24 }}>
        <AppText className="mb-4 text-xl font-semibold text-foreground text-start">
          {t("tickets.selectUnit")}
        </AppText>

        <View className="w-full overflow-hidden rounded-xl border border-border bg-card">
          {units.map((unit, index) => {
            const isSelected = selectedUnitId === unit.id;
            const isLast = index === units.length - 1;
            const unitLabel = `${unit.buildingNumber} - ${unit.unitNumber}`;

            return (
              <TouchableOpacity
                key={unit.id}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={`min-h-14 w-full justify-center px-4 py-4 ${
                  isLast ? "" : "border-b border-border"
                }`}
                onPress={() => handleSelect(unit)}
              >
                <AppRow className="w-full items-center justify-between gap-3">
                  <View className="flex-1 flex-col gap-0.5 text-start">
                    <AppText className="text-base font-medium text-card-foreground text-start">
                      {unitLabel}
                    </AppText>
                    <AppText className="text-xs text-muted-foreground text-start">
                      {t(`connectUnit.${unit.unitType}` as any)} • {t(unit.ownershipType === "owner" ? "connectUnit.owner" : "connectUnit.tenant")}
                    </AppText>
                  </View>
                  {isSelected && (
                    <AppIcon
                      name="check"
                      size={20}
                      colorToken="--foreground"
                      accessibilityLabel={unitLabel}
                    />
                  )}
                </AppRow>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
