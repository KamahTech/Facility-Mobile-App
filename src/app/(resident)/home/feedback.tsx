import React from "react";
import { View, Alert, Text } from "react-native";
import { Stack, router } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { FullScreenLoader } from "@/components/full-screen-loader";
import { ScreenHeader } from "@/components/screen-header";
import { AppInput } from "@/components/app-input";
import { AppSegmentSelector } from "@/components/app-segment-selector";
import { AppButton } from "@/components/app-button";
import { KeyboardAwareScrollContent } from "@/components/keyboard-aware-scroll-content";
import { useI18n } from "@/hooks/use-i18n";
import { useCommunityStore } from "@/stores/community-store";
import { AppSelectField } from "@/components/app-select-field";
import { UnitSelectBottomSheet } from "@/components/unit-select-bottom-sheet";
import { useUnitStore } from "@/stores/unit-store";
import { useBottomSheetPresentation } from "@/hooks/use-bottom-sheet-presentation";

type FeedbackFormValues = {
  subject: string;
  category: "complaint" | "suggestion";
  details: string;
  unitId?: string;
};

export default function FeedbackScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const { submitFeedback, loading, error, clearError } = useCommunityStore();
  const { units } = useUnitStore();
  const unitSheet = useBottomSheetPresentation();
  const [localLoading, setLocalLoading] = React.useState(false);
  const feedbackSchema = React.useMemo(
    () =>
      z.object({
        subject: z.string().min(1, t("validation.required")),
        category: z.enum(["complaint", "suggestion"]),
        details: z.string().min(1, t("validation.required")),
        unitId: z.string().optional(),
      }),
    [t],
  );

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      subject: "",
      category: "complaint",
      details: "",
      unitId: "",
    },
  });

  const selectedUnitId = useWatch({ control, name: "unitId" });
  const selectedUnit = units.find(u => u.id === selectedUnitId) || null;

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: FeedbackFormValues) => {
    clearError();
    setLocalLoading(true);
    try {
      const payload: any = {
        subject: data.subject.trim(),
        category: data.category,
        details: data.details.trim(),
      };

      if (selectedUnit) {
        const idNum = parseInt(selectedUnit.id, 10);
        if (selectedUnit.source === "mobile_unit_link") {
          payload.mobileUnitLinkId = idNum;
        } else {
          payload.unitId = idNum;
        }
      }

      await submitFeedback(payload);

      Alert.alert(
        t("feedback.successTitle"),
        t("feedback.successDesc"),
        [{ text: t("common.ok"), onPress: () => router.back() }]
      );
    } catch (e: unknown) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.feedbackSubmitFailed"));
    } finally {
      setLocalLoading(false);
    }
  };

  const categoryOptions = [
    { label: t("feedback.categoryComplaint"), value: "complaint" },
    { label: t("feedback.categorySuggestion"), value: "suggestion" },
  ];

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader title={t("quickActions.feedback")} onBack={() => router.back()} />

      <KeyboardAwareScrollContent
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        <Text
          className="text-base leading-6 text-muted-foreground mb-8"
          style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
        >
          {t("quickActions.feedbackDescription")}
        </Text>

        <View className="flex-col gap-6">
          <Controller
            control={control}
            name="subject"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label={t("feedback.subject")}
                placeholder={t("feedback.subjectPlaceholder")}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.subject?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <AppSegmentSelector
                label={t("feedback.category")}
                options={categoryOptions}
                selectedValue={value}
                onSelect={onChange}
              />
            )}
          />

          <AppSelectField
            label={t("tickets.selectUnit")}
            placeholder={t("tickets.selectUnit")}
            value={
              selectedUnit
                ? `${selectedUnit.buildingNumber} - ${selectedUnit.unitNumber}`
                : undefined
            }
            onPress={unitSheet.present}
            error={errors.unitId?.message}
          />

          <Controller
            control={control}
            name="details"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label={t("feedback.details")}
                placeholder={t("feedback.detailsPlaceholder")}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.details?.message}
                multiline={true}
                numberOfLines={4}
              />
            )}
          />

          {error && (
            <View className="bg-destructive/10 p-4 rounded-xl mt-2">
              <Text
                className="text-sm font-semibold text-destructive"
                style={{ writingDirection: isRTL ? "rtl" : "ltr" }}
              >
                {error}
              </Text>
            </View>
          )}

          <View className="mt-4">
            <AppButton
              label={t("feedback.submit")}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>
      </KeyboardAwareScrollContent>

      <UnitSelectBottomSheet
        isPresented={unitSheet.isPresented}
        units={units}
        selectedUnitId={selectedUnit?.id}
        onDismiss={unitSheet.dismiss}
        onSelect={(unit) => {
          setValue("unitId", unit?.id || "", { shouldValidate: true });
        }}
      />
      <FullScreenLoader visible={localLoading || loading} />
    </View>
  );
}
