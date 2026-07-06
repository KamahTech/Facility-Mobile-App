import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";

const houseIcon = require("@/assets/icons/house.png");

type DueBalanceCardProps = {
  /** The number of connected units to show. */
  unitsCount: number;
};

export function DueBalanceCard({ unitsCount }: DueBalanceCardProps) {
  const { isRTL, language, t } = useI18n();

  const formattedCount = React.useMemo(() => {
    const formatter = new Intl.NumberFormat(language);
    return formatter.format(unitsCount);
  }, [unitsCount, language]);

  const iconPositionStyle = React.useMemo(() => {
    return { end: -100, bottom: -100 };
  }, []);

  const textContainerStyle = React.useMemo(() => {
    return { paddingEnd: 150 };
  }, []);

  // Flip the house icon image horizontally in Arabic language mode
  const iconFlipStyle = React.useMemo(() => {
    return language === "ar" ? { transform: [{ scaleX: -1 }] } : undefined;
  }, [language]);

  const handlePress = () => {
    router.push("/profile/owner-units" as Href);
  };

  return (
    <Pressable
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
        {/* Connected Units Label Row */}
        <AppRow
          className="items-center gap-1.5"
          style={{
            alignSelf: "flex-start",
          }}
        >
          <AppText className="text-base font-bold text-emerald-100/90 uppercase tracking-wider">
            {t("connectUnit.connectedTitle")}
          </AppText>
          <AppIcon
            name={isRTL ? "arrowUpLeft" : "arrowUpRight"}
            size={18}
            color="rgba(167, 243, 208, 0.9)"
          />
        </AppRow>

        {/* Connected Units Count Number */}
        <AppText 
          className="text-4xl font-bold text-white tracking-tight"
          style={{
            alignSelf: "flex-start",
          }}
        >
          {formattedCount}
        </AppText>
      </View>

      {/* 3D House icon (Positioned absolutely in bottom-end corner and clipped) */}
      <Image
        source={houseIcon}
        style={[
          { width: 320, height: 320, position: "absolute" },
          iconPositionStyle,
          iconFlipStyle,
        ]}
        contentFit="contain"
      />
    </Pressable>
  );
}
