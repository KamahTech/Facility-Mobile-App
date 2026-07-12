import React from "react";
import { View, Alert, Pressable } from "react-native";
import { useLocalSearchParams, Stack, router, type Href } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";
import { Image } from "expo-image";
import { KeyboardAwareScrollContent } from "@/components/keyboard-aware-scroll-content";

import { ScreenHeader } from "@/components/screen-header";
import { AppChevron } from "@/components/app-chevron";
import { MediaSourceSheet } from "@/components/media-source-sheet";
import { FullscreenImageViewer } from "@/components/fullscreen-image-viewer";
import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { AppInput } from "@/components/app-input";
import { AppButton } from "@/components/app-button";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useAppImagePicker } from "@/hooks/use-image-picker";
import { encodeImageUri } from "@/lib/media";
import { useRequestsStore, type RequestStatus } from "@/stores/requests-store";
import { useUnitStore } from "@/stores/unit-store";
import { useUserStore } from "@/stores/user-store";
import { useScreenTransition } from "@/hooks/use-screen-transition";
import { useToastStore } from "@/stores/toast-store";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type InspectFormValues = {
  notes: string;
  materials?: string;
  deadline?: string;
};

export default function WorkerDetailsScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const params = useLocalSearchParams();
  const taskId = params.id as string;
  const isTransitionFinished = useScreenTransition();

  const {
    requests,
    acceptTask,
    inspectTask,
    startTask,
    completeTask,
    addRequestComment,
    loading,
  } = useRequestsStore({ enableWorkerTasks: true });
  const { units } = useUnitStore();
  const { profile } = useUserStore();

  const task = requests.find((r) => r.id === taskId);
  const unit = task ? units.find((u) => u.id === task.unitId) : undefined;
  const unitLabel = unit ? `${unit.buildingNumber} - ${unit.unitNumber}` : "";

  const mutedToken = useThemeToken("--muted-foreground");
  const workerName = profile?.name || "Worker";
  const { pickImage } = useAppImagePicker();
  const inspectSchema = React.useMemo(
    () =>
      z.object({
        notes: z.string().min(1, t("validation.inspectionNotesRequired")),
        materials: z.string().optional(),
        deadline: z
          .string()
          .optional()
          .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
            message: t("validation.dateFormat"),
          }),
      }),
    [t],
  );

  // Form states for Inspection
  const { control, handleSubmit, formState: { errors } } = useForm<InspectFormValues>({
    resolver: zodResolver(inspectSchema),
    defaultValues: {
      notes: "",
      materials: "",
      deadline: "",
    },
  });

  const [selectedPhotos, setSelectedPhotos] = React.useState<string[]>([]);
  const [isMediaSheetVisible, setIsMediaSheetVisible] = React.useState(false);
  const [selectedViewerImage, setSelectedViewerImage] = React.useState<string | null>(null);
  const [isViewerVisible, setIsViewerVisible] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  const getCategoryConfig = () => {
    if (!task) return { icon: "otherService" as const, bgClass: "bg-gray-50", iconColor: "#6B7280" };
    switch (task.category) {
      case "plumbing":
        return {
          icon: "plumbing" as const,
          bgClass: "bg-blue-50 dark:bg-blue-950/20",
          iconColor: "#3B82F6",
        };
      case "electrical":
        return {
          icon: "electrical" as const,
          bgClass: "bg-amber-50 dark:bg-amber-950/20",
          iconColor: "#D97706",
        };
      case "hvac":
        return {
          icon: "hvac" as const,
          bgClass: "bg-cyan-50 dark:bg-cyan-950/20",
          iconColor: "#06B6D4",
        };
      case "cleaning":
        return {
          icon: "cleaning" as const,
          bgClass: "bg-purple-50 dark:bg-purple-950/20",
          iconColor: "#A855F7",
        };
      case "security":
        return {
          icon: "security" as const,
          bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
          iconColor: "#10B981",
        };
      case "carpentry":
        return {
          icon: "carpentry" as const,
          bgClass: "bg-orange-50 dark:bg-orange-950/20",
          iconColor: "#F97316",
        };
      default:
        return {
          icon: "otherService" as const,
          bgClass: "bg-gray-50 dark:bg-gray-950/20",
          iconColor: "#6B7280",
        };
    }
  };

  const getStatusConfig = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return {
          bgClass: "bg-amber-50 dark:bg-amber-950/30",
          textClass: "text-amber-600 dark:text-amber-400",
        };
      case "in_progress":
        return {
          bgClass: "bg-blue-50 dark:bg-blue-950/30",
          textClass: "text-blue-600 dark:text-blue-400",
        };
      case "completed":
        return {
          bgClass: "bg-green-50 dark:bg-green-950/30",
          textClass: "text-green-600 dark:text-green-400",
        };
      case "cancelled":
        return {
          bgClass: "bg-rose-50 dark:bg-rose-950/30",
          textClass: "text-rose-600 dark:text-rose-400",
        };
    }
  };

  if (!task) {
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
        <ScreenHeader title={t("worker.detailsTitle")} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center p-6">
          <AppText className="text-base text-muted-foreground">
            {t("worker.notFound")}
          </AppText>
        </View>
      </View>
    );
  }

  const categoryConfig = getCategoryConfig();
  const statusConfig = getStatusConfig(task.status);

  const handleAcceptTask = async () => {
    setActionLoading(true);
    try {
      await acceptTask(task.id);
      await addRequestComment(
        task.id,
        t("worker.acceptedComment").replace("{{name}}", workerName)
      );
      Alert.alert(
        t("worker.status.accepted"),
        t("worker.status.acceptedDesc"),
        [{ text: t("common.ok") }]
      );
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : t("errors.acceptTaskFailed");
      useToastStore.getState().showToast(errMsg, "error");
      Alert.alert(t("common.error"), errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadPhoto = () => {
    setIsMediaSheetVisible(true);
  };

  const handleLaunchCamera = async () => {
    const uri = await pickImage("camera");
    if (uri) setSelectedPhotos((prev) => [...prev, uri]);
  };

  const handleLaunchLibrary = async () => {
    const uri = await pickImage("library");
    if (uri) setSelectedPhotos((prev) => [...prev, uri]);
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitInspection = async (data: InspectFormValues) => {
    setActionLoading(true);
    try {
      // Encode photos to base64 payload
      const photosPayload = await Promise.all(
        selectedPhotos.map((photoUri) => encodeImageUri(photoUri))
      );

      await inspectTask(task.id, {
        notes: data.notes.trim(),
        materials: (data.materials || "").trim(),
        deadline: (data.deadline || "").trim(),
        photos: photosPayload,
      });

      await addRequestComment(
        task.id,
        t("worker.inspectionComment")
          .replace("{{materials}}", (data.materials || "").trim() || t("common.none"))
          .replace("{{deadline}}", (data.deadline || "").trim() || t("common.notAvailable"))
          .replace("{{notes}}", data.notes.trim())
      );

      Alert.alert(
        t("worker.status.inspected"),
        t("worker.status.inspectedDesc"),
        [{ text: t("common.ok") }]
      );
    } catch (e: unknown) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.inspectTaskFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTask = async () => {
    setActionLoading(true);
    try {
      await startTask(task.id);
      await addRequestComment(
        task.id,
        t("worker.startedComment").replace("{{name}}", workerName)
      );
      Alert.alert(
        t("worker.status.working"),
        t("worker.status.workingDesc"),
        [{ text: t("common.ok") }]
      );
    } catch (e: unknown) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.startTaskFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseMission = async () => {
    setActionLoading(true);
    try {
      await completeTask(task.id);
      await addRequestComment(
        task.id,
        t("worker.completedComment")
      );

      Alert.alert(
        t("worker.status.completed"),
        t("worker.status.completedDesc"),
        [{ text: t("common.ok"), onPress: () => router.back() }]
      );
    } catch (e: unknown) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.completeTaskFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const isAssignedToMe = task.workerName === workerName;
  const needsInspection = isAssignedToMe && (!task.workerPhase || task.workerPhase === "accepted");
  const needsStartTask = isAssignedToMe && task.workerPhase === "inspected";
  const needsCloseMission = isAssignedToMe && task.workerPhase === "working";
  const isCompleted = task.status === "completed" || task.workerPhase === "completed";

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
      <ScreenHeader title={t("worker.detailsTitle")} onBack={() => router.back()} />

      <KeyboardAwareScrollContent
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 40,
          paddingHorizontal: 20,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        {/* Task Summary Card */}
        <View className="w-full bg-card rounded-2xl p-5 flex-col gap-4 shadow-sm mb-6">
          <AppRow className="items-center justify-between gap-3">
            <AppRow className="items-center gap-3.5 flex-1 min-w-0">
              <View className={`w-12 h-12 rounded-xl items-center justify-center ${categoryConfig.bgClass}`}>
                <AppIcon name={categoryConfig.icon} size={24} color={categoryConfig.iconColor} />
              </View>
              <View className="flex-1 min-w-0 text-start">
                <AppText className="text-lg font-bold text-foreground text-start" numberOfLines={1}>
                  {t(`services.${task.category}` as any)}
                </AppText>
                <AppText className="text-xs text-muted-foreground mt-0.5 text-start">
                  #{task.id.toUpperCase()}
                </AppText>
              </View>
            </AppRow>

            {/* Status Badge */}
            <View className={`px-3 py-1 rounded-full ${statusConfig.bgClass}`}>
              <AppText className={`text-xs font-bold uppercase tracking-wider ${statusConfig.textClass}`}>
                {t(`tickets.status.${task.status}` as any)}
              </AppText>
            </View>
          </AppRow>

          <View className="pt-4 flex-col gap-3">
            {/* Unit Info */}
            <AppRow className="justify-between items-center">
              <AppText className="text-sm font-semibold text-muted-foreground text-start">
                {t("tickets.selectUnit")}
              </AppText>
              <AppText className="text-sm font-bold text-foreground text-end">
                {unitLabel}
              </AppText>
            </AppRow>

            {/* Date Requested */}
            <AppRow className="justify-between items-center">
              <AppText className="text-sm font-semibold text-muted-foreground text-start">
                {t("tickets.date")}
              </AppText>
              <AppText className="text-sm text-foreground text-end">
                {task.createdAt}
              </AppText>
            </AppRow>
          </View>
        </View>

        {/* Issue Details Section */}
        <View className="w-full bg-card rounded-2xl p-5 shadow-sm mb-6 flex-col gap-3">
          <AppText className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-start">
            {t("tickets.enterDetails")}
          </AppText>
          <AppText className="text-base text-foreground leading-6 text-start">
            {task.description}
          </AppText>
        </View>

        {/* Comments Section Button */}
        {isAssignedToMe && (
          <Pressable
            onPress={() => {
              router.push({
                pathname: "/worker/messages",
                params: { id: task.id },
              } as Href);
            }}
            className="w-full bg-card rounded-2xl p-4 shadow-sm mb-6 active:opacity-80 border border-border/10"
          >
            <AppRow className="items-center justify-between">
              <AppRow className="items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                  <AppIcon name="tickets" size={16} colorToken="--primary" />
                </View>
                <AppText className="text-base font-bold text-foreground text-start">
                  {t("tickets.comments")}
                </AppText>
              </AppRow>

              <AppRow className="items-center gap-2">
                {task.comments && task.comments.length > 0 && (
                  <View className="bg-primary px-2.5 py-0.5 rounded-full">
                    <AppText className="text-xs font-bold text-primary-foreground">
                      {task.comments.length}
                    </AppText>
                  </View>
                )}
                <AppChevron size={14} color={mutedToken} />
              </AppRow>
            </AppRow>
          </Pressable>
        )}

        {/* WORKFLOW VIEW CHANGER */}

        {/* Case 1: Pending & Not Assigned Task */}
        {task.status === "pending" && !task.workerName && (
          <View className="mt-4">
            <AppButton
              label={t("worker.acceptBtn")}
              onPress={handleAcceptTask}
            />
          </View>
        )}

        {/* Case 2: In Progress - Needs Inspection */}
        {needsInspection && (
          <View className="flex-col gap-6 w-full mt-2">
            <View className="w-full bg-card rounded-2xl p-5 shadow-sm flex-col gap-5">
              <AppText className="text-base font-bold text-foreground text-start pb-3">
                {t("worker.inspectBtn")}
              </AppText>

              {/* Inspection notes */}
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label={t("worker.notesLabel")}
                    placeholder={t("worker.notesPlaceholder")}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={3}
                    error={errors.notes?.message}
                  />
                )}
              />

              {/* Materials Needed */}
              <Controller
                control={control}
                name="materials"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label={t("worker.materialsLabel")}
                    placeholder={t("worker.materialsPlaceholder")}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={2}
                    error={errors.materials?.message}
                  />
                )}
              />

              {/* Estimated Deadline */}
              <Controller
                control={control}
                name="deadline"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput
                    label={t("worker.deadlineLabel")}
                    placeholder={t("worker.deadlinePlaceholder")}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.deadline?.message}
                  />
                )}
              />

              {/* Photos upload block */}
              <View className="flex-col gap-2.5">
                <AppText className="text-sm font-semibold text-muted-foreground text-start">
                  {t("worker.uploadImages")}
                </AppText>
                
                <AppRow className="items-center gap-3">
	                  <Pressable
	                    onPress={handleUploadPhoto}
	                    accessibilityLabel={t("worker.uploadImages")}
	                    accessibilityRole="button"
	                    className="w-12 h-12 rounded-xl bg-secondary justify-center items-center active:opacity-75"
                  >
                    <AppIcon name="camera" size={20} color={mutedToken} />
                  </Pressable>

                  <AppText className="text-sm text-muted-foreground">
                    {t("worker.imagesCount").replace("{{count}}", String(selectedPhotos.length))}
                  </AppText>
                </AppRow>

                {/* Real photo blocks */}
                {selectedPhotos.length > 0 && (
                  <AppRow className="gap-2.5 mt-2 flex-wrap">
                    {selectedPhotos.map((photoUri, idx) => (
	                      <View
	                        key={photoUri}
	                        className="w-16 h-16 rounded-xl bg-muted overflow-hidden relative"
	                      >
	                        <Pressable
                          onPress={() => {
                            setSelectedViewerImage(photoUri);
                            setIsViewerVisible(true);
	                          }}
	                          accessibilityLabel={t("tickets.openAttachment")}
	                          accessibilityRole="imagebutton"
	                          className="w-full h-full active:opacity-90"
                        >
                          <Image source={photoUri} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                        </Pressable>
                        
                        {/* Remove button */}
	                        <Pressable
	                          onPress={() => handleRemovePhoto(idx)}
	                          accessibilityLabel={t("tickets.removeAttachment")}
	                          accessibilityRole="button"
	                          className="absolute -top-1 -end-1 bg-rose-600 w-5 h-5 rounded-full items-center justify-center shadow-sm z-10 active:opacity-75"
                        >
                          <AppIcon name="trash" size={10} colorToken="--primary-foreground" />
                        </Pressable>
                      </View>
                    ))}
                  </AppRow>
                )}
              </View>
            <View className="mt-2">
              <AppButton
                label={t("worker.submitInspectionBtn")}
                onPress={handleSubmit(handleSubmitInspection)}
              />
            </View>
          </View>
          </View>
        )}

        {/* Case 3: Needs Start Task (Inspected, Ready to work) */}
        {needsStartTask && (
          <View className="flex-col gap-6 w-full mt-2">
            {/* Inspection details card */}
            <View className="w-full bg-card rounded-2xl p-5 shadow-sm flex-col gap-4">
              <AppText className="text-base font-bold text-foreground text-start pb-3">
                {t("worker.inspectBtn")}
              </AppText>
              <AppText className="text-sm text-card-foreground leading-6 text-start bg-secondary/40 p-4 rounded-xl">
                {typeof task.notes === "string" ? task.notes : ""}
              </AppText>
            </View>

            <View className="mt-2">
              <AppButton
                label={t("worker.startTaskBtn")}
                onPress={handleStartTask}
              />
            </View>
          </View>
        )}

        {/* Case 4: Needs Close Mission (Working) */}
        {needsCloseMission && (
          <View className="flex-col gap-6 w-full mt-2">
            {/* Inspection details card */}
            <View className="w-full bg-card rounded-2xl p-5 shadow-sm flex-col gap-4">
              <AppRow className="items-center justify-between pb-3">
                <AppText className="text-base font-bold text-foreground text-start">
                  {t("worker.inspectBtn")}
                </AppText>
                <View className="px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/30">
                  <AppText className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {t("worker.status.working")}
                  </AppText>
                </View>
              </AppRow>
              <AppText className="text-sm text-card-foreground leading-6 text-start bg-secondary/40 p-4 rounded-xl">
                {typeof task.notes === "string" ? task.notes : ""}
              </AppText>
            </View>

            <View className="mt-2">
              <AppButton
                label={t("worker.closeTaskBtn")}
                onPress={handleCloseMission}
              />
            </View>
          </View>
        )}

        {/* Case 5: Completed Tasks - Read Only Summary */}
        {isCompleted && task.notes && (
          <View className="w-full bg-card rounded-2xl p-5 shadow-sm mt-2 flex-col gap-4">
            <AppText className="text-base font-bold text-foreground text-start pb-3">
              {t("worker.inspectBtn")}
            </AppText>
            <AppText className="text-sm text-card-foreground leading-6 text-start bg-secondary/40 p-4 rounded-xl">
              {typeof task.notes === "string" ? task.notes : ""}
            </AppText>
          </View>
        )}
      </KeyboardAwareScrollContent>

      <FullScreenLoader visible={actionLoading || (loading && isTransitionFinished)} />

      <MediaSourceSheet
        isPresented={isMediaSheetVisible}
        onDismiss={() => setIsMediaSheetVisible(false)}
        onSelectCamera={handleLaunchCamera}
        onSelectLibrary={handleLaunchLibrary}
      />

      <FullscreenImageViewer
        visible={isViewerVisible}
        imageUri={selectedViewerImage}
        onClose={() => setIsViewerVisible(false)}
      />
    </View>
  );
}
