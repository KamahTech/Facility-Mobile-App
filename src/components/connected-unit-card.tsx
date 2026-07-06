import React from "react";
import { Pressable, View, Alert } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import type { ConnectedUnit } from "@/stores/unit-store";

type ConnectedUnitCardProps = {
  unit: ConnectedUnit;
  onDisconnect: (id: string) => void;
};

export function ConnectedUnitCard({ unit, onDisconnect }: ConnectedUnitCardProps) {
  const { t } = useI18n();
  const destructiveColor = useThemeToken("--destructive");

  const handleDeletePress = () => {
    Alert.alert(
      t("actions.cancel") === "Cancel" ? "Disconnect Unit" : "إلغاء ربط الوحدة",
      t("actions.cancel") === "Cancel"
        ? "Are you sure you want to disconnect this unit?"
        : "هل أنت متأكد من إلغاء ربط هذه الوحدة؟",
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("actions.cancel") === "Cancel" ? "Disconnect" : "إلغاء الربط",
          style: "destructive",
          onPress: () => onDisconnect(unit.id),
        },
      ]
    );
  };

  const isOwner = unit.ownershipType === "owner";

  const getUnitTypeConfig = () => {
    switch (unit.unitType) {
      case "residential":
        return {
          icon: "home" as const,
          bgClass: "bg-violet-50 dark:bg-violet-950/20",
          iconColor: "#8B5CF6",
          badgeBg: "bg-violet-50 dark:bg-violet-950/30",
          badgeText: "text-violet-600 dark:text-violet-400",
        };
      case "office":
        return {
          icon: "facility" as const,
          bgClass: "bg-blue-50 dark:bg-blue-950/20",
          iconColor: "#3B82F6",
          badgeBg: "bg-blue-50 dark:bg-blue-950/30",
          badgeText: "text-blue-600 dark:text-blue-400",
        };
      case "retail":
        return {
          icon: "retail" as const,
          bgClass: "bg-amber-50 dark:bg-amber-950/20",
          iconColor: "#D97706",
          badgeBg: "bg-amber-50 dark:bg-amber-950/30",
          badgeText: "text-amber-600 dark:text-amber-400",
        };
      default:
        return {
          icon: "home" as const,
          bgClass: "bg-violet-50 dark:bg-violet-950/20",
          iconColor: "#8B5CF6",
          badgeBg: "bg-violet-50 dark:bg-violet-950/30",
          badgeText: "text-violet-600 dark:text-violet-400",
        };
    }
  };

  const config = getUnitTypeConfig();

  return (
    <AppRow className="w-full bg-card border border-border rounded-2xl p-4 items-center justify-between mb-4 shadow-sm">
      <AppRow className="items-center gap-3.5 flex-1 min-w-0">
        <View className={`w-12 h-12 rounded-xl items-center justify-center ${config.bgClass}`}>
          <AppIcon name={config.icon} size={24} color={config.iconColor} />
        </View>

        <View className="flex-1 flex-col gap-1 text-start">
          <AppText className="text-base font-bold text-foreground text-start">
            {unit.buildingNumber} - {unit.unitNumber}
          </AppText>
          <AppRow className="items-center gap-1.5 flex-wrap">
            {/* Unit Type Badge */}
            <View className={`px-2.5 py-0.5 rounded-full ${config.badgeBg}`}>
              <AppText className={`text-xs font-semibold ${config.badgeText}`}>
                {t(`connectUnit.${unit.unitType}` as any) === `connectUnit.${unit.unitType}` ? unit.unitType : t(`connectUnit.${unit.unitType}` as any)}
              </AppText>
            </View>

            {/* Ownership Type Badge */}
            <View
              className={`px-2.5 py-0.5 rounded-full ${
                isOwner
                  ? "bg-green-50 dark:bg-green-950/30"
                  : "bg-blue-50 dark:bg-blue-950/30"
              }`}
            >
              <AppText
                className={`text-xs font-semibold ${
                  isOwner
                    ? "text-green-600 dark:text-green-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              >
                {t(isOwner ? "connectUnit.owner" : "connectUnit.tenant")}
              </AppText>
            </View>
          </AppRow>
        </View>
      </AppRow>

      {unit.source !== "odoo_unit" && (
        <Pressable
          onPress={handleDeletePress}
          className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 items-center justify-center border border-rose-100 dark:border-rose-950/40 active:opacity-75"
        >
          <AppIcon name="trash" size={18} color={destructiveColor} />
        </Pressable>
      )}
    </AppRow>
  );
}
