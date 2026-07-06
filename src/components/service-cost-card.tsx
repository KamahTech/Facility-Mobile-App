import React from "react";
import { View } from "react-native";

import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import type { OwnerServiceCost } from "@/stores/owner-store";

type ServiceCostCardProps = {
  service: OwnerServiceCost;
};

export function ServiceCostCard({ service }: ServiceCostCardProps) {
  const { t } = useI18n();
  const { formatCurrency } = useFormatters();

  return (
    <View className="w-full bg-card border border-border rounded-3xl p-5 flex-col gap-4 shadow-sm mb-3">
      <AppRow className="items-center justify-between gap-3">
        <AppRow className="items-center gap-3.5 flex-1 min-w-0">
          <View className="w-11 h-11 rounded-xl items-center justify-center bg-blue-50 dark:bg-blue-950/20">
            <AppIcon name="requestService" size={22} color="#2563EB" />
          </View>
          <View className="flex-col flex-1 min-w-0 text-start">
            <AppText className="text-base font-bold text-foreground text-start">{service.serviceName}</AppText>
            <AppText className="text-xs text-muted-foreground text-start mt-0.5">
              {service.productName}
            </AppText>
          </View>
        </AppRow>
      </AppRow>

      <View className="w-full h-[1] bg-border/40" />

      <View className="flex-col gap-2.5">
        <AppRow className="justify-between items-center">
          <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.estimatedCost")}</AppText>
          <AppText className="text-sm font-semibold text-foreground">{formatCurrency(service.estimatedCost)}</AppText>
        </AppRow>

        <AppRow className="justify-between items-center">
          <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.actualCost")}</AppText>
          <AppText className="text-sm font-semibold text-foreground">{formatCurrency(service.actualCost)}</AppText>
        </AppRow>

        <AppRow className="justify-between items-center">
          <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.claimDifference")}</AppText>
          <AppText className="text-sm font-semibold text-foreground">{formatCurrency(service.difference)}</AppText>
        </AppRow>

        <AppRow className="justify-between items-center">
          <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.totalInvoiced")}</AppText>
          <AppText className="text-sm font-bold text-primary">{formatCurrency(service.totalInvoiced)}</AppText>
        </AppRow>
      </View>

      {service.claimReference && (
        <AppRow className="items-center justify-end gap-1 mt-1">
          <AppText className="text-xs text-muted-foreground text-start">
            {service.claimReference}
          </AppText>
        </AppRow>
      )}
    </View>
  );
}
