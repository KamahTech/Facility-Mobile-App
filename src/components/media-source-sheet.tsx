/* eslint-disable react-hooks/immutability */
import React from "react";
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  PanResponder,
  Dimensions,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";

type MediaSourceSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

export function MediaSourceSheet({
  isPresented,
  onDismiss,
  onSelectCamera,
  onSelectLibrary,
}: MediaSourceSheetProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const primaryColor = useThemeToken("--primary");

  const translateY = useSharedValue(SCREEN_HEIGHT);

  const onDismissRef = React.useRef(onDismiss);
  React.useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const handleDismissCallback = React.useCallback(() => {
    onDismissRef.current();
  }, []);

  // Sync animation with presentation state
  React.useEffect(() => {
    if (isPresented) {
      translateY.value = withTiming(0, { duration: 250 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    }
  }, [isPresented, translateY]);

  const handleDismiss = React.useCallback(() => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(handleDismissCallback)();
      }
    });
  }, [translateY, handleDismissCallback]);

  const handleSelectCamera = () => {
    onSelectCamera();
    handleDismiss();
  };

  const handleSelectLibrary = () => {
    onSelectLibrary();
    handleDismiss();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // PanResponder to handle drag-down-to-close gesture
  /* eslint-disable react-hooks/refs */
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Trigger responder only when swiping down vertically
          return gestureState.dy > 10 && gestureState.dy > Math.abs(gestureState.dx);
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.value = gestureState.dy;
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 120 || gestureState.vy > 0.5) {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, (finished) => {
              if (finished) {
                runOnJS(handleDismissCallback)();
              }
            });
          } else {
            translateY.value = withTiming(0, { duration: 200 });
          }
        },
      }),
    [translateY, handleDismissCallback]
  );
  /* eslint-enable react-hooks/refs */

  if (!isPresented) return null;

  return (
    <Modal
      visible={isPresented}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      {/* Container View */}
      <View className="flex-1 justify-end items-center px-5">
        {/* Transparent Backdrop */}
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
          onPress={handleDismiss}
          className="bg-transparent"
        />

        {/* Animated Floating Card */}
        <Animated.View
          {...panResponder.panHandlers}
          className="bg-card rounded-[28px] p-6 shadow-2xl items-center w-full max-w-md"
          style={[
            animatedStyle,
            {
              marginBottom: Math.max(insets.bottom, 24),
              zIndex: 2,
            }
          ]}
        >
          {/* Title */}
          <AppText className="text-lg font-bold text-foreground mb-6 text-center">
            {t("worker.mediaSourceTitle")}
          </AppText>

          {/* First Row: Camera and Library Side-by-side */}
          <AppRow className="w-full gap-4 mb-4">
            {/* Camera Option */}
            <Pressable
              onPress={handleSelectCamera}
              className="flex-1 bg-secondary rounded-2xl p-5 items-center justify-center active:opacity-90 min-h-[110px]"
            >
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-2.5">
                <AppIcon name="camera" size={24} color={primaryColor} />
              </View>
              <AppText className="text-sm font-bold text-foreground text-center">
                {t("worker.mediaSourceCamera").replace(/\(.*?\)/g, "").trim()}
              </AppText>
            </Pressable>

            {/* Library Option */}
            <Pressable
              onPress={handleSelectLibrary}
              className="flex-1 bg-secondary rounded-2xl p-5 items-center justify-center active:opacity-90 min-h-[110px]"
            >
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-2.5">
                <AppIcon name="gallery" size={24} color={primaryColor} />
              </View>
              <AppText className="text-sm font-bold text-foreground text-center">
                {t("worker.mediaSourceLibrary")}
              </AppText>
            </Pressable>
          </AppRow>

          {/* Second Row: Cancel Button */}
          <Pressable
            onPress={handleDismiss}
            className="w-full min-h-[50px] rounded-xl bg-secondary justify-center items-center active:opacity-90"
          >
            <AppText className="text-base font-semibold text-foreground">
              {t("actions.cancel")}
            </AppText>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
