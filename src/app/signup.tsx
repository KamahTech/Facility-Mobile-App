import React from "react";
import { View, Pressable, Alert, BackHandler } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { Stack, type Href } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { AppInput } from "@/components/app-input";
import { AppButton } from "@/components/app-button";
import { KeyboardAwareScrollContent } from "@/components/keyboard-aware-scroll-content";
import { useI18n } from "@/hooks/use-i18n";
import { useUserStore, type SignupPendingResponse } from "@/stores/user-store";
import { AppIcon } from "@/components/app-icon";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type SignupFormValues = {
  name: string;
  cardNumber: string;
  email: string;
  password: string;
  phone?: string;
  otp: string;
};

export default function SignupScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [pendingResponse, setPendingResponse] = React.useState<SignupPendingResponse | null>(null);

  const { requestOtp, signup, loading, clearError } = useUserStore();

  const stepOneSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("auth.validation.nameMin")),
        cardNumber: z.string().min(1, t("auth.validation.cardNumberMin")),
        email: z.string().min(1, t("validation.required")).email(t("auth.validation.email")),
        password: z
          .string()
          .min(10, t("auth.validation.passwordMin"))
          .max(128, t("auth.validation.passwordMax")),
        phone: z.string().optional(),
      }),
    [t],
  );

  const signupSchema = React.useMemo(
    () =>
      stepOneSchema.extend({
        otp: z.string().regex(/^\d{6}$/, t("auth.otpError")),
      }),
    [stepOneSchema, t],
  );

  const { control, handleSubmit, getValues, resetField, setError, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      cardNumber: "",
      email: "",
      password: "",
      phone: "",
      otp: "",
    },
  });

  React.useEffect(() => {
    clearError();
  }, [clearError, step]);

  React.useEffect(() => {
    const handleBackPress = () => {
      if (step === 3) {
        router.replace("/login" as Href);
      } else if (step === 2) {
        setStep(1);
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/login" as Href);
      }
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => subscription.remove();
  }, [step]);

  const handleRequestOtp = async () => {
    clearError();
    const name = getValues("name");
    const cardNumber = getValues("cardNumber");
    const email = getValues("email");
    const password = getValues("password");
    const phone = getValues("phone");

    // Validate Step 1 locally using stepOneSchema
    const validationResult = stepOneSchema.safeParse({ name, cardNumber, email, password, phone });
    if (!validationResult.success) {
      validationResult.error.issues.forEach((issue) => {
        setError(issue.path[0] as keyof SignupFormValues, { message: issue.message });
      });
      return;
    }

    try {
      await requestOtp(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        cardNumber.trim(),
        phone?.trim() || undefined
      );
      Alert.alert(t("auth.otp"), t("auth.otpSent"));
      resetField("otp", { defaultValue: "" });
      setStep(2);
    } catch {
      // API error displays in the UI / toast
    }
  };

  const handleSignupSubmit = async (data: SignupFormValues) => {
    clearError();
    try {
      const response = await signup(
        data.name.trim(),
        data.email.trim().toLowerCase(),
        data.password,
        data.cardNumber.trim(),
        data.otp.trim(),
        data.phone?.trim() || undefined
      );
      setPendingResponse(response);
      setStep(3);
    } catch {
      // Error handled by store, displaying in UI
    }
  };

  const headerTitle = React.useMemo(() => {
    if (step === 3) return t("auth.signupPendingTitle");
    return t("auth.signupTitle");
  }, [step, t]);

  const handleHeaderBack = () => {
    if (step === 3) {
      router.replace("/login" as Href);
    } else if (step === 2) {
      setStep(1);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/login" as Href);
    }
  };

  return (
    <View
      className="flex-1 bg-card"
      style={{
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader
        title={headerTitle}
        onBack={handleHeaderBack}
      />

      <KeyboardAwareScrollContent
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        {step === 3 ? (
          /* Step 3: Pending Administrator Approval Confirmation */
          <View className="flex-col items-center gap-6">
            {/* Status Icon */}
            <View className="w-20 h-20 rounded-full bg-amber-500/10 dark:bg-amber-400/15 items-center justify-center border-2 border-amber-500/30">
              <AppIcon
                name="clock"
                size={42}
                color="#f59e0b"
              />
            </View>

            {/* Title & Subtitle */}
            <View className="flex-col items-center gap-2 text-center">
              <View className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 mb-1">
                <AppText className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {t("auth.signupPendingBadge")}
                </AppText>
              </View>
              <AppText className="text-2xl font-bold text-foreground text-center">
                {t("auth.signupPendingTitle")}
              </AppText>
              <AppText className="text-sm text-muted-foreground text-center leading-relaxed max-w-md">
                {pendingResponse?.message || t("auth.signupPendingMessage")}
              </AppText>
            </View>

            {/* Submitted Summary Card */}
            <View className="w-full bg-secondary/50 border border-border/60 p-5 rounded-2xl flex-col gap-3.5">
              <AppText className="text-xs font-bold text-muted-foreground text-start uppercase tracking-wider">
                {t("auth.submittedDetails")}
              </AppText>

              <View className="h-px bg-border/50" />

              <View className="flex-col gap-3">
                <View className="flex-row items-center justify-between">
                  <AppText className="text-xs text-muted-foreground text-start">
                    {t("auth.name")}
                  </AppText>
                  <AppText className="text-sm font-semibold text-foreground text-end">
                    {pendingResponse?.name || getValues("name")}
                  </AppText>
                </View>

                <View className="flex-row items-center justify-between">
                  <AppText className="text-xs text-muted-foreground text-start">
                    {t("auth.cardNumber")}
                  </AppText>
                  <AppText className="text-sm font-semibold text-foreground text-end">
                    {pendingResponse?.cardNumber || getValues("cardNumber")}
                  </AppText>
                </View>

                <View className="flex-row items-center justify-between">
                  <AppText className="text-xs text-muted-foreground text-start">
                    {t("auth.email")}
                  </AppText>
                  <AppText className="text-sm font-semibold text-foreground text-end">
                    {pendingResponse?.email || getValues("email")}
                  </AppText>
                </View>

                {getValues("phone") ? (
                  <View className="flex-row items-center justify-between">
                    <AppText className="text-xs text-muted-foreground text-start">
                      {t("auth.phone")}
                    </AppText>
                    <AppText className="text-sm font-semibold text-foreground text-end">
                      {getValues("phone")}
                    </AppText>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Back to login button */}
            <View className="w-full mt-4">
              <AppButton
                label={t("auth.backToLogin")}
                onPress={() => router.replace("/login" as Href)}
              />
            </View>
          </View>
        ) : (
          /* Step 1 & Step 2 Form */
          <View className="flex-col gap-5">
            {step === 1 ? (
                <React.Fragment key="signup-details-step">
                  {/* Name input */}
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label={t("auth.name")}
                        placeholder={t("auth.namePlaceholder")}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={errors.name?.message}
                        autoCapitalize="words"
                        icon="profile"
                      />
                    )}
                  />

                  {/* Card Number ID input */}
                  <Controller
                    control={control}
                    name="cardNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label={t("auth.cardNumber")}
                        placeholder={t("auth.cardNumberPlaceholder")}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={errors.cardNumber?.message}
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="idCard"
                      />
                    )}
                  />

                  {/* Email input */}
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label={t("auth.email")}
                        placeholder={t("auth.emailPlaceholder")}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={errors.email?.message}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="email"
                      />
                    )}
                  />

                  {/* Password input */}
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label={t("auth.password")}
                        placeholder={t("auth.passwordPlaceholder")}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={errors.password?.message}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="password"
                      />
                    )}
                  />

                  {/* Phone input */}
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        label={t("auth.phone")}
                        placeholder={t("auth.phonePlaceholder")}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={errors.phone?.message}
                        keyboardType="phone-pad"
                        icon="phone"
                      />
                    )}
                  />

                  {/* OTP request button */}
                  <View className="mt-4">
                    {loading ? (
                      <View className="min-h-14 items-center justify-center bg-primary/80 rounded-lg">
                        <AppActivityIndicator color="white" />
                      </View>
                    ) : (
                      <AppButton
                        label={t("auth.requestOtpBtn")}
                        onPress={handleRequestOtp}
                      />
                    )}
                  </View>
                </React.Fragment>
              ) : (
                <React.Fragment key="signup-otp-step">
                  {/* Read-only target profile view */}
                  <View className="bg-secondary/45 p-4 rounded-xl flex-col gap-2.5">
                    <View>
                      <AppText className="text-xs text-muted-foreground text-start">
                        {t("auth.name")}
                      </AppText>
                      <AppText className="text-sm font-bold text-foreground text-start mt-0.5">
                        {getValues("name")}
                      </AppText>
                    </View>
                    <View>
                      <AppText className="text-xs text-muted-foreground text-start">
                        {t("auth.cardNumber")}
                      </AppText>
                      <AppText className="text-sm font-bold text-foreground text-start mt-0.5">
                        {getValues("cardNumber")}
                      </AppText>
                    </View>
                    <View>
                      <AppText className="text-xs text-muted-foreground text-start">
                        {t("auth.email")}
                      </AppText>
                      <AppText className="text-sm font-bold text-foreground text-start mt-0.5">
                        {getValues("email")}
                      </AppText>
                    </View>
                  </View>

                  {/* Edit Profile Info Link */}
                  <Pressable
                    onPress={() => setStep(1)}
                    className="py-1 self-start active:opacity-75"
                  >
                    <AppText className="text-sm font-bold text-primary text-start">
                      {t("auth.changeEmail")}
                    </AppText>
                  </Pressable>

                  {/* Verification Code input */}
                  <Controller
                    control={control}
                    name="otp"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppInput
                        key="signup-otp-input"
                        label={t("auth.otp")}
                        placeholder={t("auth.otpPlaceholder")}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={errors.otp?.message}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="key"
                        autoComplete="off"
                        textContentType="none"
                        importantForAutofill="noExcludeDescendants"
                      />
                    )}
                  />

                  {/* Final signup submit button */}
                  <View className="mt-4">
                    {loading ? (
                      <View className="min-h-14 items-center justify-center bg-primary/80 rounded-lg">
                        <AppActivityIndicator color="white" />
                      </View>
                    ) : (
                      <AppButton
                        label={t("auth.signupBtn")}
                        onPress={handleSubmit(handleSignupSubmit)}
                      />
                    )}
                  </View>
                </React.Fragment>
              )}

              {/* Back to login link */}
              <Pressable
                onPress={() => router.back()}
                disabled={loading}
                className="mt-2 py-2 items-center justify-center active:opacity-70"
              >
                <AppText className="text-sm font-bold text-foreground text-center">
                  {t("auth.hasAccount")}
                </AppText>
              </Pressable>
            </View>
        )}
      </KeyboardAwareScrollContent>
    </View>
  );
}
