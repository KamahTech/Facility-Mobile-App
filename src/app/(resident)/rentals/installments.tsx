import React from "react";
import { View, Text, Pressable, RefreshControl, ScrollView } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { LegendList } from "@legendapp/list/react-native";
import { ScreenHeader } from "@/components/screen-header";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { RentalInstallmentCard } from "@/components/rental-installment-card";
import { useI18n } from "@/hooks/use-i18n";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import { useRentalInstallmentsQuery, getInstallmentEffectiveState } from "@/hooks/use-rental";
import type { ContractType, RentalInstallment } from "@/lib/rental-types";

type FilterKey = "all" | "due" | "overdue" | "partial" | "paid" | "rent" | "insurance" | "service";

export default function InstallmentScheduleScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const isTransitionFinished = useScreenTransition();

  const params = useLocalSearchParams<{ contractId: string; contractType?: ContractType }>();
  const contractId = params.contractId;
  const contractType = params.contractType || "single";

  const [activeFilter, setActiveFilter] = React.useState<FilterKey>("all");

  const installmentsQuery = useRentalInstallmentsQuery(
    contractId,
    contractType,
    activeFilter === "rent" || activeFilter === "insurance" || activeFilter === "service"
      ? { installmentType: activeFilter }
      : activeFilter === "paid"
      ? { state: "paid" }
      : {}
  );

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await installmentsQuery.refetch();
    setRefreshing(false);
  }, [installmentsQuery]);

  const handleBack = () => {
    router.back();
  };

  const installments = React.useMemo(() => {
    const rawItems = installmentsQuery.data?.pages.flatMap((page) => page.items) || [];
    if (activeFilter === "all") return rawItems;
    if (activeFilter === "due") {
      return rawItems.filter((item) => getInstallmentEffectiveState(item) === "due");
    }
    if (activeFilter === "overdue") {
      return rawItems.filter((item) => getInstallmentEffectiveState(item) === "overdue");
    }
    if (activeFilter === "partial") {
      return rawItems.filter((item) => getInstallmentEffectiveState(item) === "partial_paid");
    }
    if (activeFilter === "paid") {
      return rawItems.filter((item) => getInstallmentEffectiveState(item) === "paid");
    }
    if (activeFilter === "rent" || activeFilter === "insurance" || activeFilter === "service") {
      return rawItems.filter((item) => item.type === activeFilter);
    }
    return rawItems;
  }, [installmentsQuery.data, activeFilter]);

  const renderItem = React.useCallback(({ item }: { item: RentalInstallment }) => {
    return <RentalInstallmentCard installment={item} />;
  }, []);

  const renderFilters = () => {
    const filters: { key: FilterKey; labelKey: string }[] = [
      { key: "all", labelKey: "rental.filter.all" },
      { key: "due", labelKey: "rental.filter.due" },
      { key: "overdue", labelKey: "rental.filter.overdue" },
      { key: "partial", labelKey: "rental.filter.partial" },
      { key: "paid", labelKey: "rental.filter.paid" },
      { key: "rent", labelKey: "rental.installment.type.rent" },
      { key: "insurance", labelKey: "rental.installment.type.insurance" },
      { key: "service", labelKey: "rental.installment.type.service" },
    ];

    return (
      <View className="w-full mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingHorizontal: 20,
          }}
          className="w-full"
        >
          {filters.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                accessibilityRole="button"
                onPress={() => setActiveFilter(f.key)}
                className={`py-2.5 px-4 rounded-xl items-center justify-center transition-all ${
                  isActive ? "bg-primary" : "bg-card border border-border/40"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                  numberOfLines={1}
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t(f.labelKey as any)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <View className="py-16 items-center justify-center">
        <Text
          className="text-xs font-semibold text-muted-foreground text-center"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("rental.noUpcoming")}
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
      <ScreenHeader title={t("rental.paymentSchedule")} onBack={handleBack} />

      <View className="flex-1 w-full max-w-xl self-center">
        {renderFilters()}

        {!isTransitionFinished || (installmentsQuery.isLoading && installments.length === 0) ? (
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
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#4F46E5"
              />
            }
            onEndReached={() => {
              if (installmentsQuery.hasNextPage && !installmentsQuery.isFetchingNextPage) {
                installmentsQuery.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: insets.bottom + 40,
              paddingHorizontal: 20,
            }}
            className="flex-1 w-full"
          />
        )}
      </View>
    </View>
  );
}
