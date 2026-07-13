import React from "react";
import { Pressable, View, ScrollView, Alert, Text } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useLocalSearchParams, Stack, type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { AppChevron } from "@/components/app-chevron";
import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useRequestsStore, type RequestStatus } from "@/stores/requests-store";
import { useUnitStore } from "@/stores/unit-store";

export default function ResidentTicketDetailsScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const params = useLocalSearchParams();
  const requestId = params.id as string;

  const { requests, cancelRequest } = useRequestsStore({ enableResidentRequests: true });
  const { units } = useUnitStore();
  const [actionLoading, setActionLoading] = React.useState(false);

  const request = requests.find((r) => r.id === requestId);
  const unit = request ? units.find((u) => u.id === request.unitId) : undefined;
  const unitLabel = unit ? `${unit.buildingNumber} - ${unit.unitNumber}` : "";

  const handleCancelPress = () => {
    if (!request) return;
    Alert.alert(
      t("tickets.cancelBtn"),
      t("tickets.cancelConfirm"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("actions.confirm"),
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelRequest(request.id);
            } catch (e: unknown) {
              Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.requestCancelFailed"));
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const mutedToken = useThemeToken("--muted-foreground");
  const primaryColor = useThemeToken("--primary");

  const getCategoryConfig = () => {
    if (!request) return { icon: "otherService" as const, bgClass: "bg-gray-50", iconColor: "#6B7280" };
    switch (request.category) {
      case "plumbing":
        return {
          icon: "plumbing" as const,
          bgClass: "bg-blue-50 dark:bg-blue-950/20",
          iconColor: "#3B82F6",
        };
      case "electrical":
        return {
          icon: "electrical" as const,
          bgClass: "bg-amber-50 dark:bg-amber-950/20",
          iconColor: "#D97706",
        };
      case "hvac":
        return {
          icon: "hvac" as const,
          bgClass: "bg-cyan-50 dark:bg-cyan-950/20",
          iconColor: "#06B6D4",
        };
      case "cleaning":
        return {
          icon: "cleaning" as const,
          bgClass: "bg-purple-50 dark:bg-purple-950/20",
          iconColor: "#A855F7",
        };
      case "security":
        return {
          icon: "security" as const,
          bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
          iconColor: "#10B981",
        };
      case "carpentry":
        return {
          icon: "carpentry" as const,
          bgClass: "bg-orange-50 dark:bg-orange-950/20",
          iconColor: "#F97316",
        };
      default:
        return {
          icon: "otherService" as const,
          bgClass: "bg-gray-50 dark:bg-gray-950/20",
          iconColor: "#6B7280",
        };
    }
  };

  const getStatusConfig = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return {
          bgClass: "bg-amber-50 dark:bg-amber-950/30",
          textClass: "text-amber-600 dark:text-amber-400",
        };
      case "in_progress":
        return {
          bgClass: "bg-blue-50 dark:bg-blue-950/30",
          textClass: "text-blue-600 dark:text-blue-400",
        };
      case "completed":
        return {
          bgClass: "bg-green-50 dark:bg-green-950/30",
          textClass: "text-green-600 dark:text-green-400",
        };
      case "cancelled":
        return {
          bgClass: "bg-rose-50 dark:bg-rose-950/30",
          textClass: "text-rose-600 dark:text-rose-400",
        };
    }
  };

  if (!request) {
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
        <ScreenHeader title={t("tickets.detailsTitle")} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-base text-muted-foreground" style={{ writingDirection: isRTL ? "rtl" : "ltr" }}>
            {t("tickets.notFound")}
          </Text>
        </View>
      </View>
    );
  }

  const categoryConfig = getCategoryConfig();
  const statusConfig = getStatusConfig(request.status);

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
      <ScreenHeader title={t("tickets.detailsTitle")} onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 110,
          paddingHorizontal: 20,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        {/* Category Header Card */}
        <View className="w-full bg-card rounded-2xl p-5 flex-col gap-4 shadow-sm mb-6">
          <AppRow className="items-center justify-between gap-3">
            <AppRow className="items-center gap-3.5 flex-1 min-w-0">
              <View className={`w-12 h-12 rounded-xl items-center justify-center ${categoryConfig.bgClass}`}>
                <AppIcon name={categoryConfig.icon} size={24} color={categoryConfig.iconColor} />
              </View>
              <View className="flex-1 min-w-0">
                <Text
                  className="text-lg font-bold text-foreground text-start"
                  numberOfLines={1}
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t(`services.${request.category}` as any)}
                </Text>
                <Text
                  className="text-xs text-muted-foreground mt-0.5 text-start"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  #{request.id.toUpperCase()}
                </Text>
              </View>
            </AppRow>

            {/* Status Badge */}
            <View className={`px-3 py-1 rounded-full shrink-0 ${statusConfig.bgClass}`}>
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${statusConfig.textClass}`}
                numberOfLines={1}
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t(`tickets.status.${request.status}` as any)}
              </Text>
            </View>
          </AppRow>

          <View className="pt-4 flex-col gap-3">
            {/* Unit Info */}
            <AppRow className="justify-between items-center">
              <AppText className="text-sm font-semibold text-muted-foreground text-start">
                {t("tickets.selectUnit")}
              </AppText>
              <AppText className="text-sm font-bold text-foreground text-end">
                {unitLabel}
              </AppText>
            </AppRow>

            {/* Date Requested */}
            <AppRow className="justify-between items-center">
              <AppText className="text-sm font-semibold text-muted-foreground text-start">
                {t("tickets.date")}
              </AppText>
              <AppText className="text-sm text-foreground text-end">
                {request.createdAt}
              </AppText>
            </AppRow>
          </View>
        </View>

        {/* Issue Details Section */}
        <View className="w-full bg-card rounded-2xl p-5 shadow-sm mb-6 flex-col gap-3">
          <AppText className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-start">
            {t("tickets.enterDetails")}
          </AppText>
          <AppText className="text-base text-foreground leading-6 text-start">
            {request.description}
          </AppText>
        </View>

        {/* Worker Section */}
        {request.workerName && (
          <View className="w-full bg-card rounded-2xl p-4 shadow-sm mb-6 flex-col gap-3">
            <AppText className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-start">
              {t("tickets.assignedWorker")}
            </AppText>
            <AppRow className="items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-secondary items-center justify-center">
                <AppIcon name="profile" size={20} color={mutedToken} />
              </View>
              <View className="flex-1 text-start">
                <AppText className="text-base font-semibold text-foreground text-start">
                  {request.workerName}
                </AppText>
                <AppText className="text-xs text-muted-foreground text-start">
                  {t("auth.workerTitle")}
                </AppText>
              </View>
            </AppRow>
          </View>
        )}

        {/* Cancel Request Button */}
        {request.status !== "completed" && request.status !== "cancelled" && (
          <Pressable
            onPress={handleCancelPress}
            disabled={actionLoading}
            className="w-full bg-rose-50 dark:bg-rose-950/20 py-4 rounded-2xl justify-center items-center mt-6 active:opacity-90"
          >
            {actionLoading ? (
              <AppActivityIndicator color="#EF4444" />
            ) : (
              <AppText className="text-rose-600 dark:text-rose-400 font-bold text-base">
                {t("tickets.cancelBtn")}
              </AppText>
            )}
          </Pressable>
        )}
      </ScrollView>

      {/* Sticky Bottom Button Container */}
      <View
        className="w-full bg-card"
        style={{ paddingBottom: Math.max(insets.bottom, 16), paddingTop: 12 }}
      >
        <View className="w-full max-w-xl self-center px-5">
          <Pressable
            onPress={() => {
              router.push({
                pathname: "/tickets/messages",
                params: { id: request.id },
              } as Href);
            }}
            className="w-full min-h-14 rounded-xl bg-background px-5 py-4 active:opacity-80"
          >
            <AppRow className="items-center justify-between">
              <AppRow className="items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                  <AppIcon name="tickets" size={16} color={primaryColor} />
                </View>
                <AppText className="text-base font-bold text-foreground">
                  {t("tickets.comments")}
                </AppText>
              </AppRow>

              <AppRow className="items-center gap-2">
                {request.comments.length > 0 && (
                  <View className="bg-primary px-2.5 py-0.5 rounded-full">
                    <AppText className="text-xs font-bold text-primary-foreground">
                      {request.comments.length}
                    </AppText>
                  </View>
                )}
                <AppChevron size={14} color={mutedToken} />
              </AppRow>
            </AppRow>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
