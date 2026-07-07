import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Stack, router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";

const backgroundImage = require("../../assets/images/modern-beach-house-with-tropical-scenery.png");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnBoardingScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

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
    <View className="flex-1 bg-neutral-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Full screen background image */}
      <Image
        source={backgroundImage}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />

      {/* Screen Layout Area */}
      <View
        className="flex-1 justify-between px-6"
        style={{
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* Creative Real Estate Copywriting at the Top */}
        <View className="flex-col gap-3.5 w-full max-w-xl self-center">
          <AppText
            className="text-start text-4xl sm:text-5xl font-extrabold text-[#DEEC7D] tracking-tight leading-[48px] sm:leading-[58px]"
          >
            {t("onboarding.title")}
          </AppText>
        </View>

        {/* Scale Animated Get Started Button at the Bottom */}
        <View className="w-full max-w-xl self-center">
          <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleGetStarted}
            style={[buttonAnimatedStyle]}
            className="w-full h-16 bg-primary rounded-2xl items-center justify-center shadow-lg active:opacity-90"
          >
            <AppText className="text-center text-xl font-extrabold text-primary-foreground leading-none">
              {t("actions.getStarted")}
            </AppText>
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
}
