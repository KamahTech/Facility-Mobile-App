import React from "react";
import { View, Text, Pressable } from "react-native";
import { type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import type { RentalSummary } from "@/lib/rental-types";

type RentalSummaryCardProps = {
  summary: RentalSummary | undefined;
  isLoading?: boolean;
};

export function RentalSummaryCard({ summary, isLoading = false }: RentalSummaryCardProps) {
  const { isRTL, t } = useI18n();
  const { formatCurrency, formatDate } = useFormatters();

  const currencyCode = summary?.currency?.code || "EGP";

  const formattedOutstanding = summary
    ? formatCurrency(summary.totalOutstanding, currencyCode)
    : "—";
  const formattedOverdue = summary
    ? formatCurrency(summary.overdueAmount, currencyCode)
    : "—";
  const formattedNextAmount = summary
    ? formatCurrency(summary.nextPaymentAmount, currencyCode)
    : "—";

  const hasNextPayment = Boolean(summary?.nextPaymentDate);
  const formattedNextDate = summary?.nextPaymentDate
    ? formatDate(summary.nextPaymentDate)
    : "";

  const handleNavigate = (path: string) => {
    router.push(path as Href);
  };

  return (
    <View className="w-full flex-col gap-4">
      {/* Top Banner Card */}
      <View className="w-full p-5 rounded-3xl bg-card border border-border/50 shadow-sm flex-col gap-4">
        <AppRow className="w-full items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center">
              <AppIcon name="rentals" size={20} colorToken="--primary" />
            </View>
            <View className="flex-col">
              <Text
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("rental.summaryTitle")}
              </Text>
              <Text
                className="text-base font-extrabold text-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {summary?.activeContracts ?? 0} {t("rental.activeContracts")}
              </Text>
            </View>
          </View>
        </AppRow>

        {/* Stats Grid */}
        <View className="w-full p-4 rounded-2xl bg-muted/40 flex-row items-center justify-between">
          <View className="flex-1 flex-col gap-1 items-start">
            <Text
              className="text-[11px] font-semibold text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("rental.totalOutstanding")}
            </Text>
            <Text
              className="text-lg font-bold text-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {isLoading ? "..." : formattedOutstanding}
            </Text>
          </View>

          <View className="w-[1px] h-8 bg-border/60 mx-2" />

          <View className="flex-1 flex-col gap-1 items-start">
            <Text
              className="text-[11px] font-semibold text-rose-500 dark:text-rose-400"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("rental.overdueAmount")}
            </Text>
            <Text
              className="text-lg font-bold text-rose-600 dark:text-rose-400"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {isLoading ? "..." : formattedOverdue}
            </Text>
          </View>
        </View>

        {/* Next Payment Banner (if nextPaymentDate is set) */}
        {hasNextPayment && (
          <View className="w-full p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-8 h-8 rounded-xl bg-amber-500/20 items-center justify-center">
                <AppIcon name="calendar" size={16} color="#F59E0B" />
              </View>
              <View className="flex-col flex-1">
                <Text
                  className="text-xs font-bold text-amber-900 dark:text-amber-200"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("rental.nextPayment")} ({formattedNextAmount})
                </Text>
                <Text
                  className="text-[11px] font-medium text-amber-700 dark:text-amber-400"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("rental.nextPaymentDesc").replace("{{date}}", formattedNextDate)}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("rental.upcomingPayments")}
              onPress={() => handleNavigate("/rentals/upcoming")}
              className="px-3 py-1.5 rounded-xl bg-amber-500 active:opacity-85"
            >
              <Text className="text-xs font-bold text-white">
                {t("actions.seeAll")}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Shortcuts Grid */}
      <View className="w-full flex-row flex-wrap gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={() => handleNavigate("/rentals/contracts")}
          className="flex-1 min-w-[45%] p-4 rounded-2xl bg-card border border-border/40 flex-row items-center gap-3 active:opacity-85"
        >
          <View className="w-9 h-9 rounded-xl bg-indigo-500/10 items-center justify-center">
            <AppIcon name="rentals" size={18} color="#6366F1" />
          </View>
          <Text
            className="text-xs font-bold text-foreground flex-1"
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.myContracts")}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleNavigate("/rentals/upcoming")}
          className="flex-1 min-w-[45%] p-4 rounded-2xl bg-card border border-border/40 flex-row items-center gap-3 active:opacity-85"
        >
          <View className="w-9 h-9 rounded-xl bg-emerald-500/10 items-center justify-center">
            <AppIcon name="invoices" size={18} color="#10B981" />
          </View>
          <Text
            className="text-xs font-bold text-foreground flex-1"
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.upcomingPayments")}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleNavigate("/rentals/overdue")}
          className="flex-1 min-w-[45%] p-4 rounded-2xl bg-card border border-border/40 flex-row items-center gap-3 active:opacity-85"
        >
          <View className="w-9 h-9 rounded-xl bg-rose-500/10 items-center justify-center">
            <AppIcon name="tickets" size={18} color="#F43F5E" />
          </View>
          <Text
            className="text-xs font-bold text-foreground flex-1"
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.overduePayments")}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleNavigate("/rentals/service-bills")}
          className="flex-1 min-w-[45%] p-4 rounded-2xl bg-card border border-border/40 flex-row items-center gap-3 active:opacity-85"
        >
          <View className="w-9 h-9 rounded-xl bg-sky-500/10 items-center justify-center">
            <AppIcon name="requestService" size={18} color="#0EA5E9" />
          </View>
          <Text
            className="text-xs font-bold text-foreground flex-1"
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.utilities")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
