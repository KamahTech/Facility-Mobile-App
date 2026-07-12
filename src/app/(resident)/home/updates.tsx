import React from "react";
import { View } from "react-native";
import { Stack, router } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";
import { LegendList } from "@legendapp/list/react-native";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { NewsCard } from "@/components/news-card";
import { PollCard } from "@/components/poll-card";
import { CommunityUpdatesSkeleton } from "@/components/community-updates-skeleton";
import { useI18n } from "@/hooks/use-i18n";
import { useCommunityStore } from "@/stores/community-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

/**
 * A dedicated screen to view all active community updates (News and Polls).
 * Implements LegendList for fast recycling performance, supports responsive layouts,
 * RTL/LTR positioning, and utilizes animated shimmer skeletons during load states.
 */
export default function AllCommunityUpdatesScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const { updates, loading, fetchNextUpdates, hasNextUpdates } = useCommunityStore({ enableUpdates: true });
  const isTransitionFinished = useScreenTransition();

  const handleBack = () => {
    router.back();
  };

  const handlePostPress = (itemId: string) => {
    router.push(`/home/post/${itemId}`);
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

      {/* Screen Header */}
      <ScreenHeader title={t("communityUpdates.title")} onBack={handleBack} />

      {/* Responsive Main Container */}
      <View className="flex-1 w-full max-w-xl self-center px-5">
        {loading && updates.length === 0 ? (
          <View className="py-4">
            {isTransitionFinished && <CommunityUpdatesSkeleton />}
          </View>
        ) : (
          <LegendList
            data={updates}
            keyExtractor={(item) => item.id}
            estimatedItemSize={150}
            recycleItems={true}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasNextUpdates) {
                fetchNextUpdates();
              }
            }}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: insets.bottom + 40,
            }}
            ListHeaderComponent={
              <AppText className="text-start text-base leading-6 text-muted-foreground mb-6">
                {t("communityUpdates.allDescription")}
              </AppText>
            }
            renderItem={({ item }) => {
              if (item.type === "news") {
                return (
                  <View className="mb-4">
                    <NewsCard item={item} onPress={() => handlePostPress(item.id)} />
                  </View>
                );
              }
              if (item.type === "poll") {
                return (
                  <View className="mb-4">
                    <PollCard item={item} onPressHeader={() => handlePostPress(item.id)} />
                  </View>
                );
              }
              return null;
            }}
            className="flex-1 w-full"
          />
        )}
      </View>
    </View>
  );
}
