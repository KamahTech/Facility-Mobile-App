import React from "react";
import { View, RefreshControl } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { Stack } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { ClaimCard } from "@/components/claim-card";
import { LegendList } from "@legendapp/list/react-native";
import { useI18n } from "@/hooks/use-i18n";
import { useOwnerClaimDetailsQuery, useOwnerStore } from "@/stores/owner-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function ClaimsScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const {
    claims,
    fetchClaims,
    fetchNextClaims,
    hasNextClaims,
    submitInquiry,
    claimsLoading,
    claimsError,
  } = useOwnerStore({ enableClaims: true });
  const isTransitionFinished = useScreenTransition();

  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedClaimId, setSelectedClaimId] = React.useState<string | null>(null);
  const claimDetailsQuery = useOwnerClaimDetailsQuery(selectedClaimId ?? undefined);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchClaims();
    } finally {
      setRefreshing(false);
    }
  };

  const handleClaimPress = (claimId: string) => {
    setSelectedClaimId((currentId) => currentId === claimId ? null : claimId);
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
        title={t("claims.title")}
        onBack={() => router.back()}
      />

      {claimsLoading && claims.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          {isTransitionFinished && <AppActivityIndicator size="large"  />}
        </View>
      ) : (
        <View className="flex-1 mt-2">
          {claimsError && (
            <View className="bg-destructive/10 p-4 rounded-2xl mx-5 mb-4">
              <AppText className="text-sm font-semibold text-destructive text-start">{claimsError}</AppText>
            </View>
          )}

          <LegendList
            data={claims}
            recycleItems={true}
            estimatedItemSize={120}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ClaimCard
                claim={item}
                isExpanded={selectedClaimId === item.id}
                onPress={() => handleClaimPress(item.id)}
                currentClaimDetails={claimDetailsQuery.data ?? null}
                detailsError={claimDetailsQuery.error?.message ?? null}
                detailsLoading={claimDetailsQuery.isLoading}
                onRetryDetails={() => claimDetailsQuery.refetch()}
                submitInquiry={submitInquiry}
              />
            )}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
            }
            onEndReached={() => {
              if (hasNextClaims) {
                fetchNextClaims();
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
                <AppText className="text-sm text-muted-foreground">{t("claims.noClaims")}</AppText>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
}
