import React from "react";
import { Pressable, View } from "react-native";
import { router, type Href } from "expo-router";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { useUnitStore } from "@/stores/unit-store";
import type { MaintenanceRequest, RequestStatus } from "@/stores/requests-store";

type RequestCardProps = {
  request: MaintenanceRequest;
};

export function RequestCard({ request }: RequestCardProps) {
  const { t } = useI18n();
  const { units } = useUnitStore();

  const unit = units.find((u) => u.id === request.unitId);
  const unitLabel = unit ? `${unit.buildingNumber} - ${unit.unitNumber}` : "";

  const getCategoryConfig = () => {
    switch (request.category) {
      case "plumbing":
        return {
          icon: "plumbing" as const,
          bgClass: "bg-blue-50 dark:bg-blue-950/20",
          iconColor: "#3B82F6",
        };
      case "electrical":
        return {
          icon: "electrical" as const,
          bgClass: "bg-amber-50 dark:bg-amber-950/20",
          iconColor: "#D97706",
        };
      case "hvac":
        return {
          icon: "hvac" as const,
          bgClass: "bg-cyan-50 dark:bg-cyan-950/20",
          iconColor: "#06B6D4",
        };
      case "cleaning":
        return {
          icon: "cleaning" as const,
          bgClass: "bg-purple-50 dark:bg-purple-950/20",
          iconColor: "#A855F7",
        };
      case "security":
        return {
          icon: "security" as const,
          bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
          iconColor: "#10B981",
        };
      case "carpentry":
        return {
          icon: "carpentry" as const,
          bgClass: "bg-orange-50 dark:bg-orange-950/20",
          iconColor: "#F97316",
        };
      default:
        return {
          icon: "otherService" as const,
          bgClass: "bg-gray-50 dark:bg-gray-950/20",
          iconColor: "#6B7280",
        };
    }
  };

  const getStatusConfig = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return {
          bgClass: "bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-950/40",
          textClass: "text-amber-600 dark:text-amber-400",
        };
      case "in_progress":
        return {
          bgClass: "bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-950/40",
          textClass: "text-blue-600 dark:text-blue-400",
        };
      case "completed":
        return {
          bgClass: "bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-950/40",
          textClass: "text-green-600 dark:text-green-400",
        };
      case "cancelled":
        return {
          bgClass: "bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-950/40",
          textClass: "text-rose-600 dark:text-rose-400",
        };
    }
  };

  const categoryConfig = getCategoryConfig();
  const statusConfig = getStatusConfig(request.status);

  const handlePress = () => {
    router.push({
      pathname: "/(resident)/tickets/details",
      params: { id: request.id },
    } as Href);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="w-full bg-card border border-border rounded-2xl p-4 flex-col gap-3.5 mb-4 shadow-sm active:opacity-90"
    >
      <AppRow className="items-center justify-between gap-3">
        <AppRow className="items-center gap-3 flex-1 min-w-0">
          <View className={`w-11 h-11 rounded-xl items-center justify-center ${categoryConfig.bgClass}`}>
            <AppIcon name={categoryConfig.icon} size={22} color={categoryConfig.iconColor} />
          </View>
          <View className="flex-1 min-w-0 text-start">
            <AppText className="text-base font-bold text-foreground text-start" numberOfLines={1}>
              {t(`services.${request.category}` as any)}
            </AppText>
            {unitLabel ? (
              <AppText className="text-xs text-muted-foreground mt-0.5 text-start" numberOfLines={1}>
                {unitLabel}
              </AppText>
            ) : null}
          </View>
        </AppRow>

        {/* Status Badge */}
        <View className={`px-2.5 py-1 rounded-full ${statusConfig.bgClass}`}>
          <AppText className={`text-xs font-semibold uppercase tracking-wider ${statusConfig.textClass}`}>
            {t(`tickets.status.${request.status}` as any)}
          </AppText>
        </View>
      </AppRow>

      {/* Preview details */}
      <AppText className="text-sm text-card-foreground/80 leading-5 text-start" numberOfLines={2}>
        {request.description}
      </AppText>

      {/* Bottom info: ID and Date */}
      <AppRow className="items-center justify-between border-t border-border/60 pt-3">
        <AppText className="text-xs text-muted-foreground">
          #{request.id.toUpperCase()}
        </AppText>
        <AppText className="text-xs text-muted-foreground">
          {request.createdAt}
        </AppText>
      </AppRow>
    </Pressable>
  );
}
