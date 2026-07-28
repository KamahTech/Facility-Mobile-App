import React from "react";
import { View, Text, RefreshControl, ScrollView, Pressable } from "react-native";
import { Stack, type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { ScreenHeader } from "@/components/screen-header";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { RentalSummaryCard } from "@/components/rental-summary-card";
import { RentalContractCard } from "@/components/rental-contract-card";
import { SectionHeader } from "@/components/section-header";
import { useI18n } from "@/hooks/use-i18n";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import {
  useRentalSummaryQuery,
  useRentalContractsQuery,
  useOverdueInstallmentsQuery,
} from "@/hooks/use-rental";
import { AppIcon } from "@/components/app-icon";

export default function RentalDashboardScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const isTransitionFinished = useScreenTransition();

  const summaryQuery = useRentalSummaryQuery();
  const contractsQuery = useRentalContractsQuery({ state: "rented" });
  const overdueQuery = useOverdueInstallmentsQuery();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([
      summaryQuery.refetch(),
      contractsQuery.refetch(),
      overdueQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [summaryQuery, contractsQuery, overdueQuery]);

  const activeContracts = contractsQuery.data || [];
  const overdueItems = overdueQuery.data || [];

  const handleBack = () => {
    router.back();
  };

  const handleSeeAllContracts = () => {
    router.push("/rentals/contracts" as Href);
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
      <ScreenHeader title={t("rental.title")} onBack={handleBack} />

      <View className="flex-1 w-full max-w-xl self-center">
        {!isTransitionFinished || (summaryQuery.isLoading && !summaryQuery.data) ? (
          <View className="flex-1 items-center justify-center py-12">
            <AppActivityIndicator size="large" />
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
              paddingHorizontal: 20,
              flexDirection: "column",
              gap: 20,
            }}
            className="flex-1 w-full"
          >
            {/* Overdue Warning Alert if any overdue items */}
            {overdueItems.length > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/rentals/overdue" as Href)}
                className="w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex-row items-center gap-3 active:opacity-85"
              >
                <View className="w-10 h-10 rounded-xl bg-rose-500/20 items-center justify-center shrink-0">
                  <AppIcon name="tickets" size={20} color="#F43F5E" />
                </View>
                <View className="flex-col flex-1">
                  <Text
                    className="text-xs font-bold text-rose-700 dark:text-rose-300"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {t("rental.overdueAlert").replace("{{count}}", String(overdueItems.length))}
                  </Text>
                </View>
                <AppIcon
                  name={isRTL ? "chevronLeft" : "chevronRight"}
                  size={18}
                  color="#F43F5E"
                />
              </Pressable>
            )}

            {/* Summary & Shortcuts Card */}
            <RentalSummaryCard
              summary={summaryQuery.data}
              isLoading={summaryQuery.isLoading}
            />

            {/* Active Contracts Section */}
            <View className="w-full flex-col gap-3">
              <SectionHeader
                title={t("rental.activeContracts")}
                showSeeAll={activeContracts.length > 0}
                onSeeAllPress={handleSeeAllContracts}
              />

              {contractsQuery.isLoading ? (
                <View className="py-6 items-center">
                  <AppActivityIndicator size="small" />
                </View>
              ) : activeContracts.length === 0 ? (
                <View className="p-6 rounded-2xl bg-card border border-border/40 items-center justify-center">
                  <Text
                    className="text-xs font-semibold text-muted-foreground text-center"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {t("rental.noContracts")}
                  </Text>
                </View>
              ) : (
                activeContracts.slice(0, 3).map((contract) => (
                  <RentalContractCard key={`${contract.contractType}_${contract.id}`} contract={contract} />
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
