import React from "react";
import { View, TouchableOpacity } from "react-native";
import { router, type Href } from "expo-router";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import type { Invoice } from "@/stores/invoices-store";

type InvoiceCardProps = {
  invoice: Invoice;
  onPay: (id: string) => void;
};

export function InvoiceCard({ invoice, onPay }: InvoiceCardProps) {
  const { t } = useI18n();
  const { formatCurrency, formatDate } = useFormatters();
  const { id, invoiceNumber, titleKey, descriptionKey, amount, status, issueDate, dueDate, paidDate } = invoice;

  const formattedAmount = React.useMemo(() => {
    return formatCurrency(amount);
  }, [amount, formatCurrency]);

  // Color schemes and badge styles based on invoice status
  const theme = React.useMemo(() => {
    switch (status) {
      case "paid":
        return {
          badgeBg: "bg-emerald-50 dark:bg-emerald-950/30",
          badgeText: "text-emerald-700 dark:text-emerald-400",
          iconBg: "bg-emerald-500/10",
          iconColor: "#10B981",
          statusTextKey: "invoices.status.paid",
          borderColor: "border-border/50",
        };
      case "overdue":
        return {
          badgeBg: "bg-rose-50 dark:bg-rose-950/30",
          badgeText: "text-rose-700 dark:text-rose-400",
          iconBg: "bg-rose-500/10",
          iconColor: "#F43F5E",
          statusTextKey: "invoices.status.overdue",
          borderColor: "border-rose-500/20 dark:border-rose-500/10",
        };
      case "pending":
      default:
        return {
          badgeBg: "bg-amber-50 dark:bg-amber-950/30",
          badgeText: "text-amber-700 dark:text-amber-400",
          iconBg: "bg-amber-500/10",
          iconColor: "#F59E0B",
          statusTextKey: "invoices.status.pending",
          borderColor: "border-border/80",
        };
    }
  }, [status]);



  const handleCardPress = () => {
    router.push(`/invoices/${id}` as Href);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleCardPress}
      className={`w-full p-4 rounded-2xl bg-card border ${theme.borderColor} mb-3 flex-col gap-3 active:opacity-95`}
    >
      {/* Top Header Row: Invoice Number, Badge Status & Icon */}
      <AppRow className="w-full items-center justify-between">
        <AppRow className="items-center gap-2.5">
          <View className={`size-8 rounded-lg items-center justify-center ${theme.iconBg}`}>
            <AppIcon name="invoices" size={16} color={theme.iconColor} />
          </View>
          <View className="flex-col">
            <AppText className="text-xs font-bold text-foreground opacity-50">
              {invoiceNumber}
            </AppText>
          </View>
        </AppRow>
        <View className={`px-2.5 py-1 rounded-full ${theme.badgeBg}`}>
          <AppText className={`text-[10px] font-bold uppercase tracking-wider ${theme.badgeText}`}>
            {t(theme.statusTextKey as any)}
          </AppText>
        </View>
      </AppRow>

      {/* Invoice Title and Description */}
      <View className="flex-col gap-1">
        <AppText className="text-start text-base font-bold text-foreground">
          {t(titleKey)}
        </AppText>
        <AppText className="text-start text-xs text-muted-foreground leading-4">
          {t(descriptionKey)}
        </AppText>
      </View>

      {/* Divider */}
      <View className="w-full h-[1px] bg-border/50" />

      {/* Footer Row: Dates, Amount, and Optional Payment Button */}
      <AppRow className="w-full items-end justify-between">
        <View className="flex-col gap-1">
          <AppRow className="items-center gap-1.5">
            <AppText className="text-[10px] text-muted-foreground">
              {t("invoices.issueDate")}:
            </AppText>
            <AppText className="text-[11px] font-medium text-foreground opacity-80">
              {formatDate(issueDate)}
            </AppText>
          </AppRow>
          <AppRow className="items-center gap-1.5">
            <AppText className="text-[10px] text-muted-foreground">
              {status === "paid" ? t("invoices.paidDate") : t("invoices.dueDate")}:
            </AppText>
            <AppText className="text-[11px] font-medium text-foreground opacity-80">
              {formatDate(status === "paid" && typeof paidDate === "string" ? paidDate : dueDate)}
            </AppText>
          </AppRow>
        </View>

        <View className="items-end gap-1.5">
          <AppText className="text-lg font-bold text-foreground">
            {formattedAmount}
          </AppText>
        </View>
      </AppRow>
    </TouchableOpacity>
  );
}
