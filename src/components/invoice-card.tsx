import React from "react";
import { Pressable, View, Text } from "react-native";
import { type Href } from "expo-router";
import { router } from "@/lib/navigation";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import type { Invoice } from "@/stores/invoices-store";

type InvoiceCardProps = {
  invoice: Invoice;
  onPay: (id: string) => void;
};

export function InvoiceCard({ invoice, onPay }: InvoiceCardProps) {
  const { isRTL, t } = useI18n();
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
        };
      case "overdue":
        return {
          badgeBg: "bg-rose-50 dark:bg-rose-950/30",
          badgeText: "text-rose-700 dark:text-rose-400",
          iconBg: "bg-rose-500/10",
          iconColor: "#F43F5E",
          statusTextKey: "invoices.status.overdue",
        };
      case "pending":
      default:
        return {
          badgeBg: "bg-amber-50 dark:bg-amber-950/30",
          badgeText: "text-amber-700 dark:text-amber-400",
          iconBg: "bg-amber-500/10",
          iconColor: "#F59E0B",
          statusTextKey: "invoices.status.pending",
        };
    }
  }, [status]);

  const handleCardPress = () => {
    router.push(`/invoices/${id}` as Href);
  };

  return (
    <Pressable
      onPress={handleCardPress}
      className="w-full p-4 rounded-2xl bg-card mb-3 flex-col gap-3 active:opacity-95"
    >
      <AppRow className="w-full items-center justify-between">
        <AppRow className="items-center gap-2.5">
          <View className={`size-8 rounded-lg items-center justify-center ${theme.iconBg}`}>
            <AppIcon name="invoices" size={16} color={theme.iconColor} />
          </View>
          <View className="flex-col">
            <Text
              className="text-xs font-bold text-foreground opacity-50"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {invoiceNumber}
            </Text>
          </View>
        </AppRow>
        <View className={`px-2.5 py-1 rounded-full shrink-0 ${theme.badgeBg}`}>
          <Text
            className={`text-[10px] font-bold uppercase tracking-wider ${theme.badgeText}`}
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t(theme.statusTextKey as any)}
          </Text>
        </View>
      </AppRow>

      {/* Invoice Title and Description */}
      <View className="flex-col gap-1">
        <Text
          className="text-base font-bold text-foreground"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t(titleKey)}
        </Text>
        <Text
          className="text-xs text-muted-foreground leading-4"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t(descriptionKey)}
        </Text>
      </View>

      {/* Footer Row: Dates, Amount, and Optional Payment Button */}
      <AppRow className="w-full items-end justify-between">
        <View className="flex-col gap-1">
          <AppRow className="items-center gap-1.5">
            <Text
              className="text-[10px] text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("invoices.issueDate")}:
            </Text>
            <Text
              className="text-[11px] font-medium text-foreground opacity-80"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {formatDate(issueDate)}
            </Text>
          </AppRow>
          <AppRow className="items-center gap-1.5">
            <Text
              className="text-[10px] text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {status === "paid" ? t("invoices.paidDate") : t("invoices.dueDate")}:
            </Text>
            <Text
              className="text-[11px] font-medium text-foreground opacity-80"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {formatDate(status === "paid" && typeof paidDate === "string" ? paidDate : dueDate)}
            </Text>
          </AppRow>
        </View>

        <View className="items-end gap-1.5">
          <Text
            className="text-lg font-bold text-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {formattedAmount}
          </Text>
        </View>
      </AppRow>
    </Pressable>
  );
}
