import React from "react";
import { View, Text } from "react-native";
import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import type { MaintenanceHistoryItem } from "@/lib/api/asset-inspection";

interface MaintenanceHistoryCardProps {
  item: MaintenanceHistoryItem;
}

export function MaintenanceHistoryCard({ item }: MaintenanceHistoryCardProps) {
  const { isRTL } = useI18n();
  const mutedForeground = useThemeToken("--muted-foreground");

  const isCorrective = item.type === "corrective";

  return (
    <View className="bg-card border border-border rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-1.5 flex-1 me-2">
          <AppIcon
            name={isCorrective ? "warning" : "inspection"}
            size={16}
            color={isCorrective ? "#EF4444" : "#10B981"}
          />
          <Text
            className="text-sm font-bold text-foreground flex-1"
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {item.name}
          </Text>
        </View>
        <View
          className={`px-2 py-0.5 rounded-md border ${
            isCorrective
              ? "bg-destructive/10 border-destructive/20"
              : "bg-emerald-500/10 border-emerald-500/20"
          }`}
        >
          <Text
            className={`text-[11px] font-semibold ${
              isCorrective ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {item.type}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between text-xs mt-1">
        <Text
          className="text-xs text-muted-foreground"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {item.requestDate} {item.closeDate ? `→ ${item.closeDate}` : ""}
        </Text>
        <Text
          className="text-xs font-semibold text-foreground"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );
}
