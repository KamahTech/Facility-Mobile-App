import React from "react";
import { View, Text } from "react-native";
import { useI18n } from "@/hooks/use-i18n";
import type { AssetStatus } from "@/lib/api/asset-inspection";

interface AssetStatusBadgeProps {
  status: AssetStatus;
}

export function AssetStatusBadge({ status }: AssetStatusBadgeProps) {
  const { t, isRTL } = useI18n();

  const config: Record<AssetStatus, { bg: string; text: string; labelKey: string }> = {
    operational: {
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      labelKey: "assets.status.operational",
    },
    maintenance: {
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      labelKey: "assets.status.maintenance",
    },
    out_of_service: {
      bg: "bg-destructive/10 border-destructive/20",
      text: "text-destructive",
      labelKey: "assets.status.out_of_service",
    },
    retired: {
      bg: "bg-muted border-border",
      text: "text-muted-foreground",
      labelKey: "assets.status.retired",
    },
  };

  const item = config[status] || config.operational;

  return (
    <View className={`px-2.5 py-1 rounded-full border ${item.bg}`}>
      <Text
        className={`text-xs font-semibold ${item.text}`}
        style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
      >
        {t(item.labelKey as any)}
      </Text>
    </View>
  );
}
