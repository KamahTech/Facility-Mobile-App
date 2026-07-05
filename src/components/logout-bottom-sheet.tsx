import { BottomSheet, BottomSheetView } from "@expo/ui/community/bottom-sheet";
import type { BottomSheetMethods } from "@expo/ui/community/bottom-sheet";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { Avatar } from "@/components/avatar";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";

type LogoutBottomSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  userName?: string;
  userRole?: string;
  avatarSource?: any;
};

export function LogoutBottomSheet({
  isPresented,
  onDismiss,
  onConfirm,
  userName,
  userRole,
  avatarSource,
}: LogoutBottomSheetProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const sheetRef = React.useRef<BottomSheetMethods>(null);
  const handledActionRef = React.useRef(false);
  const destructiveColor = useThemeToken("--destructive");

  React.useEffect(() => {
    if (isPresented) {
      handledActionRef.current = false;
    }
  }, [isPresented]);

  const runSheetAction = React.useCallback((action: () => void) => {
    if (handledActionRef.current) {
      return;
    }

    handledActionRef.current = true;
    action();
  }, []);

  const handleConfirm = React.useCallback(() => {
    onConfirm();
    onDismiss();
  }, [onConfirm, onDismiss]);

  const handleDismiss = React.useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={isPresented ? 0 : -1}
      snapPoints={["45%", "90%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
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

          <View className="w-full overflow-hidden rounded-xl border border-border bg-card">
            <TouchableOpacity
              activeOpacity={0.75}
              accessibilityRole="button"
              className="min-h-14 w-full justify-center border-b border-border px-4 py-4"
              onPress={() => runSheetAction(handleConfirm)}
              onPressIn={() => runSheetAction(handleConfirm)}
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
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              accessibilityRole="button"
              className="min-h-14 w-full justify-center px-4 py-4"
              onPress={() => runSheetAction(handleDismiss)}
              onPressIn={() => runSheetAction(handleDismiss)}
            >
              <AppRow className="w-full items-center justify-between gap-3">
                <AppText className="flex-1 text-base font-medium text-card-foreground">
                  {t("actions.cancel")}
                </AppText>
              </AppRow>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
