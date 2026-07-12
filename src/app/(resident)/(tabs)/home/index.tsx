import React from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useAppInsets } from "@/hooks/use-app-insets";
import { router, type Href, useNavigation } from "expo-router";

import { HomeHeader } from "@/components/home-header";
import { AppText } from "@/components/app-text";
import { DueBalanceCard } from "@/components/due-balance-card";
import { QuickActions } from "@/components/quick-actions";
import { CommunityUpdates } from "@/components/community-updates";
import { LogoutBottomSheet } from "@/components/logout-bottom-sheet";
import { useBottomSheetPresentation } from "@/hooks/use-bottom-sheet-presentation";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useUserStore } from "@/stores/user-store";
import { useUnitStore } from "@/stores/unit-store";
import { useScrollAnimation } from "@/providers/scroll-animation-provider";
import { getProfileImageSource } from "@/lib/image-source";

const johnDoeAvatar = require("@/assets/temp/john-doe-avatar.png");

export default function ResidentHomeScreen() {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const insets = useAppInsets();
  const background = useThemeToken("--background");
  const { headerTranslateY, scrollHandler, resetScrollAnimation } = useScrollAnimation();
  const navigation = useNavigation();
  const scrollViewRef = React.useRef<Animated.ScrollView>(null);
  
  const { profile, logout } = useUserStore();
  const { unitsCount, isSummaryLoading } = useUnitStore({ enableUnits: false, enableSummary: true });
  const logoutSheet = useBottomSheetPresentation({ dismissKeyboard: false });
  const avatarSource = React.useMemo(
    () => getProfileImageSource(profile?.profileImageUrl, johnDoeAvatar),
    [profile?.profileImageUrl],
  );

  const handleLogout = async () => {
    logoutSheet.dismiss();
    try {
      await logout();
      router.replace("/choose-login-method" as Href);
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const scrollToTop = React.useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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


  // Compute greeting text dynamically (e.g., "Hello, John Doe")
  const greetingText = React.useMemo(() => {
    const baseGreeting = t("residentHome.hello");
    const name = profile?.name || t("residentHome.userName");
    return `${baseGreeting}, ${name}`;
  }, [t, profile]);

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
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
      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 76,
          paddingBottom: insets.bottom + 140,
          flexDirection: "column",
          gap: 24,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        
        {/* Plain Greeting Text */}
        <AppText
          className="text-start text-2xl text-foreground px-5 sm:px-8 font-bold"
        >
          {greetingText}
        </AppText>

        {/* Connected Units Card Component */}
        <View className="px-5 sm:px-8">
          <DueBalanceCard unitsCount={unitsCount} isLoading={isSummaryLoading} />
        </View>

        {/* Quick Actions List */}
        <QuickActions />

        {/* Community Updates Component */}
        <CommunityUpdates />
      </Animated.ScrollView>

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
          onNotificationPress={() => router.push("/notifications" as Href)}
          onAvatarPress={logoutSheet.present}
          onLogoPress={scrollToTop}
        />
      </Animated.View>

      {/* Logout bottom sheet */}
      <LogoutBottomSheet
        isPresented={logoutSheet.isPresented}
        onDismiss={logoutSheet.dismiss}
        onConfirm={handleLogout}
        userName={profile?.name || ""}
        userRole={t("auth.residentTitle")}
        avatarSource={avatarSource}
        hostName="tabs-root"
      />
    </View>
  );
}
