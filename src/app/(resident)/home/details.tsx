import React from "react";
import { View, Text } from "react-native";
import { Stack, type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { LegendList } from "@legendapp/list/react-native";

import { ScreenHeader } from "@/components/screen-header";
import { QuickActionCard } from "@/components/quick-action-card";
import { useI18n } from "@/hooks/use-i18n";
import { useAvailableQuickActions } from "@/hooks/use-available-quick-actions";

const CARD_COLORS: Record<
  "linkUnit" | "invoices" | "requestService" | "inviteVisitor" | "feedback" | "tickets" | "facility",
  string
> = {
  linkUnit: "#6366F1",      // Indigo
  invoices: "#10B981",      // Emerald
  requestService: "#F59E0B",  // Amber
  inviteVisitor: "#8B5CF6",   // Violet
  feedback: "#F43F5E",        // Rose
  tickets: "#F97316",         // Orange
  facility: "#0EA5E9",        // Sky
};

const DEFAULT_CARD_COLOR = "#6B7280";

export default function ResidentHomeDetailsScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const availableActions = useAvailableQuickActions();

  const handlePress = (route: string) => {
    router.push(route as Href);
  };

  const renderHeader = () => (
    <View className="pt-6">
      <Text
        className="text-base leading-6 text-muted-foreground px-5 sm:px-8 mb-6"
        style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
      >
        {t("quickActions.allDescription")}
      </Text>
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

      <LegendList
        data={availableActions}
        recycleItems={true}
        estimatedItemSize={92}
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
                showArrow={true}
              />
            </View>
          );
        }}
      />
    </View>
  );
}
