import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { Pressable, View, Text } from "react-native";

import { AppBottomSheetBackdrop } from "@/components/app-bottom-sheet-backdrop";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { bottomSheetContainerStyle, defaultBottomSheetSnapPoints } from "@/constants/bottom-sheet";
import { useBottomSheetLayer } from "@/hooks/use-bottom-sheet-layer";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";

type GenericSelectBottomSheetProps<T> = {
  isPresented: boolean;
  title: string;
  items: T[];
  selectedId?: string;
  onDismiss: () => void;
  onSelect: (item: T) => void;
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  subLabelExtractor?: (item: T) => string | undefined;
  showClearOption?: boolean;
  onClear?: () => void;
  clearLabel?: string;
};

export function GenericSelectBottomSheet<T>({
  isPresented,
  title,
  items,
  selectedId,
  onDismiss,
  onSelect,
  keyExtractor,
  labelExtractor,
  subLabelExtractor,
  showClearOption,
  onClear,
  clearLabel,
}: GenericSelectBottomSheetProps<T>) {
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

  const handleSelect = (item: T) => {
    onSelect(item);
    onDismiss();
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
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
      <BottomSheetView style={{ width: "100%", paddingHorizontal: 20, paddingBottom: 24, flex: 1 }}>
        <Text
          className="mb-4 text-xl font-semibold text-foreground"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {title}
        </Text>

        <BottomSheetScrollView className="flex-1 w-full" showsVerticalScrollIndicator={false}>
          <View className="w-full overflow-hidden rounded-xl bg-secondary mb-6">
            {showClearOption && onClear && (
              <Pressable
                accessibilityRole="button"
                className="min-h-14 w-full justify-center px-4 py-4 border-b border-border/50"
                onPress={handleClear}
              >
                <AppRow className="w-full items-center gap-3">
                  <AppIcon name="close" size={20} colorToken="--destructive" />
                  <Text
                    className="flex-1 text-base font-medium text-destructive"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {clearLabel || t("common.clear") || "Clear Selection"}
                  </Text>
                </AppRow>
              </Pressable>
            )}

            {items.map((item, index) => {
              const itemId = keyExtractor(item);
              const isSelected = selectedId === itemId;
              const label = labelExtractor(item);
              const subLabel = subLabelExtractor ? subLabelExtractor(item) : undefined;
              const isLast = index === items.length - 1;

              return (
                <Pressable
                  key={itemId}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  className={`min-h-14 w-full justify-center px-4 py-4 ${
                    isLast ? "" : "border-b border-border/20"
                  }`}
                  onPress={() => handleSelect(item)}
                >
                  <AppRow className="w-full items-center justify-between gap-3">
                    <View className="flex-1 flex-col gap-0.5 text-start">
                      <Text
                        className="text-base font-medium text-secondary-foreground"
                        style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                      >
                        {label}
                      </Text>
                      {subLabel && (
                        <Text
                          className="text-xs text-muted-foreground"
                          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                        >
                          {subLabel}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <AppIcon
                        name="check"
                        size={20}
                        colorToken="--foreground"
                        accessibilityLabel={label}
                      />
                    )}
                  </AppRow>
                </Pressable>
              );
            })}

            {items.length === 0 && (
              <View className="py-8 px-4 items-center justify-center">
                <Text
                  className="text-muted-foreground text-sm text-center"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("common.noData") || "No items available"}
                </Text>
              </View>
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}
