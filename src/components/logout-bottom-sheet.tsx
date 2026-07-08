import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBottomSheetBackdrop } from "@/components/app-bottom-sheet-backdrop";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { Avatar } from "@/components/avatar";
import { bottomSheetContainerStyle, defaultBottomSheetSnapPoints } from "@/constants/bottom-sheet";
import { useBottomSheetLayer } from "@/hooks/use-bottom-sheet-layer";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";

type LogoutBottomSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  userName?: string;
  userRole?: string;
  avatarSource?: any;
  hostName?: string;
};

export function LogoutBottomSheet({
  isPresented,
  onDismiss,
  onConfirm,
  userName,
  userRole,
  avatarSource,
  hostName,
}: LogoutBottomSheetProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  useBottomSheetLayer(isPresented);
  const destructiveColor = useThemeToken("--destructive");

  const handleConfirm = React.useCallback(() => {
    onConfirm();
    onDismiss();
  }, [onConfirm, onDismiss]);

  const handleDismiss = React.useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const content = (
    <BottomSheet
      index={isPresented ? 0 : -1}
      snapPoints={defaultBottomSheetSnapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={AppBottomSheetBackdrop}
      containerStyle={bottomSheetContainerStyle}
      onClose={onDismiss}
    >
      <BottomSheetView
        style={{
          width: "100%",
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <View className="w-full max-w-xl self-center items-center pt-2">
          <View className="mb-4">
            <Avatar size={72} source={avatarSource} />
          </View>

          <AppText className="mb-1 text-xl font-bold text-foreground">
            {userName || "Michael Smith"}
          </AppText>
          <AppText className="mb-6 text-xs uppercase tracking-wider text-muted-foreground">
            {userRole || t("auth.workerTitle")}
          </AppText>

          <View className="w-full overflow-hidden rounded-xl bg-card">
            <Pressable
              accessibilityRole="button"
              className="min-h-14 w-full justify-center px-4 py-4"
              onPress={handleConfirm}
            >
              <AppRow className="w-full items-center justify-between gap-3">
                <AppRow className="flex-1 items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-rose-600/10">
                    <AppIcon name="logout" size={18} color={destructiveColor} />
                  </View>
                  <AppText className="text-base font-semibold text-rose-600">
                    {t("profile.signOut")}
                  </AppText>
                </AppRow>
              </AppRow>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="min-h-14 w-full justify-center px-4 py-4"
              onPress={handleDismiss}
            >
              <AppRow className="w-full items-center justify-between gap-3">
                <AppText className="flex-1 text-base font-medium text-card-foreground">
                  {t("actions.cancel")}
                </AppText>
              </AppRow>
            </Pressable>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );

  if (hostName) {
    return <Portal hostName={hostName}>{content}</Portal>;
  }

  return content;
}
