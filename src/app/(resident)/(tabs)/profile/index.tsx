import React from "react";
import { View, Pressable, Alert, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { router, type Href, useNavigation } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { SettingsRow } from "@/components/settings-row";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useUserStore } from "@/stores/user-store";
import { useScrollAnimation } from "@/providers/scroll-animation-provider";

const johnDoeAvatar = require("@/assets/temp/john-doe-avatar.png");

export default function ResidentProfileScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const foregroundColor = useThemeToken("--foreground");
  const { profile, logout } = useUserStore();
  const navigation = useNavigation();
  const { scrollHandler, resetScrollAnimation } = useScrollAnimation();
  const scrollViewRef = React.useRef<Animated.ScrollView>(null);

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

  const handleChangeAvatar = () => {
    Alert.alert(
      t("profile.changeAvatar"),
      t("profile.changeAvatarDescription")
    );
  };

  const handleEditInformation = () => {
    router.push("/profile/edit" as Href);
  };

  const handleAppearance = () => {
    router.push("/profile/settings" as Href);
  };

  const handleTermsAndConditions = () => {
    router.push("/profile/terms" as Href);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("profile.deleteAccount"),
      t("profile.deleteAccountConfirm"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        { 
          text: t("profile.deleteAccount"), 
          style: "destructive", 
          onPress: async () => {
            await logout();
            router.replace("/choose-login-method" as Href);
          } 
        }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      t("profile.signOut"),
      t("profile.signOutConfirm"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        { 
          text: t("profile.signOut"), 
          style: "destructive", 
          onPress: async () => {
            await logout();
            router.replace("/choose-login-method" as Href);
          } 
        }
      ]
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
      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 140,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >

        {/* Center Avatar & User Info Block */}
        <View className="items-center justify-center py-6 px-5 sm:px-8">
          <View className="relative">
            <View className="w-24 h-24 rounded-full overflow-hidden border border-border bg-muted">
              <Image
                source={johnDoeAvatar}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            </View>
            {/* Overlay Camera Change Avatar Button */}
            <Pressable
              onPress={handleChangeAvatar}
              className="absolute bottom-0 end-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-background shadow-md active:opacity-75"
            >
              <AppIcon
                name="camera"
                size={14}
                colorToken="--primary-foreground"
              />
            </Pressable>
          </View>

          {/* User Name */}
          <AppText align="center" className="text-xl font-bold text-foreground mt-4">
            {profile?.name || ""}
          </AppText>
          
          {/* User Email */}
          <AppText align="center" className="text-sm text-muted-foreground mt-1">
            {profile?.email || ""}
          </AppText>
        </View>

        {/* Section: Account Settings */}
        <AppText className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-5 sm:px-8 mt-4 mb-2">
          {t("profile.sectionAccount")}
        </AppText>

        {/* Edit Information */}
        <SettingsRow
          onPress={handleEditInformation}
          icon="profile"
          iconClassName="bg-blue-50 dark:bg-blue-950/40"
          accentColor="#3B82F6"
          chevronColor={foregroundColor}
          title={t("profile.editInfo")}
        />

        {/* Appearance */}
        <SettingsRow
          onPress={handleAppearance}
          icon="themeSystem"
          iconClassName="bg-purple-50 dark:bg-purple-950/40"
          accentColor="#8B5CF6"
          chevronColor={foregroundColor}
          title={t("profile.appearance")}
        />

        {/* Language */}
        <SettingsRow
          onPress={() => router.push("/language" as Href)}
          icon="language"
          iconClassName="bg-teal-50 dark:bg-teal-950/40"
          accentColor="#0D9488"
          chevronColor={foregroundColor}
          title={t("profile.language")}
        />


        {/* Delete Account */}
        <SettingsRow
          onPress={handleDeleteAccount}
          icon="trash"
          iconClassName="bg-rose-50 dark:bg-rose-950/40"
          accentColor="#EF4444"
          chevronColor={foregroundColor}
          title={t("profile.deleteAccount")}
          titleClassName="text-rose-600 dark:text-rose-400"
        />

        {/* Section: General */}
        <AppText className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-5 sm:px-8 mt-4 mb-2">
          {t("profile.sectionGeneral")}
        </AppText>

        {/* Terms & Conditions */}
        <SettingsRow
          onPress={handleTermsAndConditions}
          icon="terms"
          iconClassName="bg-gray-50 dark:bg-gray-800"
          chevronColor={foregroundColor}
          title={t("profile.terms")}
        />

        {/* Sign Out Button */}
        <SettingsRow
          onPress={handleSignOut}
          className="mx-5 sm:mx-8 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/40 mt-6 mb-3 active:opacity-75"
          icon="logout"
          iconClassName="bg-rose-100 dark:bg-rose-950"
          accentColor="#EF4444"
          chevronColor={foregroundColor}
          title={t("profile.signOut")}
          titleClassName="text-rose-600 dark:text-rose-400 font-bold"
        />
      </Animated.ScrollView>
    </View>
  );
}
