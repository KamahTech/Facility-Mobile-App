import { StatusBar } from "expo-status-bar";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { AppButton } from "@/components/app-button";
import { AppChevron } from "@/components/app-chevron";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { languages } from "@/constants/languages";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";

type AppScreenProps = {
  action?: {
    href: Parameters<typeof AppButton>[0]["href"];
    label: string;
  };
  children?: React.ReactNode;
  description: string;
  title: string;
  hideLanguageToggle?: boolean;
  showBackButton?: boolean;
};

export function AppScreen({
  action,
  children,
  description,
  title,
  hideLanguageToggle = false,
  showBackButton = false,
}: AppScreenProps) {
  const { language, t } = useI18n();
  const { resolvedTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <View className="flex-1 justify-center bg-background px-5 py-6 sm:px-8">
        <View className="w-full max-w-xl self-center">
          <AppRow className="w-full items-center justify-between mb-8">
            {showBackButton ? (
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-secondary justify-center items-center active:opacity-75"
              >
                <AppChevron type="back" size={20} />
              </Pressable>
            ) : !hideLanguageToggle ? (
              <AppButton
                accessibilityLabel={t("language.toggleLabel")}
                className="min-h-11 rounded-lg bg-card px-4 py-3 active:opacity-80"
                label={languages[language].nativeLabel}
                onPress={() => router.push("/language" as any)}
                variant="card"
              />
            ) : (
              <View />
            )}
          </AppRow>

          <AppText
            className="text-start text-3xl font-bold text-foreground sm:text-4xl"
          >
            {title}
          </AppText>
          <AppText
            className="mt-3 text-start text-base leading-6 text-muted-foreground"
          >
            {description}
          </AppText>

          {children ? <View className="mt-8 gap-3">{children}</View> : null}

          {action ? (
            <View className={children ? "mt-4" : "mt-8"}>
              <AppButton href={action.href} label={action.label} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
