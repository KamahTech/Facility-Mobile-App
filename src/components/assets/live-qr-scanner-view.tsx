import React, { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { parseAssetIdFromQr } from "@/lib/asset-qr-parser";
import { useToastStore } from "@/stores/toast-store";

interface LiveQrScannerViewProps {
  onScannedAsset: (assetId: string) => void;
  onClose?: () => void;
}

export function LiveQrScannerView({ onScannedAsset, onClose }: LiveQrScannerViewProps) {
  const { t, isRTL } = useI18n();
  const primaryColor = useThemeToken("--primary");
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [torch, setTorch] = useState(false);
  const isProcessingRef = useRef(false);

  // Reset processing lock on mount
  useEffect(() => {
    isProcessingRef.current = false;
  }, []);

  // Animated Scanner Line
  const scanLinePos = useSharedValue(0);

  useEffect(() => {
    scanLinePos.value = withRepeat(
      withTiming(200, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [scanLinePos]);

  const animatedLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLinePos.value }],
  }));

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (isProcessingRef.current) return;
    const rawData = result?.data;
    if (!rawData) return;

    isProcessingRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const assetId = parseAssetIdFromQr(rawData);
    if (assetId) {
      onScannedAsset(assetId);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2000);
    } else {
      useToastStore.getState().showToast(t("errors.invalidQrCode"), "error");
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1500);
    }
  };

  if (!permission && Platform.OS !== "web") {
    return (
      <View className="bg-secondary rounded-2xl p-6 items-center justify-center min-h-[260px]">
        <Text className="text-xs text-muted-foreground">...</Text>
      </View>
    );
  }

  if (permission && !permission.granted && Platform.OS !== "web") {
    return (
      <View className="bg-secondary rounded-2xl p-6 items-center justify-center min-h-[260px]">
        <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
          <AppIcon name="camera" size={24} colorToken="--primary" />
        </View>
        <Text
          className="text-sm font-bold text-foreground text-center mb-1"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("permissions.cameraRequired")}
        </Text>
        <Text
          className="text-xs text-muted-foreground text-center mb-4 leading-4 px-2"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("assets.cameraPermissionDenied")}
        </Text>
        <Pressable
          onPress={() => requestPermission()}
          className="bg-primary px-5 py-2.5 rounded-xl active:opacity-90"
        >
          <Text
            className="text-xs font-bold text-primary-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("assets.grantCameraPermission")}
          </Text>
        </Pressable>
      </View>
    );
  }

  const cornerStyle = { borderColor: String(primaryColor) };

  return (
    <View className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-black">
      <CameraView
        style={StyleSheet.absoluteFill}
        className="w-full h-full absolute inset-0"
        facing={facing}
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
        onMountError={(error) => {
          console.warn("Camera mount error:", error);
        }}
      />

      {/* Frame Window Overlay */}
      <View className="absolute inset-0 items-center justify-center" pointerEvents="box-none">
        {/* Frame Box (No border-radius, no dark borders, sharp primary corners) */}
        <View className="w-[210px] h-[210px] relative" pointerEvents="none">
          {/* Corner Guides */}
          <View className="absolute top-0 start-0 w-6 h-6 border-t-4 border-s-4 border-primary" style={cornerStyle} />
          <View className="absolute top-0 end-0 w-6 h-6 border-t-4 border-e-4 border-primary" style={cornerStyle} />
          <View className="absolute bottom-0 start-0 w-6 h-6 border-b-4 border-s-4 border-primary" style={cornerStyle} />
          <View className="absolute bottom-0 end-0 w-6 h-6 border-b-4 border-e-4 border-primary" style={cornerStyle} />

          {/* Animated Scanning Line */}
          <Animated.View
            style={[animatedLineStyle, { backgroundColor: String(primaryColor) }]}
            className="w-full h-0.5 bg-primary shadow-sm"
          />
        </View>
      </View>

      {/* Floating Controls Bar */}
      <View
        className="absolute top-3 start-3 end-3 flex-row items-center justify-between px-2"
        pointerEvents="box-none"
      >
        {/* Torch Toggle */}
        <Pressable
          onPress={() => setTorch((prev) => !prev)}
          className={`w-11 h-11 rounded-full items-center justify-center border ${
            torch ? "bg-primary border-primary" : "bg-black/60 border-white/20"
          } active:opacity-80`}
        >
          <AppIcon
            name={torch ? "flashOn" : "flashOff"}
            size={20}
            color="#ffffff"
          />
        </Pressable>

        {/* Camera Flip */}
        <Pressable
          onPress={() => setFacing((prev) => (prev === "back" ? "front" : "back"))}
          className="w-11 h-11 rounded-full bg-black/60 border border-white/20 items-center justify-center active:opacity-80"
        >
          <AppIcon name="cameraFlip" size={20} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}
