import React from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import { getDirectionalTextStyle } from "@/lib/i18n-layout";
import type { AppIconName } from "@/constants/icons";

type AppInputProps = Omit<TextInputProps, "style"> & {
  label?: string;
  error?: string;
  containerClassName?: string;
  icon?: AppIconName;
};

export function AppInput({
  label,
  error,
  containerClassName = "",
  multiline,
  numberOfLines,
  onFocus,
  onBlur,
  icon,
  ...props
}: AppInputProps) {
  const { direction } = useI18n();
  const directionStyle = getDirectionalTextStyle(direction);
  const [isFocused, setIsFocused] = React.useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View className={`w-full flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <AppText className={`text-sm font-semibold transition-colors ${isFocused ? "text-primary font-bold" : "text-muted-foreground"}`}>
          {label}
        </AppText>
      )}
      <View
        className={`w-full rounded-2xl flex-row items-center px-4 border transition-all ${
          props.editable === false
            ? "bg-muted/40 border-transparent opacity-60"
            : isFocused
            ? "bg-card border-primary"
            : error
            ? "bg-card border-destructive"
            : "bg-secondary border-transparent"
        } ${multiline ? "min-h-[110px] items-start py-3" : "h-14"}`}
      >
        {icon && (
          <View className="me-3 shrink-0">
            <AppIcon
              name={icon}
              size={20}
              colorToken={isFocused ? "--primary" : error ? "--destructive" : "--muted-foreground"}
            />
          </View>
        )}
        <TextInput
          placeholderTextColor="#A1A1AA"
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            directionStyle,
            {
              flex: 1,
              height: "100%",
              textAlignVertical: multiline ? "top" : "center",
            },
          ]}
          className="text-base text-foreground"
          {...props}
        />
      </View>
      {error && (
        <AppText className="text-xs font-medium text-destructive mt-0.5">
          {error}
        </AppText>
      )}
    </View>
  );
}
