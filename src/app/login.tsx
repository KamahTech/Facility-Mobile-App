import React from "react";
import { View, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams, router, type Href } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

import { AppText } from "@/components/app-text";
import { AppInput } from "@/components/app-input";
import { AppButton } from "@/components/app-button";
import { AppChevron } from "@/components/app-chevron";
import { KeyboardAwareScrollContent } from "@/components/keyboard-aware-scroll-content";
import { useI18n } from "@/hooks/use-i18n";
import { useUserStore } from "@/stores/user-store";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useThemeToken } from "@/hooks/use-theme-token";

const backgroundImage = require("../../assets/images/choose-account-illustration.jpg");
const appLogo = require("@/assets/app-brand/logo-light.svg");

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const { type } = useLocalSearchParams<{ type: "resident" | "worker" }>();
  const accountType = type || "resident";
  const primaryColor = useThemeToken("--primary") as string;

  const { login, loading, clearError } = useUserStore();
  const loginSchema = React.useMemo(
    () =>
      z.object({
        email: z.string().min(1, t("validation.required")).email(t("auth.validation.email")),
        password: z.string().min(6, t("auth.validation.passwordMin")),
      }),
    [t],
  );

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handlePasswordLogin = async (data: LoginFormValues) => {
    clearError();

    try {
      await login(data.email.trim(), data.password, accountType);
      if (accountType === "worker") {
        router.replace("/worker" as Href);
      } else {
        router.replace("/home" as Href);
      }
    } catch {
      // Error handled by store, displaying in UI
    }
  };

  return (
    <KeyboardAwareScrollContent
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: insets.bottom + 24,
      }}
      className="flex-1 w-full bg-card"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      {/* Top half image header with floating back button and logo */}
      <View className="w-full h-80 relative overflow-hidden bg-zinc-950">
        <Image
          source={backgroundImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        {/* Soft top gradient overlay to protect text readability */}
        <LinearGradient
          colors={["rgba(9, 9, 11, 0.85)", "rgba(9, 9, 11, 0.35)", "rgba(9, 9, 11, 0)"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.95 }}
        />

        {/* Floating Header */}
        <View
          style={{ paddingTop: insets.top + 16 }}
          className="absolute top-0 start-0 end-0 px-6 flex-row items-center justify-between z-10"
        >
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-black/35 items-center justify-center active:bg-black/50"
          >
            <AppChevron type="back" size={16} color="#FFFFFF" />
          </Pressable>

          {/* Brand Logo Group */}
          <View className="flex-row items-center gap-3">
            <Image
              source={appLogo}
              style={{ width: 36, height: 36 }}
              contentFit="contain"
              tintColor={primaryColor}
            />
            <View className="flex-col">
              <AppText className="text-white text-base font-black tracking-widest leading-none">
                KAMAH
              </AppText>
              <AppText className="text-primary text-[9px] font-bold uppercase tracking-[0.25em] mt-0.5 leading-none">
                PROPERTIES
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Content Sheet (Rounded Top Corners) */}
      <View className="flex-1 bg-card rounded-t-[32px] -mt-8 px-6 pt-12 justify-between">
        {/* Form Fields & Title Group */}
        <View className="flex-col gap-6">
          {/* Title & Description Group */}
          <View className="flex-col gap-2">
            <AppText
              className="text-start text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none"
            >
              {accountType === "resident" ? t("auth.residentTitle") : t("auth.workerTitle")} Login
            </AppText>
            <AppText className="text-start text-sm sm:text-base text-muted-foreground leading-normal font-medium mt-1">
              {t("auth.loginSubtitle")}
            </AppText>
          </View>

          {/* Form Fields */}
          <View className="flex-col gap-5">
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
          </View>
        </View>

        {/* Action Buttons Section */}
        <View className="flex-col gap-3.5 mt-8">
          {/* Login button */}
          <View>
            {loading ? (
              <View className="min-h-14 items-center justify-center bg-primary/80 rounded-lg">
                <ActivityIndicator color="white" />
              </View>
            ) : (
              <AppButton
                label={t("auth.loginBtn")}
                onPress={handleSubmit(handlePasswordLogin)}
              />
            )}
          </View>

          {/* Sign Up Link for Residents */}
          {accountType === "resident" && (
            <Pressable
              onPress={() => router.push("/signup" as Href)}
              disabled={loading}
              className="w-full h-14 border border-border rounded-2xl items-center justify-center bg-card active:bg-muted/40"
            >
              <AppText className="text-center text-base font-bold text-foreground leading-none">
                {t("auth.noAccount")}
              </AppText>
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAwareScrollContent>
  );
}
