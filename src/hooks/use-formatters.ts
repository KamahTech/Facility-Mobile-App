import React from "react";
import { useI18n } from "@/hooks/use-i18n";

export function useFormatters() {
  const { language, isRTL } = useI18n();

  const formatCurrency = React.useCallback(
    (val?: number | null) => {
      const numericVal = typeof val === "number" && !isNaN(val) ? val : 0;
      const formatted = new Intl.NumberFormat(language, {
        notation: "standard",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(numericVal);

      return isRTL ? `${formatted} $` : `$${formatted}`;
    },
    [language, isRTL],
  );

  const formatDate = React.useCallback(
    (dateString?: string) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
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
