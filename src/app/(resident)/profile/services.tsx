import React from "react";
import { View, RefreshControl, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { ServiceCostCard } from "@/components/service-cost-card";
import { LegendList } from "@legendapp/list/react-native";
import { useI18n } from "@/hooks/use-i18n";
import { useOwnerStore } from "@/stores/owner-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function ServicesScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { services, fetchServices, fetchNextServices, hasNextServices, loading, error, clearError } = useOwnerStore({ enableServices: true });
  const isTransitionFinished = useScreenTransition();

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = React.useCallback(async () => {
    clearError();
    await fetchServices();
  }, [fetchServices, clearError]);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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

      {loading && services.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          {isTransitionFinished && <ActivityIndicator size="large" color="#4F46E5" />}
        </View>
      ) : (
        <View className="flex-1 mt-2">
          {error && (
            <View className="bg-destructive/10 p-4 rounded-2xl border border-destructive/20 mx-5 mb-4">
              <AppText className="text-sm font-semibold text-destructive text-start">{error}</AppText>
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
                <AppText className="text-sm text-muted-foreground">{t("ownerUnits.noUnits")}</AppText>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
}
