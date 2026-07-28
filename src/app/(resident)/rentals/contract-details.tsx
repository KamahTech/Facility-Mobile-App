import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Stack, useLocalSearchParams, type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { ScreenHeader } from "@/components/screen-header";
import { AppRow } from "@/components/app-row";
import { AppIcon } from "@/components/app-icon";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useRentalContractDetailQuery } from "@/hooks/use-rental";
import type { ContractType, ContractState, PaymentPeriod } from "@/lib/rental-types";

export default function ContractDetailsScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const params = useLocalSearchParams<{ id: string; type?: ContractType }>();

  const contractId = params.id;
  const contractType = params.type || "single";

  const { data: contract, isLoading, error } = useRentalContractDetailQuery(contractId, contractType);
  const { formatCurrency, formatDate } = useFormatters();

  const handleBack = () => {
    router.back();
  };

  const handleViewSchedule = () => {
    if (contract) {
      router.push(`/rentals/installments?contractId=${contract.id}&contractType=${contract.contractType}` as Href);
    }
  };

  const stateStyle = React.useMemo(() => {
    if (!contract) return { bg: "", text: "", label: "" };
    const state = contract.state as ContractState;
    switch (state) {
      case "active":
      case "rented":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
          text: "text-emerald-700 dark:text-emerald-300",
          label: t("rental.state." + state as any),
        };
      case "expired":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40",
          text: "text-amber-700 dark:text-amber-300",
          label: t("rental.state.expired"),
        };
      case "termination":
      case "cancelled":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/40",
          text: "text-rose-700 dark:text-rose-300",
          label: t("rental.state." + state as any),
        };
      case "draft":
      default:
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          label: t("rental.state.draft"),
        };
    }
  }, [contract, t]);

  const periodLabel = React.useMemo(() => {
    if (!contract) return "";
    const period = contract.period as PaymentPeriod;
    const keyMap: Record<PaymentPeriod, string> = {
      monthly: "rental.periodMonthly",
      one_third: "rental.periodOneThird",
      quarterly: "rental.periodQuarterly",
      biannually: "rental.periodBiannually",
      annually: "rental.periodAnnually",
    };
    return t((keyMap[period] || "rental.periodMonthly") as any);
  }, [contract, t]);

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title={t("rental.contractDetailsTitle")} onBack={handleBack} />

      <View className="flex-1 w-full max-w-xl self-center">
        {isLoading || !contract ? (
          <View className="flex-1 items-center justify-center py-12">
            <AppActivityIndicator size="large" />
          </View>
        ) : error ? (
          <View className="p-6 items-center justify-center">
            <Text className="text-sm font-semibold text-destructive text-center">
              {String(error)}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: insets.bottom + 40,
              paddingHorizontal: 20,
              flexDirection: "column",
              gap: 20,
            }}
            className="flex-1 w-full"
          >
            {/* Contract Header Banner */}
            <View className="w-full p-5 rounded-3xl bg-card border border-border/50 flex-col gap-3">
              <AppRow className="w-full justify-between items-center">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-10 h-10 rounded-2xl bg-indigo-500/10 items-center justify-center">
                    <AppIcon name="rentals" size={20} color="#6366F1" />
                  </View>
                  <View className="flex-col">
                    <Text
                      className="text-base font-extrabold text-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {contract.reference}
                    </Text>
                    <Text
                      className="text-xs font-medium text-muted-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {contract.contractType === "multi" ? t("rental.typeMulti") : t("rental.typeSingle")} • {periodLabel}
                    </Text>
                  </View>
                </View>

                <View className={`px-3 py-1 rounded-full ${stateStyle.bg}`}>
                  <Text
                    className={`text-xs font-bold uppercase ${stateStyle.text}`}
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {stateStyle.label}
                  </Text>
                </View>
              </AppRow>

              {/* Price overview */}
              <View className="w-full p-4 rounded-2xl bg-muted/40 flex-row items-center justify-between mt-1">
                <View className="flex-col gap-1 items-start">
                  <Text
                    className="text-[11px] font-semibold text-muted-foreground"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {t("rental.rentalPrice")}
                  </Text>
                  <Text
                    className="text-lg font-bold text-foreground"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {formatCurrency(contract.rentalPrice, contract.currency?.code || "EGP")}
                  </Text>
                </View>

                <View className="w-[1px] h-8 bg-border/60 mx-2" />

                <View className="flex-col gap-1 items-start">
                  <Text
                    className="text-[11px] font-semibold text-muted-foreground"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {t("rental.insuranceAmount")}
                  </Text>
                  <Text
                    className="text-lg font-bold text-foreground opacity-90"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {formatCurrency(contract.insuranceAmount, contract.currency?.code || "EGP")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Button: View Payment Schedule */}
            <Pressable
              accessibilityRole="button"
              onPress={handleViewSchedule}
              className="w-full py-4 px-5 rounded-2xl bg-primary items-center justify-center flex-row gap-2 active:opacity-90 shadow-xs"
            >
              <AppIcon name="invoices" size={18} colorToken="--primary-foreground" />
              <Text className="text-sm font-bold text-primary-foreground">
                {t("rental.viewSchedule")} ({contract.installmentCount})
              </Text>
            </Pressable>

            {/* Key Contract Details List */}
            <View className="w-full p-5 rounded-3xl bg-card border border-border/50 flex-col gap-4">
              <Text
                className="text-sm font-extrabold text-foreground tracking-wide uppercase"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("tickets.detailsTitle")}
              </Text>

              {/* Dates */}
              <View className="flex-col gap-3">
                {contract.startDate && (
                  <AppRow className="w-full justify-between items-center">
                    <Text
                      className="text-xs font-semibold text-muted-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {t("rental.startDate")}
                    </Text>
                    <Text
                      className="text-xs font-bold text-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {formatDate(contract.startDate)}
                    </Text>
                  </AppRow>
                )}

                {contract.endDate && (
                  <AppRow className="w-full justify-between items-center">
                    <Text
                      className="text-xs font-semibold text-muted-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {t("rental.endDate")}
                    </Text>
                    <Text
                      className="text-xs font-bold text-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {formatDate(contract.endDate)}
                    </Text>
                  </AppRow>
                )}

                {contract.adjustedStartDate && (
                  <AppRow className="w-full justify-between items-center">
                    <Text
                      className="text-xs font-semibold text-muted-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {t("rental.adjustedStartDate")}
                    </Text>
                    <Text
                      className="text-xs font-bold text-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {formatDate(contract.adjustedStartDate)}
                    </Text>
                  </AppRow>
                )}

                {contract.adjustedEndDate && (
                  <AppRow className="w-full justify-between items-center">
                    <Text
                      className="text-xs font-semibold text-muted-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {t("rental.adjustedEndDate")}
                    </Text>
                    <Text
                      className="text-xs font-bold text-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {formatDate(contract.adjustedEndDate)}
                    </Text>
                  </AppRow>
                )}

                <AppRow className="w-full justify-between items-center">
                  <Text
                    className="text-xs font-semibold text-muted-foreground"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {t("rental.gracePeriod")}
                  </Text>
                  <Text
                    className="text-xs font-bold text-foreground"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {t("rental.gracePeriodDays").replace("{{days}}", String(contract.gracePeriodDays || 0))}
                  </Text>
                </AppRow>

                {contract.annualIncrease && (
                  <AppRow className="w-full justify-between items-center">
                    <Text
                      className="text-xs font-semibold text-muted-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {t("rental.annualIncrease")}
                    </Text>
                    <Text
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {t("rental.annualIncreasePercent").replace("{{percent}}", String(contract.annualIncreasePercent || 0))}
                    </Text>
                  </AppRow>
                )}
              </View>
            </View>

            {/* Covered Units Section */}
            <View className="w-full p-5 rounded-3xl bg-card border border-border/50 flex-col gap-3">
              <Text
                className="text-sm font-extrabold text-foreground tracking-wide uppercase"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("rental.unitsCovered")}
              </Text>

              {contract.units && contract.units.length > 0 ? (
                contract.units.map((unit) => (
                  <View key={unit.id} className="p-3 rounded-2xl bg-muted/40 flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                      <AppIcon name="facility" size={16} colorToken="--primary" />
                    </View>
                    <Text
                      className="text-xs font-bold text-foreground flex-1"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {unit.name}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-xs text-muted-foreground">—</Text>
              )}
            </View>

            {/* Notes Section if notes present */}
            {Boolean(contract.notes) && (
              <View className="w-full p-5 rounded-3xl bg-card border border-border/50 flex-col gap-2">
                <Text
                  className="text-sm font-extrabold text-foreground tracking-wide uppercase"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("rental.notes")}
                </Text>
                <Text
                  className="text-xs text-muted-foreground leading-5"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {contract.notes}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
