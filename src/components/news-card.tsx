import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Image } from "expo-image";

import { useI18n } from "@/hooks/use-i18n";
import { type TranslationKey } from "@/constants/translations";
import type { CommunityNews } from "@/stores/community-store";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";

type NewsCardProps = {
  item: CommunityNews;
  onPress?: () => void;
};

export function NewsCard({ item, onPress }: NewsCardProps) {
  const { t } = useI18n();
  const localizedTitle = (() => {
    const key = `communityUpdates.${item.id}.title` as TranslationKey;
    const translated = t(key);
    return translated === key ? item.title : translated;
  })();
  const localizedDescription = (() => {
    const key = `communityUpdates.${item.id}.description` as TranslationKey;
    const translated = t(key);
    return translated === key ? item.description : translated;
  })();
  const localizedDate = (() => {
    const key = `communityUpdates.${item.id}.date` as TranslationKey;
    const translated = t(key);
    return translated === key ? item.date : translated;
  })();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="w-full p-4 rounded-2xl border border-border bg-card active:opacity-90"
    >
      <AppRow className="gap-4 items-center justify-between">
        {/* Text Content Area */}
        <View className="flex-1 flex-col gap-2 min-w-0">
          <AppRow className="items-center gap-2 self-start">
            {/* Green-themed Category Badge */}
            <View className="bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
              <AppText className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                {t("communityUpdates.newsBadge")}
              </AppText>
            </View>
            <AppText className="text-[10px] text-muted-foreground">
              {localizedDate}
            </AppText>
          </AppRow>

          <AppText
            numberOfLines={1}
            className="text-start text-base font-bold text-foreground leading-5 w-full"
          >
            {localizedTitle}
          </AppText>
          <AppText
            numberOfLines={2}
            className="text-start text-xs text-muted-foreground leading-4 w-full"
          >
            {localizedDescription}
          </AppText>
        </View>

        {/* Image Area */}
        <View className="size-20 rounded-xl overflow-hidden bg-muted">
          <Image
            source={{ uri: item.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
        </View>
      </AppRow>
    </Pressable>
  );
}
