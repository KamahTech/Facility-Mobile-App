import React from "react";
import { View, RefreshControl } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { Stack, router } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { ClaimCard } from "@/components/claim-card";
import { LegendList } from "@legendapp/list/react-native";
import { useI18n } from "@/hooks/use-i18n";
import { useOwnerStore } from "@/stores/owner-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function ClaimsScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const { claims, currentClaim, fetchClaims, fetchNextClaims, hasNextClaims, fetchClaimDetails, submitInquiry, loading, error, clearError } = useOwnerStore({ enableClaims: true });
  const isTransitionFinished = useScreenTransition();

  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedClaimId, setSelectedClaimId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    clearError();
    await fetchClaims();
  }, [fetchClaims, clearError]);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClaimPress = async (claimId: string) => {
    if (selectedClaimId === claimId) {
      setSelectedClaimId(null);
      return;
    }
    
    setSelectedClaimId(claimId);
    try {
      await fetchClaimDetails(claimId);
    } catch (e) {
      console.error(e);
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
        title={t("claims.title")}
        onBack={() => router.back()}
      />

      {loading && claims.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          {isTransitionFinished && <AppActivityIndicator size="large"  />}
        </View>
      ) : (
        <View className="flex-1 mt-2">
          {error && (
            <View className="bg-destructive/10 p-4 rounded-2xl mx-5 mb-4">
              <AppText className="text-sm font-semibold text-destructive text-start">{error}</AppText>
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
                currentClaimDetails={currentClaim}
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
