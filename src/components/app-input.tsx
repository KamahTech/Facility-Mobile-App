import React from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { getDirectionalTextStyle } from "@/lib/i18n-layout";

type AppInputProps = Omit<TextInputProps, "style"> & {
  label?: string;
  error?: string;
  containerClassName?: string;
};

export function AppInput({
  label,
  error,
  containerClassName = "",
  multiline,
  numberOfLines,
  ...props
}: AppInputProps) {
  const { direction } = useI18n();
  const directionStyle = getDirectionalTextStyle(direction);

  return (
    <View className={`w-full flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <AppText className="text-sm font-semibold text-muted-foreground">
          {label}
        </AppText>
      )}
      <TextInput
        placeholderTextColor="#A1A1AA"
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          directionStyle,
          {
            textAlignVertical: multiline ? "top" : "center",
          },
        ]}
        className={`w-full rounded-xl border border-border px-4 py-3.5 text-base focus:border-primary ${
          props.editable === false
            ? "bg-muted/40 text-muted-foreground opacity-60"
            : "bg-card text-foreground"
        } ${
          multiline ? "min-h-[110px]" : "min-h-[50px]"
        }`}
        {...props}
      />
      {error && (
        <AppText className="text-xs font-medium text-destructive mt-0.5">
          {error}
        </AppText>
      )}
    </View>
  );
}
