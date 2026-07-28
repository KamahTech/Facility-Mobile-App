import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React from "react";
import { Pressable, View, Text, ActivityIndicator } from "react-native";

import { AppBottomSheetBackdrop } from "@/components/app-bottom-sheet-backdrop";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppInput } from "@/components/app-input";
import { bottomSheetContainerStyle, defaultBottomSheetSnapPoints } from "@/constants/bottom-sheet";
import { useBottomSheetLayer } from "@/hooks/use-bottom-sheet-layer";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useMaterialProductsInfiniteQuery, type Product } from "@/stores/requests-store";

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

  const productsQuery = useMaterialProductsInfiniteQuery(
    searchQuery,
    isPresented
  );

  const products = React.useMemo(() => {
    if (!productsQuery.data?.pages) return [];
    return productsQuery.data.pages
      .flatMap((page) => page?.items || [])
      .filter((item): item is Product => Boolean(item && item.id));
  }, [productsQuery.data]);

  const handleSelect = React.useCallback(
    (product: Product) => {
      onSelect(product);
      handleDismiss();
    },
    [onSelect, handleDismiss]
  );

  const renderItem = React.useCallback(
    ({ item: product, index }: { item: Product; index: number }) => {
      if (!product || !product.id) return null;
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
    },
    [handleSelect, isRTL, products.length]
  );

  const renderListHeader = React.useCallback(
    () => (
      <View className="w-full">
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
      </View>
    ),
    [isRTL, searchQuery, t]
  );

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
      onClose={handleDismiss}
    >
      <BottomSheetFlatList
        data={products}
        keyExtractor={(item: Product, index: number) => (item?.id ? String(item.id) : `prod-${index}`)}
        ListHeaderComponent={renderListHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={true}
        onEndReached={() => {
          if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
            productsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 60,
        }}
        ListEmptyComponent={
          productsQuery.isLoading ? (
            <View className="py-8 w-full items-center justify-center">
              <ActivityIndicator size="small" color={primaryColor} />
            </View>
          ) : (
            <View className="py-8 px-4 items-center justify-center">
              <Text
                className="text-muted-foreground text-sm text-center"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("common.noData")}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          productsQuery.isFetchingNextPage ? (
            <View className="py-4 items-center justify-center">
              <ActivityIndicator size="small" color={primaryColor} />
            </View>
          ) : null
        }
        style={{ flex: 1 }}
      />
    </BottomSheet>
  );
}
