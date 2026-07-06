import React from "react";
import { View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import type { OwnerUnit } from "@/stores/owner-store";

type OwnerUnitCardProps = {
  unit: OwnerUnit;
};

export function OwnerUnitCard({ unit }: OwnerUnitCardProps) {
  const { t } = useI18n();
  const { formatCurrency } = useFormatters();

  const handlePress = () => {
    router.push({
      pathname: "/profile/unit-detail",
      params: { unitId: unit.id },
    } as any);
  };

  const getStatusStyle = (state: string) => {
    switch (state.toLowerCase()) {
      case "active":
      case "connected":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/20",
          text: "text-emerald-700 dark:text-emerald-400",
        };
      case "pending":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20",
          text: "text-amber-700 dark:text-amber-400",
        };
      default:
        return {
          bg: "bg-secondary",
          text: "text-muted-foreground",
        };
    }
  };

  const status = getStatusStyle(unit.state);

  return (
    <Pressable
      onPress={handlePress}
      className="w-full bg-card rounded-[24px] shadow-sm overflow-hidden active:opacity-90 flex-row"
      style={{ marginBottom: 16 }}
    >
      {/* Decorative vertical gradient bar on the start side */}
      <LinearGradient
        colors={["#4f46e5", "#818cf8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ width: 5 }}
      />

      <View className="flex-1 flex-col" style={{ padding: 16, rowGap: 16 }}>
        {/* Header Row */}
        <AppRow className="items-center justify-between" style={{ columnGap: 12 }}>
          <AppRow className="items-center flex-1 min-w-0" style={{ columnGap: 12 }}>
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-primary/10">
              <AppIcon name="facility" size={20} colorToken="--primary" />
            </View>
            <View className="flex-col flex-1 min-w-0 text-start">
              <AppText className="text-base font-bold text-foreground text-start leading-5">
                {unit.name}
              </AppText>
              <AppText className="text-xs text-muted-foreground text-start mt-0.5">
                {unit.projectName} • {unit.phaseName}
              </AppText>
            </View>
          </AppRow>

          <View className={`px-2.5 py-0.5 rounded-full ${status.bg}`}>
            <AppText className={`text-[10px] font-bold uppercase ${status.text}`}>
              {t(`connectUnit.${unit.state.toLowerCase()}` as any) === `connectUnit.${unit.state.toLowerCase()}` 
                ? unit.state.toUpperCase() 
                : t(`connectUnit.${unit.state.toLowerCase()}` as any)}
            </AppText>
          </View>
        </AppRow>

        {/* Details Grid-like Row */}
        <View className="flex-col" style={{ rowGap: 12 }}>
          <AppRow className="justify-between items-center">
            <AppText className="text-xs text-muted-foreground text-start">{t("ownerUnits.area")}</AppText>
            <AppText className="text-xs font-semibold text-foreground">{unit.totalArea} m²</AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-xs text-muted-foreground text-start">{t("ownerUnits.operationalArea")}</AppText>
            <AppText className="text-xs font-semibold text-foreground">{unit.operationalArea} m²</AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-xs text-muted-foreground text-start">{t("ownerUnits.annualDeposit")}</AppText>
            <AppText className="text-xs font-bold text-primary">{formatCurrency(unit.annualMaintenanceDeposit)}</AppText>
          </AppRow>
        </View>

        {/* Action Link Footer */}
        <AppRow
          className="justify-end items-center"
          style={{ columnGap: 4, paddingTop: 12 }}
        >
          <AppText className="text-xs font-bold text-primary">{t("ownerFinancials.title")}</AppText>
          <AppIcon name="chevronRight" size={14} colorToken="--primary" />
        </AppRow>
      </View>
    </Pressable>
  );
}
