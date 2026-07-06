import React from "react";
import { View, FlatList } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { QuickActionCard } from "@/components/quick-action-card";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { quickActions } from "@/constants/quick-actions";

const CARD_COLORS: Record<
  "linkUnit" | "invoices" | "requestService" | "inviteVisitor" | "feedback" | "tickets",
  string
> = {
  linkUnit: "#6366F1",      // Indigo
  invoices: "#10B981",      // Emerald
  requestService: "#F59E0B",  // Amber
  inviteVisitor: "#8B5CF6",   // Violet
  feedback: "#F43F5E",        // Rose
  tickets: "#F97316",         // Orange
};

const DEFAULT_CARD_COLOR = "#6B7280";

export default function ResidentHomeDetailsScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const handlePress = (route: string) => {
    router.push(route as Href);
  };

  const renderHeader = () => (
    <View className="pt-6">
      <AppText className="text-start text-base leading-6 text-muted-foreground px-5 sm:px-8 mb-6">
        {t("quickActions.allDescription")}
      </AppText>
    </View>
  );

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

      <ScreenHeader title={t("quickActions.title")} onBack={() => router.back()} />

      <FlatList
        data={quickActions}
        keyExtractor={(item) => item.titleKey}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
        }}
        className="flex-1 w-full max-w-xl self-center"
        renderItem={({ item }) => {
          const cardThemeColor = CARD_COLORS[item.icon as keyof typeof CARD_COLORS] || DEFAULT_CARD_COLOR;

          return (
            <View className="px-5 sm:px-8 mb-3">
              <QuickActionCard
                icon={item.icon}
                themeColor={cardThemeColor}
                title={t(item.titleKey)}
                onPress={() => handlePress(item.route)}
              />
            </View>
          );
        }}
      />
    </View>
  );
}
