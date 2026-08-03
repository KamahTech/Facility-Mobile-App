import React from "react";
import { Pressable, View, Text } from "react-native";
import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { router } from "@/lib/navigation";
import { type Href } from "expo-router";
import { AssetStatusBadge } from "./asset-status-badge";
import type { WorkerAssetListItem } from "@/lib/api/asset-inspection";

interface AssetCardProps {
  asset: WorkerAssetListItem;
}

export function AssetCard({ asset }: AssetCardProps) {
  const { t, isRTL } = useI18n();
  const mutedForeground = useThemeToken("--muted-foreground");

  const handlePress = () => {
    router.push({
      pathname: "/(worker)/assets/details",
      params: { id: asset.id },
    } as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-card border border-border rounded-2xl p-4 mb-3 active:opacity-90 shadow-sm"
    >
      {/* Top Header: Code & Status */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-1.5 flex-1 me-2">
          <AppIcon name="asset" size={18} color={mutedForeground} />
          <Text
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {asset.code}
          </Text>
        </View>
        <AssetStatusBadge status={asset.status} />
      </View>

      {/* Asset Name */}
      <Text
        className="text-base font-bold text-foreground mb-1"
        numberOfLines={1}
        style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
      >
        {asset.name}
      </Text>

      {/* Type & Location */}
      <View className="flex-col gap-1 mb-3">
        {asset.typeName ? (
          <Text
            className="text-xs font-medium text-primary"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {asset.typeName}
          </Text>
        ) : null}
        {asset.location ? (
          <Text
            className="text-xs text-muted-foreground"
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {asset.location}
          </Text>
        ) : null}
      </View>

      {/* Footer Info: Last Inspection & Failure Rate */}
      <View className="pt-2 border-t border-border/60 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <AppIcon name="history" size={14} color={mutedForeground} />
          <Text
            className="text-xs text-muted-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {asset.lastInspectionDate && String(asset.lastInspectionDate) !== "false"
              ? `${t("assets.lastInspection")}: ${String(asset.lastInspectionDate).split(" ")[0]}`
              : t("assets.lastInspection") + ": --"}
          </Text>
        </View>

        {typeof asset.failureRate === "number" && asset.failureRate > 0 ? (
          <View className="flex-row items-center gap-1">
            <AppIcon name="warning" size={14} color="#EF4444" />
            <Text className="text-xs font-semibold text-destructive">
              {asset.failureRate}%
            </Text>
          </View>
        ) : (
          <AppIcon
            name={isRTL ? "chevronLeft" : "chevronRight"}
            size={16}
            color={mutedForeground}
          />
        )}
      </View>
    </Pressable>
  );
}
