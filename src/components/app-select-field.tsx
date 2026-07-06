import { Pressable, View, type PressableProps } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";

type AppSelectFieldProps = Omit<PressableProps, "children"> & {
  label: string;
  value?: string;
  placeholder: string;
  error?: string;
};

export function AppSelectField({
  label,
  value,
  placeholder,
  error,
  ...props
}: AppSelectFieldProps) {
  return (
    <View className="w-full flex-col gap-1.5">
      <AppText className="text-sm font-semibold text-muted-foreground">
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        className="min-h-[50px] w-full justify-center rounded-xl bg-card px-4 py-3.5 active:opacity-80"
        {...props}
      >
        <AppRow className="items-center justify-between gap-3">
          <AppText
            className={`flex-1 text-base ${
              value ? "text-foreground" : "text-muted-foreground"
            }`}
            numberOfLines={1}
          >
            {value || placeholder}
          </AppText>
          <AppIcon
            name="chevronDown"
            size={18}
            colorToken="--foreground"
            accessibilityLabel={placeholder}
          />
        </AppRow>
      </Pressable>
      {error && (
        <AppText className="text-xs font-medium text-destructive mt-0.5">
          {error}
        </AppText>
      )}
    </View>
  );
}
