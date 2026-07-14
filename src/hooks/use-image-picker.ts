import React from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

import type { TranslationKey } from "@/constants/translations";
import { useI18n } from "@/hooks/use-i18n";

type PickImageSource = "camera" | "library";
type PickImageOptions = {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
};

export function useAppImagePicker() {
  const { t } = useI18n();

  const pickImage = React.useCallback(
    async (source: PickImageSource, options: PickImageOptions = {}) => {
      try {
        const {
          allowsEditing = false,
          aspect,
          quality = 0.8,
        } = options;
        const permissionResult =
          source === "camera"
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
          const messageKey: TranslationKey =
            source === "camera"
              ? "permissions.cameraRequired"
              : "permissions.photoLibraryRequired";
          Alert.alert(t("permissions.requiredTitle"), t(messageKey));
          return null;
        }

        const result =
          source === "camera"
            ? await ImagePicker.launchCameraAsync({
                allowsEditing,
                aspect,
                mediaTypes: ["images"],
                quality,
              })
            : await ImagePicker.launchImageLibraryAsync({
                allowsEditing,
                aspect,
                mediaTypes: ["images"],
                quality,
              });

        if (result.canceled || !result.assets.length) {
          return null;
        }

        return result.assets[0].uri;
      } catch (error: any) {
        console.error(`[ImagePicker Error] source=${source}:`, error);
        
        // Handle simulator camera lack gracefully
        if (source === "camera" && error?.message?.includes("Camera not available")) {
          Alert.alert(t("common.error"), "Camera is not available on this device.");
        } else {
          Alert.alert(t("common.error"), error?.message || "Failed to access image.");
        }
        return null;
      }
    },
    [t],
  );

  return { pickImage };
}
