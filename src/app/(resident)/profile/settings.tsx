import React from "react";
import { ScrollView, View } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { SettingOptionCard } from "@/components/setting-option-card";
import { AppText } from "@/components/app-text";
import { themeOptions } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";

export default function ResidentProfileSettingsScreen() {
  const { t } = useI18n();
  const { setThemePreference, themePreference } = useTheme();
  const insets = useSafeAreaInsets();

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
        title={t("profile.settingsTitle")}
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        <AppText className="text-start text-base leading-6 text-muted-foreground mb-8">
          {t("profile.settingsDescription")}
        </AppText>

        <AppText className="text-start text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          {t("profile.appearance")}
        </AppText>

        <View className="flex-col gap-4">
          {themeOptions.map((option) => (
            <SettingOptionCard
              key={option.value}
              title={t(option.labelKey)}
              description={t(option.descriptionKey)}
              icon={option.icon}
              selected={themePreference === option.value}
              onPress={() => setThemePreference(option.value)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
