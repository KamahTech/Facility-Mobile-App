import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";

const houseIcon = require("@/assets/icons/house.png");

type DueBalanceCardProps = {
  /** The number of connected units to show. */
  unitsCount: number;
};

export function DueBalanceCard({ unitsCount }: DueBalanceCardProps) {
  const { isRTL, language, t } = useI18n();
  const primaryColor = useThemeToken("--primary") as string;
  const primaryForeground = useThemeToken("--primary-foreground") as string;

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
    router.push("/home/connect-unit" as Href);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        borderRadius: 24,
        padding: 24,
        backgroundColor: primaryColor || "#DBEE69",
        minHeight: 160,
      }}
      className="w-full overflow-hidden shadow-lg relative flex-col justify-between"
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={["#DFEE7C", "#D0DE5A"]}
        locations={[0, 0.35]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
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
          <AppText className="text-base font-bold text-primary-foreground/80 uppercase tracking-wider">
            {t("connectUnit.connectedTitle")}
          </AppText>
          <AppIcon
            name={isRTL ? "arrowUpLeft" : "arrowUpRight"}
            size={18}
            color={primaryForeground}
          />
        </AppRow>

        {/* Connected Units Count Number */}
        <AppText 
          className="text-4xl font-extrabold text-primary-foreground tracking-tight"
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
