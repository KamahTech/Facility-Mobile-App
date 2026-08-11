import React from "react";
import { Pressable, View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import { AppIcon } from "@/components/app-icon";
import { MediaSourceSheet } from "@/components/media-source-sheet";
import { useAppImagePicker } from "@/hooks/use-image-picker";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { encodeImageUriAsDataUrl } from "@/lib/media";
import { useToastStore } from "@/stores/toast-store";
import type { LocalPhotoItem } from "@/stores/asset-inspection-store";

interface InspectionPhotoPickerProps {
  photos: LocalPhotoItem[];
  readOnly?: boolean;
  onAddPhoto: (photo: LocalPhotoItem) => void;
  onRemovePhoto: (photoId: string) => void;
}

export function InspectionPhotoPicker({
  photos,
  readOnly = false,
  onAddPhoto,
  onRemovePhoto,
}: InspectionPhotoPickerProps) {
  const { t, isRTL } = useI18n();
  const primaryColor = useThemeToken("--primary");

  const [showMediaSheet, setShowMediaSheet] = React.useState(false);
  const { pickImage } = useAppImagePicker();

  const handleSourceSelect = async (source: "camera" | "library") => {
    setShowMediaSheet(false);
    if (photos.length >= 10) {
      useToastStore.getState().showToast(t("errors.maxImagesReached"), "error");
      return;
    }

    const uri = await pickImage(source);
    if (!uri) return;

    try {
      const encoded = await encodeImageUriAsDataUrl(uri);
      const newPhoto: LocalPhotoItem = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: encoded.name,
        mimetype: "image/jpeg",
        data: encoded.dataUrl,
        uri,
      };
      onAddPhoto(newPhoto);
    } catch {
      useToastStore.getState().showToast(t("errors.imageProcessingFailed"), "error");
    }
  };

  return (
    <View className="bg-card border border-border rounded-2xl p-4 mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <AppIcon name="camera" size={20} color={primaryColor} />
          <Text
            className="text-sm font-bold text-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("inspection.photos")}
          </Text>
        </View>
        <Text className="text-xs font-semibold text-muted-foreground">
          {t("inspection.photosCount").replace("{{count}}", String(photos.length))}
        </Text>
      </View>

      {/* Horizontal List of Thumbnails */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
      >
        {!readOnly && photos.length < 10 && (
          <Pressable
            onPress={() => setShowMediaSheet(true)}
            className="w-20 h-20 rounded-xl border border-dashed border-primary/40 bg-primary/5 items-center justify-center active:opacity-80"
          >
            <AppIcon name="add" size={24} color={primaryColor} />
            <Text
              className="text-[11px] font-semibold text-primary mt-1 text-center"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("inspection.addPhoto")}
            </Text>
          </Pressable>
        )}

        {photos.map((item) => {
          const imageUri = item.uri || item.contentUrl || item.data;
          return (
            <View key={item.id} className="relative w-20 h-20 rounded-xl overflow-hidden bg-secondary">
              <Image
                source={{ uri: imageUri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
              />

              {!readOnly && (
                <Pressable
                  onPress={() => onRemovePhoto(item.id)}
                  className="absolute top-1 end-1 w-6 h-6 rounded-full bg-black/60 items-center justify-center active:opacity-80"
                >
                  <AppIcon name="close" size={14} color="#FFFFFF" />
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Media Selection Sheet */}
      <MediaSourceSheet
        isPresented={showMediaSheet}
        onDismiss={() => setShowMediaSheet(false)}
        onSelectCamera={() => handleSourceSelect("camera")}
        onSelectLibrary={() => handleSourceSelect("library")}
      />
    </View>
  );
}
