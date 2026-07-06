import React from "react";
import { Modal, StyleSheet, View, Pressable, ScrollView, Alert, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { width, height } = useWindowDimensions();

  if (!visible || !imageUri) return null;

  const handleDownload = () => {
      Alert.alert(
        t("tickets.imageSaved"),
        t("tickets.imageSavedDesc"),
      [{ text: t("common.ok") }]
    );
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
            source={imageUri} 
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
            className="w-10 h-10 rounded-full items-center justify-center bg-white/10 active:opacity-60"
          >
            <AppIcon name="download" size={20} colorToken="--primary-foreground" />
          </Pressable>
        </AppRow>
      </View>
    </Modal>
  );
}
