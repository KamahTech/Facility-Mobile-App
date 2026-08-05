import React from "react";
import { View, Text, Pressable } from "react-native";
import { type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { calculateDaysOverdue, getInstallmentEffectiveState } from "@/hooks/use-rental";
import { type RentalInstallment, type InstallmentType, isValidInvoiceId } from "@/lib/rental-types";

type RentalInstallmentCardProps = {
  installment: RentalInstallment;
};

export function RentalInstallmentCard({ installment }: RentalInstallmentCardProps) {
  const { isRTL, t } = useI18n();
  const { formatCurrency, formatDate } = useFormatters();

  const currencyCode = installment.currency?.code || "EGP";
  const formattedAmount = formatCurrency(installment.amount, currencyCode);
  const formattedPaid = formatCurrency(installment.paidAmount || 0, currencyCode);
  const formattedRemaining = formatCurrency(installment.remainingAmount, currencyCode);

  const effectiveState = getInstallmentEffectiveState(installment);
  const daysOverdue = calculateDaysOverdue(installment.dueDate);
  const isOverdueState = effectiveState === "overdue";

  const stateStyle = React.useMemo(() => {
    switch (effectiveState) {
      case "paid":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
          text: "text-emerald-700 dark:text-emerald-300",
          label: t("rental.installment.state.paid"),
        };
      case "partial_paid":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/40",
          text: "text-blue-700 dark:text-blue-300",
          label: t("rental.installment.state.partial_paid"),
        };
      case "invoiced":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/40",
          text: "text-purple-700 dark:text-purple-300",
          label: t("rental.installment.state.invoiced"),
        };
      case "overdue":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/40",
          text: "text-rose-700 dark:text-rose-300",
          label: t("rental.installment.state.overdue"),
        };
      case "due":
      default:
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40",
          text: "text-amber-700 dark:text-amber-300",
          label: t("rental.installment.state.due"),
        };
    }
  }, [effectiveState, t]);

  const typeLabel = React.useMemo(() => {
    const type = installment.type as InstallmentType;
    const typeMap: Record<InstallmentType, string> = {
      rent: "rental.installment.type.rent",
      insurance: "rental.installment.type.insurance",
      service: "rental.installment.type.service",
    };
    return t((typeMap[type] || "rental.installment.type.rent") as any);
  }, [installment.type, t]);

  const handleInvoicePress = () => {
    if (isValidInvoiceId(installment.invoiceId)) {
      router.push(`/invoices/${installment.invoiceId}` as Href);
    }
  };

  return (
    <View className="w-full p-4 rounded-2xl bg-card border border-border/50 mb-3 flex-col gap-3">
      <AppRow className="w-full items-center justify-between">
        <AppRow className="items-center gap-2.5 flex-1">
          <View className={`w-9 h-9 rounded-xl items-center justify-center ${isOverdueState ? "bg-rose-500/10" : "bg-emerald-500/10"}`}>
            <AppIcon name="invoices" size={18} color={isOverdueState ? "#F43F5E" : "#10B981"} />
          </View>
          <View className="flex-col flex-1">
            <Text
              className="text-sm font-bold text-foreground"
              numberOfLines={1}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {installment.name}
            </Text>
            <Text
              className="text-[11px] font-medium text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {typeLabel}
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

      {/* Due Date & Overdue Tag */}
      <AppRow className="w-full justify-between items-center px-3 py-2 rounded-xl bg-muted/30">
        <Text
          className="text-[11px] font-semibold text-muted-foreground"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("invoices.dueDate")}: {installment.dueDate ? formatDate(installment.dueDate) : "—"}
        </Text>

        {isOverdueState && daysOverdue > 0 && (
          <Text
            className="text-[11px] font-bold text-rose-600 dark:text-rose-400"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.daysOverdue").replace("{{days}}", String(daysOverdue))}
          </Text>
        )}
      </AppRow>

      {/* Amounts Row */}
      <AppRow className="w-full items-end justify-between">
        <View className="flex-col">
          <Text
            className="text-[10px] font-semibold text-muted-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("invoices.total")}
          </Text>
          <Text
            className="text-sm font-bold text-foreground opacity-80"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {formattedAmount}
          </Text>
        </View>

        {installment.paidAmount > 0 && installment.remainingAmount > 0 && (
          <View className="flex-col items-center">
            <Text
              className="text-[10px] font-semibold text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("rental.paidAmount")}
            </Text>
            <Text
              className="text-sm font-bold text-emerald-600 dark:text-emerald-400"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {formattedPaid}
            </Text>
          </View>
        )}

        <View className="flex-col items-end">
          <Text
            className="text-[10px] font-semibold text-muted-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.remainingAmount")}
          </Text>
          <Text
            className={`text-base font-extrabold ${
              effectiveState === "paid"
                ? "text-emerald-600 dark:text-emerald-400"
                : isOverdueState
                ? "text-rose-600 dark:text-rose-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {formattedRemaining}
          </Text>
        </View>
      </AppRow>

      {/* Link to Invoice if invoiceId exists */}
      {isValidInvoiceId(installment.invoiceId) && (
        <Pressable
          accessibilityRole="button"
          onPress={handleInvoicePress}
          className="w-full py-2 px-3 rounded-xl bg-primary/10 items-center justify-center flex-row gap-2 active:opacity-85"
        >
          <AppIcon name="invoices" size={14} colorToken="--primary" />
          <Text className="text-xs font-bold text-primary">
            {t("rental.viewInvoice")} ({installment.invoiceNumber})
          </Text>
        </Pressable>
      )}
    </View>
  );
}
