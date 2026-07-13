import { Pressable, View, Text, type PressableProps } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";

type AppSelectFieldProps = Omit<PressableProps, "children"> & {
  label: string;
  value?: string;
  placeholder: string;
  error?: string;
  showArrow?: boolean;
};

export function AppSelectField({
  label,
  value,
  placeholder,
  error,
  disabled,
  showArrow = true,
  ...props
}: AppSelectFieldProps) {
  const { isRTL } = useI18n();

  return (
    <View className="w-full flex-col gap-1.5">
      {label && (
        <Text
          className="text-sm font-semibold text-muted-foreground"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {label}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        className={`h-14 w-full justify-center rounded-2xl border border-transparent px-4 ${
          disabled
            ? "bg-secondary/50 opacity-50"
            : "bg-secondary active:opacity-80"
        }`}
        {...props}
      >
        <AppRow className="items-center justify-between gap-3">
          <Text
            className={`flex-1 text-base ${
              value ? "text-foreground" : "text-muted-foreground"
            }`}
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {value || placeholder}
          </Text>
          {showArrow && (
            <AppIcon
              name="chevronDown"
              size={18}
              colorToken="--muted-foreground"
              accessibilityLabel={placeholder}
            />
          )}
        </AppRow>
      </Pressable>
      {error && (
        <Text
          className="text-xs font-medium text-destructive mt-0.5"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
