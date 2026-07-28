import React from "react";
import * as ImagePicker from "expo-image-picker";

import type { TranslationKey } from "@/constants/translations";
import { useI18n } from "@/hooks/use-i18n";
import { useToastStore } from "@/stores/toast-store";
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/media";

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
          quality = 0.65,
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
          useToastStore.getState().showToast(t(messageKey), "error");
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
                preferredAssetRepresentationMode:
                  ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
              });

        if (result.canceled || !result.assets.length) {
          return null;
        }

        const asset = result.assets[0];
        if (
          typeof asset.fileSize === "number" &&
          asset.fileSize > MAX_IMAGE_UPLOAD_BYTES
        ) {
          useToastStore
            .getState()
            .showToast(t("errors.imageTooLarge"), "error");
          return null;
        }

        return asset.uri;
      } catch (error: any) {
        // Handle simulator camera lack gracefully
        if (source === "camera" && error?.message?.includes("Camera not available")) {
          useToastStore
            .getState()
            .showToast(t("errors.cameraUnavailable"), "error");
        } else {
          useToastStore
            .getState()
            .showToast(t("errors.imageAccessFailed"), "error");
        }
        return null;
      }
    },
    [t],
  );

  return { pickImage };
}
