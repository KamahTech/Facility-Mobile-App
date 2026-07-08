import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppChevron } from "@/components/app-chevron";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useTheme } from "@/hooks/use-theme";
import type { AppIconName } from "@/constants/icons";

const backgroundImage = require("../../assets/images/choose-account-illustration.jpg");
const appLogo = require("@/assets/app-brand/logo-light.svg");

type RoleOptionProps = {
  title: string;
  description: string;
  icon: AppIconName;
  selected: boolean;
  onPress: () => void;
};

function RoleOption({ title, description, icon, selected, onPress }: RoleOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`flex-row items-center p-5 rounded-2xl border transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/[0.04]"
          : "border-border bg-card active:bg-muted/40"
      }`}
    >
      {/* Start Icon Container */}
      <View
        className={`w-12 h-12 rounded-xl items-center justify-center border shrink-0 ${
          selected
            ? "bg-primary/20 border-primary/30"
            : "bg-secondary border-border"
        }`}
      >
        <AppIcon
          name={icon}
          size={24}
          colorToken={selected ? "--primary" : "--foreground"}
        />
      </View>

      {/* Middle Text Content */}
      <View className="flex-1 min-w-0 ms-4 me-4 flex-col justify-center">
        <AppText
          className={`text-start text-base font-bold leading-tight ${
            selected ? "text-foreground font-black" : "text-card-foreground"
          }`}
        >
          {title}
        </AppText>
        <AppText
          className="text-start text-xs text-muted-foreground mt-1 leading-normal"
          numberOfLines={2}
        >
          {description}
        </AppText>
      </View>

      {/* End Radio Indicator */}
      <View
        className={`w-6 h-6 rounded-full border items-center justify-center shrink-0 ${
          selected ? "border-primary bg-primary" : "border-border bg-transparent"
        }`}
      >
        {selected && (
          <View className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
        )}
      </View>
    </Pressable>
  );
}

export default function ChooseLoginMethodScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const primaryColor = useThemeToken("--primary") as string;
  const { resolvedTheme } = useTheme();

  // Simple entrance animation
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(10);

  // Selection states
  const [selectedType, setSelectedType] = React.useState<"resident" | "worker" | null>(null);

  const continueOpacity = useSharedValue(0);
  const continueTranslateY = useSharedValue(10);

  React.useEffect(() => {
    contentOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.quad),
    });
    contentTranslateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.quad),
    });
  }, [contentOpacity, contentTranslateY]);

  React.useEffect(() => {
    if (selectedType !== null) {
      continueOpacity.value = withTiming(1, { duration: 250 });
      continueTranslateY.value = withTiming(0, { duration: 250 });
    } else {
      continueOpacity.value = withTiming(0, { duration: 150 });
      continueTranslateY.value = withTiming(10, { duration: 150 });
    }
  }, [selectedType, continueOpacity, continueTranslateY]);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: contentTranslateY.value }],
    };
  });

  const continueAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: continueOpacity.value,
      transform: [{ translateY: continueTranslateY.value }],
    };
  });

  const handleSelectType = (type: "resident" | "worker") => {
    if (selectedType === type) {
      handleContinue(type);
    } else {
      setSelectedType(type);
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const handleContinue = (overrideType?: "resident" | "worker") => {
    const typeToUse = overrideType || selectedType;
    if (!typeToUse) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push({
      pathname: "/login",
      params: { type: typeToUse },
    } as any);
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Premium adaptive background gradient */}
      <LinearGradient
        colors={
          resolvedTheme === "dark"
            ? ["#18181b", "#09090b", "#09090b"]
            : ["#ffffff", "#f5f6f8", "#f5f6f8"]
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Main Interactive Screen Layout */}
      <Animated.View
        style={[
          {
            flex: 1,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
          },
          contentAnimatedStyle,
        ]}
        className="px-6 justify-between"
      >
        {/* Top Header Row with Back Button & Brand Logo */}
        <View className="flex-row items-center justify-between w-full">
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-card border border-border items-center justify-center active:bg-muted active:opacity-90"
          >
            <AppChevron type="back" size={16} colorToken="--foreground" />
          </Pressable>

          {/* Brand Logo Group */}
          <View className="flex-row items-center gap-3">
            <Image
              source={appLogo}
              style={{ width: 36, height: 36 }}
              contentFit="contain"
              tintColor={primaryColor}
            />
            <View className="flex-col">
              <AppText className="text-foreground text-base font-black tracking-widest leading-none">
                KAMAH
              </AppText>
              <AppText className="text-primary text-[9px] font-bold uppercase tracking-[0.25em] mt-0.5 leading-none">
                PROPERTIES
              </AppText>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <View className="flex-1 justify-center w-full max-w-xl self-center gap-5 mt-4">
          {/* Increased Height Illustrative Image Card */}
          <View className="w-full h-64 sm:h-76 rounded-2xl overflow-hidden border border-border/80 shadow-2xs">
            <Image
              source={backgroundImage}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          </View>

          {/* Title & Description Group */}
          <View className="flex-col gap-2 mt-1">
            <AppText
              className="text-start text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none"
            >
              {t("auth.chooseAccountTitle")}
            </AppText>
            <AppText className="text-start text-sm sm:text-base text-muted-foreground leading-normal font-medium mt-1">
              {t("auth.chooseAccountDescription")}
            </AppText>
          </View>

          {/* Custom Designed Role Options */}
          <View className="flex-col gap-3.5 w-full">
            <RoleOption
              title={t("auth.residentTitle")}
              description={t("auth.residentDescription")}
              icon="resident"
              selected={selectedType === "resident"}
              onPress={() => handleSelectType("resident")}
            />

            <RoleOption
              title={t("auth.workerTitle")}
              description={t("auth.workerDescription")}
              icon="worker"
              selected={selectedType === "worker"}
              onPress={() => handleSelectType("worker")}
            />
          </View>
        </View>

        {/* Bottom CTA Continue Button */}
        <Animated.View
          style={[continueAnimatedStyle, { marginTop: 12 }]}
          pointerEvents={selectedType ? "auto" : "none"}
        >
          <Pressable
            onPress={() => handleContinue()}
            className="w-full h-14 bg-primary rounded-2xl flex-row items-center justify-between px-6 shadow-lg shadow-primary/20 active:opacity-90"
          >
            <View className="w-8" />
            <AppText className="text-center text-base font-black text-primary-foreground leading-none">
              {t("actions.continue")}
            </AppText>
            <View className="w-8 h-8 rounded-xl bg-primary-foreground/10 items-center justify-center">
              <AppChevron type="forward" size={16} colorToken="--primary-foreground" />
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}


