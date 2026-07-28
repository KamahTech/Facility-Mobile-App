import React from "react";
import { View, Text, RefreshControl } from "react-native";
import { Stack } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { LegendList } from "@legendapp/list/react-native";
import { ScreenHeader } from "@/components/screen-header";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { RentalInstallmentCard } from "@/components/rental-installment-card";
import { useI18n } from "@/hooks/use-i18n";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import { useUpcomingInstallmentsQuery } from "@/hooks/use-rental";
import type { RentalInstallment } from "@/lib/rental-types";

export default function UpcomingPaymentsScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const isTransitionFinished = useScreenTransition();

  const upcomingQuery = useUpcomingInstallmentsQuery();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await upcomingQuery.refetch();
    setRefreshing(false);
  }, [upcomingQuery]);

  const handleBack = () => {
    router.back();
  };

  const installments = upcomingQuery.data || [];

  const renderItem = React.useCallback(({ item }: { item: RentalInstallment }) => {
    return <RentalInstallmentCard installment={item} />;
  }, []);

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
      <ScreenHeader title={t("rental.upcomingPayments")} onBack={handleBack} />

      <View className="flex-1 w-full max-w-xl self-center px-5">
        {!isTransitionFinished || upcomingQuery.isLoading ? (
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
