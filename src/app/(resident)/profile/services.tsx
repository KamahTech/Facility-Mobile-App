import React from "react";
import { View, RefreshControl } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { Stack } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { ServiceCostCard } from "@/components/service-cost-card";
import { LegendList } from "@legendapp/list/react-native";
import { useI18n } from "@/hooks/use-i18n";
import { useOwnerStore } from "@/stores/owner-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function ServicesScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const {
    services,
    fetchServices,
    fetchNextServices,
    hasNextServices,
    servicesLoading,
    servicesError,
  } = useOwnerStore({ enableServices: true });
  const isTransitionFinished = useScreenTransition();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchServices();
    } finally {
      setRefreshing(false);
    }
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
        title={t("ownerFinancials.serviceCost")}
        onBack={() => router.back()}
      />

      {servicesLoading && services.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          {isTransitionFinished && <AppActivityIndicator size="large"  />}
        </View>
      ) : (
        <View className="flex-1 mt-2">
          {servicesError && (
            <View className="bg-destructive/10 p-4 rounded-2xl mx-5 mb-4">
              <AppText className="text-sm font-semibold text-destructive text-start">{servicesError}</AppText>
            </View>
          )}

          <LegendList
            data={services}
            recycleItems={true}
            estimatedItemSize={180}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ServiceCostCard service={item} />
            )}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
            }
            onEndReached={() => {
              if (hasNextServices) {
                fetchNextServices();
              }
            }}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 40,
              paddingTop: 8,
            }}
            className="flex-1 w-full max-w-xl self-center"
            ListEmptyComponent={
              <View className="items-center py-12">
                <AppText className="text-sm text-muted-foreground">{t("ownerFinancials.noServiceCosts")}</AppText>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
}
