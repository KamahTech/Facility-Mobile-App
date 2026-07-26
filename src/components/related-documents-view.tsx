import React from "react";
import { View, ScrollView, Pressable, Text } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { ScreenHeader } from "@/components/screen-header";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useRelatedDocumentsQuery, type RelatedDocument } from "@/stores/requests-store";

type RelatedDocumentsViewProps = {
  ticketId: string;
  accountType: "resident" | "worker";
  onBack: () => void;
};

export function RelatedDocumentsView({
  ticketId,
  accountType,
  onBack,
}: RelatedDocumentsViewProps) {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const background = useThemeToken("--background");

  const { data, isLoading, error, refetch } = useRelatedDocumentsQuery(ticketId, accountType);

  // Group or flatten the documents
  const pickings = data?.pickings || [];
  const quotations = data?.quotations || [];
  const purchaseOrders = data?.purchaseOrders || [];

  const totalCount = pickings.length + quotations.length + purchaseOrders.length;

  const getStatusColorConfig = (state: string) => {
    const normalized = (state || "").toLowerCase();
    if (["done", "sale", "purchase"].includes(normalized)) {
      return {
        bg: "bg-green-50 dark:bg-green-950/20",
        text: "text-green-600 dark:text-green-400",
      };
    }
    if (["assigned", "confirmed", "sent"].includes(normalized)) {
      return {
        bg: "bg-blue-50 dark:bg-blue-950/20",
        text: "text-blue-600 dark:text-blue-400",
      };
    }
    if (["draft", "waiting"].includes(normalized)) {
      return {
        bg: "bg-amber-50 dark:bg-amber-950/20",
        text: "text-amber-600 dark:text-amber-400",
      };
    }
    return {
      bg: "bg-gray-50 dark:bg-gray-950/20",
      text: "text-gray-600 dark:text-gray-400",
    };
  };

  const renderDocumentItem = (doc: RelatedDocument, type: "picking" | "quotation" | "purchase") => {
    const statusConfig = getStatusColorConfig(doc.state);
    
    // Choose icons & color markers based on document type
    let typeLabel = "";
    let iconName = "invoices" as const;
    let iconColor = "#3B82F6";
    let iconBg = "bg-blue-500/10";
    
    if (type === "picking") {
      typeLabel = t("tickets.documentType.picking" as any) || "Material picking";
      iconName = "invoices";
      iconColor = "#3B82F6";
      iconBg = "bg-blue-500/10";
    } else if (type === "quotation") {
      typeLabel = t("tickets.documentType.quotation" as any) || "Sales quotation";
      iconName = "invoices";
      iconColor = "#10B981";
      iconBg = "bg-emerald-500/10";
    } else if (type === "purchase") {
      typeLabel = t("tickets.documentType.purchase" as any) || "Purchase Order";
      iconName = "invoices";
      iconColor = "#F59E0B";
      iconBg = "bg-amber-500/10";
    }

    // Try to translate states or default
    const translatedState = t(`tickets.documentStatus.${doc.state}` as any) || doc.state;

    return (
      <View
        key={`${type}-${doc.id}`}
        className="w-full bg-card rounded-2xl p-4 flex-col gap-3 shadow-2xs border border-border/10 mb-4"
      >
        <AppRow className="items-center justify-between gap-3">
          <AppRow className="items-center gap-3 flex-1 min-w-0">
            <View className={`w-10 h-10 rounded-xl items-center justify-center ${iconBg}`}>
              <AppIcon name={iconName} size={20} color={iconColor} />
            </View>
            <View className="flex-1 min-w-0 text-start">
              <Text
                className="text-sm font-bold text-foreground text-start"
                numberOfLines={1}
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {doc.name}
              </Text>
              <Text
                className="text-[11px] text-muted-foreground mt-0.5 text-start font-semibold"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {typeLabel}
              </Text>
            </View>
          </AppRow>

          <View className={`px-2.5 py-0.5 rounded-full shrink-0 ${statusConfig.bg}`}>
            <Text
              className={`text-[10px] font-bold uppercase tracking-wider ${statusConfig.text}`}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {translatedState}
            </Text>
          </View>
        </AppRow>

        {/* Detailed Info */}
        <AppRow className="justify-between items-center border-t border-border/5 pt-2 flex-wrap gap-2">
          {doc.date ? (
            <Text
              className="text-xs text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("tickets.date")}: {doc.date}
            </Text>
          ) : (
            <View />
          )}

          {typeof doc.amountTotal === "number" && (
            <Text
              className="text-xs font-bold text-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("tickets.amount" as any) || "Amount"}: {doc.amountTotal.toFixed(2)}
            </Text>
          )}
        </AppRow>
      </View>
    );
  };

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: background,
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <ScreenHeader
        title={t("tickets.relatedDocuments" as any) || "Related Documents"}
        onBack={onBack}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <AppActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6 gap-3">
          <Text
            className="text-sm text-destructive text-center font-medium"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {error.message}
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="px-4 py-2 rounded-xl bg-primary active:opacity-75"
          >
            <Text className="text-sm font-bold text-primary-foreground">
              {t("common.retry" as any) || "Retry"}
            </Text>
          </Pressable>
        </View>
      ) : totalCount === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-14 h-14 rounded-full bg-secondary/50 items-center justify-center mb-3">
            <AppIcon name="invoices" size={24} colorToken="--muted-foreground" />
          </View>
          <Text
            className="text-sm text-muted-foreground text-center"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("tickets.noDocuments" as any) || "No related documents found."}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom, 24),
            paddingHorizontal: 20,
          }}
          className="flex-1 w-full max-w-xl self-center"
        >
          {/* Render Pickings */}
          {pickings.length > 0 && (
            <View className="mb-4">
              <Text
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 px-1 text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("tickets.documentType.picking" as any) || "Material pickings"}
              </Text>
              {pickings.map((doc) => renderDocumentItem(doc, "picking"))}
            </View>
          )}

          {/* Render Quotations */}
          {quotations.length > 0 && (
            <View className="mb-4">
              <Text
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 px-1 text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("tickets.documentType.quotation" as any) || "Sales quotations"}
              </Text>
              {quotations.map((doc) => renderDocumentItem(doc, "quotation"))}
            </View>
          )}

          {/* Render Purchase Orders */}
          {purchaseOrders.length > 0 && (
            <View className="mb-4">
              <Text
                className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 px-1 text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("tickets.documentType.purchase" as any) || "Purchase orders"}
              </Text>
              {purchaseOrders.map((doc) => renderDocumentItem(doc, "purchase"))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
