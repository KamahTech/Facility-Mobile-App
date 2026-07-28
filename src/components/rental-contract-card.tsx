import React from "react";
import { View, Text, Pressable } from "react-native";
import { type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import type { RentalContract, ContractState, PaymentPeriod } from "@/lib/rental-types";

type RentalContractCardProps = {
  contract: RentalContract;
  onPress?: () => void;
};

export function RentalContractCard({ contract, onPress }: RentalContractCardProps) {
  const { isRTL, t } = useI18n();
  const { formatCurrency, formatDate } = useFormatters();

  const stateStyle = React.useMemo(() => {
    const state = contract.state as ContractState;
    switch (state) {
      case "active":
      case "rented":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
          text: "text-emerald-700 dark:text-emerald-300",
          label: t("rental.state." + state as any),
        };
      case "expired":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40",
          text: "text-amber-700 dark:text-amber-300",
          label: t("rental.state.expired"),
        };
      case "termination":
      case "cancelled":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/40",
          text: "text-rose-700 dark:text-rose-300",
          label: t("rental.state." + state as any),
        };
      case "draft":
      default:
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          label: t("rental.state.draft"),
        };
    }
  }, [contract.state, t]);

  const periodLabel = React.useMemo(() => {
    const period = contract.period as PaymentPeriod;
    const keyMap: Record<PaymentPeriod, string> = {
      monthly: "rental.periodMonthly",
      one_third: "rental.periodOneThird",
      quarterly: "rental.periodQuarterly",
      biannually: "rental.periodBiannually",
      annually: "rental.periodAnnually",
    };
    return t((keyMap[period] || "rental.periodMonthly") as any);
  }, [contract.period, t]);

  const unitsText = React.useMemo(() => {
    if (!contract.units || contract.units.length === 0) return "—";
    return contract.units.map((u) => u.name).join(", ");
  }, [contract.units]);

  const formattedPrice = formatCurrency(contract.rentalPrice, contract.currency?.code || "EGP");
  const formattedOutstanding = formatCurrency(contract.outstandingAmount, contract.currency?.code || "EGP");

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/rentals/contract-details?id=${contract.id}&type=${contract.contractType}` as Href);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      className="w-full p-4 rounded-2xl bg-card border border-border/50 mb-3 flex-col gap-3 active:opacity-90"
    >
      <AppRow className="w-full items-center justify-between">
        <AppRow className="items-center gap-2.5">
          <View className="w-9 h-9 rounded-xl bg-indigo-500/10 items-center justify-center">
            <AppIcon name="rentals" size={18} color="#6366F1" />
          </View>
          <View className="flex-col">
            <Text
              className="text-sm font-bold text-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {contract.reference}
            </Text>
            <Text
              className="text-[11px] font-medium text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {contract.contractType === "multi" ? t("rental.typeMulti") : t("rental.typeSingle")} • {periodLabel}
            </Text>
          </View>
        </AppRow>

        <View className={`px-2.5 py-1 rounded-full ${stateStyle.bg}`}>
          <Text
            className={`text-[10px] font-bold uppercase tracking-wider ${stateStyle.text}`}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {stateStyle.label}
          </Text>
        </View>
      </AppRow>

      {/* Units & Dates */}
      <View className="p-3 rounded-xl bg-muted/30 flex-col gap-1.5">
        <AppRow className="w-full justify-between items-center">
          <Text
            className="text-[11px] font-semibold text-muted-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.unitsCovered")}:
          </Text>
          <Text
            className="text-xs font-bold text-foreground flex-1 text-end"
            numberOfLines={1}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {unitsText}
          </Text>
        </AppRow>

        {contract.startDate && contract.endDate && (
          <AppRow className="w-full justify-between items-center">
            <Text
              className="text-[11px] font-semibold text-muted-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("rental.startDate")} — {t("rental.endDate")}:
            </Text>
            <Text
              className="text-xs font-medium text-foreground opacity-90"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
            </Text>
          </AppRow>
        )}
      </View>

      {/* Price & Outstanding */}
      <AppRow className="w-full items-end justify-between">
        <View className="flex-col">
          <Text
            className="text-[10px] font-semibold text-muted-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.rentalPrice")}
          </Text>
          <Text
            className="text-base font-extrabold text-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {formattedPrice}
          </Text>
        </View>

        <View className="flex-col items-end">
          <Text
            className="text-[10px] font-semibold text-muted-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("rental.remainingAmount")}
          </Text>
          <Text
            className="text-sm font-bold text-indigo-600 dark:text-indigo-400"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {formattedOutstanding}
          </Text>
        </View>
      </AppRow>
    </Pressable>
  );
}
