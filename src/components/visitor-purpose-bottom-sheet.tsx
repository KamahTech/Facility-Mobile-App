import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { Pressable, View, Text } from "react-native";

import { AppBottomSheetBackdrop } from "@/components/app-bottom-sheet-backdrop";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { bottomSheetContainerStyle, defaultBottomSheetSnapPoints } from "@/constants/bottom-sheet";
import { visitorPurposeOptions, type VisitorPurposeId } from "@/constants/visitor-purposes";
import { useBottomSheetLayer } from "@/hooks/use-bottom-sheet-layer";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";

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

  const handleSelect = (purpose: VisitorPurposeId) => {
    onSelect(purpose);
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
          {t("inviteVisitor.purpose")}
        </Text>

        <View className="w-full overflow-hidden rounded-xl bg-secondary">
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
                  <Text
                    className="flex-1 text-base font-medium text-secondary-foreground"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {t(option.labelKey)}
                  </Text>
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
