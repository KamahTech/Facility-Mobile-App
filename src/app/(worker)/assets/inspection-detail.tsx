import React from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, View, Text, ScrollView, RefreshControl } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { router } from "@/lib/navigation";
import { type Href } from "expo-router";
import { AppIcon } from "@/components/app-icon";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useInspectionDetailQuery } from "@/hooks/use-asset-inspection";

import { ChecklistItemCard } from "@/components/assets/checklist-item-card";
import { InspectionPhotoPicker } from "@/components/assets/inspection-photo-picker";
import { InspectionStateBadge } from "@/components/assets/inspection-state-badge";
import type { LocalPhotoItem } from "@/stores/asset-inspection-store";

export default function ReadOnlyInspectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const inspectionId = Array.isArray(id) ? id[0] : id || "";

  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const { resolvedTheme } = useTheme();
  const mutedForeground = useThemeToken("--muted-foreground");
  const primaryColor = useThemeToken("--primary");

  const { data: inspection, isLoading, refetch, isRefetching } = useInspectionDetailQuery(
    inspectionId
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <AppActivityIndicator size="large" />
      </View>
    );
  }

  const checklistItems = inspection?.checklist || [];

  const photosList: LocalPhotoItem[] = (inspection?.photos || []).map((p, idx) => ({
    id: p.id || p.attachmentId || `photo-${idx}`,
    name: p.name || `photo-${idx}.jpg`,
    mimetype: p.mimetype || "image/jpeg",
    data: p.data || "",
    contentUrl: p.contentUrl,
    isExisting: true,
  }));

  const ticketId = inspection?.maintenanceRequestId;

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View className="px-5 py-3 flex-row items-center justify-between border-b border-border bg-card">
        <Pressable onPress={() => router.back()} className="p-1 active:opacity-70">
          <AppIcon name={isRTL ? "arrowRight" : "arrowLeft"} size={24} color={mutedForeground} />
        </Pressable>
        <View className="flex-1 items-center mx-2">
          <Text
            className="text-base font-bold text-foreground text-center"
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("inspection.detailsTitle")}
          </Text>
          <Text className="text-xs text-muted-foreground">{inspection?.name}</Text>
        </View>
        <InspectionStateBadge
          state={inspection?.state || "submitted"}
          result={inspection?.result}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F46E5" />
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
        className="flex-1"
      >
        {/* Corrective Maintenance Ticket Created Banner */}
        {Boolean(ticketId) && String(ticketId) !== "false" ? (
          <View className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-4 flex-row items-center justify-between">
            <View className="flex-1 me-3 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-destructive/15 items-center justify-center">
                <AppIcon name="warning" size={20} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-sm font-bold text-destructive"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("inspection.ticketCreated")}
                </Text>
                <Text className="text-xs font-medium text-destructive/90 mt-0.5">
                  {t("inspection.ticketId").replace("{{id}}", String(ticketId))}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(worker)/worker/details",
                  params: { id: String(ticketId) },
                } as Href)
              }
              className="px-3.5 py-2 rounded-xl bg-destructive active:opacity-90"
            >
              <Text
                className="text-xs font-bold text-white"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("inspection.viewTicket")}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Asset Header Info */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-4 shadow-sm">
          <Text
            className="text-xs font-semibold text-muted-foreground uppercase"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("assets.detailsTitle")}
          </Text>
          <Text
            className="text-lg font-bold text-foreground mt-0.5 mb-2"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {inspection?.assetName}
          </Text>

          <View className="bg-secondary/40 rounded-xl p-3 flex-col gap-1.5">
            <View className="flex-row justify-between text-xs">
              <Text className="text-xs text-muted-foreground">{t("inspection.date")}:</Text>
              <Text className="text-xs font-semibold text-foreground">
                {inspection?.inspectionDate}
              </Text>
            </View>
            <View className="flex-row justify-between text-xs">
              <Text className="text-xs text-muted-foreground">{t("inspection.resultLabel")}:</Text>
              <Text
                className={`text-xs font-bold ${
                  inspection?.result === "passed"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : inspection?.result === "failed"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {inspection?.result === "passed"
                  ? t("inspection.result.passed")
                  : inspection?.result === "failed"
                  ? t("inspection.result.failed")
                  : t("inspection.result.none")}
              </Text>
            </View>
          </View>
        </View>

        {/* Checklist Section */}
        <View className="mb-4">
          <Text
            className="text-sm font-bold text-foreground mb-3"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            Checklist ({checklistItems.length} items)
          </Text>

          {checklistItems.map((item) => (
            <ChecklistItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              instructions={item.instructions}
              required={item.required}
              result={item.result}
              notes={item.notes}
              readOnly={true}
            />
          ))}
        </View>

        {/* Photos Section */}
        {photosList.length > 0 && (
          <InspectionPhotoPicker
            photos={photosList}
            readOnly={true}
            onAddPhoto={() => {}}
            onRemovePhoto={() => {}}
          />
        )}

        {/* Overall Notes */}
        {inspection?.notes ? (
          <View className="bg-card border border-border rounded-2xl p-4 mb-4">
            <Text
              className="text-sm font-bold text-foreground mb-2"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("inspection.overallNotes")}
            </Text>
            <Text
              className="text-xs text-foreground leading-5 bg-background p-3 rounded-xl border border-border"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {inspection.notes}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
