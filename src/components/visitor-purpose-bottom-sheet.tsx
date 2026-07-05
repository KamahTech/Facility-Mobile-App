import { BottomSheet, BottomSheetView } from "@expo/ui/community/bottom-sheet";
import type { BottomSheetMethods } from "@expo/ui/community/bottom-sheet";
import React from "react";
import { Pressable, View } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { visitorPurposeOptions, type VisitorPurposeId } from "@/constants/visitor-purposes";
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
  const sheetRef = React.useRef<BottomSheetMethods>(null);

  const handleSelect = (purpose: VisitorPurposeId) => {
    onSelect(purpose);
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
        <AppText className="mb-4 text-xl font-semibold text-foreground">
          {t("inviteVisitor.purpose")}
        </AppText>

        <View className="w-full overflow-hidden rounded-xl border border-border bg-card">
          {visitorPurposeOptions.map((option, index) => {
            const isSelected = selectedPurpose === option.id;
            const isLast = index === visitorPurposeOptions.length - 1;

            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={`min-h-14 w-full justify-center px-4 py-4 ${
                  isLast ? "" : "border-b border-border"
                }`}
                onPress={() => handleSelect(option.id)}
              >
                <AppRow className="w-full items-center justify-between gap-3">
                  <AppText className="flex-1 text-base font-medium text-card-foreground">
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
