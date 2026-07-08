import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Stack, router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";

const backgroundImage = require("../../assets/images/modern-beach-house-with-tropical-scenery.png");
const appLogo = require("@/assets/app-brand/logo-light.svg");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnBoardingScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const primaryColor = useThemeToken("--primary") as string;

  const scale = useSharedValue(1);
  const bgScale = useSharedValue(1.15);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(35);

  React.useEffect(() => {
    // Elegant entrance animations
    bgScale.value = withTiming(1, {
      duration: 1800,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withTiming(0, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [bgScale, opacity, translateY]);

  const bgAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bgScale.value }],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handleGetStarted = () => {
    router.push("/choose-login-method" as Href);
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Animated Zooming Background Image */}
      <View style={StyleSheet.absoluteFill} className="overflow-hidden">
        <Animated.View style={[StyleSheet.absoluteFill, bgAnimatedStyle]}>
          <Image
            source={backgroundImage}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
        </Animated.View>
      </View>

      {/* Status Bar / Top Editorial Gradient Overlay */}
      <LinearGradient
        colors={["rgba(9, 9, 11, 0.8)", "rgba(9, 9, 11, 0.25)", "rgba(9, 9, 11, 0)"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.35 }}
      />

      {/* Bottom Text/CTA Gradient Overlay */}
      <LinearGradient
        colors={["rgba(9, 9, 11, 0)", "rgba(9, 9, 11, 0.45)", "rgba(9, 9, 11, 0.9)", "#09090b"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Main Interactive Screen Layout */}
      <Animated.View
        className="flex-1 justify-between px-6"
        style={[
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
          },
          contentAnimatedStyle,
        ]}
      >
        {/* Brand Header */}
        <View className="flex-row items-center gap-3 self-start">
          <Image
            source={appLogo}
            style={{ width: 40, height: 40 }}
            contentFit="contain"
            tintColor={primaryColor}
          />
          <View className="flex-col">
            <AppText className="text-white text-base font-black tracking-widest leading-none">
              KAMAH
            </AppText>
            <AppText className="text-[#DEEC7D] text-[9px] font-bold uppercase tracking-[0.25em] mt-0.5 leading-none">
              PROPERTIES
            </AppText>
          </View>
        </View>

        {/* Copywriting & Action Area at the Bottom */}
        <View className="flex-col gap-6 w-full max-w-xl self-center">
          {/* Copywriting Headlines */}
          <View className="flex-col gap-3.5">
            <AppText className="text-primary text-xs font-black uppercase tracking-[0.15em] text-start">
              {t("onboarding.welcome")}
            </AppText>
            <AppText
              className="text-start text-4xl sm:text-5xl font-black text-white tracking-tight leading-[46px] sm:leading-[56px]"
            >
              {t("onboarding.title")}
            </AppText>
            <AppText className="text-start text-base sm:text-lg text-zinc-400 leading-6 sm:leading-7 font-medium mt-1">
              {t("onboarding.description")}
            </AppText>
          </View>

          {/* Scale Animated Premium CTA Button */}
          <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleGetStarted}
            style={[buttonAnimatedStyle]}
            className="w-full h-16 bg-primary rounded-2xl flex-row items-center justify-between px-6 shadow-xl shadow-primary/25 active:opacity-95 mt-4"
          >
            <View className="w-8" />
            <AppText className="text-center text-lg font-black text-primary-foreground leading-none">
              {t("actions.getStarted")}
            </AppText>
            <View className="w-8 h-8 rounded-xl bg-primary-foreground/10 items-center justify-center">
              <AppIcon
                name="arrowUpRight"
                size={16}
                colorToken="--primary-foreground"
              />
            </View>
          </AnimatedPressable>
        </View>
      </Animated.View>
    </View>
  );
}
