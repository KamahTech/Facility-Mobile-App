import React from "react";
import { ScrollView, View, Text } from "react-native";
import { Stack } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { SettingOptionCard } from "@/components/setting-option-card";
import { themeOptions } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";

export default function ResidentProfileSettingsScreen() {
  const { isRTL, t } = useI18n();
  const { setThemePreference, themePreference } = useTheme();
  const insets = useAppInsets();

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
        <Text
          className="text-base leading-6 text-muted-foreground mb-8"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("profile.settingsDescription")}
        </Text>

        <Text
          className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("profile.appearance")}
        </Text>

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
