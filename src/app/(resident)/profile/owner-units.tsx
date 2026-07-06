import React from "react";
import { View, RefreshControl, ActivityIndicator, Pressable } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LegendList } from "@legendapp/list/react-native";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { OwnerUnitCard } from "@/components/owner-unit-card";
import { OwnerFinancialOverview } from "@/components/owner-financial-overview";
import { useI18n } from "@/hooks/use-i18n";
import { useOwnerStore } from "@/stores/owner-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

const SECTION_GAP = 16;
const ITEM_GAP = SECTION_GAP;

type InlineErrorCardProps = {
  message: string;
};

function InlineErrorCard({ message }: InlineErrorCardProps) {
  return (
    <View className="bg-destructive/10 p-4 rounded-2xl">
      <AppText className="text-sm font-semibold text-destructive text-start">{message}</AppText>
    </View>
  );
}

export default function OwnerUnitsScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const {
    ownerUnits,
    statement,
    fetchOwnerUnits,
    fetchStatement,
    loading,
    ownerUnitsError,
    statementError,
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
    clearError();
  }, [clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderHeader = () => {
    return (
      <View className="flex-col pb-4" style={{ rowGap: SECTION_GAP }}>
        {/* Description */}
        <AppText className="text-start text-sm text-muted-foreground px-1 pt-6 leading-5">
          {t("ownerUnits.description")}
        </AppText>

        {statementError ? (
          <InlineErrorCard message={t("ownerFinancials.summaryLoadFailed")} />
        ) : statement ? (
          <OwnerFinancialOverview statement={statement} />
        ) : null}

        {/* Owner Claim and Services Costs Links */}
        <View className="flex-col" style={{ rowGap: ITEM_GAP }}>
          <Pressable
            onPress={() => router.push("/profile/claims" as Href)}
            className="w-full p-4 bg-card rounded-2xl active:opacity-90 shadow-2xs"
          >
            <AppRow className="items-center justify-between" style={{ columnGap: ITEM_GAP }}>
              <AppRow className="items-center flex-1 min-w-0" style={{ columnGap: ITEM_GAP }}>
                <View className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950/20 items-center justify-center">
                  <AppIcon name="tickets" size={18} color="#EA580C" />
                </View>
                <AppText className="text-sm font-bold text-foreground flex-1 text-start" numberOfLines={1}>
                  {t("claims.title")}
                </AppText>
              </AppRow>
              <AppIcon name="chevronRight" size={16} colorToken="--foreground" />
            </AppRow>
          </Pressable>

          <Pressable
            onPress={() => router.push("/profile/services" as Href)}
            className="w-full p-4 bg-card rounded-2xl active:opacity-90 shadow-2xs"
          >
            <AppRow className="items-center justify-between" style={{ columnGap: ITEM_GAP }}>
              <AppRow className="items-center flex-1 min-w-0" style={{ columnGap: ITEM_GAP }}>
                <View className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/20 items-center justify-center">
                  <AppIcon name="requestService" size={18} color="#2563EB" />
                </View>
                <AppText className="text-sm font-bold text-foreground flex-1 text-start" numberOfLines={1}>
                  {t("ownerFinancials.serviceCost")}
                </AppText>
              </AppRow>
              <AppIcon name="chevronRight" size={16} colorToken="--foreground" />
            </AppRow>
          </Pressable>
        </View>

        {/* List Header Title */}
        {ownerUnits.length > 0 && (
          <AppText className="text-start text-base font-bold text-foreground px-1">
            {t("ownerUnits.title")}
          </AppText>
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
        <AppText align="center" className="text-base text-muted-foreground font-bold">
          {t("ownerUnits.noUnits")}
        </AppText>
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

      {loading && ownerUnits.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          {isTransitionFinished && <ActivityIndicator size="large" color="#4F46E5" />}
        </View>
      ) : (
        <View className="flex-1">
          {ownerUnitsError && (
            <View className="mx-5 mb-4">
              <InlineErrorCard message={t("ownerUnits.loadFailed")} />
            </View>
          )}

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
