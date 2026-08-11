import React from "react";
import { Pressable, View, Text, TextInput } from "react-native";
import { AppIcon } from "@/components/app-icon";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import type { ChecklistItemResult } from "@/lib/api/asset-inspection";

interface ChecklistItemCardProps {
  id: string;
  name: string;
  instructions?: string;
  required?: boolean;
  result: ChecklistItemResult;
  notes?: string;
  readOnly?: boolean;
  onResultChange?: (result: ChecklistItemResult) => void;
  onNotesChange?: (notes: string) => void;
}

export function ChecklistItemCard({
  name,
  instructions,
  required,
  result,
  notes = "",
  readOnly = false,
  onResultChange,
  onNotesChange,
}: ChecklistItemCardProps) {
  const { t, isRTL } = useI18n();
  const mutedForeground = useThemeToken("--muted-foreground");
  const foreground = useThemeToken("--foreground");
  const border = useThemeToken("--border");

  const [showNotesInput, setShowNotesInput] = React.useState(Boolean(notes));

  const options: { value: "pass" | "fail" | "na"; labelKey: string; activeColor: string; bgActive: string }[] = [
    {
      value: "pass",
      labelKey: "inspection.itemResult.pass",
      activeColor: "text-emerald-600 dark:text-emerald-400 font-bold",
      bgActive: "bg-emerald-500/15 border-emerald-500",
    },
    {
      value: "fail",
      labelKey: "inspection.itemResult.fail",
      activeColor: "text-destructive font-bold",
      bgActive: "bg-destructive/15 border-destructive",
    },
    {
      value: "na",
      labelKey: "inspection.itemResult.na",
      activeColor: "text-slate-600 dark:text-slate-300 font-bold",
      bgActive: "bg-slate-500/15 border-slate-400",
    },
  ];

  return (
    <View className="bg-card border border-border rounded-2xl p-4 mb-3">
      {/* Title and Required tag */}
      <View className="flex-row items-start justify-between mb-1">
        <Text
          className="text-sm font-bold text-foreground flex-1 me-2"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {name}
        </Text>
        {required && (
          <View className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
            <Text className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              {t("inspection.required")}
            </Text>
          </View>
        )}
      </View>

      {/* Instructions */}
      {instructions ? (
        <Text
          className="text-xs text-muted-foreground mb-3 leading-4"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {instructions}
        </Text>
      ) : null}

      {/* Option Selectors: Pass, Fail, N/A */}
      <View className="flex-row items-center gap-2 my-2">
        {options.map((opt) => {
          const isSelected = result === opt.value;
          return (
            <Pressable
              key={opt.value}
              disabled={readOnly}
              onPress={() => onResultChange?.(opt.value)}
              className={`flex-1 py-2 px-3 rounded-xl border items-center justify-center ${
                isSelected ? opt.bgActive : "bg-secondary/40 border-transparent"
              } ${readOnly ? "opacity-90" : "active:opacity-80"}`}
            >
              <Text
                className={`text-xs ${
                  isSelected ? opt.activeColor : "text-muted-foreground font-medium"
                }`}
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t(opt.labelKey as any)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Add / View Notes Section */}
      {!readOnly ? (
        <View className="mt-2">
          {!showNotesInput && !notes ? (
            <Pressable
              onPress={() => setShowNotesInput(true)}
              className="flex-row items-center gap-1 py-1"
            >
              <AppIcon name="notes" size={14} color={mutedForeground} />
              <Text className="text-xs font-semibold text-primary">
                {t("inspection.lineNotesPlaceholder")}
              </Text>
            </Pressable>
          ) : (
            <TextInput
              value={notes}
              onChangeText={onNotesChange}
              placeholder={t("inspection.lineNotesPlaceholder")}
              placeholderTextColor={mutedForeground}
              multiline
              numberOfLines={2}
              maxLength={1000}
              style={{
                writingDirection: isRTL ? "rtl" : "ltr",
                color: foreground,
                borderColor: border,
                textAlignVertical: "top",
              }}
              className="bg-background border rounded-xl p-2.5 text-xs mt-1 min-h-[56px]"
            />
          )}
        </View>
      ) : notes ? (
        <View className="mt-2 bg-secondary/30 p-2.5 rounded-xl">
          <Text
            className="text-xs text-muted-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {notes}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
