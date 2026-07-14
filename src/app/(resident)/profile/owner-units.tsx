import React from "react";
import { View, RefreshControl, Text } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { Stack, router, useNavigation } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";
import { LegendList } from "@legendapp/list/react-native";

import { ScreenHeader } from "@/components/screen-header";
import { AppIcon } from "@/components/app-icon";
import { OwnerUnitCard } from "@/components/owner-unit-card";
import { OwnerFinancialOverview } from "@/components/owner-financial-overview";
import { useI18n } from "@/hooks/use-i18n";
import { useOwnerStore } from "@/stores/owner-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";
const SECTION_GAP = 16;

export default function OwnerUnitsScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const navigation = useNavigation();
  const {
    ownerUnits,
    statement,
    fetchOwnerUnits,
    fetchStatement,
    isFetching,
    clearError,
  } = useOwnerStore({ 
    enableOwnerUnits: true, 
    enableStatement: true 
  });
  const isTransitionFinished = useScreenTransition();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = React.useCallback(async () => {
    clearError();
    await Promise.all([
      fetchOwnerUnits(),
      fetchStatement()
    ]);
  }, [fetchOwnerUnits, fetchStatement, clearError]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderHeader = () => {
    return (
      <View className="flex-col pb-4" style={{ rowGap: SECTION_GAP }}>
        {/* Description */}
        <Text
          className="text-sm text-muted-foreground px-1 pt-6 leading-5"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("ownerUnits.description")}
        </Text>

        {/* Financial Summary (Moved to Header) */}
        {statement ? (
          <OwnerFinancialOverview statement={statement} />
        ) : null}

        {/* List Header Title */}
        {ownerUnits.length > 0 && (
          <Text
            className="text-base font-bold text-foreground px-1 mt-4"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("ownerUnits.title")}
          </Text>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <View className="items-center py-16 px-6 bg-card rounded-3xl shadow-sm">
        <View className="w-14 h-14 rounded-2xl bg-secondary/85 items-center justify-center mb-4">
          <AppIcon name="facility" size={26} colorToken="--muted-foreground" />
        </View>
        <Text
          className="text-base text-muted-foreground font-bold text-center"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("ownerUnits.noUnits")}
        </Text>
      </View>
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
        paddingBottom: insets.bottom,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader
        title={t("ownerUnits.title")}
        onBack={() => router.back()}
        showBorder={false}
      />

      {isFetching && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          {isTransitionFinished && <AppActivityIndicator size="large" />}
        </View>
      ) : (
        <View className="flex-1">


          <LegendList
            data={ownerUnits}
            recycleItems={true}
            estimatedItemSize={180}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OwnerUnitCard unit={item} />
            )}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
            }
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 40,
            }}
            className="flex-1 w-full max-w-xl self-center"
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
          />
        </View>
      )}
    </View>
  );
}
