import React from "react";
import { View, Text } from "react-native";
import { useI18n } from "@/hooks/use-i18n";
import type { InspectionState, FinalInspectionResult } from "@/lib/api/asset-inspection";

interface InspectionStateBadgeProps {
  state: InspectionState;
  result?: FinalInspectionResult;
}

export function InspectionStateBadge({ state, result }: InspectionStateBadgeProps) {
  const { t, isRTL } = useI18n();

  const stateConfig: Record<InspectionState, { bg: string; text: string; labelKey: string }> = {
    draft: {
      bg: "bg-slate-500/10 border-slate-500/20",
      text: "text-slate-600 dark:text-slate-300",
      labelKey: "inspection.state.draft",
    },
    in_progress: {
      bg: "bg-blue-500/10 border-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      labelKey: "inspection.state.in_progress",
    },
    submitted: {
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      labelKey: "inspection.state.submitted",
    },
    reviewed: {
      bg: "bg-purple-500/10 border-purple-500/20",
      text: "text-purple-600 dark:text-purple-400",
      labelKey: "inspection.state.reviewed",
    },
    approved: {
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      labelKey: "inspection.state.approved",
    },
    rejected: {
      bg: "bg-destructive/10 border-destructive/20",
      text: "text-destructive",
      labelKey: "inspection.state.rejected",
    },
  };

  const current = stateConfig[state] || stateConfig.draft;

  return (
    <View className="flex-row items-center gap-1.5">
      <View className={`px-2.5 py-1 rounded-full border ${current.bg}`}>
        <Text
          className={`text-xs font-semibold ${current.text}`}
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t(current.labelKey as any)}
        </Text>
      </View>
      {Boolean(result) && String(result) !== "false" && (
        <View
          className={`px-2 py-0.5 rounded-full border ${
            result === "passed"
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-destructive/10 border-destructive/20"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              result === "passed" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
            }`}
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {result === "passed" ? t("inspection.result.passed") : t("inspection.result.failed")}
          </Text>
        </View>
      )}
    </View>
  );
}
