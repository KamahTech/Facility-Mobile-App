import React from "react";
import { View, ActivityIndicator, Pressable, TextInput, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppInput } from "@/components/app-input";
import { AppButton } from "@/components/app-button";
import { useI18n } from "@/hooks/use-i18n";
import { useFormatters } from "@/hooks/use-formatters";
import type { OwnerClaim } from "@/stores/owner-store";

type InquiryFormValues = {
  subject: string;
  details: string;
};

type ClaimCardProps = {
  claim: OwnerClaim;
  isExpanded: boolean;
  onPress: () => void;
  currentClaimDetails: OwnerClaim | null;
  submitInquiry: (params: any) => Promise<any>;
};

type ClaimExpandedDetailsProps = {
  claim: OwnerClaim;
  currentClaimDetails: OwnerClaim | null;
  submitInquiry: (params: any) => Promise<any>;
};

function ClaimExpandedDetails({ claim, currentClaimDetails, submitInquiry }: ClaimExpandedDetailsProps) {
  const { t } = useI18n();
  const { formatCurrency } = useFormatters();
  const [showInquiryForm, setShowInquiryForm] = React.useState(false);
  const [submittingInquiry, setSubmittingInquiry] = React.useState(false);

  const inquirySchema = React.useMemo(
    () =>
      z.object({
        subject: z.string().min(1, t("validation.required")),
        details: z.string().min(1, t("validation.required")),
      }),
    [t],
  );

  const { control, handleSubmit, reset, formState: { errors: formErrors } } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      subject: "",
      details: "",
    },
  });

  const handleInquirySubmit = async (data: InquiryFormValues) => {
    setSubmittingInquiry(true);
    try {
      await submitInquiry({
        sourceType: "claim",
        sourceId: claim.id,
        subject: data.subject,
        details: data.details,
      });
      Alert.alert(t("claims.inquiryTitle"), t("claims.submitSuccess"));
      reset();
      setShowInquiryForm(false);
    } catch (e: unknown) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.inquirySubmitFailed"));
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <View className="flex-col gap-4 mt-2 pt-4 border-t border-border/40">
      {currentClaimDetails && currentClaimDetails.id === claim.id && currentClaimDetails.services ? (
        <View className="flex-col gap-3">
          <AppText className="text-start text-sm font-bold text-foreground mb-1">
            {t("ownerFinancials.serviceCost")}
          </AppText>

          {currentClaimDetails.services.map((svc) => (
            <View key={svc.id} className="flex-col gap-1.5 p-3 rounded-2xl bg-secondary/40 border border-border/40">
              <AppText className="text-start text-sm font-bold text-foreground">{svc.serviceName}</AppText>
              <AppText className="text-start text-xs text-muted-foreground">{svc.productName}</AppText>
              
              <View className="w-full h-[1] bg-border/20 my-1" />
              
              <AppRow className="justify-between items-center">
                <AppText className="text-xs text-muted-foreground text-start">{t("ownerFinancials.estimatedCost")}</AppText>
                <AppText className="text-xs font-semibold text-foreground">{formatCurrency(svc.estimatedCost)}</AppText>
              </AppRow>
              
              <AppRow className="justify-between items-center">
                <AppText className="text-xs text-muted-foreground text-start">{t("ownerFinancials.actualCost")}</AppText>
                <AppText className="text-xs font-bold text-primary">{formatCurrency(svc.actualCost)}</AppText>
              </AppRow>
            </View>
          ))}
        </View>
      ) : (
        <ActivityIndicator color="#4F46E5" />
      )}

      <View className="flex-col gap-2.5 bg-secondary/30 p-4 rounded-2xl border border-border/30">
        <AppRow className="justify-between items-center">
          <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.estimatedCost")}</AppText>
          <AppText className="text-sm font-semibold text-foreground">{formatCurrency(claim.estimatedCost)}</AppText>
        </AppRow>
        <AppRow className="justify-between items-center">
          <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.actualCost")}</AppText>
          <AppText className="text-sm font-semibold text-foreground">{formatCurrency(claim.actualCost)}</AppText>
        </AppRow>
        <AppRow className="justify-between items-center">
          <AppText className="text-sm text-muted-foreground text-start">{t("profile.depositsTitle")}</AppText>
          <AppText className="text-sm font-semibold text-foreground">{formatCurrency(claim.maintenanceDepositReturn)}</AppText>
        </AppRow>
        <AppRow className="justify-between items-center">
          <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.claimDifference")}</AppText>
          <AppText className="text-sm font-bold text-foreground">{formatCurrency(claim.difference)}</AppText>
        </AppRow>
        <AppRow className="justify-between items-center">
          <AppText className="text-sm text-muted-foreground text-start">{t("ownerFinancials.claimAmountToInvoice")}</AppText>
          <AppText className="text-sm font-bold text-primary">{formatCurrency(claim.amountToInvoice)}</AppText>
        </AppRow>
      </View>

      {/* Inquiry Form */}
      {!showInquiryForm ? (
        <AppButton
          label={t("claims.inquiryTitle")}
          onPress={() => setShowInquiryForm(true)}
          variant="card"
        />
      ) : (
        <View className="flex-col gap-4 p-4 border border-primary/25 bg-primary/5 rounded-2xl">
          <AppText className="text-start text-sm font-bold text-primary">{t("claims.inquiryTitle")}</AppText>
          
          <Controller
            control={control}
            name="subject"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                placeholder={t("claims.subjectPlaceholder")}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={formErrors.subject?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="details"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex-col gap-1.5">
                <TextInput
                  multiline
                  numberOfLines={4}
                  placeholder={t("claims.detailsPlaceholder")}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={{ minHeight: 100, textAlignVertical: "top" }}
                  className={`w-full bg-card text-foreground px-4 py-3 rounded-xl border font-semibold text-sm focus:border-primary text-start ${
                    formErrors.details ? "border-destructive" : "border-border"
                  }`}
                />
                {formErrors.details && (
                  <AppText className="text-xs font-medium text-destructive mt-0.5 text-start">
                    {formErrors.details.message}
                  </AppText>
                )}
              </View>
            )}
          />

          <AppRow className="gap-2 justify-end">
            <AppButton
              label={t("actions.cancel")}
              onPress={() => {
                reset();
                setShowInquiryForm(false);
              }}
              variant="card"
            />
            {submittingInquiry ? (
              <ActivityIndicator color="#4F46E5" />
            ) : (
              <AppButton
                label={t("claims.submitBtn")}
                onPress={handleSubmit(handleInquirySubmit)}
              />
            )}
          </AppRow>
        </View>
      )}
    </View>
  );
}

export function ClaimCard({ claim, isExpanded, onPress, currentClaimDetails, submitInquiry }: ClaimCardProps) {
  const { formatDate } = useFormatters();

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case "approved":
        return "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-950/40";
      case "draft":
        return "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-950/40";
      default:
        return "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-950/40";
    }
  };

  const statusClass = getStatusColor(claim.state);

  return (
    <View className="w-full bg-card border border-border rounded-3xl p-5 flex-col gap-4 shadow-sm mb-3">
      <Pressable onPress={onPress}>
        <AppRow className="items-center justify-between gap-3">
          <AppRow className="items-center gap-3.5 flex-1 min-w-0">
            <View className="w-11 h-11 rounded-xl items-center justify-center bg-orange-50 dark:bg-orange-950/20">
              <AppIcon name="tickets" size={22} color="#EA580C" />
            </View>
            <View className="flex-col flex-1 min-w-0 text-start">
              <AppText className="text-base font-bold text-foreground text-start">{claim.reference}</AppText>
              <AppText className="text-xs text-muted-foreground text-start mt-0.5">
                {formatDate(claim.date)} • {claim.unitNumber}
              </AppText>
            </View>
          </AppRow>

          <View className={`px-2.5 py-1 rounded-full ${statusClass}`}>
            <AppText className="text-xs font-semibold text-current">
              {claim.state.toUpperCase()}
            </AppText>
          </View>
        </AppRow>
      </Pressable>

      {isExpanded && (
        <ClaimExpandedDetails
          claim={claim}
          currentClaimDetails={currentClaimDetails}
          submitInquiry={submitInquiry}
        />
      )}
    </View>
  );
}
