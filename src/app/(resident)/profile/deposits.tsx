import React from "react";
import { View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useDepositsStore, type MaintenanceDeposit } from "@/stores/deposits-store";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function DepositsScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const { formatDate, formatCurrency } = useFormatters();
  const { deposits, fetchDeposits, loading, error, clearError } = useDepositsStore();
  const isTransitionFinished = useScreenTransition();

  const [refreshing, setRefreshing] = React.useState(false);
  const mutedForeground = useThemeToken("--muted-foreground");

  const loadDeposits = React.useCallback(async () => {
    clearError();
    await fetchDeposits();
  }, [fetchDeposits, clearError]);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDeposits();
    setRefreshing(false);
  };

  const getStatusConfig = (status: string) => {
    const norm = status.toLowerCase();
    if (norm.includes("collect")) {
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        text: "text-emerald-700 dark:text-emerald-400",
      };
    } else if (norm.includes("return")) {
      return {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        text: "text-blue-700 dark:text-blue-400",
      };
    } else {
      return {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        text: "text-amber-700 dark:text-amber-400",
      };
    }
  };

  const renderDepositCard = (item: MaintenanceDeposit) => {
    const statusConfig = getStatusConfig(item.status);
    const localizedPeriod =
      item.periodic === "annual"
        ? t("connectUnit.annual")
        : item.periodic === "semi_annual"
        ? t("connectUnit.semiAnnual")
        : item.periodic === "quarterly"
        ? t("connectUnit.quarterly")
        : t("connectUnit.monthly");

    return (
      <View
        key={item.id}
        className="w-full bg-card rounded-3xl p-5 flex-col gap-4 shadow-sm mb-4"
      >
        <AppRow className="items-center justify-between gap-3">
          <AppRow className="items-center gap-3.5 flex-1 min-w-0">
            <View className="w-11 h-11 rounded-xl items-center justify-center bg-primary/10">
              <AppIcon name="linkUnit" size={22} colorToken="--primary" />
            </View>
            <View className="flex-1 min-w-0 text-start">
              <AppText className="text-base font-bold text-foreground text-start" numberOfLines={1}>
                {item.buildingNumber ? `${item.buildingNumber} - ${item.unitNumber}` : item.unitNumber}
              </AppText>
              <AppText className="text-xs text-muted-foreground mt-0.5 text-start">
                {t("deposits.unit")} #{item.id}
              </AppText>
            </View>
          </AppRow>

          <View className={`px-2.5 py-0.5 rounded-full ${statusConfig.bg}`}>
            <AppText className={`text-[10px] font-bold uppercase tracking-wider ${statusConfig.text}`}>
              {item.status}
            </AppText>
          </View>
        </AppRow>

        <View className="flex-col gap-2.5">
          <AppRow className="justify-between items-center">
            <AppText className="text-sm text-muted-foreground text-start">
              {t("deposits.amount")}
            </AppText>
            <AppText className="text-sm font-extrabold text-foreground text-end">
              {formatCurrency(item.amount)}
            </AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-sm text-muted-foreground text-start">
              {t("deposits.period")}
            </AppText>
            <AppText className="text-sm font-semibold text-foreground text-end">
              {localizedPeriod}
            </AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-sm text-muted-foreground text-start">
              {t("deposits.rate")}
            </AppText>
            <AppText className="text-sm font-semibold text-foreground text-end">
              {item.rate}%
            </AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-sm text-muted-foreground text-start">
              {t("deposits.returnValue")}
            </AppText>
            <AppText className="text-sm font-bold text-emerald-600 dark:text-emerald-400 text-end">
              +{formatCurrency(item.returnValue)}
            </AppText>
          </AppRow>

          {typeof item.expirationDate === "string" && (
            <>
              <AppRow className="justify-between items-center">
                <AppText className="text-xs text-muted-foreground text-start">
                  {t("deposits.expiration")}
                </AppText>
                <AppText className="text-xs text-muted-foreground text-end">
                  {formatDate(item.expirationDate)}
                </AppText>
              </AppRow>
            </>
          )}
        </View>
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
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader
        title={t("profile.depositsTitle")}
        onBack={() => router.back()}
      />

      <View className="flex-1 w-full max-w-xl self-center px-5">
        {loading && deposits.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            {isTransitionFinished && <ActivityIndicator size="large" color="#4F46E5" />}
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#4F46E5"
              />
            }
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: insets.bottom + 40,
            }}
            className="flex-1 w-full"
          >
            {error && (
              <View className="bg-destructive/10 p-3 rounded-xl mb-4">
                <AppText className="text-sm font-semibold text-destructive text-start">
                  {error}
                </AppText>
              </View>
            )}

            {deposits.length === 0 ? (
              <View className="items-center justify-center py-16 px-6">
                <View className="w-16 h-16 rounded-full bg-secondary/50 items-center justify-center mb-4">
                  <AppIcon name="linkUnit" size={28} color={mutedForeground} />
                </View>
                <AppText align="center" className="text-base text-muted-foreground leading-6">
                  {t("deposits.noDeposits")}
                </AppText>
              </View>
            ) : (
              deposits.map(renderDepositCard)
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
