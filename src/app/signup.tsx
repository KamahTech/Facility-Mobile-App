import React from "react";
import { View, ActivityIndicator, Pressable, Alert } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { AppInput } from "@/components/app-input";
import { AppButton } from "@/components/app-button";
import { KeyboardAwareScrollContent } from "@/components/keyboard-aware-scroll-content";
import { useI18n } from "@/hooks/use-i18n";
import { useUserStore } from "@/stores/user-store";
import { AppIcon } from "@/components/app-icon";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type SignupFormValues = {
  email: string;
  phone?: string;
  name: string;
  password: string;
  otp: string;
};

export default function SignupScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [step, setStep] = React.useState<1 | 2>(1);

  const { requestOtp, signup, loading, clearError } = useUserStore();
  const stepOneSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("auth.validation.nameMin")),
        email: z.string().min(1, t("validation.required")).email(t("auth.validation.email")),
        password: z.string().min(6, t("auth.validation.passwordMin")),
        phone: z.string().optional(),
      }),
    [t],
  );
  const signupSchema = React.useMemo(
    () =>
      stepOneSchema.extend({
        otp: z.string().min(6, t("auth.otpError")).max(6, t("auth.otpError")),
      }),
    [stepOneSchema, t],
  );

  const { control, handleSubmit, getValues, setError, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      phone: "",
      name: "",
      password: "",
      otp: "",
    },
  });

  React.useEffect(() => {
    clearError();
  }, [clearError, step]);

  const handleRequestOtp = async () => {
    clearError();
    const name = getValues("name");
    const email = getValues("email");
    const password = getValues("password");
    const phone = getValues("phone");
    
    // Validate Step 1 locally using stepOneSchema
    const validationResult = stepOneSchema.safeParse({ name, email, password, phone });
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
        phone?.trim() || undefined
      );
      Alert.alert(t("auth.otp"), t("auth.otpSent"));
      setStep(2);
    } catch {
      // API error displays in the UI
    }
  };

  const handleSignupSubmit = async (data: SignupFormValues) => {
    clearError();
    try {
      await signup(
        data.name.trim(),
        data.email.trim().toLowerCase(),
        data.password,
        data.otp.trim(),
        data.phone?.trim() || undefined
      );
      Alert.alert(t("auth.signupTitle"), t("auth.signupSuccess"), [
        {
          text: t("common.ok"),
          onPress: () => {
            router.replace("/home" as Href);
          },
        },
      ]);
    } catch {
      // Error handled by store, displaying in UI
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
        title={t("auth.signupTitle")}
        onBack={step === 2 ? () => setStep(1) : () => router.back()}
      />

      <KeyboardAwareScrollContent
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        <View className="flex-col items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <AppIcon
              name="resident"
              size={36}
              colorToken="--primary"
            />
          </View>
          <AppText className="text-2xl font-bold text-foreground mb-2 text-center">
            {t("auth.signupTitle")}
          </AppText>
          <AppText className="text-sm text-muted-foreground text-center">
            {t("auth.signupSubtitle")}
          </AppText>
        </View>

        <View className="flex-col gap-5">
          {step === 1 ? (
            <>
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
                  />
                )}
              />

              {/* OTP request button */}
              <View className="mt-4">
                {loading ? (
                  <View className="min-h-14 items-center justify-center bg-primary/80 rounded-lg">
                    <ActivityIndicator color="white" />
                  </View>
                ) : (
                  <AppButton
                    label={t("auth.requestOtpBtn")}
                    onPress={handleRequestOtp}
                  />
                )}
              </View>
            </>
          ) : (
            <>
              {/* Read-only target profile view */}
              <View className="bg-secondary/45 p-4 rounded-xl flex-col gap-2">
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
                  />
                )}
              />

              {/* Final signup submit button */}
              <View className="mt-4">
                {loading ? (
                  <View className="min-h-14 items-center justify-center bg-primary/80 rounded-lg">
                    <ActivityIndicator color="white" />
                  </View>
                ) : (
                  <AppButton
                    label={t("auth.signupBtn")}
                    onPress={handleSubmit(handleSignupSubmit)}
                  />
                )}
              </View>
            </>
          )}

          {/* Back to login link */}
          <Pressable
            onPress={() => router.back()}
            disabled={loading}
            className="mt-2 py-2 items-center justify-center"
          >
            <AppText className="text-sm font-bold text-primary text-center">
              {t("auth.hasAccount")}
            </AppText>
          </Pressable>
        </View>
      </KeyboardAwareScrollContent>
    </View>
  );
}
