import React from "react";
import { View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useOwnerStore, type OwnerServiceCost } from "@/stores/owner-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function ServicesScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { formatCurrency } = useFormatters();
  const { services, fetchServices, loading, error, clearError } = useOwnerStore({ enableServices: true });
  const isTransitionFinished = useScreenTransition();

  const [refreshing, setRefreshing] = React.useState(false);


  const loadData = React.useCallback(async () => {
    clearError();
    await fetchServices();
  }, [fetchServices, clearError]);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderServiceCard = (svc: OwnerServiceCost) => {
    return (
      <View
        key={svc.id}
        className="w-full bg-card border border-border rounded-3xl p-5 flex-col gap-4 shadow-sm mb-4"
      >
        <AppRow className="items-center justify-between gap-3">
          <AppRow className="items-center gap-3.5 flex-1 min-w-0">
            <View className="w-11 h-11 rounded-xl items-center justify-center bg-blue-50 dark:bg-blue-950/20">
              <AppIcon name="requestService" size={22} color="#2563EB" />
            </View>
            <View className="flex-col flex-1 min-w-0 text-start">
              <AppText className="text-base font-bold text-foreground text-start">{svc.serviceName}</AppText>
              <AppText className="text-xs text-muted-foreground text-start mt-0.5">
                {svc.productName}
              </AppText>
            </View>
          </AppRow>
        </AppRow>

        <View className="w-full h-[1] bg-border/40" />

        <View className="flex-col gap-2.5">
          <AppRow className="justify-between items-center">
            <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.estimatedCost")}</AppText>
            <AppText className="text-sm font-semibold text-foreground">{formatCurrency(svc.estimatedCost)}</AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.actualCost")}</AppText>
            <AppText className="text-sm font-semibold text-foreground">{formatCurrency(svc.actualCost)}</AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.claimDifference")}</AppText>
            <AppText className="text-sm font-semibold text-foreground">{formatCurrency(svc.difference)}</AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.totalInvoiced")}</AppText>
            <AppText className="text-sm font-bold text-primary">{formatCurrency(svc.totalInvoiced)}</AppText>
          </AppRow>
        </View>

        {svc.claimReference && (
          <View className="flex-row items-center justify-end gap-1 mt-1">
            <AppText className="text-xs text-muted-foreground text-start">
              {svc.claimReference}
            </AppText>
          </View>
        )}
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
        title={t("ownerFinancials.serviceCost")}
        onBack={() => router.back()}
      />

      {loading && services.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          {isTransitionFinished && <ActivityIndicator size="large" color="#4F46E5" />}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
          }
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            flexDirection: "column",
            gap: 12
          }}
          className="flex-1 w-full max-w-xl self-center mt-2"
        >
          {error && (
            <View className="bg-destructive/10 p-4 rounded-2xl border border-destructive/20 mb-4">
              <AppText className="text-sm font-semibold text-destructive text-start">{error}</AppText>
            </View>
          )}

          {services.length === 0 ? (
            <View className="items-center py-12">
              <AppText className="text-sm text-muted-foreground">{t("ownerUnits.noUnits")}</AppText>
            </View>
          ) : (
            services.map(renderServiceCard)
          )}
        </ScrollView>
      )}
    </View>
  );
}
