import React from "react";
import { View, Text } from "react-native";
import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import type { SparePartHistoryItem } from "@/lib/api/asset-inspection";

interface SparePartCardProps {
  item: SparePartHistoryItem;
}

export function SparePartCard({ item }: SparePartCardProps) {
  const { isRTL } = useI18n();
  const primaryColor = useThemeToken("--primary");

  return (
    <View className="bg-card border border-border rounded-xl p-3 mb-2 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3 flex-1 me-2">
        <View className="w-9 h-9 rounded-lg bg-primary/10 items-center justify-center">
          <AppIcon name="part" size={18} color={primaryColor} />
        </View>

        <View className="flex-1">
          <Text
            className="text-sm font-bold text-foreground"
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {item.productName}
          </Text>
          <Text
            className="text-xs text-muted-foreground mt-0.5"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {item.date}
          </Text>
        </View>
      </View>

      <View className="bg-secondary px-3 py-1.5 rounded-lg border border-border">
        <Text className="text-xs font-bold text-foreground">
          {item.quantity} {item.uom || "Units"}
        </Text>
      </View>
    </View>
  );
}
