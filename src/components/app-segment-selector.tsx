import React from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/app-text";
import { AppRow } from "@/components/app-row";

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
};

export function AppSegmentSelector({
  label,
  options,
  selectedValue,
  onSelect,
  containerClassName = "",
}: AppSegmentSelectorProps) {
  return (
    <View className={`w-full flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <AppText className="text-sm font-semibold text-muted-foreground">
          {label}
        </AppText>
      )}
      <AppRow className="w-full bg-secondary p-1 rounded-xl gap-1">
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              className={`flex-1 py-3 rounded-lg items-center justify-center ${
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
        })}
      </AppRow>
    </View>
  );
}
