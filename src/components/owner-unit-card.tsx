import React from "react";
import { View, Pressable, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "@/lib/navigation";

import { AppChevron } from "@/components/app-chevron";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useThemeToken } from "@/hooks/use-theme-token";
import { getDirectionalRowStyle } from "@/lib/i18n-layout";
import type { OwnerUnit } from "@/stores/owner-store";

type OwnerUnitCardProps = {
  unit: OwnerUnit;
};

export function OwnerUnitCard({ unit }: OwnerUnitCardProps) {
  const { direction, isRTL, t } = useI18n();
  const { formatCurrency } = useFormatters();
  const primaryColor = useThemeToken("--primary");

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
          bg: "bg-emerald-500/10 border border-emerald-500/20",
          text: "text-emerald-600 dark:text-emerald-400",
        };
      case "pending":
        return {
          bg: "bg-amber-500/10 border border-amber-500/20",
          text: "text-amber-600 dark:text-amber-400",
        };
      default:
        return {
          bg: "bg-secondary border border-border/55",
          text: "text-muted-foreground",
        };
    }
  };

  const status = getStatusStyle(unit.state);

  return (
    <Pressable
      onPress={handlePress}
      className="w-full bg-card rounded-[24px] shadow-sm overflow-hidden active:opacity-90"
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
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-secondary">
              <AppIcon name="facility" size={20} colorToken="--primary" />
            </View>
            <View className="flex-col flex-1 min-w-0 text-start">
              <Text
                className="text-base font-bold text-foreground leading-5"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {unit.name}
              </Text>
              <Text
                className="text-xs text-muted-foreground mt-0.5"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {unit.projectName} • {unit.phaseName}
              </Text>
            </View>
          </AppRow>

          <View className={`px-2.5 py-0.5 rounded-full ${status.bg}`}>
            <Text
              className={`text-[10px] font-bold uppercase ${status.text}`}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t(`connectUnit.${unit.state.toLowerCase()}` as any) === `connectUnit.${unit.state.toLowerCase()}` 
                ? unit.state.toUpperCase() 
                : t(`connectUnit.${unit.state.toLowerCase()}` as any)}
            </Text>
          </View>
        </AppRow>

        {/* Details Grid-like Row */}
        <View className="flex-col" style={{ rowGap: 12 }}>
          <AppRow className="justify-between items-center">
            <Text className="text-xs text-muted-foreground" style={{ writingDirection: isRTL ? "rtl" : "ltr" }}>{t("ownerUnits.area")}</Text>
            <Text className="text-xs font-semibold text-foreground" style={{ writingDirection: isRTL ? "rtl" : "ltr" }}>{unit.totalArea} m²</Text>
          </AppRow>

          <AppRow className="justify-between items-center">
            <Text className="text-xs text-muted-foreground" style={{ writingDirection: isRTL ? "rtl" : "ltr" }}>{t("ownerUnits.operationalArea")}</Text>
            <Text className="text-xs font-semibold text-foreground" style={{ writingDirection: isRTL ? "rtl" : "ltr" }}>{unit.operationalArea} m²</Text>
          </AppRow>

          <AppRow className="justify-between items-center">
            <Text className="text-xs text-muted-foreground" style={{ writingDirection: isRTL ? "rtl" : "ltr" }}>{t("ownerUnits.annualDeposit")}</Text>
            <Text className="text-xs font-bold text-foreground" style={{ writingDirection: isRTL ? "rtl" : "ltr" }}>{formatCurrency(unit.annualMaintenanceDeposit)}</Text>
          </AppRow>
        </View>

        {/* Action Link Footer */}
        <AppRow
          className="justify-end items-center"
          style={{ columnGap: 4, paddingTop: 12 }}
        >
          <Text className="text-xs font-bold text-primary" style={{ writingDirection: isRTL ? "rtl" : "ltr" }}>{t("ownerFinancials.title")}</Text>
          <AppChevron size={14} color={primaryColor} />
        </AppRow>
      </View>
    </Pressable>
  );
}
