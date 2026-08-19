import React from "react";
import { Modal, Pressable, View, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { scanFromURLAsync } from "expo-camera";
import { AppIcon } from "@/components/app-icon";
import { LiveQrScannerView } from "@/components/assets/live-qr-scanner-view";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { router } from "@/lib/navigation";
import { useToastStore } from "@/stores/toast-store";
import { useAppImagePicker } from "@/hooks/use-image-picker";
import { parseAssetIdFromQr } from "@/lib/asset-qr-parser";

interface QrScannerModalProps {
  isPresented: boolean;
  onDismiss: () => void;
}

export function QrScannerModal({ isPresented, onDismiss }: QrScannerModalProps) {
  const { t, isRTL } = useI18n();
  const mutedForeground = useThemeToken("--muted-foreground");
  const primaryColor = useThemeToken("--primary");

  const [scanMode, setScanMode] = React.useState<"live" | "manual">("live");
  const [inputCode, setInputCode] = React.useState("");
  const { pickImage } = useAppImagePicker();

  const handleNavigateToAsset = (assetId: string) => {
    onDismiss();
    setInputCode("");
    setScanMode("live");
    router.push({
      pathname: "/(worker)/assets/details",
      params: { id: assetId },
    } as any);
  };

  const handleSubmitInput = () => {
    const parsedId = parseAssetIdFromQr(inputCode);
    if (!parsedId) {
      useToastStore.getState().showToast(t("errors.invalidQrCode"), "error");
      return;
    }
    handleNavigateToAsset(parsedId);
  };

  const handlePickFromLibrary = async () => {
    try {
      const uri = await pickImage("library");
      if (!uri) return;

      const scanResults = await scanFromURLAsync(uri, ["qr"]);
      if (scanResults && scanResults.length > 0) {
        for (const item of scanResults) {
          const matched = parseAssetIdFromQr(item.data);
          if (matched) {
            handleNavigateToAsset(matched);
            return;
          }
        }
      }
      useToastStore.getState().showToast(t("errors.invalidQrCode"), "error");
    } catch {
      useToastStore.getState().showToast(t("errors.invalidQrCode"), "error");
    }
  };

  if (!isPresented) return null;

  return (
    <Modal visible={isPresented} transparent animationType="fade" onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center bg-black/70 px-4 py-8"
      >
        <View className="bg-card rounded-3xl p-5 w-full max-w-md border border-border shadow-2xl overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                <AppIcon name="qrCode" size={20} color={primaryColor} />
              </View>
              <Text
                className="text-base font-bold text-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("assets.scanQr")}
              </Text>
            </View>
            <Pressable onPress={onDismiss} className="p-1 active:opacity-70">
              <AppIcon name="close" size={20} color={mutedForeground} />
            </Pressable>
          </View>

          <Text
            className="text-xs text-muted-foreground mb-4 leading-5"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("assets.scanQrInstruction")}
          </Text>

          {/* Scanner View / Manual Mode */}
          {scanMode === "live" ? (
            <View className="w-full mb-4">
              <LiveQrScannerView onScannedAsset={handleNavigateToAsset} onClose={onDismiss} />

              <View className="flex-row gap-2.5 mt-3">
                <Pressable
                  onPress={handlePickFromLibrary}
                  className="flex-1 bg-secondary border border-border rounded-xl py-3.5 px-4 flex-row items-center justify-center gap-2 active:opacity-80"
                >
                  <AppIcon name="gallery" size={20} color={primaryColor} />
                  <Text
                    className="text-sm font-semibold text-foreground"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {t("worker.mediaSourceLibrary")}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setScanMode("manual")}
                  className="flex-1 bg-secondary border border-border rounded-xl py-3.5 px-4 flex-row items-center justify-center gap-2 active:opacity-80"
                >
                  <AppIcon name="notes" size={20} color={primaryColor} />
                  <Text
                    className="text-sm font-semibold text-foreground"
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {t("assets.code")}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="mb-4">
              <View className="mb-4">
                <Text
                  className="text-xs font-semibold text-muted-foreground mb-1.5"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("assets.manualInput")}
                </Text>
                <TextInput
                  value={inputCode}
                  onChangeText={setInputCode}
                  placeholder="e.g. 18 or https://.../asset_inspection/asset/18"
                  placeholderTextColor={mutedForeground}
                  className="bg-background border border-border rounded-xl px-4 h-[52px] text-base text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>

              <Pressable
                onPress={() => setScanMode("live")}
                className="bg-secondary border border-border rounded-xl py-3.5 px-4 flex-row items-center justify-center gap-2 mb-3 active:opacity-80"
              >
                <AppIcon name="camera" size={20} color={primaryColor} />
                <Text
                  className="text-sm font-semibold text-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("assets.liveScanner")}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Bottom Actions */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={onDismiss}
              className="flex-1 py-3.5 rounded-xl bg-secondary items-center justify-center active:opacity-80"
            >
              <Text
                className="text-sm font-bold text-foreground"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("actions.close")}
              </Text>
            </Pressable>
            {scanMode === "manual" && (
              <Pressable
                onPress={handleSubmitInput}
                disabled={!inputCode.trim()}
                className={`flex-1 py-3.5 rounded-xl bg-primary items-center justify-center ${
                  !inputCode.trim() ? "opacity-50" : "active:opacity-90"
                }`}
              >
                <Text
                  className="text-sm font-bold text-primary-foreground"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {t("actions.continue")}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
