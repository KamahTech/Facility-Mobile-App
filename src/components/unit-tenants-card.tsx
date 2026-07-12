import React from "react";
import { View, Pressable, Alert } from "react-native";
import { AppText } from "@/components/app-text";
import { AppRow } from "@/components/app-row";
import { AppIcon } from "@/components/app-icon";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useI18n } from "@/hooks/use-i18n";
import { useTenantsQuery, useOwnerStore } from "@/stores/owner-store";

type UnitTenantsCardProps = {
  unitId: string;
};

export function UnitTenantsCard({ unitId }: UnitTenantsCardProps) {
  const { t } = useI18n();
  const { data, isLoading, refetch } = useTenantsQuery(unitId);
  const { removeTenant } = useOwnerStore();

  const handleRemove = (unitLinkId: string, tenantName: string) => {
    Alert.alert(
      t("familyTenant.removeTenant"),
      t("familyTenant.removeConfirm").replace("{name}", tenantName),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("familyTenant.removeTenant"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeTenant(unitId, unitLinkId);
              Alert.alert(t("common.success"), t("common.ok"));
              refetch();
            } catch (e: any) {
              Alert.alert(t("common.error"), e?.message || "Failed to remove tenant");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="w-full bg-card rounded-3xl p-5 shadow-sm justify-center items-center py-8 border border-border/20">
        <AppActivityIndicator size="small" />
      </View>
    );
  }

  const tenants = data?.items || [];

  return (
    <View className="w-full bg-card rounded-3xl p-5 flex-col gap-4 shadow-sm border border-border/20">
      <AppRow className="items-center gap-2">
        <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
          <AppIcon name="profile" size={16} colorToken="--primary" />
        </View>
        <AppText className="text-start text-base font-bold text-foreground">
          {t("familyTenant.tenants")}
        </AppText>
      </AppRow>

      {tenants.length === 0 ? (
        <AppText className="text-start text-sm text-muted-foreground py-2 px-1">
          {t("familyTenant.noTenants")}
        </AppText>
      ) : (
        <View className="flex-col gap-4">
          {tenants.map((tenant, idx) => (
            <View key={tenant.id} className={`flex-col gap-2 ${idx > 0 ? "pt-3 border-t border-border/20" : ""}`}>
              <AppRow className="justify-between items-start">
                <View className="flex-col flex-1 text-start">
                  <AppText className="text-sm font-semibold text-foreground text-start">
                    {tenant.residentName}
                  </AppText>
                  <AppText className="text-xs text-muted-foreground text-start mt-0.5">
                    {tenant.residentEmail}
                  </AppText>
                  <AppText className="text-xs text-muted-foreground text-start mt-0.5">
                    {tenant.contactNumber}
                  </AppText>
                </View>

                <Pressable
                  onPress={() => handleRemove(tenant.id, tenant.residentName)}
                  accessibilityLabel={t("familyTenant.removeTenant")}
                  accessibilityRole="button"
                  className="px-3 py-1.5 rounded-xl bg-destructive/10 active:opacity-60"
                >
                  <AppText className="text-xs font-bold text-destructive">
                    {t("familyTenant.removeTenant")}
                  </AppText>
                </Pressable>
              </AppRow>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
