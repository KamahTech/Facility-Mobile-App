import React from "react";
import { View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useOwnerStore, type OwnerUnit, type OwnerFinancialSummary } from "@/stores/owner-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function UnitDetailScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const { formatCurrency } = useFormatters();
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const { fetchOwnerUnitDetails, loading, error, clearError } = useOwnerStore();
  const isTransitionFinished = useScreenTransition();

  const [unitDetails, setUnitDetails] = React.useState<(OwnerUnit & { financialSummary?: OwnerFinancialSummary }) | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadDetails = React.useCallback(async () => {
    if (!unitId) return;
    clearError();
    try {
      const details = await fetchOwnerUnitDetails(unitId);
      setUnitDetails(details);
    } catch (e) {
      console.error(e);
    }
  }, [unitId, fetchOwnerUnitDetails, clearError]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadDetails();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDetails]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDetails();
    setRefreshing(false);
  };

  if (loading && !unitDetails) {
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
          title={t("ownerFinancials.title")}
          onBack={() => router.back()}
        />
        <View className="flex-1 items-center justify-center">
          {isTransitionFinished && <ActivityIndicator size="large" color="#4F46E5" />}
        </View>
      </View>
    );
  }

  const summary = unitDetails?.financialSummary;

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
        title={unitDetails?.name || t("ownerFinancials.title")}
        onBack={() => router.back()}
      />

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
          <View className="bg-destructive/10 p-4 rounded-2xl mt-2">
            <AppText className="text-sm font-semibold text-destructive text-start">{error}</AppText>
          </View>
        )}

        {unitDetails && (
          <AppText className="text-start text-sm text-muted-foreground mt-2 px-1">
            {`${unitDetails.projectName} • ${unitDetails.phaseName}`}
          </AppText>
        )}

        {unitDetails && (
          <View className="w-full bg-card rounded-3xl p-5 flex-col gap-4 shadow-sm">
            <AppText className="text-start text-base font-bold text-foreground">{t("profile.title")}</AppText>
            
            <View className="flex-col gap-3">
              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerUnits.projectName")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">{unitDetails.projectName}</AppText>
              </AppRow>
              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerUnits.phaseName")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">{unitDetails.phaseName}</AppText>
              </AppRow>
              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("connectUnit.buildingNumber")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">{unitDetails.buildingNumber}</AppText>
              </AppRow>
              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("connectUnit.unitNumber")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">{unitDetails.unitNumber}</AppText>
              </AppRow>
              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerUnits.area")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">{unitDetails.totalArea} m²</AppText>
              </AppRow>
              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerUnits.operationalArea")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">{unitDetails.operationalArea} m²</AppText>
              </AppRow>
            </View>
          </View>
        )}

        {summary && (
          <View className="w-full bg-card rounded-3xl p-5 flex-col gap-4 shadow-sm">
            <AppText className="text-start text-base font-bold text-foreground">{t("ownerFinancials.title")}</AppText>

            <View className="flex-col gap-3">
              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.totalInvoiced")}</AppText>
                <AppText className="text-sm font-bold text-foreground">{formatCurrency(summary.totalInvoiced)}</AppText>
              </AppRow>

              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.paidAmount")}</AppText>
                <AppText className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.paidAmount)}</AppText>
              </AppRow>

              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.unpaidAmount")}</AppText>
                <AppText className="text-sm font-bold text-amber-600 dark:text-amber-400">{formatCurrency(summary.unpaidAmount)}</AppText>
              </AppRow>

              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.overdueAmount")}</AppText>
                <AppText className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(summary.overdueAmount)}</AppText>
              </AppRow>

              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.invoiceCount")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">
                  {summary.invoiceCount} ({summary.paidInvoiceCount} {t("invoices.status.paid" as any) || "Paid"})
                </AppText>
              </AppRow>

              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.claimCount")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">{summary.claimCount}</AppText>
              </AppRow>

              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.claimAmountToInvoice")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">{formatCurrency(summary.claimAmountToInvoice)}</AppText>
              </AppRow>

              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.claimDifference")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">{formatCurrency(summary.claimDifference)}</AppText>
              </AppRow>

              <AppText className="text-start text-sm font-bold text-foreground">{t("ownerFinancials.serviceCost")}</AppText>

              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.estimatedCost")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">{formatCurrency(summary.serviceEstimatedCost)}</AppText>
              </AppRow>

              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.actualCost")}</AppText>
                <AppText className="text-sm font-semibold text-foreground">{formatCurrency(summary.serviceActualCost)}</AppText>
              </AppRow>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
