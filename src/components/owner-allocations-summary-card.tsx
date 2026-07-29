import React from "react";
import { View } from "react-native";
import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import type { FacilityOwnerPeriod } from "@/stores/owner-store";

type OwnerAllocationsSummaryCardProps = {
  periods: FacilityOwnerPeriod[];
};

export function OwnerAllocationsSummaryCard({ periods }: OwnerAllocationsSummaryCardProps) {
  const { t } = useI18n();
  const { formatCurrency } = useFormatters();

  const totals = React.useMemo(() => {
    let allocated = 0;
    let paid = 0;
    let unpaid = 0;

    periods.forEach((period) => {
      if (period.residentAllocation) {
        allocated += period.residentAllocation.totalAllocated ?? 0;
        paid += period.residentAllocation.paidAmount ?? 0;
        unpaid += period.residentAllocation.unpaidAmount ?? (period.residentAllocation.totalAllocated - period.residentAllocation.paidAmount);
      }
    }
  );

    const progressRatio = allocated > 0 ? Math.min(1, Math.max(0, paid / allocated)) : 0;
    const progressPercent = Math.round(progressRatio * 100);

    return {
      allocated,
      paid,
      unpaid,
      progressPercent,
    };
  }, [periods]);

  if (periods.length === 0) {
    return null;
  }

  return (
    <View className="w-full bg-card rounded-[28px] p-5 flex-col gap-4 shadow-sm border border-border/10 mb-4">
      {/* Title & Description */}
      <View className="flex-col gap-1 items-start">
        <AppText className="text-base font-bold text-foreground text-start">
          {t("ownerAllocations.summary")}
        </AppText>
        <AppText className="text-xs text-muted-foreground text-start leading-5">
          {t("ownerAllocations.summaryDesc")}
        </AppText>
      </View>

      {/* Hero Total Allocated Box */}
      <View className="overflow-hidden rounded-2xl bg-secondary p-4 flex-col gap-2">
        <AppRow className="items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center">
            <AppIcon name="facility" size={20} colorToken="--primary-foreground" />
          </View>
          <View className="flex-1 flex-col items-start min-w-0">
            <AppText className="text-xs font-bold text-muted-foreground text-start">
              {t("ownerAllocations.totalAllocated")}
            </AppText>
            <AppText
              className="text-2xl font-extrabold text-foreground text-start mt-0.5"
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {formatCurrency(totals.allocated)}
            </AppText>
          </View>
        </AppRow>

        {/* Progress Bar */}
        <View className="flex-col gap-1 mt-1">
          <AppRow className="justify-between items-center">
            <AppText className="text-[10px] font-semibold text-muted-foreground">
              {t("ownerAllocations.paymentProgress")}
            </AppText>
            <AppText className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {totals.progressPercent}%
            </AppText>
          </AppRow>
          <View className="w-full h-2 rounded-full bg-background/60 overflow-hidden">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${totals.progressPercent}%` }}
            />
          </View>
        </View>
      </View>

      {/* Status Breakdown Cards */}
      <AppRow className="justify-between items-center gap-3">
        <View className="flex-1 bg-emerald-500/10 dark:bg-emerald-950/30 p-3 rounded-2xl flex-col items-start">
          <AppRow className="items-center gap-1.5 mb-1">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <AppText className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {t("ownerAllocations.totalPaid")}
            </AppText>
          </AppRow>
          <AppText className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
            {formatCurrency(totals.paid)}
          </AppText>
        </View>

        <View className="flex-1 bg-amber-500/10 dark:bg-amber-950/30 p-3 rounded-2xl flex-col items-start">
          <AppRow className="items-center gap-1.5 mb-1">
            <View className="w-2 h-2 rounded-full bg-amber-500" />
            <AppText className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              {t("ownerAllocations.totalUnpaid")}
            </AppText>
          </AppRow>
          <AppText className="text-sm font-bold text-amber-800 dark:text-amber-300">
            {formatCurrency(totals.unpaid)}
          </AppText>
        </View>
      </AppRow>
    </View>
  );
}
