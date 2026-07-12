import React from "react";
import { View, Alert, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { AppInput } from "@/components/app-input";
import { AppSegmentSelector } from "@/components/app-segment-selector";
import { AppButton } from "@/components/app-button";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { KeyboardAwareScrollContent } from "@/components/keyboard-aware-scroll-content";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { AppSelectField } from "@/components/app-select-field";
import { GenericSelectBottomSheet } from "@/components/generic-select-bottom-sheet";
import {
  useUnitStore,
  useProjectsQuery,
  useBuildingsQuery,
  useFloorsQuery,
  useLookupUnitsQuery,
} from "@/stores/unit-store";

type ConnectUnitFormValues = {
  projectId: string;
  buildingId: string;
  floorId?: string;
  unitId: string;
  ownershipType: "owner" | "tenant" | "family_member";
  contactNumber?: string;
};

export default function AddUnitScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const { resolvedTheme } = useTheme();
  const { connectUnit, clearError } = useUnitStore();

  const connectUnitSchema = React.useMemo(
    () =>
      z.object({
        projectId: z.string().min(1, t("validation.required")),
        buildingId: z.string().min(1, t("validation.required")),
        floorId: z.string().optional(),
        unitId: z.string().min(1, t("validation.required")),
        ownershipType: z.enum(["owner", "tenant", "family_member"]),
        contactNumber: z.string().optional(),
      }).refine((data) => {
        if (data.ownershipType !== "family_member" && (!data.contactNumber || data.contactNumber.trim() === "")) {
          return false;
        }
        return true;
      }, {
        message: t("validation.required"),
        path: ["contactNumber"],
      }),
    [t],
  );

  const [actionLoading, setActionLoading] = React.useState(false);

  const [isProjectSheetPresented, setIsProjectSheetPresented] = React.useState(false);
  const [isBuildingSheetPresented, setIsBuildingSheetPresented] = React.useState(false);
  const [isFloorSheetPresented, setIsFloorSheetPresented] = React.useState(false);
  const [isUnitSheetPresented, setIsUnitSheetPresented] = React.useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ConnectUnitFormValues>({
    resolver: zodResolver(connectUnitSchema),
    defaultValues: {
      projectId: "",
      buildingId: "",
      floorId: "",
      unitId: "",
      ownershipType: "owner",
      contactNumber: "",
    },
  });

  const selectedProjectId = useWatch({ control, name: "projectId" });
  const selectedBuildingId = useWatch({ control, name: "buildingId" });
  const selectedFloorId = useWatch({ control, name: "floorId" });
  const selectedUnitId = useWatch({ control, name: "unitId" });

  const projectsQuery = useProjectsQuery();
  const buildingsQuery = useBuildingsQuery(selectedProjectId);
  const floorsQuery = useFloorsQuery(selectedBuildingId);
  const unitsLookupQuery = useLookupUnitsQuery(selectedBuildingId, selectedFloorId);

  const selectedProject = projectsQuery.data?.find(p => p.id === selectedProjectId);
  const selectedBuilding = buildingsQuery.data?.find(b => b.id === selectedBuildingId);
  const selectedFloor = floorsQuery.data?.find(f => f.id === selectedFloorId);
  const selectedUnit = unitsLookupQuery.data?.find(u => u.unitId === selectedUnitId || u.id === selectedUnitId);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSelectProject = (projectId: string) => {
    setValue("projectId", projectId);
    setValue("buildingId", "");
    setValue("floorId", "");
    setValue("unitId", "");
  };

  const handleSelectBuilding = (buildingId: string) => {
    setValue("buildingId", buildingId);
    setValue("floorId", "");
    setValue("unitId", "");
  };

  const handleSelectFloor = (floorId: string) => {
    setValue("floorId", floorId);
    setValue("unitId", "");
  };

  const handleClearFloor = () => {
    setValue("floorId", "");
    setValue("unitId", "");
  };

  const handleSelectUnit = (unitId: string) => {
    setValue("unitId", unitId);
  };

  const onSubmit = async (data: ConnectUnitFormValues) => {
    clearError();
    setActionLoading(true);
    try {
      await connectUnit({
        unitId: data.unitId,
        ownershipType: data.ownershipType,
        contactNumber: data.contactNumber?.trim() || undefined,
      });

      Alert.alert(
        t("connectUnit.successTitle"),
        t("connectUnit.successDesc"),
        [{ text: t("common.ok"), onPress: () => {
          reset();
          router.back();
        } }]
      );
    } catch (e: unknown) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.connectUnitFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const ownershipOptions = [
    { label: t("connectUnit.owner"), value: "owner" },
    { label: t("connectUnit.tenant"), value: "tenant" },
    { label: t("connectUnit.familyMember"), value: "family_member" },
  ];

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />

      {/* Adaptive Background Gradient */}
      <LinearGradient
        colors={
          resolvedTheme === "dark"
            ? ["#18181b", "#09090b", "#09090b"]
            : ["#ffffff", "#f5f6f8", "#f5f6f8"]
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View
        className="flex-1"
        style={{
          paddingTop: insets.top,
          paddingStart: insets.left,
          paddingEnd: insets.right,
        }}
      >
        <ScreenHeader
          title={t("quickActions.connectUnit")}
          onBack={() => router.back()}
          showBorder={false}
        />

        <View className="flex-1 w-full max-w-xl self-center px-5">
          <FullScreenLoader visible={actionLoading} />

          <KeyboardAwareScrollContent
            bottomOffset={insets.bottom + 24}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: insets.bottom + 40,
            }}
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            {/* Form Card wrapper matching the Login Redesign */}
            <View className="w-full bg-card rounded-3xl p-6 shadow-2xs flex-col gap-6">
              <View className="flex-col gap-1.5">
                <AppText className="text-start text-xl font-black text-foreground">
                  {t("quickActions.connectUnit")}
                </AppText>
                <AppText className="text-start text-xs text-muted-foreground leading-normal">
                  {t("quickActions.connectUnitDescription")}
                </AppText>
              </View>

              <View className="flex-col gap-5">
                <Controller
                  control={control}
                  name="projectId"
                  render={() => (
                    <AppSelectField
                      label={t("connectUnit.project")}
                      placeholder={projectsQuery.isLoading ? "Loading..." : t("connectUnit.projectPlaceholder")}
                      value={selectedProject?.name}
                      error={errors.projectId?.message}
                      onPress={() => setIsProjectSheetPresented(true)}
                      disabled={projectsQuery.isLoading}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="buildingId"
                  render={() => (
                    <AppSelectField
                      label={t("connectUnit.building")}
                      placeholder={
                        !selectedProjectId
                          ? t("connectUnit.projectPlaceholder")
                          : buildingsQuery.isFetching
                          ? "Loading..."
                          : t("connectUnit.buildingPlaceholder")
                      }
                      value={selectedBuilding ? (selectedBuilding.name || selectedBuilding.number) : ""}
                      error={errors.buildingId?.message}
                      onPress={() => {
                        if (selectedProjectId) {
                          setIsBuildingSheetPresented(true);
                        } else {
                          Alert.alert(t("common.error"), t("connectUnit.projectPlaceholder"));
                        }
                      }}
                      disabled={!selectedProjectId || buildingsQuery.isFetching}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="floorId"
                  render={() => (
                    <AppSelectField
                      label={t("connectUnit.floor")}
                      placeholder={
                        !selectedBuildingId
                          ? t("connectUnit.buildingPlaceholder")
                          : floorsQuery.isFetching
                          ? "Loading..."
                          : t("connectUnit.floorPlaceholder")
                      }
                      value={selectedFloor?.name || ""}
                      error={errors.floorId?.message}
                      onPress={() => {
                        if (selectedBuildingId) {
                          setIsFloorSheetPresented(true);
                        } else {
                          Alert.alert(t("common.error"), t("connectUnit.buildingPlaceholder"));
                        }
                      }}
                      disabled={!selectedBuildingId || floorsQuery.isFetching}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="unitId"
                  render={() => (
                    <AppSelectField
                      label={t("connectUnit.unit")}
                      placeholder={
                        !selectedBuildingId
                          ? t("connectUnit.buildingPlaceholder")
                          : unitsLookupQuery.isFetching
                          ? "Loading..."
                          : t("connectUnit.unitPlaceholder")
                      }
                      value={selectedUnit ? (selectedUnit.name || selectedUnit.number) : ""}
                      error={errors.unitId?.message}
                      onPress={() => {
                        if (selectedBuildingId) {
                          setIsUnitSheetPresented(true);
                        } else {
                          Alert.alert(t("common.error"), t("connectUnit.buildingPlaceholder"));
                        }
                      }}
                      disabled={!selectedBuildingId || unitsLookupQuery.isFetching}
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
                      icon="phone"
                    />
                  )}
                />
              </View>

              <View className="mt-4">
                <AppButton
                  label={t("connectUnit.submit")}
                  onPress={handleSubmit(onSubmit)}
                />
              </View>
            </View>
          </KeyboardAwareScrollContent>
        </View>
      </View>

      <GenericSelectBottomSheet
        isPresented={isProjectSheetPresented}
        title={t("connectUnit.project")}
        items={projectsQuery.data || []}
        selectedId={selectedProjectId}
        onDismiss={() => setIsProjectSheetPresented(false)}
        onSelect={(item) => handleSelectProject(item.id)}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item.name}
      />

      <GenericSelectBottomSheet
        isPresented={isBuildingSheetPresented}
        title={t("connectUnit.building")}
        items={buildingsQuery.data || []}
        selectedId={selectedBuildingId}
        onDismiss={() => setIsBuildingSheetPresented(false)}
        onSelect={(item) => handleSelectBuilding(item.id)}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item.name || item.number}
      />

      <GenericSelectBottomSheet
        isPresented={isFloorSheetPresented}
        title={t("connectUnit.floor")}
        items={floorsQuery.data || []}
        selectedId={selectedFloorId}
        onDismiss={() => setIsFloorSheetPresented(false)}
        onSelect={(item) => handleSelectFloor(item.id)}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item.name}
        showClearOption={true}
        onClear={handleClearFloor}
        clearLabel={t("connectUnit.clearFilters")}
      />

      <GenericSelectBottomSheet
        isPresented={isUnitSheetPresented}
        title={t("connectUnit.unit")}
        items={unitsLookupQuery.data || []}
        selectedId={selectedUnitId}
        onDismiss={() => setIsUnitSheetPresented(false)}
        onSelect={(item) => handleSelectUnit(item.unitId || item.id)}
        keyExtractor={(item) => item.unitId || item.id}
        labelExtractor={(item) => item.name || item.number}
        subLabelExtractor={(item) => item.unitType}
      />
    </View>
  );
}
