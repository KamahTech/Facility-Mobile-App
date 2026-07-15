import React from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { router } from "@/lib/navigation";
import { Image } from "expo-image";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useQuery } from "@tanstack/react-query";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { PollCard } from "@/components/poll-card";
import { ScreenHeader } from "@/components/screen-header";
import { type TranslationKey } from "@/constants/translations";
import { useI18n } from "@/hooks/use-i18n";
import { getBackendImageSource } from "@/lib/image-source";
import { useCommunityStore, type CommunityPoll } from "@/stores/community-store";

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const { updates, fetchUpdateDetails, loading } = useCommunityStore({ enableUpdates: true });
  const updateId = Array.isArray(id) ? id[0] : id;

  // Look up the post in community updates state
  const listItem = React.useMemo(() => {
    return updates.find((post) => post.id === updateId);
  }, [updates, updateId]);

  const detailQuery = useQuery({
    queryKey: ["community-update", updateId],
    queryFn: () => fetchUpdateDetails(updateId || ""),
    enabled: Boolean(updateId && !listItem && !loading),
    retry: false,
  });

  const item = detailQuery.data || listItem;
  const imageSource = item?.type === "news" ? getBackendImageSource(item.imageUrl) : undefined;

  const handleBack = () => {
    router.back();
  };

  if (!item && (loading || detailQuery.isLoading)) {
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
        <ScreenHeader title={t("communityUpdates.title")} onBack={handleBack} />
      </View>
    );
  }

  if (!item) {
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
        
        {/* Simple Back Header for Not Found State */}
        <ScreenHeader title={t("communityUpdates.title")} onBack={handleBack} />

        <View className="flex-1 items-center justify-center px-6">
          <AppIcon name="feedback" size={48} colorToken="--foreground" />
          <AppText align="center" className="mt-4 text-lg font-bold text-foreground">
            {t("communityUpdates.postNotFound")}
          </AppText>
        </View>
      </View>
    );
  }

  const localizedTitle = (() => {
    const key = `communityUpdates.${item.id}.title` as TranslationKey;
    const translated = t(key);
    return translated === key ? (item.type === "news" ? item.title : "") : translated;
  })();
  const localizedDescription = (() => {
    const key = `communityUpdates.${item.id}.description` as TranslationKey;
    const translated = t(key);
    return translated === key ? (item.type === "news" ? item.description : "") : translated;
  })();
  const localizedDate = (() => {
    const key = `communityUpdates.${item.id}.date` as TranslationKey;
    const translated = t(key);
    return translated === key ? item.date : translated;
  })();

  const screenTitle = item.type === "news" ? t("communityUpdates.newsBadge") : t("communityUpdates.surveyBadge");

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      {/* Hide native stack header */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Sticky Custom Header */}
      <ScreenHeader title={screenTitle} onBack={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        {/* Content Container */}
        <View className="w-full px-5 sm:px-8">
          {item.type === "news" ? (
            <View className="flex-col gap-4">
              {/* News Post Image */}
              <View className="w-full h-56 rounded-3xl overflow-hidden bg-muted shadow-sm">
                <Image
                  source={imageSource}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              </View>

              {/* Badges and Metadata */}
              <AppRow className="items-center gap-2 mt-2">
                <View className="bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                  <AppText className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                    {t("communityUpdates.newsBadge")}
                  </AppText>
                </View>
                <AppText className="text-xs text-muted-foreground">
                  {localizedDate}
                </AppText>
              </AppRow>

              {/* Title */}
              <Text
                className="text-2xl font-extrabold text-foreground leading-8 mt-2"
                style={{
                  writingDirection: isRTL ? "rtl" : "ltr",
                }}
              >
                {localizedTitle}
              </Text>

              {/* Detailed Body Paragraphs */}
              <Text
                className="text-base leading-6 text-muted-foreground"
                style={{
                  writingDirection: isRTL ? "rtl" : "ltr",
                }}
              >
                {localizedDescription}
              </Text>
              
              {/* Added rich placeholder text to make it feel premium */}
              <Text
                className="text-base leading-6 text-muted-foreground mt-4"
                style={{
                  writingDirection: isRTL ? "rtl" : "ltr",
                }}
              >
                {t("communityUpdates.postPlaceholder")}
              </Text>
            </View>
          ) : (
            <View className="flex-col gap-4">
              {/* Poll survey view */}
              <Text
                className="text-2xl font-extrabold text-foreground leading-8 mt-2"
                style={{
                  writingDirection: isRTL ? "rtl" : "ltr",
                }}
              >
                {t("communityUpdates.surveyBadge")}
              </Text>
              
              {/* Embed the interactive Poll Card */}
              <PollCard item={item as CommunityPoll} />

              {/* Description / Subtext */}
              <Text
                className="text-sm leading-5 text-muted-foreground mt-2"
                style={{
                  writingDirection: isRTL ? "rtl" : "ltr",
                }}
              >
                {t("communityUpdates.pollSubtext")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
