import React from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, View, ScrollView, RefreshControl, Text, TextInput } from "react-native";
import { type Href, useNavigation } from "expo-router";
import { router } from "@/lib/navigation";
import { AnimatedLegendList } from "@legendapp/list/reanimated";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useScrollAnimation } from "@/providers/scroll-animation-provider";
import { AppIcon } from "@/components/app-icon";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useUserStore } from "@/stores/user-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import { getDirectionalRowStyle } from "@/lib/i18n-layout";
import { HomeHeader } from "@/components/home-header";
import { getProfileImageSource } from "@/lib/image-source";
import { LogoutBottomSheet } from "@/components/logout-bottom-sheet";
import { useBottomSheetPresentation } from "@/hooks/use-bottom-sheet-presentation";
import { useToastStore } from "@/stores/toast-store";

import {
  useWorkerAssetsInfiniteQuery,
  useWorkerInspectionsInfiniteQuery,
} from "@/hooks/use-asset-inspection";

import { AssetCard } from "@/components/assets/asset-card";
import { InspectionStateBadge } from "@/components/assets/inspection-state-badge";
import { QrScannerModal } from "@/components/assets/qr-scanner-modal";
import type { CompactInspection } from "@/lib/api/asset-inspection";

export default function WorkerAssetsScreen() {
  const { isRTL, t, direction } = useI18n();
  const insets = useAppInsets();
  const { resolvedTheme } = useTheme();
  const isTransitionFinished = useScreenTransition();
  const mutedColor = useThemeToken("--muted-foreground");
  const background = useThemeToken("--background");
  const primaryColor = useThemeToken("--primary");

  const { profile, logout } = useUserStore();
  const logoutSheet = useBottomSheetPresentation({ dismissKeyboard: false });
  const avatarSource = React.useMemo(
    () => getProfileImageSource(profile?.profileImageUrl, undefined),
    [profile?.profileImageUrl]
  );

  const { headerTranslateY, scrollHandler, resetScrollAnimation } = useScrollAnimation();
  const navigation = useNavigation();
  const listRef = React.useRef<any>(null);

  const [activeTab, setActiveTab] = React.useState<"assigned_assets" | "my_inspections">("assigned_assets");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showQrModal, setShowQrModal] = React.useState(false);

  // Queries
  const {
    data: assetsData,
    isLoading: isLoadingAssets,
    isRefetching: isRefetchingAssets,
    refetch: refetchAssets,
    fetchNextPage: fetchNextAssets,
    hasNextPage: hasNextAssets,
  } = useWorkerAssetsInfiniteQuery(20);

  const {
    data: inspectionsData,
    isLoading: isLoadingInspections,
    isRefetching: isRefetchingInspections,
    refetch: refetchInspections,
    fetchNextPage: fetchNextInspections,
    hasNextPage: hasNextInspections,
  } = useWorkerInspectionsInfiniteQuery(20);

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

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: headerTranslateY.value }],
    };
  });

  const workerName = profile?.name || "Worker";

  // Flattened lists
  const allAssets = React.useMemo(() => {
    return assetsData?.pages.flatMap((page) => page.items) || [];
  }, [assetsData]);

  const allInspections = React.useMemo(() => {
    return inspectionsData?.pages.flatMap((page) => page.items) || [];
  }, [inspectionsData]);

  // Filtered lists
  const filteredAssets = React.useMemo(() => {
    if (!searchQuery.trim()) return allAssets;
    const query = searchQuery.toLowerCase();
    return allAssets.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.code.toLowerCase().includes(query) ||
        a.typeName?.toLowerCase().includes(query) ||
        a.location?.toLowerCase().includes(query)
    );
  }, [allAssets, searchQuery]);

  const filteredInspections = React.useMemo(() => {
    if (!searchQuery.trim()) return allInspections;
    const query = searchQuery.toLowerCase();
    return allInspections.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        i.assetName?.toLowerCase().includes(query)
    );
  }, [allInspections, searchQuery]);

  const isRefreshing = isRefetchingAssets || isRefetchingInspections;

  const handleRefresh = async () => {
    if (activeTab === "assigned_assets") {
      await refetchAssets();
    } else {
      await refetchInspections();
    }
  };

  const handleLogout = async () => {
    logoutSheet.dismiss();
    try {
      await logout();
      router.replace("/choose-login-method" as Href);
    } catch {
      useToastStore.getState().showToast(t("errors.logoutFailed"), "error");
    }
  };

  const handleInspectionPress = (inspection: CompactInspection) => {
    if (inspection.state === "draft" || inspection.state === "in_progress") {
      router.push({
        pathname: "/(worker)/assets/inspection",
        params: { id: inspection.id },
      } as any);
    } else {
      router.push({
        pathname: "/(worker)/assets/inspection-detail",
        params: { id: inspection.id },
      } as any);
    }
  };

  const renderInspectionCard = ({ item }: { item: CompactInspection }) => (
    <Pressable
      onPress={() => handleInspectionPress(item)}
      className="bg-card border border-border rounded-2xl p-4 mb-3 active:opacity-90 shadow-sm"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {item.name}
        </Text>
        <InspectionStateBadge state={item.state} result={item.result} />
      </View>

      <Text
        className="text-base font-bold text-foreground mb-1"
        numberOfLines={1}
        style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
      >
        {item.assetName}
      </Text>

      <View className="flex-row items-center justify-between text-xs mt-2 pt-2 border-t border-border/60">
        <Text className="text-xs text-muted-foreground">
          {item.inspectionDate ? String(item.inspectionDate).split(" ")[0] : ""}
        </Text>

        <AppIcon
          name={isRTL ? "chevronLeft" : "chevronRight"}
          size={16}
          color={mutedColor}
        />
      </View>
    </Pressable>
  );

  const renderListHeader = () => (
    <View className="w-full flex-col">
      {/* Title & Scan QR Row */}
      <View className="pt-5 pb-3 flex-row items-center justify-between">
        <View className="flex-col">
          <Text
            className="text-2xl font-bold text-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("assets.title")}
          </Text>
          <Text
            className="text-xs text-muted-foreground mt-0.5"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {activeTab === "assigned_assets"
              ? `${allAssets.length} ${t("assets.tab.assigned").toLowerCase()}`
              : `${allInspections.length} ${t("assets.tab.inspections").toLowerCase()}`}
          </Text>
        </View>

        <Pressable
          onPress={() => setShowQrModal(true)}
          className="flex-row items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl active:opacity-80"
        >
          <AppIcon name="qrCode" size={18} color={primaryColor} />
          <Text
            className="text-xs font-bold text-primary"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("assets.scanQr")}
          </Text>
        </Pressable>
      </View>

      {/* Sub-tab Selectors */}
      <View className="flex-row gap-2 mb-3">
        <Pressable
          onPress={() => setActiveTab("assigned_assets")}
          className={`flex-1 py-2.5 rounded-full items-center justify-center border ${
            activeTab === "assigned_assets"
              ? "bg-primary border-primary"
              : "bg-card border-border"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              activeTab === "assigned_assets"
                ? "text-primary-foreground font-bold"
                : "text-muted-foreground"
            }`}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("assets.tab.assigned")}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("my_inspections")}
          className={`flex-1 py-2.5 rounded-full items-center justify-center border ${
            activeTab === "my_inspections"
              ? "bg-primary border-primary"
              : "bg-card border-border"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              activeTab === "my_inspections"
                ? "text-primary-foreground font-bold"
                : "text-muted-foreground"
            }`}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("assets.tab.inspections")}
          </Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View className="bg-card border border-border rounded-xl px-3 py-2 flex-row items-center gap-2 mb-3">
        <AppIcon name="search" size={16} color={mutedColor} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("assets.searchPlaceholder")}
          placeholderTextColor={mutedColor}
          className="flex-1 text-xs text-foreground py-0.5"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <AppIcon name="close" size={16} color={mutedColor} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const renderEmptyOrLoading = () => {
    const isLoading = activeTab === "assigned_assets" ? isLoadingAssets : isLoadingInspections;
    if (isLoading) {
      return (
        <View className="items-center justify-center py-16">
          {isTransitionFinished && <AppActivityIndicator size="large" />}
        </View>
      );
    }

    return (
      <View className="items-center justify-center py-16 px-6">
        <View className="w-16 h-16 rounded-full bg-secondary/50 items-center justify-center mb-4">
          <AppIcon name="inspection" size={28} color={mutedColor} />
        </View>
        <Text
          className="text-base text-muted-foreground leading-6 text-center"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {activeTab === "assigned_assets" ? t("assets.noAssets") : t("assets.noInspections")}
        </Text>
      </View>
    );
  };

  const currentData = activeTab === "assigned_assets" ? filteredAssets : filteredInspections;

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />

      {/* Top Status Bar Cover */}
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
        <AnimatedLegendList
          ref={listRef}
          data={currentData as any}
          keyExtractor={(item: any) => item.id}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyOrLoading}
          renderItem={
            activeTab === "assigned_assets"
              ? ({ item }: { item: any }) => <AssetCard asset={item} />
              : renderInspectionCard
          }
          estimatedItemSize={140}
          recycleItems={true}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#4F46E5"
            />
          }
          onEndReached={() => {
            if (activeTab === "assigned_assets" && hasNextAssets) {
              fetchNextAssets();
            } else if (activeTab === "my_inspections" && hasNextInspections) {
              fetchNextInspections();
            }
          }}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{
            paddingTop: insets.top + 76,
            paddingBottom: insets.bottom + 100,
          }}
          className="flex-1 w-full"
        />
      </View>

      {/* Header Container */}
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
          },
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

      {/* QR Scanner Modal */}
      <QrScannerModal
        isPresented={showQrModal}
        onDismiss={() => setShowQrModal(false)}
      />

      {/* Logout Sheet */}
      <LogoutBottomSheet
        isPresented={logoutSheet.isPresented}
        onDismiss={logoutSheet.dismiss}
        onConfirm={handleLogout}
        userName={workerName}
        userRole={t("auth.workerTitle")}
        hostName="worker-tabs-root"
      />
    </View>
  );
}
