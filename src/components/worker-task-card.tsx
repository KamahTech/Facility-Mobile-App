import { View, Pressable } from "react-native";
import { router, type Href } from "expo-router";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import type {
  MaintenanceRequest,
  RequestStatus,
} from "@/stores/requests-store";

type WorkerTaskCardProps = {
  task: MaintenanceRequest;
};

export function WorkerTaskCard({ task }: WorkerTaskCardProps) {
  const { t } = useI18n();
  const unitLabel = [task.buildingNumber, task.unitNumber].filter(Boolean).join(" - ");

  const getCategoryConfig = () => {
    switch (task.category) {
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
          bgClass: "bg-amber-50 dark:bg-amber-950/30",
          textClass: "text-amber-600 dark:text-amber-400",
        };
      case "in_progress":
        return {
          bgClass: "bg-blue-50 dark:bg-blue-950/30",
          textClass: "text-blue-600 dark:text-blue-400",
        };
      case "completed":
        return {
          bgClass: "bg-green-50 dark:bg-green-950/30",
          textClass: "text-green-600 dark:text-green-400",
        };
      case "cancelled":
        return {
          bgClass: "bg-rose-50 dark:bg-rose-950/30",
          textClass: "text-rose-600 dark:text-rose-400",
        };
    }
  };

  const categoryConfig = getCategoryConfig();
  const statusConfig = getStatusConfig(task.status);

  const handlePress = () => {
    router.push({
      pathname: "/worker/details",
      params: { id: task.id },
    } as Href);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="w-full bg-card rounded-2xl p-4 flex-col gap-3 mb-4 shadow-sm active:opacity-90"
    >
      <AppRow className="items-center justify-between gap-3">
        <AppRow className="items-center gap-3 flex-1 min-w-0">
          <View
            className={`w-11 h-11 rounded-xl items-center justify-center ${categoryConfig.bgClass}`}
          >
            <AppIcon
              name={categoryConfig.icon}
              size={22}
              color={categoryConfig.iconColor}
            />
          </View>
          <View className="flex-1 min-w-0 text-start">
            <AppText
              className="text-base font-bold text-foreground text-start"
              numberOfLines={1}
            >
              {t(`services.${task.category}` as any)}
            </AppText>
            {unitLabel ? (
              <AppText
                className="text-xs text-muted-foreground mt-0.5 text-start"
                numberOfLines={1}
              >
                {unitLabel}
              </AppText>
            ) : null}
          </View>
        </AppRow>

        {/* Status Badge */}
        <View className={`px-2.5 py-1 rounded-full ${statusConfig.bgClass}`}>
          <AppText
            className={`text-xs font-semibold uppercase tracking-wider ${statusConfig.textClass}`}
          >
            {t(`tickets.status.${task.status}` as any)}
          </AppText>
        </View>
      </AppRow>

      {/* Preview details */}
      <AppText
        className="text-sm text-card-foreground/80 leading-5 text-start"
        numberOfLines={2}
      >
        {task.description}
      </AppText>

      {/* Bottom info: ID and Date */}
      <AppRow className="items-center justify-between pt-3">
        <AppText className="text-xs text-muted-foreground">
          #{task.id.toUpperCase()}
        </AppText>
        <AppText className="text-xs text-muted-foreground">
          {task.createdAt}
        </AppText>
      </AppRow>
    </Pressable>
  );
}
