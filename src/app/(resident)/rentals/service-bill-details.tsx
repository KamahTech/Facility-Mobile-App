import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Stack, useLocalSearchParams, type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { ScreenHeader } from "@/components/screen-header";
import { AppRow } from "@/components/app-row";
import { AppIcon } from "@/components/app-icon";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useServiceBillDetailQuery } from "@/hooks/use-rental";
import type { ServiceType, ServiceBillState } from "@/lib/rental-types";

export default function ServiceBillDetailsScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const params = useLocalSearchParams<{ id: string }>();

  const billId = params.id;
  const { data: bill, isLoading, error } = useServiceBillDetailQuery(billId);
  const { formatCurrency, formatDate } = useFormatters();

  const handleBack = () => {
    router.back();
  };

  const handleInvoicePress = () => {
    if (bill?.invoiceId) {
      router.push(`/invoices/${bill.invoiceId}` as Href);
    }
  };

  const serviceInfo = React.useMemo(() => {
    if (!bill) return { icon: "otherService" as const, color: "#8B5CF6", bg: "", label: "" };
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
  }, [bill, t]);

  const stateStyle = React.useMemo(() => {
    if (!bill) return { bg: "", text: "", label: "" };
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
  }, [bill, t]);

  const isMetered = bill?.serviceType === "electricity" || bill?.serviceType === "water";

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
      <ScreenHeader title={t("rental.serviceBillDetailsTitle")} onBack={handleBack} />

      <View className="flex-1 w-full max-w-xl self-center">
        {isLoading || !bill ? (
          <View className="flex-1 items-center justify-center py-12">
            <AppActivityIndicator size="large" />
          </View>
        ) : error ? (
          <View className="p-6 items-center justify-center">
            <Text className="text-sm font-semibold text-destructive text-center">
              {String(error)}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: insets.bottom + 40,
              paddingHorizontal: 20,
              flexDirection: "column",
              gap: 20,
            }}
            className="flex-1 w-full"
          >
            {/* Main Header Banner */}
            <View className="w-full p-5 rounded-3xl bg-card border border-border/50 flex-col gap-4">
              <AppRow className="w-full justify-between items-center">
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-2xl items-center justify-center ${serviceInfo.bg}`}>
                    <AppIcon name={serviceInfo.icon} size={20} color={serviceInfo.color} />
                  </View>
                  <View className="flex-col">
                    <Text
                      className="text-base font-extrabold text-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {bill.reference}
                    </Text>
                    <Text
                      className="text-xs font-medium text-muted-foreground"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {serviceInfo.label} • {bill.unitName || "Unit"}
                    </Text>
                  </View>
                </View>

                <View className={`px-3 py-1 rounded-full ${stateStyle.bg}`}>
                  <Text
                    className={`text-xs font-bold uppercase ${stateStyle.text}`}
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {stateStyle.label}
                  </Text>
                </View>
              </AppRow>

              {/* Total Amount Box */}
              <View className="w-full p-4 rounded-2xl bg-muted/40 flex-col items-start gap-1">
                <Text
                  className="text-[11px] font-semibold text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("rental.service.totalAmount")}
                </Text>
                <Text
                  className="text-2xl font-black text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {formatCurrency(bill.totalAmount, bill.currency?.code || "EGP")}
                </Text>
              </View>
            </View>

            {/* Meter Reading Comparison Card if metered */}
            {isMetered && (
              <View className="w-full p-5 rounded-3xl bg-card border border-border/50 flex-col gap-4">
                <Text
                  className="text-sm font-extrabold text-foreground tracking-wide uppercase"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("tickets.detailsTitle")}
                </Text>

                <View className="p-4 rounded-2xl bg-muted/30 flex-row items-center justify-between">
                  <View className="flex-1 items-start flex-col">
                    <Text
                      className="text-xs text-muted-foreground font-medium"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {t("rental.service.previousReading")}
                    </Text>
                    <Text
                      className="text-base font-bold text-foreground mt-1"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {bill.previousReading}
                    </Text>
                  </View>

                  <View className="w-[1px] h-10 bg-border/60 mx-2" />

                  <View className="flex-1 items-start flex-col">
                    <Text
                      className="text-xs text-muted-foreground font-medium"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {t("rental.service.currentReading")}
                    </Text>
                    <Text
                      className="text-base font-bold text-foreground mt-1"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {bill.currentReading}
                    </Text>
                  </View>

                  <View className="w-[1px] h-10 bg-border/60 mx-2" />

                  <View className="flex-1 items-start flex-col">
                    <Text
                      className="text-xs text-muted-foreground font-medium"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {t("rental.service.consumption")}
                    </Text>
                    <Text
                      className="text-base font-black text-primary mt-1"
                      style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                    >
                      {bill.consumption}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Bill Details List */}
            <View className="w-full p-5 rounded-3xl bg-card border border-border/50 flex-col gap-3">
              <AppRow className="w-full justify-between items-center">
                <Text
                  className="text-xs font-semibold text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("invoices.issueDate")}
                </Text>
                <Text
                  className="text-xs font-bold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {bill.serviceDate ? formatDate(bill.serviceDate) : "—"}
                </Text>
              </AppRow>

              <AppRow className="w-full justify-between items-center">
                <Text
                  className="text-xs font-semibold text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("rental.unitsCovered")}
                </Text>
                <Text
                  className="text-xs font-bold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {bill.unitName || "—"}
                </Text>
              </AppRow>
            </View>

            {/* Invoice Link Button */}
            {Boolean(bill.invoiceId) && (
              <Pressable
                accessibilityRole="button"
                onPress={handleInvoicePress}
                className="w-full py-4 px-5 rounded-2xl bg-primary items-center justify-center flex-row gap-2 active:opacity-90 shadow-xs"
              >
                <AppIcon name="invoices" size={18} colorToken="--primary-foreground" />
                <Text className="text-sm font-bold text-primary-foreground">
                  {t("rental.viewInvoice")} ({bill.invoiceNumber})
                </Text>
              </Pressable>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
