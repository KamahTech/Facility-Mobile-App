import React from "react";
import { View, RefreshControl } from "react-native";
import { LegendList } from "@legendapp/list/react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { Stack } from "expo-router";
import { router } from "@/lib/navigation";
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
  }, [clearError, fetchDeposits]);

  React.useEffect(() => {
    if (isTransitionFinished) {
      loadDeposits();
    }
  }, [isTransitionFinished, loadDeposits]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDeposits();
    setRefreshing(false);
  };

  const getStatusStyle = (status: string) => {
    const norm = status.toLowerCase();
    if (norm.includes("collect") || norm.includes("held")) {
      return {
        bg: "bg-amber-100 dark:bg-amber-950/30",
        text: "text-amber-700 dark:text-amber-400",
        label: status,
      };
    } else if (norm.includes("return") || norm.includes("refund")) {
      return {
        bg: "bg-emerald-100 dark:bg-emerald-950/30",
        text: "text-emerald-700 dark:text-emerald-400",
        label: status,
      };
    } else {
      return {
        bg: "bg-secondary",
        text: "text-muted-foreground",
        label: status,
      };
    }
  };

  const renderDepositCard = ({ item: deposit }: { item: MaintenanceDeposit }) => {
    const statusInfo = getStatusStyle(deposit.status);
    const unitTitle = deposit.buildingNumber
      ? `${deposit.buildingNumber} - ${deposit.unitNumber}`
      : deposit.unitNumber;

    return (
      <View
        key={deposit.id}
        className="w-full bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border/20 flex-col gap-4"
      >
        <AppRow className="items-center justify-between">
          <AppRow className="items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
              <AppIcon name="linkUnit" size={20} colorToken="--primary" />
            </View>
            <View className="flex-col">
              <AppText className="text-base font-bold text-foreground">
                {unitTitle}
              </AppText>
              <AppText className="text-xs text-muted-foreground mt-0.5">
                Ref: #{deposit.id}
              </AppText>
            </View>
          </AppRow>

          <View className={`px-2.5 py-1 rounded-full ${statusInfo.bg}`}>
            <AppText className={`text-xs font-bold ${statusInfo.text}`}>
              {statusInfo.label}
            </AppText>
          </View>
        </AppRow>

        <View className="bg-secondary/40 rounded-xl p-3.5 flex-col gap-2.5">
          <AppRow className="items-center justify-between">
            <AppText className="text-xs text-muted-foreground">
              {t("deposits.amount")}
            </AppText>
            <AppText className="text-sm font-bold text-foreground">
              {formatCurrency(deposit.amount)}
            </AppText>
          </AppRow>

          <AppRow className="items-center justify-between">
            <AppText className="text-xs text-muted-foreground">
              {t("deposits.rate")}
            </AppText>
            <AppText className="text-xs font-medium text-foreground">
              {deposit.rate}%
            </AppText>
          </AppRow>

          <AppRow className="items-center justify-between">
            <AppText className="text-xs text-muted-foreground">
              {t("deposits.returnValue")}
            </AppText>
            <AppText className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(deposit.returnValue)}
            </AppText>
          </AppRow>

          {typeof deposit.expirationDate === "string" && (
            <AppRow className="items-center justify-between">
              <AppText className="text-xs text-muted-foreground">
                {t("deposits.expiration")}
              </AppText>
              <AppText className="text-xs font-medium text-foreground">
                {formatDate(deposit.expirationDate)}
              </AppText>
            </AppRow>
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      className="flex-1"
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

      <View className="flex-1 px-5 w-full max-w-xl self-center pt-2">
        {loading && deposits.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <AppActivityIndicator size="large" colorToken="--primary" />
          </View>
        ) : (
          <LegendList
            data={deposits}
            keyExtractor={(item) => item.id}
            renderItem={renderDepositCard}
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
            ListHeaderComponent={
              error ? (
                <View className="bg-destructive/10 p-3 rounded-xl mb-4">
                  <AppText className="text-sm font-semibold text-destructive text-start">
                    {error}
                  </AppText>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-16 px-6">
                <View className="w-16 h-16 rounded-full bg-secondary/50 items-center justify-center mb-4">
                  <AppIcon name="linkUnit" size={28} color={mutedForeground} />
                </View>
                <AppText align="center" className="text-base text-muted-foreground leading-6">
                  {t("deposits.noDeposits")}
                </AppText>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
