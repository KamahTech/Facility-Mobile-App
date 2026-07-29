import React from "react";
import { View } from "react-native";
import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import type { FacilityOwnerPeriod } from "@/stores/owner-store";

type OwnerAllocationCardProps = {
  item: FacilityOwnerPeriod;
};

export function OwnerAllocationCard({ item }: OwnerAllocationCardProps) {
  const { isRTL, t } = useI18n();
  const formatters = useFormatters();
  const formatCurrency = formatters?.formatCurrency;
  const formatDate = formatters?.formatDate;

  const renderFormattedDate = (rawDate?: string | false) => {
    if (!rawDate) return t("common.notAvailable");
    try {
      if (typeof formatDate === "function") {
        const formatted = formatDate(String(rawDate));
        if (formatted) return formatted;
      }
    } catch {
      // Fallback
    }
    return String(rawDate);
  };

  const getStatusColorConfig = (state: string) => {
    const normalized = (state || "").toLowerCase();
    if (["active", "posted", "done", "approved", "verified"].includes(normalized)) {
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
      };
    }
    if (["draft", "pending", "submitted"].includes(normalized)) {
      return {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-500",
      };
    }
    if (["cancel", "cancelled", "rejected"].includes(normalized)) {
      return {
        bg: "bg-rose-50 dark:bg-rose-950/30",
        text: "text-rose-700 dark:text-rose-400",
        dot: "bg-rose-500",
      };
    }
    return {
      bg: "bg-secondary dark:bg-secondary/40",
      text: "text-muted-foreground",
      dot: "bg-muted-foreground",
    };
  };

  const formatCurrencyVal = (val?: number | null) => {
    if (typeof formatCurrency === "function") return formatCurrency(val);
    return `${val ?? 0}`;
  };

  const statusConfig = getStatusColorConfig(item.state);
  const allocation = item.residentAllocation;

  const paid = allocation?.paidAmount ?? 0;
  const total = allocation?.totalAllocated ?? 0;
  const unpaid = allocation?.unpaidAmount ?? Math.max(0, total - paid);
  const progressRatio = total > 0 ? Math.min(1, Math.max(0, paid / total)) : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const statusLabel = t(`ownerUnits.state.${(item.state || "").toLowerCase()}` as any) || item.state;

  return (
    <View className="w-full bg-card rounded-3xl p-5 shadow-xs border border-border/10 mb-4 flex-col gap-4">
      {/* Header: Icon + Reference/Project + Status */}
      <AppRow className="items-start justify-between gap-3">
        <AppRow className="items-center gap-3 flex-1 min-w-0">
          <View className="w-11 h-11 rounded-2xl bg-amber-500/10 items-center justify-center shrink-0">
            <AppIcon name="facility" size={22} color="#F59E0B" />
          </View>
          <View className="flex-col flex-1 min-w-0 items-start">
            <AppText className="text-base font-bold text-foreground text-start" numberOfLines={1}>
              {item.reference}
            </AppText>
            <AppText className="text-xs text-muted-foreground font-medium text-start mt-0.5" numberOfLines={1}>
              {item.projectName}
            </AppText>
          </View>
        </AppRow>

        <View className={`px-3 py-1 rounded-full shrink-0 ${statusConfig.bg}`}>
          <AppRow className="items-center gap-1.5">
            <View className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <AppText className={`text-[11px] font-bold uppercase tracking-wider ${statusConfig.text}`}>
              {statusLabel}
            </AppText>
          </AppRow>
        </View>
      </AppRow>

      {/* Dates Row - Aligned with card grid */}
      <AppRow className="w-full items-center justify-between gap-3 py-0.5">
        <AppRow className="items-center gap-2 flex-1 min-w-0">
          <AppIcon name="calendar" size={16} colorToken="--muted-foreground" className="shrink-0" />
          <AppText className="text-xs font-semibold text-muted-foreground text-start" numberOfLines={1}>
            {t("ownerAllocations.dates")}
          </AppText>
        </AppRow>

        <AppRow className="items-center gap-1.5 shrink-0">
          <AppText className="text-xs font-bold text-foreground">
            {renderFormattedDate(item.startDate)}
          </AppText>
          <AppText className="text-xs font-bold text-muted-foreground opacity-50">
            –
          </AppText>
          <AppText className="text-xs font-bold text-foreground">
            {renderFormattedDate(item.endDate)}
          </AppText>
          {item.durationDays !== undefined && (
            <AppText className="text-[11px] font-medium text-muted-foreground ms-1">
              ({item.durationDays} {t("ownerAllocations.days")})
            </AppText>
          )}
        </AppRow>
      </AppRow>

      {/* Financial Allocation Section */}
      {allocation && (
        <View className="flex-col gap-3 mt-0.5">
          <AppRow className="justify-between items-end">
            <View className="flex-col items-start">
              <AppText className="text-xs text-muted-foreground">{t("ownerAllocations.allocated")}</AppText>
              <AppText className="text-lg font-extrabold text-foreground mt-0.5">
                {formatCurrencyVal(total)}
              </AppText>
            </View>

            {item.allocatedServiceCosts !== undefined && (
              <View className="flex-col items-end">
                <AppText className="text-xs text-muted-foreground">{t("ownerAllocations.services")}</AppText>
                <AppText className="text-sm font-bold text-foreground mt-0.5">
                  {formatCurrencyVal(item.allocatedServiceCosts)}
                </AppText>
              </View>
            )}
          </AppRow>

          {/* Progress Bar & Percentage */}
          <View className="flex-col gap-1.5 mt-1">
            <AppRow className="justify-between items-center">
              <AppText className="text-[11px] font-semibold text-muted-foreground">
                {t("ownerAllocations.paymentProgress")}
              </AppText>
              <AppText className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {progressPercent}%
              </AppText>
            </AppRow>

            <View className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
              <View
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </View>
          </View>

          {/* Paid vs Unpaid Breakdown Cards */}
          <AppRow className="justify-between items-center gap-3 mt-1">
            <View className="flex-1 bg-emerald-500/10 rounded-2xl p-2.5 flex-col items-start">
              <AppRow className="items-center gap-1.5 mb-0.5">
                <View className="w-2 h-2 rounded-full bg-emerald-500" />
                <AppText className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {t("ownerAllocations.paid")}
                </AppText>
              </AppRow>
              <AppText className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {formatCurrencyVal(paid)}
              </AppText>
            </View>

            <View className="flex-1 bg-amber-500/10 rounded-2xl p-2.5 flex-col items-start">
              <AppRow className="items-center gap-1.5 mb-0.5">
                <View className="w-2 h-2 rounded-full bg-amber-500" />
                <AppText className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  {t("ownerAllocations.unpaid")}
                </AppText>
              </AppRow>
              <AppText className="text-xs font-bold text-amber-800 dark:text-amber-300">
                {formatCurrencyVal(unpaid)}
              </AppText>
            </View>
          </AppRow>
        </View>
      )}
    </View>
  );
}
