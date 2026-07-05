import { Link, type Href } from "expo-router";
import { Pressable, type PressableProps } from "react-native";

import { AppText } from "@/components/app-text";

type AppButtonProps = PressableProps & {
  href?: Href;
  label: string;
  variant?: "card" | "primary";
};

export function AppButton({
  href,
  label,
  onPress,
  variant = "primary",
  ...props
}: AppButtonProps) {
  const buttonClassName =
    variant === "card"
      ? "min-h-14 items-center justify-center rounded-lg border border-border bg-card px-5 py-4 active:opacity-80"
      : "min-h-14 items-center justify-center rounded-lg bg-primary px-5 py-4 active:opacity-80";
  const textClassName =
    variant === "card"
      ? "text-center text-base font-semibold text-card-foreground"
      : "text-center text-base font-semibold text-primary-foreground";

  const button = (
    <Pressable
      accessibilityRole="button"
      className={buttonClassName}
      onPress={onPress}
      {...props}
    >
      <AppText
        align="center"
        className={textClassName}
      >
        {label}
      </AppText>
    </Pressable>
  );

  if (!href) {
    return button;
  }

  return (
    <Link href={href} asChild>
      {button}
    </Link>
  );
}
