import React from "react";
import { Pressable } from "react-native";

import { AppChevron } from "@/components/app-chevron";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";

type SectionHeaderProps = {
  title: string;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
};

export function SectionHeader({
  title,
  showSeeAll = true,
  onSeeAllPress,
}: SectionHeaderProps) {
  const { t } = useI18n();

  return (
    <AppRow className="w-full items-center justify-between px-5 sm:px-8">
      <AppText
        className="text-start text-lg font-bold text-foreground animate-fade-in"
      >
        {title}
      </AppText>

      {showSeeAll && onSeeAllPress && (
        <Pressable
          onPress={onSeeAllPress}
          className="active:opacity-75"
          accessibilityRole="button"
        >
          <AppRow className="items-center gap-1">
            <AppText className="text-start text-sm font-bold text-foreground opacity-80">
              {t("actions.seeAll")}
            </AppText>
            <AppChevron size={14} />
          </AppRow>
        </Pressable>
      )}
    </AppRow>
  );
}
