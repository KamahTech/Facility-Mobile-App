import React from "react";
import { Pressable, View, useWindowDimensions } from "react-native";

import { AppText } from "@/components/app-text";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";

type AppSegmentOption = {
  label: string;
  value: string;
};

type AppSegmentSelectorProps = {
  label?: string;
  options: AppSegmentOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  containerClassName?: string;
  responsiveLayout?: boolean;
};

export function AppSegmentSelector({
  label,
  options,
  selectedValue,
  onSelect,
  containerClassName = "",
  responsiveLayout = false,
}: AppSegmentSelectorProps) {
  const { width } = useWindowDimensions();
  const { direction } = useI18n();
  const isVertical = responsiveLayout && width < 640;
  const optionsContent = options.map((option) => {
    const isSelected = option.value === selectedValue;
    return (
      <Pressable
        key={option.value}
        onPress={() => onSelect(option.value)}
        className={`${isVertical ? "w-full" : "flex-1"} py-3 rounded-lg items-center justify-center ${
          isSelected ? "bg-card shadow-sm" : ""
        }`}
      >
        <AppText
          className={`text-sm font-semibold ${
            isSelected ? "text-foreground font-bold" : "text-muted-foreground"
          }`}
        >
          {option.label}
        </AppText>
      </Pressable>
    );
  });

  return (
    <View className={`w-full flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <AppText className="text-sm font-semibold text-muted-foreground">
          {label}
        </AppText>
      )}
      {responsiveLayout ? (
        <View
          className="w-full bg-secondary p-1 rounded-xl gap-1"
          style={{
            flexDirection: isVertical
              ? "column"
              : direction === "rtl"
                ? "row-reverse"
                : "row",
          }}
        >
          {optionsContent}
        </View>
      ) : (
        <AppRow className="w-full bg-secondary p-1 rounded-xl gap-1">
          {optionsContent}
        </AppRow>
      )}
    </View>
  );
}
