import React from "react";
import { View, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LegendList } from "@legendapp/list/react-native";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { ActionCard } from "@/components/action-card";
import { AppInput } from "@/components/app-input";
import { AppSelectField } from "@/components/app-select-field";
import { AppButton } from "@/components/app-button";
import { KeyboardAwareScrollContent } from "@/components/keyboard-aware-scroll-content";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { UnitSelectBottomSheet } from "@/components/unit-select-bottom-sheet";
import { serviceItems } from "@/constants/services";
import { useBottomSheetPresentation } from "@/hooks/use-bottom-sheet-presentation";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useUnitStore } from "@/stores/unit-store";
import { useRequestsStore } from "@/stores/requests-store";

type RequestServiceFormValues = {
  unitId: string;
  category: string;
  description: string;
};

export default function RequestServiceScreen() {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const background = useThemeToken("--background");
  const insets = useSafeAreaInsets();
  const { units } = useUnitStore();
  const { createRequest } = useRequestsStore();
  const [actionLoading, setActionLoading] = React.useState(false);
  const unitSheet = useBottomSheetPresentation();
  const requestServiceSchema = React.useMemo(
    () =>
      z.object({
        unitId: z.string().min(1, t("tickets.noUnitSelected")),
        category: z.string().min(1, t("tickets.noCategorySelected")),
        description: z.string().min(1, t("tickets.noDescription")),
      }),
    [t],
  );

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<RequestServiceFormValues>({
    resolver: zodResolver(requestServiceSchema),
    defaultValues: {
      unitId: "",
      category: "",
      description: "",
    },
  });

  const selectedCategory = useWatch({ control, name: "category" });
  const selectedUnitId = useWatch({ control, name: "unitId" });
  const selectedUnit = units.find(u => u.id === selectedUnitId) || null;

  // Select default unit if only one is connected
  React.useEffect(() => {
    if (units.length === 1) {
      const raf = requestAnimationFrame(() => {
        setValue("unitId", units[0].id);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [units, setValue]);

  const services = React.useMemo(() => {
    return serviceItems.map((item) => ({
      id: item.id,
      title: t(item.titleKey),
      description: t(item.descriptionKey),
      icon: item.icon,
    }));
  }, [t]);

  const handleSelectService = (id: string) => {
    setValue("category", id, { shouldValidate: true });
  };

  const handleBackPress = () => {
    if (selectedCategory) {
      setValue("category", "");
      setValue("description", "");
    } else {
      router.back();
    }
  };

  const onSubmit = async (data: RequestServiceFormValues) => {
    setActionLoading(true);
    try {
      await createRequest(
        data.category,
        data.description.trim(),
        data.unitId
      );

      Alert.alert(
        t("tickets.createSuccess"),
        t("tickets.createSuccessDesc"),
        [
          {
            text: t("common.ok"),
            onPress: () => {
              // Reset state and redirect
              setValue("category", "");
              setValue("description", "");
              router.replace("/(resident)/(tabs)/tickets");
            },
          },
        ]
      );
    } catch (e: unknown) {
      Alert.alert(
        t("common.error"),
        e instanceof Error ? e.message : t("errors.requestSubmitFailed")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const renderHeader = () => (
    <AppText className="text-start text-base leading-6 text-muted-foreground mb-6">
      {t("services.description")}
    </AppText>
  );

  const renderItem = ({
    item,
  }: {
    item: { id: string; title: string; description: string; icon: any };
  }) => (
    <View className="mb-4">
      <ActionCard
        title={item.title}
        description={item.description}
        icon={item.icon}
        onPress={() => handleSelectService(item.id)}
      />
    </View>
  );

  const selectedCategoryItem = serviceItems.find((s) => s.id === selectedCategory);

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <View
        style={{
          height: insets.top,
          backgroundColor: background,
          position: "absolute",
          top: 0,
          start: 0,
          end: 0,
          zIndex: 100,
        }}
      />
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader
        title={
          selectedCategory
            ? t("tickets.createTitle")
            : t("services.title")
        }
        onBack={handleBackPress}
      />

      {units.length === 0 ? (
        <View className="flex-1 w-full max-w-xl self-center px-5 justify-center items-center py-12">
          <AppText className="text-base text-muted-foreground text-center mb-6 leading-6">
            {t("connectUnit.noUnits")}
          </AppText>
          <AppButton
            label={t("connectUnit.addBtn")}
            onPress={() => router.push("/home/connect-unit")}
            className="w-full"
          />
        </View>
      ) : selectedCategory ? (
        <KeyboardAwareScrollContent
          bottomOffset={insets.bottom + 24}
          contentContainerStyle={{
            paddingTop: 24,
            paddingBottom: insets.bottom + 40,
            paddingHorizontal: 20,
          }}
          className="flex-1 w-full max-w-xl self-center"
        >
          <View className="flex-col gap-6">
            {/* Category summary */}
            {selectedCategoryItem && (
              <View className="p-4 rounded-xl bg-secondary/50">
                <AppText className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-start">
                  {t("tickets.categoryLabel")}
                </AppText>
                <AppText className="text-lg font-bold text-foreground mt-1 text-start">
                  {t(selectedCategoryItem.titleKey)}
                </AppText>
              </View>
            )}

            {/* Select Connected Unit */}
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

            {/* Enter Description */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label={t("tickets.enterDetails")}
                  placeholder={t("tickets.detailsPlaceholder")}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  error={errors.description?.message}
                />
              )}
            />

            <View className="mt-4">
              <AppButton
                label={t("tickets.submitBtn")}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </View>
        </KeyboardAwareScrollContent>
      ) : (
        <LegendList
          data={services}
          recycleItems={true}
          estimatedItemSize={120}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 24,
            paddingBottom: insets.bottom + 40,
            paddingHorizontal: 20,
          }}
          className="flex-1 w-full max-w-xl self-center"
        />
      )}

      {/* Unit selection bottom sheet */}
      <UnitSelectBottomSheet
        isPresented={unitSheet.isPresented}
        units={units}
        selectedUnitId={selectedUnit?.id}
        onDismiss={unitSheet.dismiss}
        onSelect={(unit) => {
          setValue("unitId", unit?.id || "", { shouldValidate: true });
        }}
      />
      <FullScreenLoader visible={actionLoading} />
    </View>
  );
}
