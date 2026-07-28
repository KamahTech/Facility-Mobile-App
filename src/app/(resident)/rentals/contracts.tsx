import React from "react";
import { View, Text, Pressable, RefreshControl, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { LegendList } from "@legendapp/list/react-native";
import { ScreenHeader } from "@/components/screen-header";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { RentalContractCard } from "@/components/rental-contract-card";
import { useI18n } from "@/hooks/use-i18n";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import { useRentalContractsQuery } from "@/hooks/use-rental";
import type { RentalContract } from "@/lib/rental-types";

type FilterKey = "all" | "active" | "expired" | "terminated";

export default function MyContractsScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const isTransitionFinished = useScreenTransition();

  const [activeFilter, setActiveFilter] = React.useState<FilterKey>("all");
  const contractsQuery = useRentalContractsQuery();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await contractsQuery.refetch();
    setRefreshing(false);
  }, [contractsQuery]);

  const handleBack = () => {
    router.back();
  };

  const filteredContracts = React.useMemo(() => {
    const list = contractsQuery.data || [];
    switch (activeFilter) {
      case "active":
        return list.filter((c) => c.state === "active" || c.state === "rented");
      case "expired":
        return list.filter((c) => c.state === "expired");
      case "terminated":
        return list.filter((c) => c.state === "termination" || c.state === "cancelled");
      case "all":
      default:
        return list;
    }
  }, [contractsQuery.data, activeFilter]);

  const renderItem = React.useCallback(({ item }: { item: RentalContract }) => {
    return <RentalContractCard contract={item} />;
  }, []);

  const renderFilters = () => {
    const filters: { key: FilterKey; labelKey: string }[] = [
      { key: "all", labelKey: "rental.filter.all" },
      { key: "active", labelKey: "rental.filter.active" },
      { key: "expired", labelKey: "rental.filter.expired" },
      { key: "terminated", labelKey: "rental.filter.terminated" },
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
          {t("rental.noContracts")}
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
      <ScreenHeader title={t("rental.myContracts")} onBack={handleBack} />

      <View className="flex-1 w-full max-w-xl self-center">
        {renderFilters()}

        {!isTransitionFinished || contractsQuery.isLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <AppActivityIndicator size="large" />
          </View>
        ) : (
          <LegendList
            data={filteredContracts}
            recycleItems={true}
            estimatedItemSize={180}
            keyExtractor={(item: RentalContract) => `${item.contractType}_${item.id}`}
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
