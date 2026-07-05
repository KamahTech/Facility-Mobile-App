import React from "react";
import { View, ScrollView } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { QuickActions } from "@/components/quick-actions";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";

export default function ResidentHomeDetailsScreen() {
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

      <ScreenHeader title={t("quickActions.title")} onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: insets.bottom + 40,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        <AppText className="text-start text-base leading-6 text-muted-foreground px-5 sm:px-8 mb-6">
          {t("quickActions.allDescription")}
        </AppText>

        <QuickActions
          limit={null}
          showHeader={false}
          showSeeAll={false}
        />
      </ScrollView>
    </View>
  );
}
