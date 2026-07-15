import React from "react";
import { View, Alert, Text } from "react-native";
import { Stack } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { ScreenHeader } from "@/components/screen-header";
import { AppInput } from "@/components/app-input";
import { AppButton } from "@/components/app-button";
import { AppDateTimeField } from "@/components/app-date-time-field";
import { AppSelectField } from "@/components/app-select-field";
import { UnitSelectBottomSheet } from "@/components/unit-select-bottom-sheet";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { KeyboardAwareScrollContent } from "@/components/keyboard-aware-scroll-content";
import { VisitorPurposeBottomSheet } from "@/components/visitor-purpose-bottom-sheet";
import {
  visitorPurposeOptions,
  type VisitorPurposeId,
} from "@/constants/visitor-purposes";
import { useBottomSheetPresentation } from "@/hooks/use-bottom-sheet-presentation";
import { useI18n } from "@/hooks/use-i18n";
import { useCommunityStore } from "@/stores/community-store";
import { getTodayAtMidnight } from "@/lib/date-time";
import { useUnitStore } from "@/stores/unit-store";
import { getConnectedUnitReference } from "@/lib/unit-reference";

type InviteVisitorFormValues = {
  visitorName: string;
  visitDate: string;
  visitTime: string;
  purpose: string;
  unitId: string;
};

export default function InviteVisitorScreen() {
  const { isRTL, t } = useI18n();
  const insets = useAppInsets();
  const { createVisitor, loading, error, clearError } = useCommunityStore();
  const { units, loading: unitsLoading } = useUnitStore();
  const [localLoading, setLocalLoading] = React.useState(false);
  const purposeSheet = useBottomSheetPresentation();
  const unitSheet = useBottomSheetPresentation();
  const inviteVisitorSchema = React.useMemo(
    () =>
      z.object({
        visitorName: z.string().min(1, t("validation.required")),
        visitDate: z
          .string()
          .min(1, t("validation.required"))
          .regex(/^\d{4}-\d{2}-\d{2}$/, t("validation.dateFormat")),
        visitTime: z
          .string()
          .min(1, t("validation.required"))
          .regex(/^\d{2}:\d{2}$/, t("validation.timeFormat")),
        purpose: z.string().min(1, t("validation.required")),
        unitId: z.string().min(1, t("tickets.noUnitSelected")),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InviteVisitorFormValues>({
    resolver: zodResolver(inviteVisitorSchema),
    defaultValues: {
      visitorName: "",
      visitDate: "",
      visitTime: "",
      purpose: "",
      unitId: "",
    },
  });

  const selectedPurpose = useWatch({ control, name: "purpose" });
  const selectedUnitId = useWatch({ control, name: "unitId" });
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId) || null;
  const selectedPurposeOption = visitorPurposeOptions.find(
    (option) => option.id === selectedPurpose,
  );

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  React.useEffect(() => {
    if (units.length === 1 && !selectedUnitId) {
      setValue("unitId", units[0].id, { shouldValidate: true });
    }
  }, [selectedUnitId, setValue, units]);

  const onSubmit = async (data: InviteVisitorFormValues) => {
    clearError();
    setLocalLoading(true);
    try {
      if (!selectedUnit) {
        throw new Error(t("tickets.noUnitSelected"));
      }

      const invite = await createVisitor({
        visitorName: data.visitorName.trim(),
        visitDate: data.visitDate.trim(),
        visitTime: data.visitTime.trim(),
        purpose: data.purpose,
        ...getConnectedUnitReference(selectedUnit),
      });

      Alert.alert(
        t("inviteVisitor.successTitle"),
        `${t("inviteVisitor.successDesc")}\n\n${t("inviteVisitor.accessCode")}: ${invite.accessCode}`,
        [{ text: t("common.ok"), onPress: () => router.back() }],
      );
    } catch (e: unknown) {
      Alert.alert(
        t("common.error"),
        e instanceof Error ? e.message : t("errors.generic"),
      );
    } finally {
      setLocalLoading(false);
    }
  };

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

      <ScreenHeader
        title={t("quickActions.inviteVisitor")}
        onBack={() => router.back()}
      />

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
          {t("quickActions.inviteVisitorDescription")}
        </Text>

        <View className="flex-col gap-6">
          <Controller
            control={control}
            name="visitorName"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label={t("inviteVisitor.visitorName")}
                placeholder={t("inviteVisitor.visitorNamePlaceholder")}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.visitorName?.message}
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
            name="visitDate"
            render={({ field: { onChange, value } }) => (
              <AppDateTimeField
                label={t("inviteVisitor.visitDate")}
                placeholder={t("inviteVisitor.visitDatePlaceholder")}
                value={value}
                onChange={onChange}
                mode="date"
                minimumDate={getTodayAtMidnight()}
                error={errors.visitDate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="visitTime"
            render={({ field: { onChange, value } }) => (
              <AppDateTimeField
                label={t("inviteVisitor.visitTime")}
                placeholder={t("inviteVisitor.visitTimePlaceholder")}
                value={value}
                onChange={onChange}
                mode="time"
                error={errors.visitTime?.message}
              />
            )}
          />

          <AppSelectField
            label={t("inviteVisitor.purpose")}
            placeholder={t("inviteVisitor.purposePlaceholder")}
            value={
              selectedPurposeOption
                ? t(selectedPurposeOption.labelKey)
                : undefined
            }
            onPress={purposeSheet.present}
            error={errors.purpose?.message}
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
              label={t("inviteVisitor.submit")}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>
      </KeyboardAwareScrollContent>

      <FullScreenLoader visible={localLoading || loading || unitsLoading} />

      <UnitSelectBottomSheet
        isPresented={unitSheet.isPresented}
        units={units}
        selectedUnitId={selectedUnit?.id}
        onDismiss={unitSheet.dismiss}
        onSelect={(unit) => {
          setValue("unitId", unit.id, { shouldValidate: true });
        }}
      />

      <VisitorPurposeBottomSheet
        isPresented={purposeSheet.isPresented}
        selectedPurpose={selectedPurpose as VisitorPurposeId}
        onDismiss={purposeSheet.dismiss}
        onSelect={(val) => {
          setValue("purpose", val, { shouldValidate: true });
        }}
      />
    </View>
  );
}
