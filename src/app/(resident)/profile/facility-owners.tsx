import React from "react";
import { View, RefreshControl, Text } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { Stack } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { LegendList } from "@legendapp/list/react-native";

import { ScreenHeader } from "@/components/screen-header";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useFacilityOwnersQuery, type FacilityOwnerPeriod } from "@/stores/owner-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function FacilityOwnersScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const { formatCurrency } = useFormatters();
  const isTransitionFinished = useScreenTransition();

  const { data: periods = [], isLoading, error, refetch, isRefetching } = useFacilityOwnersQuery();

  const getStatusColorConfig = (state: string) => {
    const normalized = (state || "").toLowerCase();
    if (normalized === "active" || normalized === "posted" || normalized === "done") {
      return {
        bg: "bg-green-50 dark:bg-green-950/20",
        text: "text-green-600 dark:text-green-400",
      };
    }
    if (normalized === "draft") {
      return {
        bg: "bg-blue-50 dark:bg-blue-950/20",
        text: "text-blue-600 dark:text-blue-400",
      };
    }
    return {
      bg: "bg-gray-50 dark:bg-gray-950/20",
      text: "text-gray-600 dark:text-gray-400",
    };
  };

  const renderItem = ({ item }: { item: FacilityOwnerPeriod }) => {
    const statusConfig = getStatusColorConfig(item.state);
    const allocation = item.residentAllocation;

    // Calculate progress ratio
    const paid = allocation?.paidAmount ?? 0;
    const total = allocation?.totalAllocated ?? 0;
    const unpaid = allocation?.unpaidAmount ?? total - paid;
    const progress = total > 0 ? paid / total : 0;

    return (
      <View className="w-full bg-card rounded-3xl p-5 shadow-xs border border-border/10 mb-4 flex-col gap-4">
        {/* Title & Status */}
        <AppRow className="items-center justify-between gap-3">
          <View className="flex-1 text-start">
            <Text
              className="text-base font-bold text-foreground text-start"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {item.reference}
            </Text>
            <Text
              className="text-xs text-muted-foreground mt-0.5 text-start font-semibold"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {item.projectName}
            </Text>
          </View>

          <View className={`px-2.5 py-0.5 rounded-full shrink-0 ${statusConfig.bg}`}>
            <Text
              className={`text-[10px] font-bold uppercase tracking-wider ${statusConfig.text}`}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t(`ownerUnits.state.${item.state}` as any) || item.state}
            </Text>
          </View>
        </AppRow>

        {/* Dates */}
        <View className="bg-secondary/30 p-3 rounded-2xl flex-col gap-1">
          <Text
            className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-start"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("ownerAllocations.dates")}
          </Text>
          <AppRow className="items-center justify-between gap-2 mt-0.5">
            <Text className="text-xs text-foreground font-semibold">{item.startDate}</Text>
            <AppIcon name="chevronRight" size={12} colorToken="--muted-foreground" className="opacity-50" />
            <Text className="text-xs text-foreground font-semibold">{item.endDate}</Text>
          </AppRow>
        </View>

        {/* Financial allocation */}
        {allocation && (
          <View className="flex-col gap-2 mt-1">
            <AppRow className="justify-between items-end">
              <View className="flex-col items-start">
                <Text className="text-xs text-muted-foreground">{t("ownerAllocations.allocated")}</Text>
                <Text className="text-lg font-bold text-foreground mt-0.5">
                  {formatCurrency(total)}
                </Text>
              </View>

              {item.allocatedServiceCosts !== undefined && (
                <View className="items-end">
                  <Text className="text-xs text-muted-foreground">{t("ownerAllocations.services")}</Text>
                  <Text className="text-sm font-semibold text-foreground mt-0.5">
                    {formatCurrency(item.allocatedServiceCosts)}
                  </Text>
                </View>
              )}
            </AppRow>

            {/* Progress Bar */}
            <View className="w-full h-2 rounded-full bg-secondary overflow-hidden mt-1">
              <View
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${progress * 100}%` }}
              />
            </View>

            {/* Paid vs Unpaid breakdown */}
            <AppRow className="justify-between items-center mt-0.5">
              <AppRow className="items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-green-500" />
                <Text className="text-xs text-muted-foreground">
                  {t("ownerAllocations.paid")}: {formatCurrency(paid)}
                </Text>
              </AppRow>

              <AppRow className="items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-amber-500" />
                <Text className="text-xs text-muted-foreground">
                  {t("ownerAllocations.unpaid")}: {formatCurrency(unpaid)}
                </Text>
              </AppRow>
            </AppRow>
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <View className="items-center justify-center py-16 px-6 bg-card rounded-3xl shadow-sm">
        <View className="w-14 h-14 rounded-2xl bg-secondary/80 items-center justify-center mb-4">
          <AppIcon name="facility" size={26} colorToken="--muted-foreground" />
        </View>
        <Text
          className="text-base text-muted-foreground font-bold text-center"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("ownerAllocations.noPeriods")}
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
        title={t("ownerAllocations.title")}
        onBack={() => router.back()}
      />

      {isLoading && !isRefetching ? (
        <View className="flex-1 items-center justify-center">
          {isTransitionFinished && <AppActivityIndicator size="large" />}
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6 gap-3">
          <Text
            className="text-sm text-destructive text-center font-medium"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {error.message}
          </Text>
        </View>
      ) : (
        <View className="flex-1 mt-4">
          <LegendList
            data={periods}
            recycleItems={true}
            estimatedItemSize={220}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
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
