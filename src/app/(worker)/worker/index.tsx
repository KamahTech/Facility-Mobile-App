import React from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, View, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { LegendList } from "@legendapp/list/react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { Avatar } from "@/components/avatar";
import { WorkerTaskCard } from "@/components/worker-task-card";
import { LogoutBottomSheet } from "@/components/logout-bottom-sheet";
import { useBottomSheetPresentation } from "@/hooks/use-bottom-sheet-presentation";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useRequestsStore } from "@/stores/requests-store";
import { useUserStore } from "@/stores/user-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import { getDirectionalRowStyle } from "@/lib/i18n-layout";

export default function WorkerHomeScreen() {
  const { t, direction } = useI18n();
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useTheme();
  const isTransitionFinished = useScreenTransition();
  const mutedColor = useThemeToken("--muted-foreground");

  const { requests, fetchWorkerTasks, fetchNextWorkerTasks, hasNextWorkerTasks, loading, error, clearError } = useRequestsStore({ enableWorkerTasks: true });
  const { profile, logout } = useUserStore();
  const logoutSheet = useBottomSheetPresentation({ dismissKeyboard: false });

  const [activeTab, setActiveTab] = React.useState<"my_tasks" | "available" | "completed">("my_tasks");
  const [refreshing, setRefreshing] = React.useState(false);

  const workerName = profile?.name || "Worker";

  const loadTasks = React.useCallback(async () => {
    clearError();
    await fetchWorkerTasks();
  }, [fetchWorkerTasks, clearError]);



  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  // Filter tasks based on activeTab selection
  const filteredTasks = React.useMemo(() => {
    // API returns workerName as string or false (from Odoo empty representation)
    switch (activeTab) {
      case "my_tasks":
        return requests.filter(
          (req) => req.workerName === workerName && req.status === "in_progress"
        );
      case "available":
        return requests.filter(
          (req) => req.status === "pending" && !req.workerName
        );
      case "completed":
        return requests.filter(
          (req) => req.workerName === workerName && req.status === "completed"
        );
      default:
        return [];
    }
  }, [requests, activeTab, workerName]);

  // Compute number of active tasks assigned to the worker
  const activeTasksCount = React.useMemo(() => {
    return requests.filter(
      (req) => req.workerName === workerName && req.status === "in_progress"
    ).length;
  }, [requests, workerName]);

  const tabs: { labelKey: string; value: typeof activeTab }[] = [
    { labelKey: "worker.tab.assigned", value: "my_tasks" },
    { labelKey: "worker.tab.available", value: "available" },
    { labelKey: "worker.tab.completed", value: "completed" },
  ];

  const handleLogout = async () => {
    logoutSheet.dismiss();
    try {
      await logout();
      router.replace("/choose-login-method" as Href);
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const renderTabItem = (tab: typeof tabs[0]) => {
    const isSelected = activeTab === tab.value;
    return (
      <Pressable
        key={tab.value}
        onPress={() => setActiveTab(tab.value)}
        className={`px-4 py-2.5 rounded-full border me-2 items-center justify-center ${
          isSelected
            ? "bg-primary border-primary"
            : "bg-card border-border"
        }`}
      >
        <AppText
          className={`text-sm font-semibold ${
            isSelected ? "text-primary-foreground font-bold" : "text-muted-foreground"
          }`}
        >
          {t(tab.labelKey as any)}
        </AppText>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
      }
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      className="flex-1 w-full"
    >
      <View className="items-center justify-center py-16 px-6">
        <View className="w-16 h-16 rounded-full bg-secondary/50 items-center justify-center mb-4">
          <AppIcon name="worker" size={28} color={mutedColor} />
        </View>
        <AppText align="center" className="text-base text-muted-foreground leading-6">
          {t("worker.noTasks")}
        </AppText>
      </View>
    </ScrollView>
  );

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />

      {/* Top Header Row */}
      <AppRow className="items-center justify-between px-5 sm:px-8 py-4 border-b border-border/40">
        <Pressable onPress={logoutSheet.present}>
          <Avatar size={40} />
        </Pressable>

        <AppText className="text-lg font-bold text-foreground">
          {t("worker.title")}
        </AppText>

        <Pressable
          onPress={() => router.push("/worker/notifications" as Href)}
          className="w-10 h-10 rounded-full bg-secondary items-center justify-center active:opacity-75"
          accessibilityLabel={t("notifications.title")}
        >
          <AppIcon name="notification" size={20} color={mutedColor} />
        </Pressable>
      </AppRow>

      {/* Welcome Block */}
      <View className="px-5 sm:px-8 pt-5 pb-3 w-full max-w-xl self-center text-start flex-col gap-1.5">
        <AppText className="text-start text-2xl font-bold text-foreground">
          {t("worker.welcome").replace("Michael!", workerName)}
        </AppText>
        <AppText className="text-start text-sm text-muted-foreground">
          {t("worker.assignedTasks").replace("{{count}}", String(activeTasksCount))}
        </AppText>
      </View>

      {/* Tab Selectors */}
      <View className="w-full">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 12,
            ...getDirectionalRowStyle(direction),
          }}
          className="w-full max-w-xl self-center"
        >
          {tabs.map(renderTabItem)}
        </ScrollView>
      </View>

      {/* Tasks List */}
      <View className="flex-1 w-full max-w-xl self-center px-5">
        {loading && requests.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            {isTransitionFinished && <ActivityIndicator size="large" color="#4F46E5" />}
          </View>
        ) : filteredTasks.length === 0 ? (
          renderEmptyState()
        ) : (
          <View className="flex-1">
            {error && (
              <View className="bg-destructive/10 p-3 rounded-xl border border-destructive/25 mb-4">
                <AppText className="text-sm font-semibold text-destructive text-start">
                  {error}
                </AppText>
              </View>
            )}
            <LegendList
              data={filteredTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <WorkerTaskCard task={item} />}
              estimatedItemSize={140}
              recycleItems={true}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#4F46E5"
                />
              }
              onEndReached={() => {
                if (hasNextWorkerTasks) {
                  fetchNextWorkerTasks();
                }
              }}
              onEndReachedThreshold={0.5}
              contentContainerStyle={{
                paddingBottom: insets.bottom + 40,
              }}
              className="flex-1 w-full"
            />
          </View>
        )}
      </View>

      {/* Logout bottom sheet */}
      <LogoutBottomSheet
        isPresented={logoutSheet.isPresented}
        onDismiss={logoutSheet.dismiss}
        onConfirm={handleLogout}
        userName={workerName}
        userRole={t("auth.workerTitle")}
      />
    </View>
  );
}
