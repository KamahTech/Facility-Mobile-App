import React from "react";
import { View, TouchableOpacity } from "react-native";
import { router, type Href } from "expo-router";

import { AppChevron } from "@/components/app-chevron";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { QuickActionCard } from "@/components/quick-action-card";
import { quickActions } from "@/constants/quick-actions";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useThemeToken } from "@/hooks/use-theme-token";

type QuickActionsProps = {
  limit?: number | null;
  showHeader?: boolean;
  showSeeAll?: boolean;
};

const CARD_COLORS: Record<
  "linkUnit" | "invoices" | "requestService" | "inviteVisitor" | "feedback" | "tickets",
  { light: string; dark: string }
> = {
  linkUnit: {
    light: "#4F46E5", // Premium Indigo
    dark: "#3730A3",
  },
  invoices: {
    light: "#059669", // Rich Emerald Green
    dark: "#065F46",
  },
  requestService: {
    light: "#D97706", // Deep Warm Amber
    dark: "#92400E",
  },
  inviteVisitor: {
    light: "#7C3AED", // Royal Violet
    dark: "#5B21B6",
  },
  feedback: {
    light: "#E11D48", // Premium Rose
    dark: "#9F1239",
  },
  tickets: {
    light: "#EA580C", // Vibrant Orange
    dark: "#9A3412",
  },
};

const DEFAULT_CARD_COLOR = {
  light: "#6B7280", // Gray
  dark: "#374151",
};

export function QuickActions({
  limit = 4, // Limit to 4 items by default
  showHeader = true,
  showSeeAll = true,
}: QuickActionsProps) {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();

  const primaryColor = useThemeToken("--primary");
  
  // Display up to the limit of 4 items for the 2x2 grid, or all items if limit is null
  const visibleActions = React.useMemo(() => {
    return limit === null ? quickActions : quickActions.slice(0, limit);
  }, [limit]);

  // Chunk actions into rows of 2 columns
  const rows = React.useMemo(() => {
    const chunked = [];
    for (let i = 0; i < visibleActions.length; i += 2) {
      chunked.push(visibleActions.slice(i, i + 2));
    }
    return chunked;
  }, [visibleActions]);

  const handlePress = (route: string) => {
    router.push(route as Href);
  };

  const handleSeeAll = () => {
    router.push("/home/details" as Href);
  };

  return (
    <View className="w-full flex-col gap-4">
      {showHeader ? (
        <AppRow className="w-full items-center justify-between px-5 sm:px-8">
          <AppText
            className="text-start text-2xl font-bold text-foreground"
          >
            {t("quickActions.title")}
          </AppText>
          {showSeeAll ? (
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
          ) : null}
        </AppRow>
      ) : null}

      {/* Grid Container (2 Columns per Row) */}
      <View className="w-full px-5 sm:px-8 flex-col gap-3">
        {rows.map((rowItems, rowIndex) => (
          <AppRow
            key={rowIndex}
            className="w-full gap-3"
          >
            {rowItems.map((item) => {
              const cardThemeColor = (CARD_COLORS[item.icon as keyof typeof CARD_COLORS] || DEFAULT_CARD_COLOR)[resolvedTheme];

              return (
                <View key={item.titleKey} className="flex-1">
                  <QuickActionCard
                    icon={item.icon}
                    themeColor={cardThemeColor}
                    title={t(item.titleKey)}
                    onPress={() => handlePress(item.route)}
                  />
                </View>
              );
            })}
            {/* Balance the row if it has an odd number of items */}
            {rowItems.length === 1 && <View className="flex-1" />}
          </AppRow>
        ))}
      </View>
    </View>
  );
}
