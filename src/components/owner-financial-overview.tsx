import React from "react";
import { View } from "react-native";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppText } from "@/components/app-text";
import type { AppIconName } from "@/constants/icons";
import { useFormatters } from "@/hooks/use-formatters";
import { useI18n } from "@/hooks/use-i18n";
import type { OwnerStatement } from "@/stores/owner-store";

type OwnerFinancialOverviewProps = {
  statement: OwnerStatement;
};

type FinancialStatusRowProps = {
  icon: AppIconName;
  label: string;
  value: string;
  tone: "paid" | "unpaid" | "overdue";
};

type TotalInvoicedSummaryProps = {
  label: string;
  value: string;
};

const rowToneStyles = {
  paid: {
    container: "bg-emerald-500/5 dark:bg-emerald-950/10",
    iconWrap: "bg-emerald-500/10",
    iconColor: "#10B981",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  unpaid: {
    container: "bg-amber-500/5 dark:bg-amber-950/10",
    iconWrap: "bg-amber-500/10",
    iconColor: "#F59E0B",
    value: "text-amber-600 dark:text-amber-400",
  },
  overdue: {
    container: "bg-rose-500/5 dark:bg-rose-950/10",
    iconWrap: "bg-rose-500/10",
    iconColor: "#F43F5E",
    value: "text-rose-600 dark:text-rose-400",
  },
} as const;

function FinancialStatusRow({ icon, label, value, tone }: FinancialStatusRowProps) {
  const style = rowToneStyles[tone];

  return (
    <AppRow
      className={`items-center justify-between rounded-2xl ${style.container}`}
      style={{ columnGap: 12, paddingHorizontal: 14, paddingVertical: 14 }}
    >
      <AppRow className="items-center flex-1 min-w-0" style={{ columnGap: 12 }}>
        <View className={`w-8 h-8 rounded-lg items-center justify-center ${style.iconWrap}`}>
          <AppIcon name={icon} size={16} color={style.iconColor} />
        </View>
        <AppText className="text-sm font-semibold text-foreground flex-1 text-start" numberOfLines={2}>
          {label}
        </AppText>
      </AppRow>
      <AppText className={`text-sm font-extrabold ${style.value}`} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
    </AppRow>
  );
}

function TotalInvoicedSummary({ label, value }: TotalInvoicedSummaryProps) {
  return (
    <View
      className="overflow-hidden rounded-[22px] bg-secondary"
      style={{ paddingHorizontal: 16, paddingVertical: 16 }}
    >
      <AppRow className="items-center" style={{ columnGap: 12 }}>
        <View className="w-11 h-11 rounded-2xl bg-primary items-center justify-center">
          <AppIcon name="invoices" size={21} colorToken="--primary-foreground" />
        </View>

        <View className="flex-1 min-w-0 flex-col" style={{ rowGap: 4 }}>
          <AppText className="text-xs font-bold text-muted-foreground text-start" numberOfLines={2}>
            {label}
          </AppText>
          <AppText
            className="text-[32px] leading-10 font-extrabold text-foreground text-start"
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            numberOfLines={1}
          >
            {value}
          </AppText>
        </View>
      </AppRow>
    </View>
  );
}

export function OwnerFinancialOverview({ statement }: OwnerFinancialOverviewProps) {
  const { t } = useI18n();
  const { formatCurrency } = useFormatters();
  const { totalSummary } = statement;

  return (
    <View
      className="w-full bg-card rounded-[28px] flex-col shadow-sm"
      style={{ padding: 16, rowGap: 16 }}
    >
      <View className="flex-col" style={{ rowGap: 4 }}>
        <AppText className="text-start text-base font-bold text-foreground">
          {t("ownerFinancials.title")}
        </AppText>
        <AppText className="text-start text-xs text-muted-foreground leading-5">
          {t("ownerFinancials.summaryDescription")}
        </AppText>
      </View>

      <TotalInvoicedSummary
        label={t("ownerFinancials.totalInvoiced")}
        value={formatCurrency(totalSummary.totalInvoiced)}
      />

      <View className="flex-col" style={{ rowGap: 12 }}>
        <FinancialStatusRow
          icon="check"
          label={t("ownerFinancials.paidAmount")}
          value={formatCurrency(totalSummary.paidAmount)}
          tone="paid"
        />
        <FinancialStatusRow
          icon="invoices"
          label={t("ownerFinancials.unpaidAmount")}
          value={formatCurrency(totalSummary.unpaidAmount)}
          tone="unpaid"
        />
        <FinancialStatusRow
          icon="feedback"
          label={t("ownerFinancials.overdueAmount")}
          value={formatCurrency(totalSummary.overdueAmount)}
          tone="overdue"
        />
      </View>
    </View>
  );
}
