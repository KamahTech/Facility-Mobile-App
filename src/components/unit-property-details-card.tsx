import React from "react";
import { View, Text } from "react-native";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useI18n } from "@/hooks/use-i18n";
import type { PropertyContext } from "@/stores/owner-store";

export type UnitPropertyDetailsCardProps = {
  data?: PropertyContext | null;
  isLoading?: boolean;
};

export function hasPropertyDetails(data?: PropertyContext | null): boolean {
  if (!data) return false;
  return Boolean(
    data.propertyType ||
    data.constructionState ||
    data.deliveryState ||
    data.saleContractDate ||
    data.deliveryDate ||
    data.location ||
    data.publicLicensingState ||
    data.licenseNumber ||
    (data.roomCount !== undefined && data.roomCount !== null && data.roomCount > 0) ||
    (data.bathroomCount !== undefined && data.bathroomCount !== null && data.bathroomCount > 0)
  );
}

export function UnitPropertyDetailsCard({
  data,
  isLoading,
}: UnitPropertyDetailsCardProps) {
  const { isRTL, t } = useI18n();

  const hasDetails = hasPropertyDetails(data);

  return (
    <View className="w-full bg-card rounded-3xl p-5 flex-col gap-4 shadow-sm">
      <AppText
        className="text-base font-bold text-foreground text-start"
        style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
      >
        {t("ownerUnits.propertyDetails")}
      </AppText>

      {isLoading && !data ? (
        <View className="py-4 items-center justify-center">
          <AppActivityIndicator size="small" />
        </View>
      ) : !hasDetails ? (
        <AppText
          className="text-sm text-muted-foreground py-2 text-start"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("ownerUnits.noPropertyDetails")}
        </AppText>
      ) : (
        <View className="flex-col gap-3">
          {data?.propertyType && (
            <AppRow className="justify-between items-center gap-3">
              <AppText
                className="text-sm text-muted-foreground text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("ownerUnits.propertyType")}
              </AppText>
              <Text
                className="text-sm font-semibold text-foreground text-end"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {data.propertyType}
              </Text>
            </AppRow>
          )}
          {data?.constructionState && (
            <AppRow className="justify-between items-center gap-3">
              <AppText
                className="text-sm text-muted-foreground text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("ownerUnits.constructionState")}
              </AppText>
              <View className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/20">
                <Text
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 capitalize"
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {data.constructionState.replace("_", " ")}
                </Text>
              </View>
            </AppRow>
          )}
          {data?.deliveryState && (
            <AppRow className="justify-between items-center gap-3">
              <AppText
                className="text-sm text-muted-foreground text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("ownerUnits.deliveryState")}
              </AppText>
              <View
                className={`px-2.5 py-0.5 rounded-full ${
                  data.deliveryState === "delivered"
                    ? "bg-green-50 dark:bg-green-950/20"
                    : "bg-amber-50 dark:bg-amber-950/20"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold capitalize ${
                    data.deliveryState === "delivered"
                      ? "text-green-600 dark:text-green-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                  style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                >
                  {data.deliveryState.replace("_", " ")}
                </Text>
              </View>
            </AppRow>
          )}
          {data?.saleContractDate && (
            <AppRow className="justify-between items-center gap-3">
              <AppText
                className="text-sm text-muted-foreground text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("ownerUnits.saleContractDate")}
              </AppText>
              <Text
                className="text-sm font-semibold text-foreground text-end"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {data.saleContractDate}
              </Text>
            </AppRow>
          )}
          {data?.deliveryDate && (
            <AppRow className="justify-between items-center gap-3">
              <AppText
                className="text-sm text-muted-foreground text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("ownerUnits.deliveryDate")}
              </AppText>
              <Text
                className="text-sm font-semibold text-foreground text-end"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {data.deliveryDate}
              </Text>
            </AppRow>
          )}
          {((data?.roomCount !== undefined && data?.roomCount !== null && data?.roomCount > 0) ||
            (data?.bathroomCount !== undefined && data?.bathroomCount !== null && data?.bathroomCount > 0)) && (
            <AppRow className="justify-between items-center gap-3">
              <AppText
                className="text-sm text-muted-foreground text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("ownerUnits.rooms")} / {t("ownerUnits.bathrooms")}
              </AppText>
              <Text
                className="text-sm font-semibold text-foreground text-end"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {data?.roomCount ?? 0} / {data?.bathroomCount ?? 0}
              </Text>
            </AppRow>
          )}
          {data?.location && (
            <AppRow className="justify-between items-center gap-3">
              <AppText
                className="text-sm text-muted-foreground text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("ownerUnits.location")}
              </AppText>
              <Text
                className="text-sm font-semibold text-foreground text-end"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {data.location}
              </Text>
            </AppRow>
          )}
          {data?.publicLicensingState && (
            <AppRow className="justify-between items-center gap-3">
              <AppText
                className="text-sm text-muted-foreground text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("ownerUnits.licensingState")}
              </AppText>
              <Text
                className="text-sm font-semibold text-foreground text-end capitalize"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {data.publicLicensingState}
              </Text>
            </AppRow>
          )}
          {data?.licenseNumber && (
            <AppRow className="justify-between items-center gap-3">
              <AppText
                className="text-sm text-muted-foreground text-start"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("ownerUnits.licenseNumber")}
              </AppText>
              <Text
                className="text-sm font-semibold text-foreground text-end"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {data.licenseNumber}
              </Text>
            </AppRow>
          )}
        </View>
      )}
    </View>
  );
}
