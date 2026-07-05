import React from "react";
import { View, ScrollView, RefreshControl, ActivityIndicator, Pressable } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useOwnerStore, type OwnerUnit } from "@/stores/owner-store";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function OwnerUnitsScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { formatCurrency } = useFormatters();
  const { ownerUnits, statement, fetchOwnerUnits, fetchStatement, loading, error, clearError } = useOwnerStore({ enableOwnerUnits: true, enableStatement: true });
  const isTransitionFinished = useScreenTransition();

  const [refreshing, setRefreshing] = React.useState(false);
  const mutedForeground = useThemeToken("--muted-foreground");

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

  const renderUnitCard = (unit: OwnerUnit) => {
    return (
      <Pressable
        key={unit.id}
        onPress={() => router.push({ pathname: "/profile/unit-detail", params: { unitId: unit.id } } as any)}
        className="w-full bg-card border border-border rounded-3xl p-5 flex-col gap-4 shadow-sm mb-4 active:opacity-75"
      >
        <AppRow className="items-center justify-between gap-3">
          <AppRow className="items-center gap-3.5 flex-1 min-w-0">
            <View className="w-11 h-11 rounded-xl items-center justify-center bg-primary/10">
              <AppIcon name="facility" size={22} colorToken="--primary" />
            </View>
            <View className="flex-col flex-1 min-w-0 text-start">
              <AppText className="text-base font-bold text-foreground text-start">{unit.name}</AppText>
              <AppText className="text-xs text-muted-foreground text-start mt-0.5">
                {unit.projectName} • {unit.phaseName}
              </AppText>
            </View>
          </AppRow>
          
          <View className="px-2.5 py-1 rounded-full bg-secondary/80 border border-border">
            <AppText className="text-xs font-semibold text-muted-foreground">
              {unit.state.toUpperCase()}
            </AppText>
          </View>
        </AppRow>

        <View className="w-full h-[1] bg-border/40" />

        <View className="flex-col gap-2.5">
          <AppRow className="justify-between items-center">
            <AppText className="text-sm text-muted-foreground text-start">{t("ownerUnits.area")}</AppText>
            <AppText className="text-sm font-semibold text-foreground">{unit.totalArea} m²</AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-sm text-muted-foreground text-start">{t("ownerUnits.operationalArea")}</AppText>
            <AppText className="text-sm font-semibold text-foreground">{unit.operationalArea} m²</AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-sm text-muted-foreground text-start">{t("ownerUnits.annualDeposit")}</AppText>
            <AppText className="text-sm font-bold text-primary">{formatCurrency(unit.annualMaintenanceDeposit)}</AppText>
          </AppRow>
        </View>

        <AppRow className="justify-end items-center gap-1.5 mt-2">
          <AppText className="text-xs font-bold text-primary">{t("ownerFinancials.title")}</AppText>
          <AppIcon name="chevronRight" size={14} colorToken="--primary" />
        </AppRow>
      </Pressable>
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
      />

      {loading && ownerUnits.length === 0 ? (
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
            gap: 20
          }}
          className="flex-1 w-full max-w-xl self-center"
        >
          {error && (
            <View className="bg-destructive/10 p-4 rounded-2xl border border-destructive/20 mt-4">
              <AppText className="text-sm font-semibold text-destructive text-start">{error}</AppText>
            </View>
          )}

          {/* Description */}
          <AppText className="text-start text-sm text-muted-foreground mt-2 px-1">
            {t("ownerUnits.description")}
          </AppText>

          {/* Statement Financial Overview */}
          {statement && (
            <View className="w-full bg-card border border-border rounded-3xl p-5 flex-col gap-4 shadow-sm mt-2">
              <AppText className="text-start text-base font-bold text-foreground">
                {t("ownerFinancials.title")}
              </AppText>

              {/* Total Invoiced Banner */}
              <View className="bg-primary/5 dark:bg-primary/10 border border-primary/10 p-4 rounded-2xl items-center">
                <AppText className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  {t("ownerFinancials.totalInvoiced")}
                </AppText>
                <AppText className="text-3xl font-extrabold text-foreground">
                  {formatCurrency(statement.totalSummary.totalInvoiced)}
                </AppText>
              </View>

              {/* Grid of Paid, Unpaid, Overdue */}
              <AppRow className="gap-2.5">
                <View className="flex-1 p-3 rounded-2xl bg-emerald-50/10 dark:bg-emerald-950/10 border border-emerald-100/20 items-center">
                  <AppText className="text-[10px] text-muted-foreground font-semibold text-center mb-1">
                    {t("ownerFinancials.paidAmount")}
                  </AppText>
                  <AppText className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(statement.totalSummary.paidAmount)}
                  </AppText>
                </View>

                <View className="flex-1 p-3 rounded-2xl bg-amber-50/10 dark:bg-amber-950/10 border border-amber-100/20 items-center">
                  <AppText className="text-[10px] text-muted-foreground font-semibold text-center mb-1">
                    {t("ownerFinancials.unpaidAmount")}
                  </AppText>
                  <AppText className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(statement.totalSummary.unpaidAmount)}
                  </AppText>
                </View>

                <View className="flex-1 p-3 rounded-2xl bg-rose-50/10 dark:bg-rose-950/10 border border-rose-100/20 items-center">
                  <AppText className="text-[10px] text-muted-foreground font-semibold text-center mb-1">
                    {t("ownerFinancials.overdueAmount")}
                  </AppText>
                  <AppText className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(statement.totalSummary.overdueAmount)}
                  </AppText>
                </View>
              </AppRow>
            </View>
          )}

          {/* Owner Claim and Services Costs Links */}
          <View className="flex-col gap-3 mt-2">
            <Pressable
              onPress={() => router.push("/profile/claims" as Href)}
              className="w-full p-4 bg-card border border-border rounded-2xl active:opacity-75"
            >
              <AppRow className="items-center justify-between">
                <AppRow className="items-center gap-3">
                  <View className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950/20 items-center justify-center">
                    <AppIcon name="tickets" size={18} color="#EA580C" />
                  </View>
                  <AppText className="text-sm font-bold text-foreground">{t("claims.title")}</AppText>
                </AppRow>
                <AppIcon name="chevronRight" size={16} color={mutedForeground} />
              </AppRow>
            </Pressable>

            <Pressable
              onPress={() => router.push("/profile/services" as Href)}
              className="w-full p-4 bg-card border border-border rounded-2xl active:opacity-75"
            >
              <AppRow className="items-center justify-between">
                <AppRow className="items-center gap-3">
                  <View className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/20 items-center justify-center">
                    <AppIcon name="requestService" size={18} color="#2563EB" />
                  </View>
                  <AppText className="text-sm font-bold text-foreground">{t("ownerFinancials.serviceCost")}</AppText>
                </AppRow>
                <AppIcon name="chevronRight" size={16} color={mutedForeground} />
              </AppRow>
            </Pressable>
          </View>

          {/* List of Owner Units */}
          <View className="flex-col gap-3.5 mt-2">
            <AppText className="text-start text-base font-bold text-foreground">
              {t("ownerUnits.title")}
            </AppText>

            {ownerUnits.length === 0 ? (
              <View className="items-center py-10">
                <AppText className="text-sm text-muted-foreground">{t("ownerUnits.noUnits")}</AppText>
              </View>
            ) : (
              ownerUnits.map(renderUnitCard)
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
