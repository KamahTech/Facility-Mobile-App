import React from "react";
import { View, Alert } from "react-native";
import { Stack, router } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { ScreenHeader } from "@/components/screen-header";
import { AppInput } from "@/components/app-input";
import { AppButton } from "@/components/app-button";
import { AppText } from "@/components/app-text";
import { KeyboardAwareScrollContent } from "@/components/keyboard-aware-scroll-content";
import { useI18n } from "@/hooks/use-i18n";
import { useUserStore } from "@/stores/user-store";

type EditProfileFormValues = {
  name: string;
  phone: string;
};

export default function EditProfileScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const { profile, updateProfile, loading, error } = useUserStore();
  const editProfileSchema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("auth.validation.nameMin")),
        phone: z.string().min(1, t("validation.required")),
      }),
    [t],
  );

  const { control, handleSubmit, formState: { errors } } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      phone: profile?.phone || "",
    },
  });

  const handleSave = async (data: EditProfileFormValues) => {
    try {
      await updateProfile({
        name: data.name.trim(),
        phone: data.phone.trim(),
      });

      Alert.alert(
        t("profile.editTitle"),
        t("profile.saveSuccess"),
        [{ text: t("common.ok"), onPress: () => router.back() }]
      );
    } catch (e: unknown) {
      Alert.alert(
        t("common.error"),
        e instanceof Error ? e.message : t("errors.profileSaveFailed")
      );
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
        title={t("profile.editTitle")}
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
        <View className="flex-col gap-6">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label={t("profile.nameLabel")}
                placeholder={t("profile.namePlaceholder")}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />

          <AppInput
            label={t("profile.emailLabel")}
            placeholder={t("profile.emailPlaceholder")}
            value={profile?.email || ""}
            editable={false}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label={t("profile.phoneLabel")}
                placeholder={t("profile.phonePlaceholder")}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.phone?.message}
                keyboardType="phone-pad"
              />
            )}
          />

          {error && (
            <View className="bg-destructive/10 p-4 rounded-xl mt-2">
              <AppText className="text-sm font-semibold text-destructive text-start">
                {error}
              </AppText>
            </View>
          )}

          <View className="mt-4">
            <AppButton
              label={loading ? t("profile.saving") : t("profile.saveButton")}
              onPress={handleSubmit(handleSave)}
              disabled={loading}
            />
          </View>
        </View>
      </KeyboardAwareScrollContent>
    </View>
  );
}
