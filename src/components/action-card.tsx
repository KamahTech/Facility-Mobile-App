import { Pressable, View, Text, type PressableProps } from "react-native";

import { AppChevron } from "@/components/app-chevron";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import type { AppIconName } from "@/constants/icons";

type ActionCardProps = PressableProps & {
  description: string;
  icon: AppIconName;
  title: string;
  variant?: "default" | "translucent";
  selected?: boolean;
};

export function ActionCard({
  description,
  icon,
  title,
  variant = "default",
  selected = false,
  ...props
}: ActionCardProps) {
  const { isRTL } = useI18n();
  const isTranslucent = variant === "translucent";

  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-24 rounded-2xl px-5 py-5 border ${
        selected
          ? "border-primary bg-primary/10 active:bg-primary/20"
          : isTranslucent
          ? "bg-zinc-900/60 border-zinc-800/80 active:bg-zinc-900/80"
          : "bg-card border-border active:opacity-80"
      }`}
      {...props}
    >
      <AppRow className="items-center gap-4 justify-between">
        <AppRow className="items-center gap-4 flex-1 min-w-0">
          <View
            className={`size-11 items-center justify-center rounded-xl shrink-0 ${
              selected
                ? "bg-primary/20 border border-primary/30"
                : isTranslucent
                ? "bg-primary/10 border border-primary/20"
                : "bg-secondary"
            }`}
          >
            <AppIcon
              accessibilityLabel={title}
              name={icon}
              size={22}
              colorToken={selected || isTranslucent ? "--primary" : "--foreground"}
            />
          </View>
          <View className="min-w-0 flex-1 flex-col gap-1">
            <Text
              className={`text-lg font-bold leading-tight ${
                selected
                  ? "text-foreground font-extrabold"
                  : isTranslucent
                  ? "text-white"
                  : "text-card-foreground"
              }`}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {title}
            </Text>
            <Text
              className={`text-sm leading-normal ${
                selected ? "text-foreground/80" : isTranslucent ? "text-zinc-400" : "text-muted-foreground"
              }`}
              numberOfLines={2}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {description}
            </Text>
          </View>
        </AppRow>

        {selected ? (
          <View className="w-6 h-6 items-center justify-center rounded-full bg-primary shrink-0">
            <AppIcon name="check" size={12} colorToken="--primary-foreground" />
          </View>
        ) : isTranslucent ? (
          <View className="w-8 h-8 items-center justify-center rounded-full bg-white/5 border border-white/10 shrink-0">
            <AppChevron size={14} color="#FFFFFF" />
          </View>
        ) : null}
      </AppRow>
    </Pressable>
  );
}

