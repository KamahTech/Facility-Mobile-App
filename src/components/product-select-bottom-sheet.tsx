import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { Pressable, View, Text, ActivityIndicator } from "react-native";

import { AppBottomSheetBackdrop } from "@/components/app-bottom-sheet-backdrop";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppInput } from "@/components/app-input";
import { bottomSheetContainerStyle } from "@/constants/bottom-sheet";
import { useBottomSheetLayer } from "@/hooks/use-bottom-sheet-layer";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useMaterialProductsQuery, type Product } from "@/stores/requests-store";

type ProductSelectBottomSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  onSelect: (product: Product) => void;
};

export function ProductSelectBottomSheet({
  isPresented,
  onDismiss,
  onSelect,
}: ProductSelectBottomSheetProps) {
  const { isRTL, t } = useI18n();
  useBottomSheetLayer(isPresented);
  const backgroundColor = useThemeToken("--card");
  const borderColor = useThemeToken("--border");
  const primaryColor = useThemeToken("--primary");

  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (isPresented) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isPresented]);

  const handleDismiss = React.useCallback(() => {
    setSearchQuery("");
    onDismiss();
  }, [onDismiss]);

  const { data: products = [], isLoading } = useMaterialProductsQuery(
    searchQuery,
    50,
    isPresented && searchQuery.length >= 2
  );

  const handleSelect = (product: Product) => {
    onSelect(product);
    handleDismiss();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["50%", "75%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={AppBottomSheetBackdrop}
      containerStyle={bottomSheetContainerStyle}
      backgroundStyle={{ backgroundColor }}
      handleIndicatorStyle={{ backgroundColor: borderColor }}
      onClose={handleDismiss}
    >
      <BottomSheetView style={{ width: "100%", paddingHorizontal: 20, paddingBottom: 24, flex: 1 }}>
        <Text
          className="mb-3 text-xl font-semibold text-foreground text-start"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("worker.selectMaterial" as any) || "Select Material / Product"}
        </Text>

        <AppInput
          placeholder={t("worker.searchPlaceholder" as any) || "Search products..."}
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search"
          containerClassName="mb-4"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <BottomSheetScrollView className="flex-1 w-full" showsVerticalScrollIndicator={false}>
          {isLoading && (
            <View className="py-8 w-full items-center justify-center">
              <ActivityIndicator size="small" color={primaryColor} />
            </View>
          )}

          {!isLoading && searchQuery.length >= 2 && products.length === 0 && (
            <View className="py-8 px-4 items-center justify-center">
              <Text
                className="text-muted-foreground text-sm text-center"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("common.noData")}
              </Text>
            </View>
          )}

          {!isLoading && searchQuery.length < 2 && (
            <View className="py-8 px-4 items-center justify-center">
              <Text
                className="text-muted-foreground text-sm text-center"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("worker.searchInstructions" as any) || "Type at least 2 characters to search"}
              </Text>
            </View>
          )}

          {!isLoading && products.length > 0 && (
            <View className="w-full overflow-hidden rounded-xl bg-secondary mb-6">
              {products.map((product, index) => {
                const isLast = index === products.length - 1;
                return (
                  <Pressable
                    key={product.id}
                    accessibilityRole="button"
                    className={`min-h-14 w-full justify-center px-4 py-4 ${
                      isLast ? "" : "border-b border-border/20"
                    }`}
                    onPress={() => handleSelect(product)}
                  >
                    <AppRow className="w-full items-center justify-between gap-3">
                      <View className="flex-1 flex-col gap-0.5 text-start">
                        <Text
                          className="text-base font-medium text-secondary-foreground text-start"
                          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                        >
                          {product.name}
                        </Text>
                        {product.uomName && (
                          <Text
                            className="text-xs text-muted-foreground text-start"
                            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                          >
                            {product.uomName}
                          </Text>
                        )}
                      </View>
                      <AppIcon name="add" size={20} colorToken="--primary" />
                    </AppRow>
                  </Pressable>
                );
              })}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}
