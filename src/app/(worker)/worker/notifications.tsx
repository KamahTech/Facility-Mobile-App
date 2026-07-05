import React from "react";
import { Pressable, View, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LegendList } from "@legendapp/list/react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { ScreenHeader } from "@/components/screen-header";
import { useI18n } from "@/hooks/use-i18n";
import { useCommunityStore, type NotificationItem } from "@/stores/community-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function WorkerNotificationsScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { notifications, fetchNotifications, loading, error, clearError } = useCommunityStore({ enableNotifications: true });
  const isTransitionFinished = useScreenTransition();
  const [refreshing, setRefreshing] = React.useState(false);

  const loadNotifications = React.useCallback(async () => {
    clearError();
    await fetchNotifications();
  }, [fetchNotifications, clearError]);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleNotificationPress = React.useCallback((item: NotificationItem) => {
    Alert.alert(item.title, item.description);
  }, []);

  const renderItem = React.useCallback(({ item }: { item: NotificationItem }) => {
    let badgeBg = "";
    let iconName: "worker" | "requestService" | "notification" | "linkUnit" = "notification";
    let iconColor = "";

    switch (item.type) {
      case "task_assigned":
        badgeBg = "bg-amber-50 dark:bg-amber-950/40";
        iconName = "worker";
        iconColor = "#D97706";
        break;
      case "inspection":
        badgeBg = "bg-emerald-50 dark:bg-emerald-950/40";
        iconName = "linkUnit";
        iconColor = "#059669";
        break;
      case "announcement":
        badgeBg = "bg-blue-50 dark:bg-blue-950/40";
        iconName = "notification";
        iconColor = "#2563EB";
        break;
      case "general":
      default:
        badgeBg = "bg-purple-50 dark:bg-purple-950/40";
        iconName = "notification";
        iconColor = "#7C3AED";
        break;
    }

    return (
      <Pressable
        onPress={() => handleNotificationPress(item)}
        className="w-full p-4 rounded-2xl bg-card border border-border mb-3 active:opacity-75"
      >
        <AppRow className="gap-4 items-center justify-between">
          <View className={`size-10 rounded-xl items-center justify-center ${badgeBg}`}>
            <AppIcon name={iconName} size={20} color={iconColor} />
          </View>

          <View className="flex-1 min-w-0 flex-col gap-1">
            <AppText
              numberOfLines={1}
              className={`text-sm text-start ${item.unread ? "font-bold text-foreground" : "font-semibold text-foreground opacity-80"}`}
            >
              {item.title}
            </AppText>
            <AppText
              numberOfLines={2}
              className="text-start text-xs text-muted-foreground leading-4"
            >
              {item.description}
            </AppText>
            <AppText className="text-start text-[10px] text-muted-foreground mt-0.5">
              {item.time}
            </AppText>
          </View>

          {item.unread && (
            <View className="size-2.5 rounded-full bg-primary" />
          )}
        </AppRow>
      </Pressable>
    );
  }, [handleNotificationPress]);

  const renderEmpty = () => {
    return (
      <View className="flex-1 py-16 items-center justify-center">
        <AppText className="text-muted-foreground text-sm font-semibold">
          {t("notifications.empty" as any) || "No notifications yet"}
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
      <ScreenHeader title={t("notifications.title")} onBack={handleBack} />

      <View className="flex-1 w-full max-w-xl self-center">
        {loading && notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            {isTransitionFinished && <ActivityIndicator size="large" color="#4F46E5" />}
          </View>
        ) : (
          <View className="flex-1">
            {error && (
              <View className="bg-destructive/10 p-3 rounded-xl border border-destructive/25 mx-5 mb-4 mt-2">
                <AppText className="text-sm font-semibold text-destructive text-start">
                  {error}
                </AppText>
              </View>
            )}

            <LegendList
              data={notifications}
              recycleItems={true}
              estimatedItemSize={92}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
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
              className="flex-1 w-full max-w-xl self-center"
            />
          </View>
        )}
      </View>
    </View>
  );
}
