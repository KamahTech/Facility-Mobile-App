import React, { useEffect } from "react";
import { View, StyleSheet, useWindowDimensions, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useI18n } from "@/hooks/use-i18n";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useBottomSheetLayer } from "@/hooks/use-bottom-sheet-layer";

const SHEET_DISMISS_ANIMATION_MS = 300;
const SHEET_PRESENT_ANIMATION_MS = 350;

export function OfflineBottomSheet() {
  const { isSheetVisible, status } = useNetworkStatus();
  const { t } = useI18n();
  const insets = useAppInsets();
  const { width } = useWindowDimensions();

  useBottomSheetLayer(isSheetVisible);

  const translateY = useSharedValue(500);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isSheetVisible) {
      translateY.value = withTiming(0, {
        duration: SHEET_PRESENT_ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      backdropOpacity.value = withTiming(1, {
        duration: SHEET_PRESENT_ANIMATION_MS,
        easing: Easing.out(Easing.quad),
      });
    } else {
      translateY.value = withTiming(500, {
        duration: SHEET_DISMISS_ANIMATION_MS,
        easing: Easing.in(Easing.cubic),
      });
      backdropOpacity.value = withTiming(0, {
        duration: SHEET_DISMISS_ANIMATION_MS,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [isSheetVisible, translateY, backdropOpacity]);

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (status === "idle" && !isSheetVisible) {
    return null;
  }

  const isRestored = status === "restored";
  const maxWidth = Math.min(width, 540);

  const bgClass = isRestored
    ? "bg-emerald-600 border-emerald-500"
    : "bg-rose-600 border-rose-500";

  const iconName = isRestored ? "wifi" : "wifiSlash";
  const title = isRestored ? t("network.onlineTitle") : t("network.offlineTitle");
  const message = isRestored ? t("network.onlineMessage") : t("network.offlineMessage");

  return (
    <View
      style={styles.rootContainer}
      pointerEvents={isSheetVisible ? "auto" : "none"}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      {/* Full-screen backdrop overlay to prevent clicks behind the sheet */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessible={false}
          importantForAccessibility="no"
          onPress={(e) => e.stopPropagation()}
        />
      </Animated.View>

      {/* Slide-up bottom sheet starting from the very bottom of the screen */}
      <Animated.View
        style={[
          styles.sheetContainer,
          animatedSheetStyle,
          {
            maxWidth,
          },
        ]}
      >
        <View
          className={`w-full rounded-t-[36px] border-t border-x px-6 pt-3 shadow-2xl items-center min-h-[250px] justify-between ${bgClass}`}
          style={{
            paddingBottom: Math.max(insets.bottom, 20) + 16,
          }}
        >
          {/* Sheet Handle Indicator */}
          <View className="h-1.5 w-12 self-center rounded-full bg-white/30 mb-4" />

          {/* Centered Column Content with Same Fixed/Balanced Height */}
          <View className="w-full items-center justify-center flex-1 py-1">
            {/* Big Centered Icon */}
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-white/20 shadow-sm mb-4">
              <AppIcon name={iconName} size={40} color="#FFFFFF" />
            </View>

            {/* Centered Column Text */}
            <View className="w-full items-center px-2">
              <AppText
                align="center"
                className="text-xl font-bold text-white text-center mb-1.5"
              >
                {title}
              </AppText>
              <AppText
                align="center"
                className="text-sm font-medium leading-5 text-white/90 text-center max-w-sm"
              >
                {message}
              </AppText>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 99990,
    elevation: 999,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheetContainer: {
    width: "100%",
    alignSelf: "center",
    zIndex: 99991,
    elevation: 1000,
  },
});
