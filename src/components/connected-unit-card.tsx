import React from "react";
import { Pressable, View, Alert } from "react-native";
import { router, type Href } from "expo-router";

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
  const primaryColor = useThemeToken("--primary");
  const primaryBgTranslucent = typeof primaryColor === "string" ? `${primaryColor}25` : "rgba(219, 238, 105, 0.15)";

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
          onPress: () => onDisconnect(unit.mobileUnitLinkId || unit.id),
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
      iconColor: "#7A891B",
    };
  };

  const config = getUnitTypeConfig();

  return (
    <View className="w-full bg-card rounded-[24px] p-4 mb-4 shadow-2xs">
      <AppRow className="items-center justify-between">
      <AppRow className="items-center gap-3.5 flex-1 min-w-0">
        <View 
          style={{ backgroundColor: primaryBgTranslucent }}
          className="w-12 h-12 rounded-xl items-center justify-center"
        >
          <AppIcon name={config.icon} size={24} color={config.iconColor} />
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
                {t(`connectUnit.${unit.ownershipType}` as any)}
              </AppText>
            </View>
          </AppRow>
        </View>
      </AppRow>

      {!!unit.mobileUnitLinkId && (
        <Pressable
          onPress={handleDeletePress}
          className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 items-center justify-center active:bg-rose-500/20 active:opacity-90"
        >
          <AppIcon name="trash" size={18} color={destructiveColor} />
        </Pressable>
      )}
      </AppRow>

      {unit.ownershipType === "tenant" ? (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/home/unit-family",
              params: { unitId: unit.id },
            } as Href)
          }
          accessibilityRole="button"
          accessibilityLabel={t("familyTenant.familyMembers")}
          className="mt-3 rounded-xl bg-secondary px-4 py-2.5 active:opacity-70"
        >
          <AppText className="text-center text-sm font-semibold text-foreground">
            {t("familyTenant.familyMembers")}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
