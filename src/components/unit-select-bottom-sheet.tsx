import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { Pressable, View, Text } from "react-native";

import { AppBottomSheetBackdrop } from "@/components/app-bottom-sheet-backdrop";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { bottomSheetContainerStyle, defaultBottomSheetSnapPoints } from "@/constants/bottom-sheet";
import { useBottomSheetLayer } from "@/hooks/use-bottom-sheet-layer";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
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
  const { isRTL, t } = useI18n();
  useBottomSheetLayer(isPresented);
  const backgroundColor = useThemeToken("--card");
  const borderColor = useThemeToken("--border");

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  React.useEffect(() => {
    if (isPresented) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isPresented]);

  const handleSelect = (unit: ConnectedUnit) => {
    onSelect(unit);
    onDismiss();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={defaultBottomSheetSnapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={AppBottomSheetBackdrop}
      containerStyle={bottomSheetContainerStyle}
      backgroundStyle={{ backgroundColor }}
      handleIndicatorStyle={{ backgroundColor: borderColor }}
      onClose={onDismiss}
    >
      <BottomSheetView style={{ width: "100%", paddingHorizontal: 20, paddingBottom: 24 }}>
        <Text
          className="mb-4 text-xl font-semibold text-foreground"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("tickets.selectUnit")}
        </Text>

        <View className="w-full overflow-hidden rounded-xl bg-secondary">
          {units.map((unit, index) => {
            const isSelected = selectedUnitId === unit.id;
            const isLast = index === units.length - 1;
            const unitLabel = `${unit.buildingNumber} - ${unit.unitNumber}`;

            return (
              <Pressable
                key={unit.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={`min-h-14 w-full justify-center px-4 py-4 ${
                  isLast ? "" : ""
                }`}
                onPress={() => handleSelect(unit)}
              >
                <AppRow className="w-full items-center justify-between gap-3">
                  <View className="flex-1 flex-col gap-0.5 text-start">
                    <Text
                      className="text-base font-medium text-secondary-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {unitLabel}
                    </Text>
                    <Text
                      className="text-xs text-muted-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {t(`connectUnit.${unit.unitType}` as any)} • {t(unit.ownershipType === "owner" ? "connectUnit.owner" : "connectUnit.tenant")}
                    </Text>
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
              </Pressable>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
