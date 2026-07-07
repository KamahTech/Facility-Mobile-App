import React from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import { Stack, useLocalSearchParams, router, type Href } from "expo-router";
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

type LoginFormValues = {
  email: string;
  password: string;
};



export default function LoginScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: "resident" | "worker" }>();
  const accountType = type || "resident";

  const { login, loading, error, clearError } = useUserStore();
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
        title={accountType === "resident" ? t("auth.residentTitle") : t("auth.workerTitle")}
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
        <View className="flex-col items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <AppIcon
              name={accountType === "resident" ? "resident" : "worker"}
              size={36}
              colorToken="--primary"
            />
          </View>
          <AppText className="text-2xl font-bold text-foreground mb-2 text-center">
            {t("auth.loginTitle")}
          </AppText>
          <AppText className="text-sm text-muted-foreground text-center">
            {t("auth.loginSubtitle")}
          </AppText>
        </View>

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

          {/* API error messages */}
          {error && (
            <View className="bg-destructive/10 p-4 rounded-xl">
              <AppText className="text-sm font-semibold text-destructive text-start">
                {error}
              </AppText>
            </View>
          )}

          {/* Login button */}
          <View className="mt-4">
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
              className="mt-2 py-2 items-center justify-center active:opacity-75"
            >
              <AppText className="text-sm font-bold text-primary text-center">
                {t("auth.noAccount")}
              </AppText>
            </Pressable>
          )}




        </View>
      </KeyboardAwareScrollContent>
    </View>
  );
}
