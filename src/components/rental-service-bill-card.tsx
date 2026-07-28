import React from "react";
import { View, Text, Pressable } from "react-native";
import { type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import type { RentalServiceBill, ServiceType, ServiceBillState } from "@/lib/rental-types";

type RentalServiceBillCardProps = {
  bill: RentalServiceBill;
  onPress?: () => void;
};

export function RentalServiceBillCard({ bill, onPress }: RentalServiceBillCardProps) {
  const { isRTL, t } = useI18n();
  const { formatCurrency, formatDate } = useFormatters();

  const formattedTotal = formatCurrency(bill.totalAmount, bill.currency?.code || "EGP");

  const serviceInfo = React.useMemo(() => {
    const type = bill.serviceType as ServiceType;
    switch (type) {
      case "electricity":
        return {
          icon: "electrical" as const,
          color: "#F59E0B",
          bg: "bg-amber-500/10",
          label: t("rental.service.electricity"),
        };
      case "water":
        return {
          icon: "plumbing" as const,
          color: "#0EA5E9",
          bg: "bg-sky-500/10",
          label: t("rental.service.water"),
        };
      case "other":
      default:
        return {
          icon: "otherService" as const,
          color: "#8B5CF6",
          bg: "bg-purple-500/10",
          label: t("rental.service.other"),
        };
    }
  }, [bill.serviceType, t]);

  const stateStyle = React.useMemo(() => {
    const state = bill.state as ServiceBillState;
    switch (state) {
      case "paid":
      case "confirmed":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
          text: "text-emerald-700 dark:text-emerald-300",
          label: t("rental.service.billState." + state as any),
        };
      case "reviewed":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/40",
          text: "text-blue-700 dark:text-blue-300",
          label: t("rental.service.billState.reviewed"),
        };
      case "cancel":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/40",
          text: "text-rose-700 dark:text-rose-300",
          label: t("rental.service.billState.cancel"),
        };
      case "draft":
      default:
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          label: t("rental.service.billState.draft"),
        };
    }
  }, [bill.state, t]);

  const isMetered = bill.serviceType === "electricity" || bill.serviceType === "water";

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/rentals/service-bill-details?id=${bill.id}` as Href);
    }
  };

  const handleInvoicePress = () => {
    if (bill.invoiceId) {
      router.push(`/invoices/${bill.invoiceId}` as Href);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handleCardPress}
      className="w-full p-4 rounded-2xl bg-card border border-border/50 mb-3 flex-col gap-3 active:opacity-90"
    >
      <AppRow className="w-full items-center justify-between">
        <AppRow className="items-center gap-2.5 flex-1">
          <View className={`w-9 h-9 rounded-xl items-center justify-center ${serviceInfo.bg}`}>
            <AppIcon name={serviceInfo.icon} size={18} color={serviceInfo.color} />
          </View>
          <View className="flex-col flex-1">
            <Text
              className="text-sm font-bold text-foreground"
              numberOfLines={1}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {bill.reference}
            </Text>
            <Text
              className="text-[11px] font-medium text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {serviceInfo.label} • {bill.unitName || "Unit"}
            </Text>
          </View>
        </AppRow>

        <View className={`px-2.5 py-1 rounded-full ${stateStyle.bg}`}>
          <Text
            className={`text-[10px] font-bold uppercase tracking-wider ${stateStyle.text}`}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {stateStyle.label}
          </Text>
        </View>
      </AppRow>

      {/* Meter readings if metered service */}
      {isMetered ? (
        <View className="p-3 rounded-xl bg-muted/30 flex-row items-center justify-between">
          <View className="flex-1 items-start flex-col">
            <Text
              className="text-[10px] text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("rental.service.previousReading")}
            </Text>
            <Text
              className="text-xs font-bold text-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {bill.previousReading}
            </Text>
          </View>

          <View className="w-[1px] h-6 bg-border/60 mx-1" />

          <View className="flex-1 items-start flex-col">
            <Text
              className="text-[10px] text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("rental.service.currentReading")}
            </Text>
            <Text
              className="text-xs font-bold text-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {bill.currentReading}
            </Text>
          </View>

          <View className="w-[1px] h-6 bg-border/60 mx-1" />

          <View className="flex-1 items-start flex-col">
            <Text
              className="text-[10px] text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("rental.service.consumption")}
            </Text>
            <Text
              className="text-xs font-bold text-primary"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {bill.consumption}
            </Text>
          </View>
        </View>
      ) : (
        <AppRow className="w-full justify-between items-center px-3 py-2 rounded-xl bg-muted/30">
          <Text
            className="text-[11px] font-semibold text-muted-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("tickets.title")}: {bill.serviceDate ? formatDate(bill.serviceDate) : "—"}
          </Text>
        </AppRow>
      )}

      {/* Date & Total Amount */}
      <AppRow className="w-full items-end justify-between">
        <Text
          className="text-[11px] font-medium text-muted-foreground"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {bill.serviceDate ? formatDate(bill.serviceDate) : "—"}
        </Text>

        <View className="flex-col items-end">
          <Text
            className="text-[10px] font-semibold text-muted-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.service.totalAmount")}
          </Text>
          <Text
            className="text-base font-extrabold text-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {formattedTotal}
          </Text>
        </View>
      </AppRow>

      {/* Link to Invoice if available */}
      {Boolean(bill.invoiceId) && (
        <Pressable
          accessibilityRole="button"
          onPress={handleInvoicePress}
          className="w-full py-2 px-3 rounded-xl bg-primary/10 items-center justify-center flex-row gap-2 active:opacity-85"
        >
          <AppIcon name="invoices" size={14} colorToken="--primary" />
          <Text className="text-xs font-bold text-primary">
            {t("rental.viewInvoice")} ({bill.invoiceNumber})
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}
