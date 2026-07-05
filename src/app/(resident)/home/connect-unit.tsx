import React from "react";
import { View, Alert, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LegendList } from "@legendapp/list/react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { AppInput } from "@/components/app-input";
import { AppSegmentSelector } from "@/components/app-segment-selector";
import { AppButton } from "@/components/app-button";
import { AppIcon } from "@/components/app-icon";
import { ConnectedUnitCard } from "@/components/connected-unit-card";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { useI18n } from "@/hooks/use-i18n";
import { useTransitionDelayedLoading } from "@/hooks/use-screen-transition";
import { useUnitStore } from "@/stores/unit-store";
import { useThemeToken } from "@/hooks/use-theme-token";

type ConnectUnitFormValues = {
  buildingNumber: string;
  unitNumber: string;
  unitType: "residential" | "office" | "retail";
  ownershipType: "owner" | "tenant";
  contactNumber?: string;
};

export default function ConnectUnitScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { units, fetchUnits, connectUnit, disconnectUnit, loading, error, clearError } = useUnitStore();
  const mutedForeground = useThemeToken("--muted-foreground");
  const connectUnitSchema = React.useMemo(
    () =>
      z.object({
        buildingNumber: z.string().min(1, t("validation.required")),
        unitNumber: z.string().min(1, t("validation.required")),
        unitType: z.enum(["residential", "office", "retail"]),
        ownershipType: z.enum(["owner", "tenant"]),
        contactNumber: z.string().optional(),
      }),
    [t],
  );

  const [isAdding, setIsAdding] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const showInitialUnitsLoader = useTransitionDelayedLoading(loading && units.length === 0);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ConnectUnitFormValues>({
    resolver: zodResolver(connectUnitSchema),
    defaultValues: {
      buildingNumber: "",
      unitNumber: "",
      unitType: "residential",
      ownershipType: "owner",
      contactNumber: "",
    },
  });

  const loadUnits = React.useCallback(async () => {
    clearError();
    await fetchUnits();
  }, [fetchUnits, clearError]);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUnits();
    setRefreshing(false);
  };

  const onSubmit = async (data: ConnectUnitFormValues) => {
    clearError();
    setActionLoading(true);
    try {
      await connectUnit({
        buildingNumber: data.buildingNumber.trim(),
        unitNumber: data.unitNumber.trim(),
        unitType: data.unitType,
        ownershipType: data.ownershipType,
        contactNumber: data.contactNumber?.trim() || undefined,
      });

      Alert.alert(
        t("connectUnit.successTitle"),
        t("connectUnit.successDesc"),
        [{ text: t("common.ok"), onPress: () => {
          reset();
          setIsAdding(false);
        } }]
      );
    } catch (e: unknown) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.connectUnitFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    Alert.alert(
      t("connectUnit.disconnectTitle"),
      t("connectUnit.disconnectConfirm"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("connectUnit.disconnect"),
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await disconnectUnit(id);
            } catch (e: unknown) {
              Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.disconnectUnitFailed"));
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const ownershipOptions = [
    { label: t("connectUnit.owner"), value: "owner" },
    { label: t("connectUnit.tenant"), value: "tenant" },
  ];

  const unitTypeOptions = [
    { label: t("connectUnit.residential"), value: "residential" },
    { label: t("connectUnit.office"), value: "office" },
    { label: t("connectUnit.retail"), value: "retail" },
  ];

  const headerRightAction = !isAdding ? (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        reset();
        setIsAdding(true);
        clearError();
      }}
      accessibilityLabel={t("connectUnit.addBtn")}
      accessibilityRole="button"
      className="w-10 h-10 rounded-full bg-primary items-center justify-center active:opacity-75"
    >
      <AppIcon name="add" size={18} colorToken="--primary-foreground" />
    </TouchableOpacity>
  ) : null;

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
        title={t(isAdding ? "quickActions.connectUnit" : "connectUnit.connectedTitle")}
        onBack={isAdding ? () => setIsAdding(false) : () => router.back()}
        rightAction={headerRightAction}
      />

      <View className="flex-1 w-full max-w-xl self-center px-5">
        <FullScreenLoader visible={actionLoading} />

        {isAdding ? (
          <View className="flex-1 pt-6 pb-10">
            <AppText className="text-start text-base leading-6 text-muted-foreground mb-8">
              {t("quickActions.connectUnitDescription")}
            </AppText>

            <View className="flex-col gap-6">
              <Controller
                control={control}
                name="buildingNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label={t("connectUnit.buildingNumber")}
                    placeholder={t("connectUnit.buildingNumberPlaceholder")}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.buildingNumber?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="unitNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label={t("connectUnit.unitNumber")}
                    placeholder={t("connectUnit.unitNumberPlaceholder")}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.unitNumber?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="unitType"
                render={({ field: { onChange, value } }) => (
                  <AppSegmentSelector
                    label={t("connectUnit.unitType")}
                    options={unitTypeOptions}
                    selectedValue={value}
                    onSelect={onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="ownershipType"
                render={({ field: { onChange, value } }) => (
                  <AppSegmentSelector
                    label={t("connectUnit.ownershipType")}
                    options={ownershipOptions}
                    selectedValue={value}
                    onSelect={onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="contactNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label={t("connectUnit.contactNumber")}
                    placeholder={t("connectUnit.contactNumberPlaceholder")}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.contactNumber?.message}
                    keyboardType="phone-pad"
                  />
                )}
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
                  label={t("connectUnit.submit")}
                  onPress={handleSubmit(onSubmit)}
                />
              </View>
            </View>
          </View>
        ) : (
          <View className="flex-1">
            {loading && units.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                {showInitialUnitsLoader && <ActivityIndicator size="large" color="#4F46E5" />}
              </View>
            ) : units.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12 px-6">
                <View className="w-16 h-16 rounded-full bg-secondary/50 items-center justify-center mb-4">
                  <AppIcon name="linkUnit" size={28} color={mutedForeground} />
                </View>
                <AppText align="center" className="text-base text-muted-foreground mb-8 leading-6">
                  {t("connectUnit.noUnits")}
                </AppText>
                <AppButton
                  label={t("connectUnit.addBtn")}
                  onPress={() => setIsAdding(true)}
                  className="w-full"
                />
              </View>
            ) : (
              <View className="flex-1">
                {error && (
                  <View className="bg-destructive/10 p-3 rounded-xl border border-destructive/25 mb-4 mt-2">
                    <AppText className="text-sm font-semibold text-destructive text-start">
                      {error}
                    </AppText>
                  </View>
                )}
                <LegendList
                  data={units}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <ConnectedUnitCard unit={item} onDisconnect={handleDisconnect} />
                  )}
                  estimatedItemSize={100}
                  recycleItems={true}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      tintColor="#4F46E5"
                    />
                  }
                  contentContainerStyle={{
                    paddingTop: 24,
                    paddingBottom: insets.bottom + 40,
                  }}
                  className="flex-1 w-full"
                />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
