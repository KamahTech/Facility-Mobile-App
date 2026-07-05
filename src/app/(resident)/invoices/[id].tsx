import React from "react";
import { ScrollView, View, TouchableOpacity, Alert } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { ScreenHeader } from "@/components/screen-header";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useInvoicesStore } from "@/stores/invoices-store";

export default function InvoiceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useI18n();
  const { formatDate, formatCurrency } = useFormatters();
  const insets = useSafeAreaInsets();
  const { invoices, payInvoice } = useInvoicesStore();
  const [localLoading, setLocalLoading] = React.useState(false);

  const invoice = React.useMemo(() => {
    return invoices.find((inv) => inv.id === id);
  }, [invoices, id]);

  const handleBack = React.useCallback(() => {
    router.back();
  }, []);

  const handlePay = React.useCallback(() => {
    if (!invoice) return;

    const localizedAmountStr = formatCurrency(invoice.amount);

    Alert.alert(
      t("invoices.payConfirmTitle"),
      t("invoices.payConfirmDesc")
        .replace("{{invoiceNumber}}", invoice.invoiceNumber)
        .replace("{{amount}}", localizedAmountStr),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("invoices.payNow"),
          style: "default",
          onPress: async () => {
            setLocalLoading(true);
            try {
              await payInvoice(invoice.id);
              Alert.alert(
                t("invoices.successPayment"),
                t("invoices.successPaymentDesc").replace("{{invoiceNumber}}", invoice.invoiceNumber)
              );
            } catch (e: unknown) {
              Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.invoicePaymentFailed"));
            } finally {
              setLocalLoading(false);
            }
          },
        },
      ]
    );
  }, [invoice, formatCurrency, payInvoice, t]);

  const handleComingSoon = React.useCallback(() => {
    Alert.alert(t("invoices.detailsTitle"), t("invoices.comingSoon"));
  }, [t]);

  if (!invoice) {
    return (
      <View
        className="flex-1 bg-background"
        style={{
          paddingTop: insets.top,
          paddingStart: insets.left,
          paddingEnd: insets.right,
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title={t("invoices.detailsTitle")} onBack={handleBack} />
        <View className="flex-1 items-center justify-center px-6">
          <AppIcon name="feedback" size={48} colorToken="--foreground" />
          <AppText align="center" className="mt-4 text-lg font-bold text-foreground">
            {t("invoices.notFound")}
          </AppText>
        </View>
      </View>
    );
  }

  // Calculate Breakdown values dynamically: Base (80%), VAT (15%), Processing Fee (5%)
  const baseFee = invoice.amount * 0.8;
  const vatAmount = invoice.amount * 0.15;
  const processingFee = invoice.amount * 0.05;

  const statusTheme = (() => {
    switch (invoice.status) {
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
  })();

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader title={t("invoices.detailsTitle")} onBack={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        <View className="px-5 sm:px-8 flex-col gap-6">
          
          {/* Header Summary Box */}
          <View className="bg-card border border-border p-6 rounded-3xl flex-col items-center gap-4">
            <View className={`size-12 rounded-2xl items-center justify-center ${statusTheme.iconBg}`}>
              <AppIcon name="invoices" size={24} color={statusTheme.iconColor} />
            </View>
            <View className="items-center">
              <AppText className="text-2xl font-black text-foreground">
                {formatCurrency(invoice.amount)}
              </AppText>
              <AppText className="text-xs text-muted-foreground font-semibold mt-1">
                {invoice.invoiceNumber}
              </AppText>
            </View>
            <View className={`px-3 py-1 rounded-full ${statusTheme.badgeBg}`}>
              <AppText className={`text-xs font-bold uppercase tracking-wider ${statusTheme.badgeText}`}>
                {t(statusTheme.statusTextKey as any)}
              </AppText>
            </View>
          </View>

          {/* Billing / Information Section */}
          <View className="flex-col gap-3">
            <AppText className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {t("invoices.paymentInfo")}
            </AppText>

            <View className="bg-card border border-border rounded-2xl p-4 flex-col gap-3">
              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground">
                  {t("invoices.itemDescription")}
                </AppText>
                <AppText className="text-sm font-bold text-foreground">
                  {t(invoice.titleKey)}
                </AppText>
              </AppRow>
              
              <View className="h-[1px] bg-border/50" />

              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground">
                  {t("invoices.issueDate")}
                </AppText>
                <AppText className="text-sm font-semibold text-foreground">
                  {formatDate(invoice.issueDate)}
                </AppText>
              </AppRow>

              <View className="h-[1px] bg-border/50" />

              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground">
                  {invoice.status === "paid" ? t("invoices.paidDate") : t("invoices.dueDate")}
                </AppText>
                <AppText className="text-sm font-semibold text-foreground">
                  {formatDate(invoice.status === "paid" && typeof invoice.paidDate === "string" ? invoice.paidDate : invoice.dueDate)}
                </AppText>
              </AppRow>
            </View>
          </View>

          {/* Invoice Breakdown Details */}
          <View className="flex-col gap-3">
            <AppText className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {t("invoices.lineItems")}
            </AppText>

            <View className="bg-card border border-border rounded-2xl p-4 flex-col gap-3">
              {/* Row 1: Base fee */}
              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground">
                  {t("invoices.serviceFee")}
                </AppText>
                <AppText className="text-sm font-medium text-foreground">
                  {formatCurrency(baseFee)}
                </AppText>
              </AppRow>

              <View className="h-[1px] bg-border/50" />

              {/* Row 2: VAT */}
              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground">
                  {t("invoices.vat")}
                </AppText>
                <AppText className="text-sm font-medium text-foreground">
                  {formatCurrency(vatAmount)}
                </AppText>
              </AppRow>

              <View className="h-[1px] bg-border/50" />

              {/* Row 3: Processing Fee */}
              <AppRow className="justify-between items-center">
                <AppText className="text-sm text-muted-foreground">
                  {t("invoices.processingFee")}
                </AppText>
                <AppText className="text-sm font-medium text-foreground">
                  {formatCurrency(processingFee)}
                </AppText>
              </AppRow>

              <View className="h-[1px] bg-border/50" />

              {/* Row 4: Total */}
              <AppRow className="justify-between items-center pt-1">
                <AppText className="text-sm font-bold text-foreground">
                  {t("invoices.total")}
                </AppText>
                <AppText className="text-base font-black text-primary">
                  {formatCurrency(invoice.amount)}
                </AppText>
              </AppRow>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-col gap-3 mt-4">
            {invoice.status !== "paid" ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePay}
                className="w-full bg-primary py-4 rounded-2xl justify-center items-center active:opacity-90"
              >
                <AppText className="text-primary-foreground font-bold text-base uppercase tracking-wider">
                  {t("invoices.payNow")}
                </AppText>
              </TouchableOpacity>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleComingSoon}
                  className="flex-1 bg-card border border-border py-4 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-90"
                >
                  <AppIcon name="invoices" size={16} colorToken="--foreground" />
                  <AppText className="text-foreground font-bold text-sm">
                    {t("invoices.downloadReceipt")}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleComingSoon}
                  className="flex-1 bg-card border border-border py-4 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-90"
                >
                  <AppIcon name="linkUnit" size={16} colorToken="--foreground" />
                  <AppText className="text-foreground font-bold text-sm">
                    {t("invoices.shareInvoice")}
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>

        </View>
      </ScrollView>
      <FullScreenLoader visible={localLoading} />
    </View>
  );
}
