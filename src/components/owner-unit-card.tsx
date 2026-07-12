import React from "react";
import { View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "@/lib/navigation";

import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { getDirectionalRowStyle } from "@/lib/i18n-layout";
import type { OwnerUnit } from "@/stores/owner-store";

type OwnerUnitCardProps = {
  unit: OwnerUnit;
};

export function OwnerUnitCard({ unit }: OwnerUnitCardProps) {
  const { direction, t } = useI18n();
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
          bg: "bg-emerald-950/40 border border-emerald-800/30",
          text: "text-emerald-400",
        };
      case "pending":
        return {
          bg: "bg-amber-950/40 border border-amber-800/30",
          text: "text-amber-400",
        };
      default:
        return {
          bg: "bg-zinc-800 border border-zinc-700/30",
          text: "text-zinc-400",
        };
    }
  };

  const status = getStatusStyle(unit.state);

  return (
    <Pressable
      onPress={handlePress}
      className="w-full bg-zinc-900 rounded-[24px] shadow-md overflow-hidden active:opacity-90"
      style={[getDirectionalRowStyle(direction), { marginBottom: 16 }]}
    >
      {/* Decorative vertical gradient bar on the start side (Primary Color Theme) */}
      <LinearGradient
        colors={["#DBEE69", "#A2B527"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ width: 5 }}
      />

      <View className="flex-1 flex-col" style={{ padding: 16, rowGap: 16 }}>
        {/* Header Row */}
        <AppRow className="items-center justify-between" style={{ columnGap: 12 }}>
          <AppRow className="items-center flex-1 min-w-0" style={{ columnGap: 12 }}>
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-zinc-800">
              <AppIcon name="facility" size={20} colorToken="--primary" />
            </View>
            <View className="flex-col flex-1 min-w-0 text-start">
              <AppText className="text-base font-bold text-white text-start leading-5">
                {unit.name}
              </AppText>
              <AppText
                className="text-xs text-zinc-400 text-start mt-0.5"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
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
            <AppText className="text-xs text-zinc-400 text-start">{t("ownerUnits.area")}</AppText>
            <AppText className="text-xs font-semibold text-white">{unit.totalArea} m²</AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-xs text-zinc-400 text-start">{t("ownerUnits.operationalArea")}</AppText>
            <AppText className="text-xs font-semibold text-white">{unit.operationalArea} m²</AppText>
          </AppRow>

          <AppRow className="justify-between items-center">
            <AppText className="text-xs text-zinc-400 text-start">{t("ownerUnits.annualDeposit")}</AppText>
            <AppText className="text-xs font-bold text-white">{formatCurrency(unit.annualMaintenanceDeposit)}</AppText>
          </AppRow>
        </View>

        {/* Action Link Footer */}
        <AppRow
          className="justify-end items-center"
          style={{ columnGap: 4, paddingTop: 12 }}
        >
          <AppText className="text-xs font-bold text-white">{t("ownerFinancials.title")}</AppText>
          <AppIcon name="chevronRight" size={14} color="#FFFFFF" />
        </AppRow>
      </View>
    </Pressable>
  );
}
