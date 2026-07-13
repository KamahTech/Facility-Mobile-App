import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { Image } from "expo-image";
import { Stack, type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";

const backgroundImage = require("../../assets/images/modern-beach-house-with-tropical-scenery.png");
const appLogo = require("@/assets/app-brand/logo-light.svg");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnBoardingScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const primaryColor = useThemeToken("--primary") as string;

  // Background Ken Burns effect
  const bgScale = useSharedValue(1);

  // Staggered content entrance animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(15);

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(25);

  const descOpacity = useSharedValue(0);
  const descTranslateY = useSharedValue(25);

  const btnOpacity = useSharedValue(0);
  const btnTranslateY = useSharedValue(25);

  // Button interactive scale animation
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    // 1. Slow, continuous Ken Burns background zoom
    bgScale.value = withRepeat(
      withTiming(1.08, {
        duration: 18000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // 2. Staggered fade & slide up for elements
    // Header (Instant stagger)
    headerOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    headerTranslateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    // Title (200ms delay)
    titleOpacity.value = withDelay(
      200,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
    titleTranslateY.value = withDelay(
      200,
      withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Description (400ms delay)
    descOpacity.value = withDelay(
      400,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
    descTranslateY.value = withDelay(
      400,
      withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Button (600ms delay)
    btnOpacity.value = withDelay(
      600,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
    btnTranslateY.value = withDelay(
      600,
      withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [
    bgScale,
    headerOpacity,
    headerTranslateY,
    titleOpacity,
    titleTranslateY,
    descOpacity,
    descTranslateY,
    btnOpacity,
    btnTranslateY,
  ]);

  const bgAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bgScale.value }],
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: headerTranslateY.value }],
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    };
  });

  const descAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: descOpacity.value,
      transform: [{ translateY: descTranslateY.value }],
    };
  });

  const btnAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: btnOpacity.value,
      transform: [{ translateY: btnTranslateY.value }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handlePressIn = () => {
    // eslint-disable-next-line react-hooks/immutability
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    // eslint-disable-next-line react-hooks/immutability
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handleGetStarted = () => {
    router.push("/choose-login-method" as Href);
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Animated Ken Burns Background Image */}
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
      <View
        className="flex-1 justify-between px-6"
        style={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Brand Header */}
        <Animated.View
          style={headerAnimatedStyle}
          className="flex-row items-center gap-3 self-start"
        >
          <Image
            source={appLogo}
            style={{ width: 40, height: 40 }}
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
              className="text-[#DBEE69] text-[9px] font-bold uppercase tracking-[0.25em] mt-0.5 leading-none"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              PROPERTIES
            </Text>
          </View>
        </Animated.View>

        {/* Copywriting & Action Area at the Bottom */}
        <View className="flex-col gap-6 w-full max-w-xl self-center">
          {/* Copywriting Headlines */}
          <View className="flex-col gap-3.5">
            {/* Title / Welcome group */}
            <Animated.View style={titleAnimatedStyle} className="flex-col gap-3">
              <Text
                className="text-primary text-xs font-black uppercase tracking-[0.15em]"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("onboarding.welcome")}
              </Text>
              <Text
                className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[46px] sm:leading-[56px]"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("onboarding.title")}
              </Text>
            </Animated.View>

            {/* Description */}
            <Animated.View style={descAnimatedStyle}>
              <Text
                className="text-base sm:text-lg text-zinc-400 leading-6 sm:leading-7 font-medium mt-1"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("onboarding.description")}
              </Text>
            </Animated.View>
          </View>

          {/* Scale Animated Premium CTA Button */}
          <Animated.View style={btnAnimatedStyle}>
            <AnimatedPressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleGetStarted}
              style={[buttonAnimatedStyle]}
              className="w-full h-16 bg-primary rounded-2xl flex-row items-center justify-between px-6 shadow-xl shadow-primary/25 active:opacity-95 mt-4"
            >
              <View className="w-8" />
              <Text
                className="text-center text-lg font-black text-primary-foreground leading-none"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("actions.getStarted")}
              </Text>
              <View className="w-8 h-8 rounded-xl bg-primary-foreground/10 items-center justify-center">
                <AppIcon
                  name={isRTL ? "arrowUpLeft" : "arrowUpRight"}
                  size={16}
                  colorToken="--primary-foreground"
                />
              </View>
            </AnimatedPressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
