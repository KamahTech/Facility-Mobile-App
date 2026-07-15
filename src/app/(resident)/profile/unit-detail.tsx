import React from "react";
import { View, ScrollView, RefreshControl, Text } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { Stack, useLocalSearchParams } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useOwnerStore, useTenantsQuery, type OwnerUnit, type OwnerFinancialSummary } from "@/stores/owner-store";
import { useFamilyMembersQuery } from "@/stores/unit-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import { UnitTenantsCard } from "@/components/unit-tenants-card";
import { UnitFamilyMembersCard } from "@/components/unit-family-members-card";

export default function UnitDetailScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const { formatCurrency } = useFormatters();
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const { fetchOwnerUnitDetails, loading, error, clearError } = useOwnerStore();
  const isTransitionFinished = useScreenTransition();

  const [unitDetails, setUnitDetails] = React.useState<(OwnerUnit & { financialSummary?: OwnerFinancialSummary }) | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const tenantsQuery = useTenantsQuery(unitId);
  const familyQuery = useFamilyMembersQuery(unitId);

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
    await Promise.all([
      loadDetails(),
      tenantsQuery.refetch(),
      familyQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const isLoadingData = loading || !unitDetails || tenantsQuery.isLoading || familyQuery.isLoading;

  if (isLoadingData) {
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
          {isTransitionFinished && <AppActivityIndicator size="large"  />}
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
            <Text
              className="text-sm font-semibold text-destructive"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {error}
            </Text>
          </View>
        )}

        {unitDetails && (
          <Text
            className="text-sm text-muted-foreground mt-2 px-1 text-center self-center"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {`${unitDetails.projectName} • ${unitDetails.phaseName}`}
          </Text>
        )}

        {unitDetails && (
          <View className="w-full bg-card rounded-3xl p-5 flex-col gap-4 shadow-sm">
            <Text
              className="text-base font-bold text-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("profile.title")}
            </Text>
            
            <View className="flex-col gap-3">
              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerUnits.projectName")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {unitDetails.projectName}
                </Text>
              </AppRow>
              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerUnits.phaseName")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {unitDetails.phaseName}
                </Text>
              </AppRow>
              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("connectUnit.buildingNumber")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {unitDetails.buildingNumber}
                </Text>
              </AppRow>
              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("connectUnit.unitNumber")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {unitDetails.unitNumber}
                </Text>
              </AppRow>
              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerUnits.area")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {unitDetails.totalArea} m²
                </Text>
              </AppRow>
              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerUnits.operationalArea")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {unitDetails.operationalArea} m²
                </Text>
              </AppRow>
            </View>
          </View>
        )}

        {summary && (
          <View className="w-full bg-card rounded-3xl p-5 flex-col gap-4 shadow-sm">
            <Text
              className="text-base font-bold text-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("ownerFinancials.title")}
            </Text>

            <View className="flex-col gap-3">
              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerFinancials.totalInvoiced")}
                </Text>
                <Text
                  className="text-sm font-bold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {formatCurrency(summary.totalInvoiced)}
                </Text>
              </AppRow>

              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerFinancials.paidAmount")}
                </Text>
                <Text
                  className="text-sm font-bold text-emerald-600 dark:text-emerald-400"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {formatCurrency(summary.paidAmount)}
                </Text>
              </AppRow>

              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerFinancials.unpaidAmount")}
                </Text>
                <Text
                  className="text-sm font-bold text-amber-600 dark:text-amber-400"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {formatCurrency(summary.unpaidAmount)}
                </Text>
              </AppRow>

              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerFinancials.overdueAmount")}
                </Text>
                <Text
                  className="text-sm font-bold text-rose-600 dark:text-rose-400"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {formatCurrency(summary.overdueAmount)}
                </Text>
              </AppRow>

              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerFinancials.invoiceCount")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {summary.invoiceCount} ({summary.paidInvoiceCount} {t("invoices.status.paid" as any) || "Paid"})
                </Text>
              </AppRow>

              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerFinancials.claimCount")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {summary.claimCount}
                </Text>
              </AppRow>

              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerFinancials.claimAmountToInvoice")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {formatCurrency(summary.claimAmountToInvoice)}
                </Text>
              </AppRow>

              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerFinancials.claimDifference")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {formatCurrency(summary.claimDifference)}
                </Text>
              </AppRow>

              <Text
                className="text-sm font-bold text-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("ownerFinancials.serviceCost")}
              </Text>

              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerFinancials.estimatedCost")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {formatCurrency(summary.serviceEstimatedCost)}
                </Text>
              </AppRow>

              <AppRow className="justify-between items-center">
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("ownerFinancials.actualCost")}
                </Text>
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {formatCurrency(summary.serviceActualCost)}
                </Text>
              </AppRow>
            </View>
          </View>
        )}

        {unitId && (
          <UnitTenantsCard unitId={unitId} />
        )}

        {unitId && (
          <UnitFamilyMembersCard unitId={unitId} />
        )}
      </ScrollView>
    </View>
  );
}
