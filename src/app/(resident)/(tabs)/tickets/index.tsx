import React from "react";
import { View, ScrollView, Pressable, RefreshControl } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useAppInsets } from "@/hooks/use-app-insets";
import { type Href, useNavigation } from "expo-router";
import { router } from "@/lib/navigation";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import { StatusBar } from "expo-status-bar";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { RequestCard } from "@/components/request-card";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useRequestsStore, type RequestStatus } from "@/stores/requests-store";
import { useScrollAnimation } from "@/providers/scroll-animation-provider";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import { getDirectionalRowStyle } from "@/lib/i18n-layout";

export default function ResidentTicketsScreen() {
  const { t, direction } = useI18n();
  const insets = useAppInsets();
  const { resolvedTheme } = useTheme();
  const mutedColor = useThemeToken("--muted-foreground");
  const background = useThemeToken("--background");
  const { requests, fetchResidentRequests, fetchNextResidentRequests, hasNextResidentRequests, loading, error, clearError } = useRequestsStore({ enableResidentRequests: true });
  const isTransitionFinished = useScreenTransition();
  const navigation = useNavigation();
  const { scrollHandler, resetScrollAnimation } = useScrollAnimation();
  const listRef = React.useRef<any>(null);

  const [activeFilter, setActiveFilter] = React.useState<RequestStatus | "all">("all");
  const [refreshing, setRefreshing] = React.useState(false);

  const loadRequests = React.useCallback(async () => {
    clearError();
    await fetchResidentRequests();
  }, [fetchResidentRequests, clearError]);



  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

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



  const filterOptions: { labelKey: string; value: RequestStatus | "all" }[] = [
    { labelKey: "tickets.status.all", value: "all" },
    { labelKey: "tickets.status.pending", value: "pending" },
    { labelKey: "tickets.status.in_progress", value: "in_progress" },
    { labelKey: "tickets.status.completed", value: "completed" },
    { labelKey: "tickets.status.cancelled", value: "cancelled" },
  ];

  const filteredRequests = React.useMemo(() => {
    if (activeFilter === "all") return requests;
    return requests.filter((req) => req.status === activeFilter);
  }, [requests, activeFilter]);

  const handleCreatePress = () => {
    router.push("/home/request-service" as Href);
  };

  const renderFilterItem = (option: typeof filterOptions[0]) => {
    const isSelected = activeFilter === option.value;
    return (
      <Pressable
        key={option.value}
        onPress={() => setActiveFilter(option.value)}
        className={`px-4 py-2 rounded-full me-2 items-center justify-center active:opacity-90 ${
          isSelected ? "bg-primary" : "bg-card"
        }`}
      >
        <AppText
          className={`text-sm font-semibold ${
            isSelected ? "text-primary-foreground font-bold" : "text-muted-foreground"
          }`}
        >
          {t(option.labelKey as any)}
        </AppText>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#4F46E5"
        />
      }
      contentContainerStyle={{ paddingTop: 32, flexGrow: 1 }}
      className="flex-1"
    >
      <View className="items-center justify-center py-16 px-6">
        <View className="w-16 h-16 rounded-full bg-secondary/50 items-center justify-center mb-4">
          <AppIcon name="tickets" size={28} color={mutedColor} />
        </View>
        <AppText align="center" className="text-base text-muted-foreground mb-8 leading-6 text-start">
          {t("tickets.empty")}
        </AppText>
        <Pressable
          onPress={handleCreatePress}
          className="px-6 py-3 bg-primary rounded-xl active:opacity-90 shadow-sm"
        >
          <AppText className="text-sm font-bold text-primary-foreground">
            {t("tickets.createTitle")}
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
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

      {/* Static Header Container */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: background,
        }}
        className="shadow-sm"
      >
        {/* Tab Screen Header */}
        <AppRow className="items-center justify-between px-5 sm:px-8 py-4">
          <View className="flex-col text-start">
            <AppText className="text-2xl font-bold text-foreground text-start">
              {t("tickets.title")}
            </AppText>
            <AppText className="text-xs text-muted-foreground mt-0.5 text-start">
              {t("tickets.description")}
            </AppText>
          </View>

          <Pressable
            onPress={handleCreatePress}
            className="w-10 h-10 rounded-full bg-primary items-center justify-center active:opacity-75 shadow-sm"
          >
            <AppIcon name="add" size={18} colorToken="--primary-foreground" />
          </Pressable>
        </AppRow>

        {/* Horizontal Filter Bar */}
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
            {filterOptions.map(renderFilterItem)}
          </ScrollView>
        </View>
      </View>

      {/* Requests List */}
      <View className="flex-1 w-full max-w-xl self-center px-5">
        {loading && requests.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            {isTransitionFinished && <AppActivityIndicator size="large"  />}
          </View>
        ) : filteredRequests.length === 0 ? (
          renderEmptyState()
        ) : (
          <View className="flex-1">
            {error && (
              <View className="bg-destructive/10 p-3 rounded-xl mb-2 mx-1 mt-2">
                <AppText className="text-sm font-semibold text-destructive text-start">
                  {error}
                </AppText>
              </View>
            )}
            <AnimatedLegendList
              ref={listRef}
              data={filteredRequests}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RequestCard request={item} />}
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
                if (hasNextResidentRequests) {
                  fetchNextResidentRequests();
                }
              }}
              onEndReachedThreshold={0.5}
              contentContainerStyle={{
                paddingTop: 16,
                paddingBottom: insets.bottom + 140,
              }}
              className="flex-1 w-full"
            />
          </View>
        )}
      </View>
    </View>
  );
}
