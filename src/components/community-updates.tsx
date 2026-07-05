import React from "react";
import { View, TouchableOpacity } from "react-native";
import { router, type Href } from "expo-router";

import { AppChevron } from "@/components/app-chevron";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useCommunityStore } from "@/stores/community-store";

import { NewsCard } from "./news-card";
import { PollCard } from "./poll-card";
import { CommunityUpdatesSkeleton } from "./community-updates-skeleton";

type CommunityUpdatesProps = {
  limit?: number | null;
  showHeader?: boolean;
  showSeeAll?: boolean;
};

export function CommunityUpdates({
  limit = 4, // Default to 4 scrollable list items
  showHeader = true,
  showSeeAll = true,
}: CommunityUpdatesProps) {
  const { t } = useI18n();
  const primaryColor = useThemeToken("--primary");

  const { updates, loading } = useCommunityStore({ enableUpdates: true });

  // Fetch the latest updates based on the limit
  const visibleUpdates = React.useMemo(() => {
    return limit === null ? updates : updates.slice(0, limit);
  }, [updates, limit]);

  const handleSeeAll = () => {
    router.push("/home/updates" as Href);
  };

  const handlePostPress = (itemId: string) => {
    router.push(`/home/post/${itemId}` as Href);
  };

  return (
    <View className="w-full flex-col gap-4">
      {/* Header Row */}
      {showHeader && (
        <AppRow className="w-full items-center justify-between px-5 sm:px-8">
          <AppText
            className="text-start text-lg font-bold text-foreground animate-fade-in"
          >
            {t("communityUpdates.title")}
          </AppText>

          {showSeeAll && (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleSeeAll}
              className="active:opacity-75"
            >
              <AppRow className="items-center gap-1">
                <AppText className="text-start text-sm font-bold text-primary">
                  {t("actions.seeAll")}
                </AppText>
                <AppChevron size={14} color={primaryColor} />
              </AppRow>
            </TouchableOpacity>
          )}
        </AppRow>
      )}

      <View className="w-full px-5 sm:px-8 flex-col gap-4">
        {loading && updates.length === 0 ? (
          <CommunityUpdatesSkeleton />
        ) : (
          visibleUpdates.map((item) => {
            if (item.type === "news") {
              return (
                <NewsCard
                  key={item.id}
                  item={item}
                  onPress={() => handlePostPress(item.id)}
                />
              );
            }
            if (item.type === "poll") {
              return (
                <PollCard
                  key={item.id}
                  item={item}
                  onPressHeader={() => handlePostPress(item.id)}
                />
              );
            }
            return null;
          })
        )}
      </View>
    </View>
  );
}
