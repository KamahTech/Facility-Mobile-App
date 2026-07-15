import React from "react";
import { View, ScrollView, Text } from "react-native";
import { Stack } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { useI18n } from "@/hooks/use-i18n";

export default function TermsAndConditionsScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();

  const sections = [
    { title: "terms.sec1.title", desc: "terms.sec1.desc" },
    { title: "terms.sec2.title", desc: "terms.sec2.desc" },
    { title: "terms.sec3.title", desc: "terms.sec3.desc" },
    { title: "terms.sec4.title", desc: "terms.sec4.desc" },
    { title: "terms.sec5.title", desc: "terms.sec5.desc" },
  ] as const;

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
        title={t("profile.terms")}
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
          className="text-base text-muted-foreground leading-6 mb-8"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("terms.intro")}
        </Text>

        <View className="flex-col gap-6">
          {sections.map((section) => (
            <View
              key={section.title}
              className="w-full bg-card rounded-2xl p-5 shadow-sm flex-col gap-2"
            >
              <Text
                className="text-lg font-bold text-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t(section.title)}
              </Text>
              <Text
                className="text-sm text-muted-foreground leading-5 mt-1"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t(section.desc)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
