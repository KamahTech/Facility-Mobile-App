import React from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, View, Text, ScrollView, RefreshControl } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { router } from "@/lib/navigation";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useInspectionDetailQuery } from "@/hooks/use-asset-inspection";

import { ChecklistItemCard } from "@/components/assets/checklist-item-card";
import { InspectionPhotoPicker } from "@/components/assets/inspection-photo-picker";
import { InspectionStateBadge } from "@/components/assets/inspection-state-badge";
import { ScreenHeader } from "@/components/screen-header";
import type { LocalPhotoItem } from "@/stores/asset-inspection-store";

export default function ReadOnlyInspectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const inspectionId = Array.isArray(id) ? id[0] : id || "";

  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const { resolvedTheme } = useTheme();

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

      {/* Reusable Screen Header */}
      <ScreenHeader title={t("inspection.detailsTitle")} onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F46E5" />
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
        className="flex-1"
      >
        {/* Urgent/Failed Banner Action */}
        {ticketId ? (
          <View className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-4 flex-row items-center justify-between">
            <View className="flex-1 me-3">
              <Text
                className="text-xs font-semibold text-destructive uppercase tracking-wider mb-0.5"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("inspection.itemResult.fail")}
              </Text>
              <Text
                className="text-xs text-muted-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                Maintenance request generated
              </Text>
            </View>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(worker)/worker/details",
                  params: { id: ticketId },
                } as any)
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
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1 me-2"
              numberOfLines={1}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {inspection?.name || t("assets.detailsTitle")}
            </Text>
            <InspectionStateBadge
              state={inspection?.state || "submitted"}
              result={inspection?.result}
            />
          </View>
          <Text
            className="text-lg font-bold text-foreground mb-2"
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
