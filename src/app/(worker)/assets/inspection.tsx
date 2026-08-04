import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { router } from "@/lib/navigation";
import { type Href } from "expo-router";
import { AppIcon } from "@/components/app-icon";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useToastStore } from "@/stores/toast-store";
import {
  useInspectionDetailQuery,
  useSaveInspectionMutation,
  useSubmitInspectionMutation,
} from "@/hooks/use-asset-inspection";
import { useAssetInspectionStore } from "@/stores/asset-inspection-store";

import { ChecklistItemCard } from "@/components/assets/checklist-item-card";
import { InspectionPhotoPicker } from "@/components/assets/inspection-photo-picker";
import { InspectionStateBadge } from "@/components/assets/inspection-state-badge";
import { ScreenHeader } from "@/components/screen-header";
import type { ChecklistItemResult, FinalInspectionResult } from "@/lib/api/asset-inspection";

export default function InspectionEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const inspectionId = Array.isArray(id) ? id[0] : id || "";

  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const { resolvedTheme } = useTheme();
  const mutedForeground = useThemeToken("--muted-foreground");
  const foreground = useThemeToken("--foreground");
  const border = useThemeToken("--border");
  const primaryColor = useThemeToken("--primary");

  const { data: inspection, isLoading } = useInspectionDetailQuery(inspectionId);
  const saveMutation = useSaveInspectionMutation();
  const submitMutation = useSubmitInspectionMutation();

  const {
    activeDrafts,
    initDraft,
    updateChecklistItem,
    updateOverallNotes,
    updateFinalResult,
    addPhoto,
    removePhoto,
    getDraftPayload,
  } = useAssetInspectionStore();

  const draft = activeDrafts[inspectionId];

  // Initialize draft store when inspection data loads
  React.useEffect(() => {
    if (inspection) {
      initDraft(inspectionId, {
        notes: inspection.notes || "",
        finalResult: inspection.result,
        checklist: inspection.checklist || [],
        photos: inspection.photos || [],
      });
    }
  }, [inspection, inspectionId, initDraft]);

  const checklistItems = inspection?.checklist || [];

  const handleSaveDraft = async () => {
    if (saveMutation.isPending || submitMutation.isPending) return;

    const payload = getDraftPayload(inspectionId);
    try {
      await saveMutation.mutateAsync({
        inspectionId,
        payload,
      });
      useToastStore.getState().showToast(t("inspection.saveSuccess"), "success");
    } catch {
      // Handled by apiRequest toast
    }
  };

  const handleSubmit = async () => {
    if (saveMutation.isPending || submitMutation.isPending) return;

    // Validate required checklist items
    const localChecklist = draft?.checklist || {};
    const uncompletedRequired = checklistItems.filter((item) => {
      if (!item.required) return false;
      const res = localChecklist[item.id]?.result || item.result;
      return !res || String(res) === "false";
    });

    if (uncompletedRequired.length > 0) {
      useToastStore
        .getState()
        .showToast(t("inspection.validation.requiredItems"), "error");
      return;
    }

    // Validate final result selected
    const selectedFinalResult = draft?.finalResult || inspection?.result;
    if (!selectedFinalResult || String(selectedFinalResult) === "false") {
      useToastStore
        .getState()
        .showToast(t("inspection.validation.resultRequired"), "error");
      return;
    }

    Alert.alert(
      t("inspection.submitConfirmTitle"),
      t("inspection.submitConfirmMessage"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("inspection.submit"),
          style: "default",
          onPress: async () => {
            try {
              const payload = getDraftPayload(inspectionId);
              const submitted = await submitMutation.mutateAsync({
                inspectionId,
                payload,
              });

              useToastStore
                .getState()
                .showToast(t("inspection.submitSuccess"), "success");

              router.replace({
                pathname: "/(worker)/assets/inspection-detail",
                params: { id: submitted.id },
              } as any);
            } catch {
              // Handled by apiRequest toast
            }
          },
        },
      ]
    );
  };

  if (isLoading || !draft) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <AppActivityIndicator size="large" />
      </View>
    );
  }

  const isSaving = saveMutation.isPending || submitMutation.isPending;
  const hasAnyFailItem = Object.values(draft.checklist).some((i) => i.result === "fail");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />

      {/* Reusable Screen Header */}
      <ScreenHeader title={t("inspection.editorTitle")} onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 120 }}
        className="flex-1"
      >
        {/* Asset Header Info */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1 me-2"
              numberOfLines={1}
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {inspection?.name || t("assets.detailsTitle")}
            </Text>
            <InspectionStateBadge state={inspection?.state || "in_progress"} result={inspection?.result} />
          </View>
          <Text
            className="text-lg font-bold text-foreground"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {inspection?.assetName}
          </Text>
        </View>

        {/* Checklist Items Section */}
        <View className="mb-4">
          <Text
            className="text-sm font-bold text-foreground mb-3"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            Checklist ({checklistItems.length} items)
          </Text>

          {checklistItems.map((item) => {
            const currentItemState = draft.checklist[item.id] || {
              result: item.result,
              notes: item.notes || "",
            };

            return (
              <ChecklistItemCard
                key={item.id}
                id={item.id}
                name={item.name}
                instructions={item.instructions}
                required={item.required}
                result={currentItemState.result}
                notes={currentItemState.notes}
                onResultChange={(res) => updateChecklistItem(inspectionId, item.id, res)}
                onNotesChange={(notes) =>
                  updateChecklistItem(inspectionId, item.id, currentItemState.result, notes)
                }
              />
            );
          })}
        </View>

        {/* Photo Upload Section */}
        <InspectionPhotoPicker
          photos={draft.photos}
          onAddPhoto={(photo) => addPhoto(inspectionId, photo)}
          onRemovePhoto={(photoId) => removePhoto(inspectionId, photoId)}
        />

        {/* Overall Notes */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-4">
          <Text
            className="text-sm font-bold text-foreground mb-2"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("inspection.overallNotes")}
          </Text>
          <TextInput
            value={draft.notes}
            onChangeText={(txt) => updateOverallNotes(inspectionId, txt)}
            placeholder={t("inspection.overallNotesPlaceholder")}
            placeholderTextColor={mutedForeground}
            multiline
            numberOfLines={4}
            maxLength={10000}
            style={{
              writingDirection: isRTL ? "rtl" : "ltr",
              color: foreground,
              borderColor: border,
              textAlignVertical: "top",
            }}
            className="bg-background border rounded-xl p-3.5 text-sm min-h-[110px]"
          />
        </View>

        {/* Final Result Selection */}
        <View className="bg-card border border-border rounded-2xl p-4 mb-4">
          <Text
            className="text-sm font-bold text-foreground mb-1"
            style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
          >
            {t("inspection.resultLabel")}
          </Text>

          {hasAnyFailItem ? (
            <View className="bg-destructive/10 border border-destructive/20 p-2.5 rounded-xl my-2">
              <Text
                className="text-xs text-destructive font-semibold"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {t("inspection.validation.failedAutoSelected")}
              </Text>
            </View>
          ) : null}

          <View className="flex-row gap-3 mt-2">
            {(
              [
                { value: "passed", labelKey: "inspection.result.passed", color: "text-emerald-600 dark:text-emerald-400 font-bold", bg: "bg-emerald-500/15 border-emerald-500" },
                { value: "failed", labelKey: "inspection.result.failed", color: "text-destructive font-bold", bg: "bg-destructive/15 border-destructive" },
              ] as const
            ).map((opt) => {
              const isSelected = draft.finalResult === opt.value;
              const isDisabled = hasAnyFailItem && opt.value === "passed";

              return (
                <Pressable
                  key={opt.value}
                  disabled={isDisabled}
                  onPress={() => updateFinalResult(inspectionId, opt.value as FinalInspectionResult)}
                  className={`flex-1 py-3 rounded-xl border items-center justify-center ${
                    isSelected ? opt.bg : "bg-secondary/40 border-transparent"
                  } ${isDisabled ? "opacity-40" : "active:opacity-80"}`}
                >
                  <Text
                    className={`text-xs ${
                      isSelected ? opt.color : "text-muted-foreground font-medium"
                    }`}
                    style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
                  >
                    {t(opt.labelKey as any)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Buttons */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        className="absolute bottom-0 start-0 end-0 bg-card border-t border-border p-4 flex-row gap-3 z-50 shadow-lg"
      >
        <Pressable
          onPress={handleSaveDraft}
          disabled={isSaving}
          className={`flex-1 py-3.5 rounded-xl border border-border bg-secondary items-center justify-center ${
            isSaving ? "opacity-60" : "active:opacity-80"
          }`}
        >
          {saveMutation.isPending ? (
            <AppActivityIndicator size="small" />
          ) : (
            <Text
              className="text-sm font-bold text-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("inspection.saveDraft")}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          disabled={isSaving}
          className={`flex-1 py-3.5 rounded-xl bg-primary items-center justify-center ${
            isSaving ? "opacity-60" : "active:opacity-90"
          }`}
        >
          {submitMutation.isPending ? (
            <AppActivityIndicator size="small" />
          ) : (
            <Text
              className="text-sm font-bold text-primary-foreground"
              style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
            >
              {t("inspection.submit")}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
