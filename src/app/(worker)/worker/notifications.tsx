import React from "react";
import { Pressable, View, Alert, RefreshControl, Text } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { Stack, router } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";
import { LegendList } from "@legendapp/list/react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { ScreenHeader } from "@/components/screen-header";
import { useI18n } from "@/hooks/use-i18n";
import { useCommunityStore, type NotificationItem } from "@/stores/community-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function WorkerNotificationsScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const {
    notifications,
    fetchNotifications,
    fetchNextNotifications,
    hasNextNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    loading,
    error,
    clearError,
  } = useCommunityStore({ enableNotifications: true });
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

  const handleNotificationPress = React.useCallback(
    async (item: NotificationItem) => {
      Alert.alert(item.title, item.description);
      if (item.unread) {
        try {
          await markNotificationRead(item.id);
        } catch (err) {
          console.error("Failed to mark notification as read", err);
        }
      }
    },
    [markNotificationRead]
  );

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
        className="w-full p-4 rounded-2xl bg-card mb-3 active:opacity-75"
      >
        <AppRow className="gap-4 items-center justify-between">
          <View className={`size-10 rounded-xl items-center justify-center ${badgeBg}`}>
            <AppIcon name={iconName} size={20} color={iconColor} />
          </View>

          <View className="flex-1 min-w-0 flex-col gap-1">
            <Text
              numberOfLines={1}
              className={`text-sm ${item.unread ? "font-bold text-foreground" : "font-semibold text-foreground opacity-80"}`}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {item.title}
            </Text>
            <Text
              numberOfLines={2}
              className="text-xs text-muted-foreground leading-4"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {item.description}
            </Text>
            <Text
              className="text-[10px] text-muted-foreground mt-0.5"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {item.time}
            </Text>
          </View>

          {item.unread && (
            <View className="size-2.5 rounded-full bg-primary" />
          )}
        </AppRow>
      </Pressable>
    );
  }, [handleNotificationPress, isRTL]);

  const renderEmpty = () => {
    return (
      <View className="flex-1 py-16 items-center justify-center">
        <Text
          className="text-muted-foreground text-sm font-semibold text-center"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("notifications.empty" as any) || "No notifications yet"}
        </Text>
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
      <ScreenHeader
        title={t("notifications.title")}
        onBack={handleBack}
        rightAction={
          notifications.some((n) => n.unread) ? (
            <Pressable
              accessibilityLabel={t("notifications.markAllRead")}
              accessibilityRole="button"
              onPress={async () => {
                try {
                  await markAllNotificationsRead();
                } catch (err) {
                  Alert.alert(t("common.error"), err instanceof Error ? err.message : String(err));
                }
              }}
              className="w-10 h-10 rounded-full bg-secondary justify-center items-center active:opacity-75"
            >
              <AppIcon name="check" size={20} colorToken="--primary" />
            </Pressable>
          ) : undefined
        }
      />

      <View className="flex-1 w-full max-w-xl self-center">
        {loading && notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            {isTransitionFinished && <AppActivityIndicator size="large"  />}
          </View>
        ) : (
          <View className="flex-1">
            {error && (
              <View className="bg-destructive/10 p-3 rounded-xl mx-5 mb-4 mt-2">
                <Text
                  className="text-sm font-semibold text-destructive"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {error}
                </Text>
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
              onEndReached={() => {
                if (hasNextNotifications) {
                  fetchNextNotifications();
                }
              }}
              onEndReachedThreshold={0.5}
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
