import React from "react";
import { View, RefreshControl } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { AppText } from "@/components/app-text";
import { Stack } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { LegendList } from "@legendapp/list/react-native";

import { ScreenHeader } from "@/components/screen-header";
import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import { useFacilityOwnersQuery, type FacilityOwnerPeriod } from "@/stores/owner-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import { OwnerAllocationCard } from "@/components/owner-allocation-card";
import { OwnerAllocationsSummaryCard } from "@/components/owner-allocations-summary-card";

export default function FacilityOwnersScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const isTransitionFinished = useScreenTransition();

  const { data: periods = [], isLoading, error, refetch, isRefetching } = useFacilityOwnersQuery();

  const renderItem = ({ item }: { item: FacilityOwnerPeriod }) => {
    return <OwnerAllocationCard item={item} />;
  };

  const renderHeader = () => {
    if (periods.length === 0) return null;
    return <OwnerAllocationsSummaryCard periods={periods} />;
  };

  const renderEmpty = () => {
    return (
      <View className="items-center justify-center py-16 px-6 bg-card rounded-3xl shadow-xs border border-border/10">
        <View className="w-14 h-14 rounded-2xl bg-secondary/80 items-center justify-center mb-4">
          <AppIcon name="facility" size={26} colorToken="--muted-foreground" />
        </View>
        <AppText className="text-base text-muted-foreground font-bold text-center">
          {t("ownerAllocations.noPeriods")}
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
        title={t("ownerAllocations.title")}
        onBack={() => router.back()}
      />

      {isLoading && !isRefetching ? (
        <View className="flex-1 items-center justify-center">
          {isTransitionFinished && <AppActivityIndicator size="large" />}
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6 gap-3">
          <AppText className="text-sm text-destructive text-center font-medium">
            {error.message}
          </AppText>
        </View>
      ) : (
        <View className="flex-1 mt-4">
          <LegendList
            data={periods}
            recycleItems={true}
            estimatedItemSize={240}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#4F46E5"
              />
            }
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 40,
            }}
            className="flex-1 w-full max-w-xl self-center"
            ListEmptyComponent={renderEmpty}
          />
        </View>
      )}
    </View>
  );
}
