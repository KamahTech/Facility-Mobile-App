import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";

const dollarIcon = require("@/assets/icons/3dicons-dollar-dynamic-color.png");

type DueBalanceCardProps = {
  /** The outstanding due balance amount to show. */
  dueAmount: number;
};

export function DueBalanceCard({ dueAmount }: DueBalanceCardProps) {
  const { isRTL, language, t } = useI18n();

  const formattedAmount = React.useMemo(() => {
    const compactFormatter = new Intl.NumberFormat(language, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 2,
    });
    const compacted = compactFormatter.format(dueAmount);

    return isRTL
      ? `${compacted} $`
      : `$${compacted}`;
  }, [dueAmount, isRTL, language]);

  const iconPositionStyle = React.useMemo(() => {
    return { end: -24, bottom: -32 };
  }, []);

  const textContainerStyle = React.useMemo(() => {
    return { paddingEnd: 110 };
  }, []);

  // Flip the dollar icon image horizontally in English language mode
  const iconFlipStyle = React.useMemo(() => {
    return language === "en" ? { transform: [{ scaleX: -1 }] } : undefined;
  }, [language]);

  const handlePress = () => {
    router.push("/profile/owner-units" as Href);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={{
        borderRadius: 24,
        padding: 24,
        backgroundColor: "#2E5A44",
        minHeight: 160,
      }}
      className="w-full overflow-hidden shadow-lg border border-white/10 relative flex-col justify-between"
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={["#2E5A44", "#1f4a34"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        className="flex-col justify-between flex-1"
        style={textContainerStyle}
      >
        {/* Money Number */}
        <AppText className="text-4xl font-bold text-white tracking-tight">
          {formattedAmount}
        </AppText>

        {/* Due Text Label Row */}
        <AppRow
          className="flex-row items-center gap-1.5"
          style={{
            alignSelf: isRTL ? "flex-end" : "flex-start",
          }}
        >
          <AppText className="text-base font-bold text-emerald-100/90 uppercase tracking-wider">
            {t("welcomeCard.dueBalance")}
          </AppText>
          <AppIcon
            name={isRTL ? "arrowUpLeft" : "arrowUpRight"}
            size={18}
            color="rgba(167, 243, 208, 0.9)"
          />
        </AppRow>
      </View>

      {/* 3D Dollar Icon (Positioned absolutely in bottom-end corner and clipped) */}
      <Image
        source={dollarIcon}
        style={[
          { width: 160, height: 160, position: "absolute" },
          iconPositionStyle,
          iconFlipStyle,
        ]}
        contentFit="contain"
      />
    </TouchableOpacity>
  );
}
