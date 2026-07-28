import React from "react";
import { View, Text, RefreshControl } from "react-native";
import { Stack } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { LegendList } from "@legendapp/list/react-native";
import { ScreenHeader } from "@/components/screen-header";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { RentalInstallmentCard } from "@/components/rental-installment-card";
import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import { useOverdueInstallmentsQuery } from "@/hooks/use-rental";
import type { RentalInstallment } from "@/lib/rental-types";

export default function OverduePaymentsScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const isTransitionFinished = useScreenTransition();
  const { formatCurrency } = useFormatters();

  const overdueQuery = useOverdueInstallmentsQuery();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await overdueQuery.refetch();
    setRefreshing(false);
  }, [overdueQuery]);

  const handleBack = () => {
    router.back();
  };

  const installments = overdueQuery.data || [];

  const totalOverduePayable = React.useMemo(() => {
    return installments.reduce((sum, item) => sum + (item.remainingAmount || 0), 0);
  }, [installments]);

  const formattedTotalOverdue = formatCurrency(totalOverduePayable, installments[0]?.currency?.code || "EGP");

  const renderHeader = () => {
    if (installments.length === 0) return null;
    return (
      <View className="w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 mb-4 flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-xl bg-rose-500/20 items-center justify-center shrink-0">
          <AppIcon name="tickets" size={20} color="#F43F5E" />
        </View>
        <View className="flex-col flex-1">
          <Text
            className="text-xs font-bold text-rose-700 dark:text-rose-300"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.overdueAlert").replace("{{count}}", String(installments.length))}
          </Text>
          <Text
            className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.totalOutstanding")}: {formattedTotalOverdue}
          </Text>
        </View>
      </View>
    );
  };

  const renderItem = React.useCallback(({ item }: { item: RentalInstallment }) => {
    return <RentalInstallmentCard installment={item} />;
  }, []);

  const renderEmpty = () => {
    return (
      <View className="py-16 items-center justify-center flex-col gap-2">
        <View className="w-12 h-12 rounded-full bg-emerald-500/10 items-center justify-center">
          <AppIcon name="check" size={24} color="#10B981" />
        </View>
        <Text
          className="text-sm font-bold text-emerald-700 dark:text-emerald-300 text-center"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("rental.noOverdue")}
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
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title={t("rental.overduePayments")} onBack={handleBack} />

      <View className="flex-1 w-full max-w-xl self-center px-5">
        {!isTransitionFinished || overdueQuery.isLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <AppActivityIndicator size="large" />
          </View>
        ) : (
          <LegendList
            data={installments}
            recycleItems={true}
            estimatedItemSize={170}
            keyExtractor={(item: RentalInstallment) => `${item.contractType}_${item.id}`}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#4F46E5"
              />
            }
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: insets.bottom + 40,
            }}
            className="flex-1 w-full"
          />
        )}
      </View>
    </View>
  );
}
