import React from "react";
import { useI18n } from "@/hooks/use-i18n";
import { parseDateTimeValue } from "@/lib/date-time";

export function useFormatters() {
  const { language, isRTL } = useI18n();

  const formatCurrency = React.useCallback(
    (val?: number | null, currencyCode?: string | null) => {
      const numericVal = typeof val === "number" && !isNaN(val) ? val : 0;
      const code = currencyCode || "EGP";
      try {
        return new Intl.NumberFormat(language, {
          style: "currency",
          currency: code,
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        }).format(numericVal);
      } catch {
        const formatted = new Intl.NumberFormat(language, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        }).format(numericVal);
        return isRTL ? `${formatted} ${code}` : `${code} ${formatted}`;
      }
    },
    [language, isRTL],
  );

  const formatDate = React.useCallback(
    (dateString?: string) => {
      if (!dateString) return "";
      try {
        const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
          ? parseDateTimeValue(dateString, "date")
          : new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString(language, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return dateString;
      }
    },
    [language],
  );

  return { formatCurrency, formatDate };
}
