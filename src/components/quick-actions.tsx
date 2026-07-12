import React from "react";
import { View } from "react-native";
import { type Href } from "expo-router";
import { router } from "@/lib/navigation";

import { AppRow } from "@/components/app-row";
import { QuickActionCard } from "@/components/quick-action-card";
import { SectionHeader } from "@/components/section-header";
import { quickActions } from "@/constants/quick-actions";
import { useI18n } from "@/hooks/use-i18n";

type QuickActionsProps = {
  limit?: number | null;
  showHeader?: boolean;
  showSeeAll?: boolean;
};

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

export function QuickActions({
  limit = 4, // Limit to 4 items by default on the home screen
  showHeader = true,
  showSeeAll = true,
}: QuickActionsProps) {
  const { t } = useI18n();
  
  // Display up to the limit of items, or all items if limit is null
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
      {showHeader && (
        <SectionHeader
          title={t("quickActions.title")}
          showSeeAll={showSeeAll}
          onSeeAllPress={handleSeeAll}
        />
      )}

      {/* Grid Container (2 Columns per Row) */}
      <View className="w-full px-5 sm:px-8 flex-col gap-3">
        {rows.map((rowItems, rowIndex) => (
          <AppRow
            key={rowIndex}
            className="w-full gap-3"
          >
            {rowItems.map((item) => {
              const cardThemeColor = CARD_COLORS[item.icon as keyof typeof CARD_COLORS] || DEFAULT_CARD_COLOR;

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
