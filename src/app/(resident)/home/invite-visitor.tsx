import React from "react";
import { View, ScrollView, Alert } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { AppInput } from "@/components/app-input";
import { AppButton } from "@/components/app-button";
import { AppSelectField } from "@/components/app-select-field";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { VisitorPurposeBottomSheet } from "@/components/visitor-purpose-bottom-sheet";
import { visitorPurposeOptions, type VisitorPurposeId } from "@/constants/visitor-purposes";
import { useBottomSheetPresentation } from "@/hooks/use-bottom-sheet-presentation";
import { useI18n } from "@/hooks/use-i18n";
import { useCommunityStore } from "@/stores/community-store";

type InviteVisitorFormValues = {
  visitorName: string;
  visitDate: string;
  visitTime: string;
  purpose: string;
};

export default function InviteVisitorScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { createVisitor, loading, error, clearError } = useCommunityStore();
  const [localLoading, setLocalLoading] = React.useState(false);
  const purposeSheet = useBottomSheetPresentation();
  const inviteVisitorSchema = React.useMemo(
    () =>
      z.object({
        visitorName: z.string().min(1, t("validation.required")),
        visitDate: z.string().min(1, t("validation.required")).regex(/^\d{4}-\d{2}-\d{2}$/, t("validation.dateFormat")),
        visitTime: z.string().min(1, t("validation.required")).regex(/^\d{2}:\d{2}$/, t("validation.timeFormat")),
        purpose: z.string().min(1, t("validation.required")),
      }),
    [t],
  );

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<InviteVisitorFormValues>({
    resolver: zodResolver(inviteVisitorSchema),
    defaultValues: {
      visitorName: "",
      visitDate: "",
      visitTime: "",
      purpose: "",
    },
  });

  const selectedPurpose = useWatch({ control, name: "purpose" });
  const selectedPurposeOption = visitorPurposeOptions.find((option) => option.id === selectedPurpose);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: InviteVisitorFormValues) => {
    clearError();
    setLocalLoading(true);
    try {
      const invite = await createVisitor({
        visitorName: data.visitorName.trim(),
        visitDate: data.visitDate.trim(),
        visitTime: data.visitTime.trim(),
        purpose: data.purpose,
      });

      Alert.alert(
        t("inviteVisitor.successTitle"),
        `${t("inviteVisitor.successDesc")}\n\n${t("inviteVisitor.accessCode")}: ${invite.accessCode}`,
        [{ text: t("common.ok"), onPress: () => router.back() }]
      );
    } catch (e: unknown) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.generic"));
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

      <ScreenHeader title={t("quickActions.inviteVisitor")} onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        <AppText className="text-start text-base leading-6 text-muted-foreground mb-8">
          {t("quickActions.inviteVisitorDescription")}
        </AppText>

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

          <Controller
            control={control}
            name="visitDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label={t("inviteVisitor.visitDate")}
                placeholder={t("inviteVisitor.visitDatePlaceholder")}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.visitDate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="visitTime"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label={t("inviteVisitor.visitTime")}
                placeholder={t("inviteVisitor.visitTimePlaceholder")}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.visitTime?.message}
              />
            )}
          />

          <AppSelectField
            label={t("inviteVisitor.purpose")}
            placeholder={t("inviteVisitor.purposePlaceholder")}
            value={selectedPurposeOption ? t(selectedPurposeOption.labelKey) : undefined}
            onPress={purposeSheet.present}
            error={errors.purpose?.message}
          />

          {error && (
            <View className="bg-destructive/10 p-4 rounded-xl border border-destructive/25 mt-2">
              <AppText className="text-sm font-semibold text-destructive text-start">
                {error}
              </AppText>
            </View>
          )}

          <View className="mt-4">
            <AppButton
              label={t("inviteVisitor.submit")}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>
      </ScrollView>

      <FullScreenLoader visible={localLoading || loading} />

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
