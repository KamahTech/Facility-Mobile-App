import React from "react";
import { Link, type Href } from "expo-router";
import { Pressable, View, type PressableProps } from "react-native";

import { AppText } from "@/components/app-text";

type AppButtonProps = PressableProps & {
  href?: Href;
  label: string;
  variant?: "card" | "primary";
  className?: string;
};

export const AppButton = React.forwardRef<View, AppButtonProps>(
  (
    { href, label, onPress, variant = "primary", className = "", ...props },
    ref,
  ) => {
    const defaultClassName =
      variant === "card"
        ? "min-h-14 items-center justify-center rounded-lg bg-card px-5 py-4 active:opacity-80"
        : "min-h-14 items-center justify-center rounded-lg bg-primary px-5 py-4 active:opacity-80";

    const buttonClassName = `${defaultClassName} ${className}`.trim();
    const textClassName =
      variant === "card"
        ? "text-center text-base font-semibold text-card-foreground"
        : "text-center text-base font-semibold text-primary-foreground";

    const button = (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        className={buttonClassName}
        onPress={onPress}
        {...props}
      >
        <AppText align="center" className={textClassName}>
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
  },
);

AppButton.displayName = "AppButton";
