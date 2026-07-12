import React from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, View, ScrollView, RefreshControl } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useAppInsets } from "@/hooks/use-app-insets";
import { type Href, useNavigation } from "expo-router";
import { router } from "@/lib/navigation";
import { LegendList } from "@legendapp/list/react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useScrollAnimation } from "@/providers/scroll-animation-provider";
import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
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
import { HomeHeader } from "@/components/home-header";
import { getProfileImageSource } from "@/lib/image-source";

const AnimatedLegendList = Animated.createAnimatedComponent(LegendList);

export default function WorkerHomeScreen() {
  const { t, direction } = useI18n();
  const insets = useAppInsets();
  const { resolvedTheme } = useTheme();
  const isTransitionFinished = useScreenTransition();
  const mutedColor = useThemeToken("--muted-foreground");

  const { requests, fetchWorkerTasks, fetchNextWorkerTasks, hasNextWorkerTasks, loading, error, clearError } = useRequestsStore({ enableWorkerTasks: true });
  const { profile, logout } = useUserStore();
  const logoutSheet = useBottomSheetPresentation({ dismissKeyboard: false });
  const avatarSource = React.useMemo(
    () => getProfileImageSource(profile?.profileImageUrl, undefined),
    [profile?.profileImageUrl],
  );
  const background = useThemeToken("--background");
  const { headerTranslateY, scrollHandler, resetScrollAnimation } = useScrollAnimation();
  const navigation = useNavigation();
  const listRef = React.useRef<any>(null);

  const scrollToTop = React.useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    resetScrollAnimation();
  }, [resetScrollAnimation]);

  React.useEffect(() => {
    const unsubscribeTabPress = (navigation as any).addListener("tabPress", () => {
      if (navigation.isFocused()) {
        scrollToTop();
      }
    });
    return unsubscribeTabPress;
  }, [navigation, scrollToTop]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      resetScrollAnimation();
    });
    return unsubscribe;
  }, [navigation, resetScrollAnimation]);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: headerTranslateY.value }],
    };
  });

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
          (req) => !req.workerName && req.status !== "completed" && req.status !== "cancelled"
        );
      case "completed":
        return requests.filter(
          (req) => req.workerName === workerName && (req.status === "completed" || req.workerPhase === "completed")
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
        className={`px-4 py-2.5 rounded-full me-2 items-center justify-center ${
          isSelected ? "bg-primary" : "bg-card"
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

  const renderEmptyOrLoading = () => {
    if (loading && requests.length === 0) {
      return (
        <View className="items-center justify-center py-16">
          {isTransitionFinished && <AppActivityIndicator size="large" />}
        </View>
      );
    }
    return (
      <View className="items-center justify-center py-16 px-6">
        <View className="w-16 h-16 rounded-full bg-secondary/50 items-center justify-center mb-4">
          <AppIcon name="worker" size={28} color={mutedColor} />
        </View>
        <AppText align="center" className="text-base text-muted-foreground leading-6">
          {t("worker.noTasks")}
        </AppText>
      </View>
    );
  };

  const renderListHeader = () => (
    <View className="w-full flex-col">
      {/* Welcome Block */}
      <View className="pt-5 pb-3 w-full text-start flex-col gap-1.5">
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
            paddingVertical: 12,
            ...getDirectionalRowStyle(direction),
          }}
          className="w-full"
        >
          {tabs.map(renderTabItem)}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />

      {/* Status Bar Cover view */}
      <View
        style={{
          height: insets.top,
          backgroundColor: background,
          position: "absolute",
          top: 0,
          start: 0,
          end: 0,
          zIndex: 100,
        }}
      />

      <View className="flex-1 w-full max-w-xl self-center px-5">
        {error && (
          <View className="bg-destructive/10 p-3 rounded-xl mb-4 mt-4">
            <AppText className="text-sm font-semibold text-destructive text-start">
              {error}
            </AppText>
          </View>
        )}
        <AnimatedLegendList
          ref={listRef}
          data={filteredTasks}
          keyExtractor={(item: any) => item.id}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyOrLoading}
          renderItem={({ item }: { item: any }) => <WorkerTaskCard task={item} />}
          estimatedItemSize={140}
          recycleItems={true}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
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
            paddingTop: insets.top + 76,
            paddingBottom: insets.bottom + 40,
          }}
          className="flex-1 w-full"
        />
      </View>

      {/* Absolute Collapsible Header Container */}
      <Animated.View
        style={[
          headerAnimatedStyle,
          {
            position: "absolute",
            top: 0,
            start: 0,
            end: 0,
            paddingTop: insets.top + 12,
            paddingBottom: 12,
            backgroundColor: background,
            zIndex: 10,
          }
        ]}
        className="px-5 sm:px-8"
      >
        <HomeHeader
          avatarSource={avatarSource}
          onNotificationPress={() => router.push("/worker/notifications" as Href)}
          onAvatarPress={logoutSheet.present}
          onLogoPress={scrollToTop}
        />
      </Animated.View>

      {/* Logout bottom sheet */}
      <LogoutBottomSheet
        isPresented={logoutSheet.isPresented}
        onDismiss={logoutSheet.dismiss}
        onConfirm={handleLogout}
        userName={workerName}
        userRole={t("auth.workerTitle")}
        hostName="worker-root"
      />
    </View>
  );
}
