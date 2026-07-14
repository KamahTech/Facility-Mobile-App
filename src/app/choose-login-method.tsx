import React from "react";
import { View, StyleSheet, Pressable, Text, BackHandler } from "react-native";
import { Image } from "expo-image";
import { Stack, type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { StatusBar } from "expo-status-bar";
import { useAppInsets } from "@/hooks/use-app-insets";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { AppIcon } from "@/components/app-icon";
import { AppChevron } from "@/components/app-chevron";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
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
  const { isRTL } = useI18n();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`flex-row items-center p-5 rounded-2xl border transition-all duration-200 ${
        selected
          ? "border-primary bg-primary"
          : "border-border bg-card active:bg-muted/40"
      }`}
    >
      {/* Start Icon Container */}
      <View className="w-12 h-12 rounded-xl items-center justify-center shrink-0">
        <AppIcon
          name={icon}
          size={24}
          colorToken={selected ? "--primary-foreground" : "--foreground"}
        />
      </View>

      {/* Middle Text Content */}
      <View className="flex-1 min-w-0 ms-4 me-4 flex-col justify-center">
        <Text
          className={`text-base font-bold leading-tight ${
            selected ? "text-primary-foreground" : "text-card-foreground"
          }`}
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {title}
        </Text>
        <Text
          className={`text-xs mt-1 leading-normal ${
            selected ? "text-primary-foreground/80" : "text-muted-foreground"
          }`}
          numberOfLines={2}
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {description}
        </Text>
      </View>

      {/* End Radio Indicator */}
      <View
        className={`w-6 h-6 rounded-full border items-center justify-center shrink-0 ${
          selected ? "border-primary-foreground bg-primary-foreground" : "border-border bg-transparent"
        }`}
      >
        {selected && (
          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </View>
    </Pressable>
  );
}

export default function ChooseLoginMethodScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const primaryColor = useThemeToken("--primary") as string;

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
    const handleBackPress = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/on-boarding" as Href);
      }
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => subscription.remove();
  }, []);

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
    setSelectedType(type);
    Haptics.selectionAsync().catch(() => {});
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
      <StatusBar style="light" />

      {/* Top half image header with floating back button and logo */}
      <View className="w-full h-[46%] relative overflow-hidden bg-zinc-950">
        <Image
          source={backgroundImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        {/* Soft top gradient overlay to protect text readability */}
        <LinearGradient
          colors={["rgba(9, 9, 11, 0.85)", "rgba(9, 9, 11, 0.35)", "rgba(9, 9, 11, 0)"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.95 }}
        />

        {/* Floating Header */}
        <View
          style={{ paddingTop: insets.top + 16 }}
          className="absolute top-0 start-0 end-0 px-6 flex-row items-center justify-between z-10"
        >
          {/* Back Button */}
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/on-boarding" as Href);
              }
            }}
            className="w-10 h-10 rounded-xl bg-black/35 items-center justify-center active:bg-black/50"
          >
            <AppChevron type="back" size={16} color="#FFFFFF" />
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
              <Text
                className="text-white text-base font-black tracking-widest leading-none"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                KAMAH
              </Text>
              <Text
                className="text-primary text-[9px] font-bold uppercase tracking-[0.25em] mt-0.5 leading-none"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                PROPERTIES
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Content Sheet (Rounded Top Corners) */}
      <Animated.View
        style={[
          {
            flex: 1,
            paddingBottom: insets.bottom + 16,
          },
          contentAnimatedStyle,
        ]}
        className="bg-card rounded-t-[32px] -mt-8 px-6 pt-12 justify-between"
      >
        {/* Content Area */}
        <View className="flex-1 justify-start gap-6">
          {/* Title & Description Group */}
          <View className="flex-col gap-2">
            <Text
              className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("auth.chooseAccountTitle")}
            </Text>
            <Text
              className="text-sm sm:text-base text-muted-foreground leading-normal font-medium mt-1"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("auth.chooseAccountDescription")}
            </Text>
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
          style={[continueAnimatedStyle, { marginTop: 16 }]}
          pointerEvents={selectedType ? "auto" : "none"}
        >
          <Pressable
            onPress={() => handleContinue()}
            className="w-full h-14 bg-primary rounded-2xl flex-row items-center justify-between px-6 shadow-lg shadow-primary/20 active:opacity-90"
          >
            <View className="w-8" />
            <Text
              className="text-center text-base font-black text-primary-foreground leading-none"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("actions.continue")}
            </Text>
            <View className="w-8 h-8 rounded-xl bg-primary-foreground/10 items-center justify-center">
              <AppChevron type="forward" size={16} colorToken="--primary-foreground" />
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

