import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { router } from "@/lib/navigation";
import { type Href } from "expo-router";
import { AppIcon } from "@/components/app-icon";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useToastStore } from "@/stores/toast-store";
import {
  useAssetDetailQuery,
  useStartInspectionMutation,
} from "@/hooks/use-asset-inspection";

import { AssetStatusBadge } from "@/components/assets/asset-status-badge";
import { InspectionStateBadge } from "@/components/assets/inspection-state-badge";
import { AssetDocumentCard } from "@/components/assets/asset-document-card";
import { MaintenanceHistoryCard } from "@/components/assets/maintenance-history-card";
import { SparePartCard } from "@/components/assets/spare-part-card";
import type { ChecklistTemplateSummary, CompactInspection } from "@/lib/api/asset-inspection";

import { ScreenHeader } from "@/components/screen-header";

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const assetId = Array.isArray(id) ? id[0] : id || "";

  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const { resolvedTheme } = useTheme();
  const mutedForeground = useThemeToken("--muted-foreground");
  const primaryColor = useThemeToken("--primary");

  const {
    data: asset,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAssetDetailQuery(assetId);

  const startMutation = useStartInspectionMutation();

  const [activeHistoryTab, setActiveHistoryTab] = React.useState<
    "inspections" | "maintenance" | "spare_parts" | "documents" | "templates"
  >("inspections");

  const [showTemplateModal, setShowTemplateModal] = React.useState(false);

  const isAccessDenied =
    isError &&
    (error?.message?.toLowerCase().includes("access") ||
      error?.message?.toLowerCase().includes("denied") ||
      error?.message?.toLowerCase().includes("unassigned"));

  const performStartInspection = async (templateId?: string) => {
    if (!assetId || startMutation.isPending) return;

    try {
      const created = await startMutation.mutateAsync({
        assetId,
        templateId,
      });

      setShowTemplateModal(false);
      useToastStore.getState().showToast(t("inspection.saveSuccess"), "success");

      router.push({
        pathname: "/(worker)/assets/inspection",
        params: { id: created.id },
      } as any);
    } catch {
      // Error handled by apiRequest / query toast
    }
  };

  const handleStartInspection = (templateId?: string) => {
    if (!assetId || startMutation.isPending) return;

    Alert.alert(
      t("assets.confirmStartTitle" as any),
      t("assets.confirmStartMessage" as any),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("assets.startInspection" as any),
          style: "default",
          onPress: () => performStartInspection(templateId),
        },
      ]
    );
  };

  const handleStartPress = () => {
    if (!asset || startMutation.isPending) return;

    const templates = asset.checklistTemplates || [];
    if (templates.length === 0) {
      handleStartInspection();
    } else if (templates.length === 1) {
      handleStartInspection(templates[0].id);
    } else {
      setShowTemplateModal(true);
    }
  };

  const templates = asset?.checklistTemplates || [];
  const inspections = asset?.inspectionHistory || [];
  const maintenance = asset?.maintenanceHistory || [];
  const spareParts = asset?.sparePartsHistory || [];
  const documents = asset?.documents || [];

  const renderHistoryContent = () => {
    switch (activeHistoryTab) {
      case "inspections":
        if (inspections.length === 0) {
          return (
            <Text
              className="text-xs text-muted-foreground py-6 text-center"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("assets.noInspections")}
            </Text>
          );
        }
        return inspections.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              router.push({
                pathname:
                  item.state === "draft" || item.state === "in_progress"
                    ? "/(worker)/assets/inspection"
                    : "/(worker)/assets/inspection-detail",
                params: { id: item.id },
              } as any)
            }
            className="bg-card border border-border rounded-2xl p-4 mb-3 active:opacity-90 shadow-sm"
          >
            {/* Top Row: Name & Badge */}
            <View className="flex-row items-center justify-between mb-1.5">
              <Text
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1 me-2"
                numberOfLines={1}
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {item.name}
              </Text>
              <InspectionStateBadge state={item.state} result={item.result} />
            </View>

            {/* Main Asset Title */}
            <Text
              className="text-base font-bold text-foreground mb-2"
              numberOfLines={1}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {item.assetName || asset?.name || ""}
            </Text>

            {/* Footer Row: Date & Arrow */}
            <View className="flex-row items-center justify-between pt-1">
              <View className="flex-row items-center gap-1.5">
                <AppIcon name="history" size={14} color={mutedForeground} />
                <Text
                  className="text-xs text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {item.inspectionDate ? String(item.inspectionDate).split(" ")[0] : "--"}
                </Text>
              </View>

              <AppIcon
                name={isRTL ? "chevronLeft" : "chevronRight"}
                size={16}
                color={mutedForeground}
              />
            </View>
          </Pressable>
        ));

      case "maintenance":
        if (maintenance.length === 0) {
          return (
            <Text
              className="text-xs text-muted-foreground py-6 text-center"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("tickets.empty")}
            </Text>
          );
        }
        return maintenance.map((item) => (
          <MaintenanceHistoryCard key={item.id} item={item} />
        ));

      case "spare_parts":
        if (spareParts.length === 0) {
          return (
            <Text
              className="text-xs text-muted-foreground py-6 text-center"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("worker.noTasks")}
            </Text>
          );
        }
        return spareParts.map((item) => (
          <SparePartCard key={item.id} item={item} />
        ));

      case "documents":
        if (documents.length === 0) {
          return (
            <Text
              className="text-xs text-muted-foreground py-6 text-center"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("tickets.noDocuments")}
            </Text>
          );
        }
        return documents.map((item) => (
          <AssetDocumentCard key={item.id} document={item} assetId={assetId} />
        ));

      case "templates":
        if (templates.length === 0) {
          return (
            <Text
              className="text-xs text-muted-foreground py-6 text-center"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("assets.noTemplates")}
            </Text>
          );
        }
        return templates.map((tpl) => (
          <Pressable
            key={tpl.id}
            onPress={() => handleStartInspection(tpl.id)}
            disabled={startMutation.isPending}
            className="bg-card border border-border rounded-2xl p-4 mb-3 flex-row items-center justify-between active:opacity-90 shadow-sm"
          >
            <View className="flex-1 me-3">
              <Text
                className="text-base font-bold text-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {tpl.name}
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {tpl.itemCount} checklist items
              </Text>
            </View>
            <AppIcon name="add" size={20} color={primaryColor} />
          </Pressable>
        ));

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <AppActivityIndicator size="large" />
      </View>
    );
  }

  if (isAccessDenied || !asset) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6">
        <View className="w-16 h-16 rounded-full bg-destructive/10 items-center justify-center mb-4">
          <AppIcon name="warning" size={32} color="#EF4444" />
        </View>
        <Text
          className="text-lg font-bold text-foreground text-center mb-2"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("assets.accessDeniedTitle")}
        </Text>
        <Text
          className="text-sm text-muted-foreground text-center leading-6 mb-6"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("assets.accessDeniedMessage")}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="px-6 py-3 rounded-xl bg-primary active:opacity-90"
        >
          <Text
            className="text-sm font-bold text-primary-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("actions.back")}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />

      {/* Top Header Navigation */}
      <ScreenHeader title={t("assets.detailsTitle")} onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F46E5" />
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
        className="flex-1"
      >
        {/* Main Card */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-semibold text-muted-foreground uppercase">
              {asset.code}
            </Text>
            <AssetStatusBadge status={asset.status} />
          </View>

          <Text
            className="text-xl font-bold text-foreground mb-1"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {asset.name}
          </Text>

          {asset.location ? (
            <Text
              className="text-xs text-muted-foreground mb-3"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {asset.location}
            </Text>
          ) : null}

          {/* Details List */}
          <View className="pt-1 flex-col gap-2.5">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-xs text-muted-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("assets.type")}
              </Text>
              <Text
                className="text-xs font-semibold text-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {asset.typeName || "--"}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text
                className="text-xs text-muted-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("assets.manufacturer")}
              </Text>
              <Text
                className="text-xs font-semibold text-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {asset.manufacturer || "--"}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text
                className="text-xs text-muted-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("assets.model")}
              </Text>
              <Text
                className="text-xs font-semibold text-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {asset.model || "--"}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text
                className="text-xs text-muted-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("assets.serialNumber")}
              </Text>
              <Text
                className="text-xs font-semibold text-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {asset.serialNumber || "--"}
              </Text>
            </View>
            {asset.failureRate ? (
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-xs text-muted-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("assets.failureRate")}
                </Text>
                <Text
                  className="text-xs font-bold text-destructive"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {asset.failureRate}%
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Start Inspection Action Banner */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-4 flex-row items-center justify-between shadow-sm">
          <View className="flex-1 me-3">
            <Text
              className="text-sm font-bold text-foreground mb-0.5"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("assets.startInspection")}
            </Text>
            <Text
              className="text-xs text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {templates.length > 0
                ? `${templates.length} template(s) available`
                : t("assets.noTemplates")}
            </Text>
          </View>

          <Pressable
            onPress={handleStartPress}
            disabled={startMutation.isPending}
            className={`px-4 py-3 rounded-xl bg-primary flex-row items-center gap-2 ${
              startMutation.isPending ? "opacity-60" : "active:opacity-90"
            }`}
          >
            {startMutation.isPending ? (
              <AppActivityIndicator size="small" />
            ) : (
              <>
                <AppIcon name="add" size={18} colorToken="--primary-foreground" />
                <Text
                  className="text-sm font-bold text-primary-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("assets.startInspection")}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* History Segmented Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3 -mx-5"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {(
            [
              { key: "inspections", labelKey: "assets.history.inspections", count: inspections.length },
              { key: "maintenance", labelKey: "assets.history.maintenance", count: maintenance.length },
              { key: "spare_parts", labelKey: "assets.history.spareParts", count: spareParts.length },
              { key: "documents", labelKey: "assets.history.documents", count: documents.length },
              { key: "templates", labelKey: "assets.history.templates", count: templates.length },
            ] as const
          ).map((tab) => {
            const isSelected = activeHistoryTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveHistoryTab(tab.key)}
                className={`px-4 py-2.5 rounded-full border flex-row items-center gap-2 ${
                  isSelected ? "bg-primary border-primary" : "bg-card border-border"
                }`}
              >
                <Text
                  className={`text-xs ${
                    isSelected ? "text-primary-foreground font-bold" : "text-muted-foreground font-semibold"
                  }`}
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t(tab.labelKey as any)}
                </Text>
                <View
                  className={isSelected ? "bg-primary-foreground" : "bg-primary/10"}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      isSelected ? "text-primary" : "text-primary"
                    }`}
                  >
                    {tab.count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* History Content */}
        <View className="mb-6">{renderHistoryContent()}</View>
      </ScrollView>

      {/* Template Selection Modal (if multiple templates exist) */}
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-5">
          <View className="bg-card rounded-3xl p-6 w-full max-w-md border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-base font-bold text-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("assets.selectTemplate")}
              </Text>
              <Pressable onPress={() => setShowTemplateModal(false)}>
                <AppIcon name="close" size={20} color={mutedForeground} />
              </Pressable>
            </View>

            {templates.map((tpl) => (
              <Pressable
                key={tpl.id}
                onPress={() => handleStartInspection(tpl.id)}
                className="bg-secondary border border-border rounded-2xl p-4 mb-2 flex-row items-center justify-between active:opacity-80"
              >
                <View className="flex-1 me-2">
                  <Text
                    className="text-sm font-bold text-foreground"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {tpl.name}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {tpl.itemCount} items
                  </Text>
                </View>
                <AppIcon name={isRTL ? "chevronLeft" : "chevronRight"} size={18} color={primaryColor} />
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
