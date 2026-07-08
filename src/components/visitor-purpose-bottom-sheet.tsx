import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { Pressable, View } from "react-native";

import { AppBottomSheetBackdrop } from "@/components/app-bottom-sheet-backdrop";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { bottomSheetContainerStyle, defaultBottomSheetSnapPoints } from "@/constants/bottom-sheet";
import { visitorPurposeOptions, type VisitorPurposeId } from "@/constants/visitor-purposes";
import { useBottomSheetLayer } from "@/hooks/use-bottom-sheet-layer";
import { useI18n } from "@/hooks/use-i18n";

type VisitorPurposeBottomSheetProps = {
  isPresented: boolean;
  selectedPurpose?: VisitorPurposeId;
  onDismiss: () => void;
  onSelect: (purpose: VisitorPurposeId) => void;
};

export function VisitorPurposeBottomSheet({
  isPresented,
  selectedPurpose,
  onDismiss,
  onSelect,
}: VisitorPurposeBottomSheetProps) {
  const { t } = useI18n();
  useBottomSheetLayer(isPresented);

  const handleSelect = (purpose: VisitorPurposeId) => {
    onSelect(purpose);
    onDismiss();
  };

  return (
    <BottomSheet
      index={isPresented ? 0 : -1}
      snapPoints={defaultBottomSheetSnapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={AppBottomSheetBackdrop}
      containerStyle={bottomSheetContainerStyle}
      onClose={onDismiss}
    >
      <BottomSheetView style={{ width: "100%", paddingHorizontal: 20, paddingBottom: 24 }}>
        <AppText className="mb-4 text-xl font-semibold text-foreground text-start">
          {t("inviteVisitor.purpose")}
        </AppText>

        <View className="w-full overflow-hidden rounded-xl bg-card">
          {visitorPurposeOptions.map((option, index) => {
            const isSelected = selectedPurpose === option.id;
            const isLast = index === visitorPurposeOptions.length - 1;

            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={`min-h-14 w-full justify-center px-4 py-4 ${
                  isLast ? "" : ""
                }`}
                onPress={() => handleSelect(option.id)}
              >
                <AppRow className="w-full items-center justify-between gap-3">
                  <AppText className="flex-1 text-base font-medium text-card-foreground text-start">
                    {t(option.labelKey)}
                  </AppText>
                  {isSelected && (
                    <AppIcon
                      name="check"
                      size={20}
                      colorToken="--foreground"
                      accessibilityLabel={t(option.labelKey)}
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
