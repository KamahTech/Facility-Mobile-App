import React from "react";
import { ScrollView, View } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { LanguagePreferenceOptions } from "@/components/language-preference-options";
import { useI18n } from "@/hooks/use-i18n";

export default function LanguageScreen() {
  const { t } = useI18n();
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
        title={t("language.title")}
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
          {t("language.description")}
        </AppText>

        <LanguagePreferenceOptions />
      </ScrollView>
    </View>
  );
}
