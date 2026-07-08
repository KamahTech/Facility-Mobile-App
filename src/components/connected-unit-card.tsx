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
    const icon =
      unit.unitType === "office"
        ? ("facility" as const)
        : unit.unitType === "retail"
        ? ("retail" as const)
        : ("home" as const);

    return {
      icon,
      bgClass: "bg-transparent",
      iconColorToken: "--primary" as const,
    };
  };

  const config = getUnitTypeConfig();

  return (
    <AppRow className="w-full bg-card rounded-[24px] p-4 items-center justify-between mb-4 shadow-2xs">
      <AppRow className="items-center gap-3.5 flex-1 min-w-0">
        <View className={`w-12 h-12 rounded-xl items-center justify-center ${config.bgClass}`}>
          <AppIcon name={config.icon} size={24} colorToken={config.iconColorToken} />
        </View>

        <View className="flex-1 flex-col gap-1 text-start">
          <AppText className="text-base font-bold text-foreground text-start">
            {unit.buildingNumber} - {unit.unitNumber}
          </AppText>
          <AppRow className="items-center gap-1.5 flex-wrap">
            {/* Unit Type Badge */}
            <View className="px-2 py-0.5 rounded-lg bg-secondary">
              <AppText className="text-[11px] font-bold text-muted-foreground">
                {t(`connectUnit.${unit.unitType}` as any) === `connectUnit.${unit.unitType}` ? unit.unitType : t(`connectUnit.${unit.unitType}` as any)}
              </AppText>
            </View>

            {/* Ownership Type Badge */}
            <View
              className="px-2 py-0.5 rounded-lg"
              style={{
                backgroundColor: isOwner ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
              }}
            >
              <AppText
                className={`text-[11px] font-bold ${
                  isOwner
                    ? "text-emerald-600 dark:text-emerald-400"
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
          className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 items-center justify-center active:bg-rose-500/20 active:opacity-90"
        >
          <AppIcon name="trash" size={18} color={destructiveColor} />
        </Pressable>
      )}
    </AppRow>
  );
}
