import { BottomSheet, BottomSheetView } from "@expo/ui/community/bottom-sheet";
import type { BottomSheetMethods } from "@expo/ui/community/bottom-sheet";
import React from "react";
import { Pressable, View, ScrollView } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";

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
  const { t } = useI18n();
  const sheetRef = React.useRef<BottomSheetMethods>(null);

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
      ref={sheetRef}
      index={isPresented ? 0 : -1}
      snapPoints={["45%", "90%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      onClose={onDismiss}
    >
      <BottomSheetView style={{ width: "100%", paddingHorizontal: 20, paddingBottom: 24, flex: 1 }}>
        <AppText className="mb-4 text-xl font-semibold text-foreground text-start">
          {title}
        </AppText>

        <ScrollView className="flex-1 w-full" showsVerticalScrollIndicator={false}>
          <View className="w-full overflow-hidden rounded-xl bg-card mb-6">
            {showClearOption && onClear && (
              <Pressable
                accessibilityRole="button"
                className="min-h-14 w-full justify-center px-4 py-4 border-b border-border/50"
                onPress={handleClear}
              >
                <AppRow className="w-full items-center gap-3">
                  <AppIcon name="close" size={20} colorToken="--destructive" />
                  <AppText className="flex-1 text-base font-medium text-destructive text-start">
                    {clearLabel || t("common.clear") || "Clear Selection"}
                  </AppText>
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
                      <AppText className="text-base font-medium text-card-foreground text-start">
                        {label}
                      </AppText>
                      {subLabel && (
                        <AppText className="text-xs text-muted-foreground text-start">
                          {subLabel}
                        </AppText>
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
                <AppText className="text-muted-foreground text-sm text-center">
                  {t("common.noData") || "No items available"}
                </AppText>
              </View>
            )}
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}
