import React from "react";
import { View, Pressable, Alert } from "react-native";
import Animated from "react-native-reanimated";
import { router, type Href, useNavigation } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";

import { AppIcon } from "@/components/app-icon";
import { AppText } from "@/components/app-text";
import { Avatar } from "@/components/avatar";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { MediaSourceSheet } from "@/components/media-source-sheet";
import { SettingsRow } from "@/components/settings-row";
import { useAppImagePicker } from "@/hooks/use-image-picker";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { encodeImageUriAsDataUrl } from "@/lib/media";
import { getProfileImageSource } from "@/lib/image-source";
import { useUserStore } from "@/stores/user-store";
import { useScrollAnimation } from "@/providers/scroll-animation-provider";

const johnDoeAvatar = require("@/assets/temp/john-doe-avatar.png");

export default function ResidentProfileScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const foregroundColor = useThemeToken("--foreground");
  const { profile, logout, loading, updateProfileImage } = useUserStore();
  const { pickImage } = useAppImagePicker();
  const navigation = useNavigation();
  const { scrollHandler, resetScrollAnimation } = useScrollAnimation();
  const scrollViewRef = React.useRef<Animated.ScrollView>(null);
  const [isMediaSheetVisible, setIsMediaSheetVisible] = React.useState(false);

  const avatarSource = React.useMemo(
    () => getProfileImageSource(profile?.profileImageUrl, johnDoeAvatar),
    [profile?.profileImageUrl],
  );

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
    setIsMediaSheetVisible(true);
  };

  const handlePickAvatar = React.useCallback(
    async (source: "camera" | "library") => {
      try {
        const imageUri = await pickImage(source, {
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!imageUri) {
          return;
        }

        const encoded = await encodeImageUriAsDataUrl(imageUri);
        await updateProfileImage(encoded.dataUrl);
        Alert.alert(t("profile.changeAvatar"), t("profile.avatarUpdated"));
      } catch (error) {
        Alert.alert(
          t("common.error"),
          error instanceof Error ? error.message : t("errors.profileAvatarUpdateFailed"),
        );
      }
    },
    [pickImage, t, updateProfileImage],
  );

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
            <Avatar size={96} source={avatarSource} />
            {/* Overlay Camera Change Avatar Button */}
            <Pressable
              onPress={handleChangeAvatar}
              accessibilityLabel={t("profile.changeAvatar")}
              accessibilityRole="button"
              className="absolute bottom-0 end-0 w-8 h-8 rounded-full bg-primary items-center justify-center shadow-md active:opacity-75"
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
          className="mx-5 sm:mx-8 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 mt-6 mb-3 active:opacity-75"
          icon="logout"
          iconClassName="bg-rose-100 dark:bg-rose-950"
          accentColor="#EF4444"
          chevronColor={foregroundColor}
          title={t("profile.signOut")}
          titleClassName="text-rose-600 dark:text-rose-400 font-bold"
        />
      </Animated.ScrollView>
      <MediaSourceSheet
        isPresented={isMediaSheetVisible}
        onDismiss={() => setIsMediaSheetVisible(false)}
        onSelectCamera={() => void handlePickAvatar("camera")}
        onSelectLibrary={() => void handlePickAvatar("library")}
      />
      <FullScreenLoader visible={loading} />
    </View>
  );
}
