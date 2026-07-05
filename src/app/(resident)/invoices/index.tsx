import React from "react";
import { View, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LegendList } from "@legendapp/list/react-native";

import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { ScreenHeader } from "@/components/screen-header";
import { InvoiceCard } from "@/components/invoice-card";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import { useInvoicesStore, type Invoice } from "@/stores/invoices-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function ResidentInvoicesScreen() {
  const { t } = useI18n();
  const { formatCurrency } = useFormatters();
  const insets = useSafeAreaInsets();
  const { invoices, fetchInvoices, payInvoice, loading, error, clearError } = useInvoicesStore();
  const isTransitionFinished = useScreenTransition();

  const [activeFilter, setActiveFilter] = React.useState<"all" | "unpaid" | "paid">("all");
  const [refreshing, setRefreshing] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  const loadInvoices = React.useCallback(async () => {
    clearError();
    await fetchInvoices();
  }, [fetchInvoices, clearError]);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInvoices();
    setRefreshing(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handlePay = React.useCallback(async (id: string) => {
    setActionLoading(true);
    try {
      await payInvoice(id);
      Alert.alert(
        t("invoices.successPayment"),
        t("invoices.successPaymentDesc").replace("{{invoiceNumber}}", id)
      );
    } catch (e: unknown) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.invoicePaymentFailed"));
    } finally {
      setActionLoading(false);
    }
  }, [payInvoice, t]);

  const totalBalance = React.useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "pending" || inv.status === "overdue")
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  const formattedTotalBalance = React.useMemo(() => {
    return formatCurrency(totalBalance);
  }, [totalBalance, formatCurrency]);

  const filteredInvoices = React.useMemo(() => {
    switch (activeFilter) {
      case "unpaid":
        return invoices.filter((inv) => inv.status === "pending" || inv.status === "overdue");
      case "paid":
        return invoices.filter((inv) => inv.status === "paid");
      case "all":
      default:
        return invoices;
    }
  }, [invoices, activeFilter]);

  const renderItem = React.useCallback(({ item }: { item: Invoice }) => {
    return <InvoiceCard invoice={item} onPay={handlePay} />;
  }, [handlePay]);

  const renderFilters = () => {
    const filters: { key: typeof activeFilter; labelKey: string }[] = [
      { key: "all", labelKey: "invoices.filterAll" },
      { key: "unpaid", labelKey: "invoices.filterUnpaid" },
      { key: "paid", labelKey: "invoices.filterPaid" },
    ];

    return (
      <AppRow className="gap-2 mb-4">
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(f.key)}
              className={`flex-1 py-2 px-3 rounded-xl border items-center justify-center transition-all ${
                isActive
                  ? "bg-primary border-primary"
                  : "bg-card border-border"
              }`}
            >
              <AppText
                className={`text-xs font-bold ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {t(f.labelKey as any)}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </AppRow>
    );
  };

  const renderHeader = () => {
    return (
      <View className="mb-4">
        {/* Outstanding balance card summary */}
        <View className="bg-primary/5 dark:bg-primary/10 border border-primary/10 p-5 rounded-2xl items-center mb-6">
          <AppText className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            {t("invoices.totalBalance")}
          </AppText>
          <AppText className="text-3xl font-extrabold text-foreground">
            {formattedTotalBalance}
          </AppText>
        </View>

        {/* Local Tab filters */}
        {renderFilters()}
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <View className="flex-1 py-16 items-center justify-center">
        <AppText className="text-muted-foreground text-sm font-semibold">
          {t("invoices.empty")}
        </AppText>
      </View>
    );
  };

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

      <ScreenHeader title={t("invoices.title")} onBack={handleBack} />

      <View className="flex-1 w-full max-w-xl self-center">
        <FullScreenLoader visible={actionLoading} />

        {loading && invoices.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            {isTransitionFinished && <ActivityIndicator size="large" color="#4F46E5" />}
          </View>
        ) : (
          <View className="flex-1">
            {error && (
              <View className="bg-destructive/10 p-3 rounded-xl border border-destructive/25 mx-5 mb-4">
                <AppText className="text-sm font-semibold text-destructive text-start">
                  {error}
                </AppText>
              </View>
            )}

            <LegendList
              data={filteredInvoices}
              recycleItems={true}
              estimatedItemSize={180}
              keyExtractor={(item: Invoice) => item.id}
              renderItem={renderItem}
              ListHeaderComponent={renderHeader}
              ListEmptyComponent={renderEmpty}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#4F46E5"
                />
              }
              contentContainerStyle={{
                paddingTop: 16,
                paddingBottom: insets.bottom + 40,
                paddingHorizontal: 20,
              }}
              className="flex-1 w-full"
            />
          </View>
        )}
      </View>
    </View>
  );
}
