import React from "react";
import { Modal, StyleSheet, View, Pressable, ScrollView, Alert, useWindowDimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { documentDirectory, downloadAsync } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useAppInsets } from "@/hooks/use-app-insets";
import { getBackendImageSource } from "@/lib/image-source";

import { AppIcon } from "@/components/app-icon";
import { AppChevron } from "@/components/app-chevron";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";

type FullscreenImageViewerProps = {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
};

export function FullscreenImageViewer({
  visible,
  imageUri,
  onClose,
}: FullscreenImageViewerProps) {
  const insets = useAppInsets();
  const { t } = useI18n();
  const { width, height } = useWindowDimensions();

  if (!visible || !imageUri) return null;

  const handleDownload = async () => {
    try {
      if (Platform.OS === "web") {
        const resolved = getBackendImageSource(imageUri);
        const url = resolved && typeof resolved === "object" && resolved.uri ? resolved.uri : imageUri;
        const link = document.createElement("a");
        link.href = url;
        link.download = `image_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("permissions.requiredTitle") || "Permission Required",
          t("permissions.photoLibraryRequired")
        );
        return;
      }

      const resolved = getBackendImageSource(imageUri);
      if (!resolved || typeof resolved !== "object" || !resolved.uri) {
        throw new Error("Invalid image URI");
      }

      const extension = resolved.uri.split(".").pop()?.split("?")[0] || "png";
      const filename = `download_${Date.now()}.${extension}`;
      const fileUri = `${documentDirectory}${filename}`;

      const downloadOptions = resolved.headers ? { headers: resolved.headers } : {};
      const downloadResult = await downloadAsync(resolved.uri, fileUri, downloadOptions);

      if (downloadResult.status !== 200) {
        throw new Error(`Failed to download image. Status: ${downloadResult.status}`);
      }

      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

      Alert.alert(
        t("tickets.imageSaved"),
        t("tickets.imageSavedDesc"),
        [{ text: t("common.ok") }]
      );
    } catch (e: unknown) {
      Alert.alert(
        t("common.error"),
        e instanceof Error ? e.message : String(e)
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={StyleSheet.absoluteFill} className="bg-black">
        {/* Zoomable Image Container using ScrollView */}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          maximumZoomScale={3}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bouncesZoom={true}
          className="flex-1 w-full"
        >
          <Image 
            source={getBackendImageSource(imageUri)} 
            style={{ width, height: height * 0.8 }} 
            contentFit="contain" 
          />
        </ScrollView>

        {/* WhatsApp-Style Top Header Bar */}
        <AppRow
          className="absolute top-0 inset-x-0 bg-black/60 items-center justify-between px-5 z-20"
          style={{ 
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: 12,
            minHeight: 60 + insets.top
          }}
        >
          {/* Back Button */}
          <Pressable
            onPress={onClose}
            accessibilityLabel={t("actions.close")}
            accessibilityRole="button"
            className="w-10 h-10 rounded-full items-center justify-center bg-white/10 active:opacity-60"
          >
            <AppChevron size={18} color="#FFFFFF" type="back" />
          </Pressable>

          {/* Title */}
          <AppText className="text-base font-bold text-white">
            {t("tickets.requestNo").replace(/\(.*?\)/g, "").trim()}
          </AppText>

          {/* Save/Download Button */}
          <Pressable
            onPress={handleDownload}
            accessibilityLabel={t("actions.download")}
            accessibilityRole="button"
            className="w-10 h-10 rounded-full items-center justify-center bg-primary active:opacity-80"
          >
            <AppIcon name="download" size={20} colorToken="--primary-foreground" />
          </Pressable>
        </AppRow>
      </View>
    </Modal>
  );
}
