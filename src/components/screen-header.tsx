import { Pressable, View } from "react-native";
import { router } from "expo-router";

import { AppChevron } from "@/components/app-chevron";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showBorder?: boolean;
};

export function ScreenHeader({
  title,
  onBack = () => router.back(),
  rightAction,
  showBorder = true,
}: ScreenHeaderProps) {
  const { t } = useI18n();

  return (
    <AppRow className={`w-full items-center justify-between py-4 px-5 sm:px-8 ${showBorder ? "border-b border-border" : ""}`}>
      <Pressable
        accessibilityLabel={t("actions.back")}
        accessibilityRole="button"
        onPress={onBack}
        className="w-10 h-10 rounded-full bg-secondary justify-center items-center active:opacity-75"
      >
        <AppChevron type="back" size={20} />
      </Pressable>

      <AppText className="text-lg font-bold text-foreground">
        {title}
      </AppText>

      <View className="w-10 items-center justify-center">
        {rightAction}
      </View>
    </AppRow>
  );
}
