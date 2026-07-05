import React from "react";
import { View, ScrollView, Pressable, KeyboardAvoidingView, Platform, TextInput, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { ScreenHeader } from "@/components/screen-header";
import { MediaSourceSheet } from "@/components/media-source-sheet";
import { FullscreenImageViewer } from "@/components/fullscreen-image-viewer";
import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useAppImagePicker } from "@/hooks/use-image-picker";
import { encodeImageUriAsDataUrl } from "@/lib/media";
import { useRequestsStore } from "@/stores/requests-store";
import { getDirectionalTextStyle } from "@/lib/i18n-layout";

export default function ResidentTicketMessagesScreen() {
  const { t, direction } = useI18n();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const requestId = params.id as string;

  const { requests, addRequestComment } = useRequestsStore({ enableResidentRequests: true });
  const { pickImage } = useAppImagePicker();

  const request = requests.find((r) => r.id === requestId);
  const directionStyle = getDirectionalTextStyle(direction);

  const [newComment, setNewComment] = React.useState("");
  const [selectedPhoto, setSelectedPhoto] = React.useState<string | null>(null);
  const [isMediaSheetVisible, setIsMediaSheetVisible] = React.useState(false);
  const [selectedViewerImage, setSelectedViewerImage] = React.useState<string | null>(null);
  const [isViewerVisible, setIsViewerVisible] = React.useState(false);
  const [sendLoading, setSendLoading] = React.useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Auto scroll to end on comments count change or component mount
  React.useEffect(() => {
    if (request && request.comments.length > 0) {
      const scrollTimeout = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(scrollTimeout);
    }
  }, [request?.comments.length, request]);

  if (!request) {
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
        <ScreenHeader title={t("tickets.comments")} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center p-6">
          <AppText className="text-base text-muted-foreground">
            {t("tickets.notFound")}
          </AppText>
        </View>
      </View>
    );
  }



  const handleSubmitComment = async () => {
    if (!newComment.trim() && !selectedPhoto) return;
    
    setSendLoading(true);
    try {
      let imageBase64: string | false = false;
      let imageName: string | false = false;

      if (selectedPhoto) {
        const encoded = await encodeImageUriAsDataUrl(selectedPhoto);
        imageBase64 = encoded.dataUrl;
        imageName = encoded.name;
      }

      await addRequestComment(request.id, newComment.trim(), imageBase64, imageName);
      setNewComment("");
      setSelectedPhoto(null);
    } catch (e: unknown) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("errors.commentSubmitFailed"));
    } finally {
      setSendLoading(false);
    }
  };

  const handlePickImage = () => {
    setIsMediaSheetVisible(true);
  };

  const handleLaunchCamera = async () => {
    const uri = await pickImage("camera");
    if (uri) setSelectedPhoto(uri);
  };

  const handleLaunchLibrary = async () => {
    const uri = await pickImage("library");
    if (uri) setSelectedPhoto(uri);
  };

  const getRoleBadgeStyle = (role: "resident" | "admin" | "worker") => {
    switch (role) {
      case "resident":
        return {
          bg: "bg-purple-100 dark:bg-purple-950/30",
          text: "text-purple-600 dark:text-purple-400",
        };
      case "admin":
        return {
          bg: "bg-indigo-100 dark:bg-indigo-950/30",
          text: "text-indigo-600 dark:text-indigo-400",
        };
      case "worker":
        return {
          bg: "bg-orange-100 dark:bg-orange-950/30",
          text: "text-orange-600 dark:text-orange-400",
        };
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title={t("tickets.comments")} onBack={() => router.back()} />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}
        className="flex-1 w-full max-w-xl self-center"
      >
        {request.comments.length === 0 ? (
          <View className="w-full py-16 items-center justify-center border border-dashed border-border rounded-2xl bg-card/40">
            <AppText className="text-sm text-muted-foreground text-center">
              {t("tickets.noComments")}
            </AppText>
          </View>
        ) : (
          <View className="flex-col gap-4 w-full">
            {request.comments.map((comment) => {
              const isResident = comment.senderRole === "resident";
              const roleStyle = getRoleBadgeStyle(comment.senderRole);
              const roleLabel =
                comment.senderRole === "resident"
                  ? t("auth.residentTitle")
                  : comment.senderRole === "worker"
                  ? t("auth.workerTitle")
                  : t("tickets.adminRole");

              return (
                <View
                  key={comment.id}
                  className={`flex-col gap-1.5 max-w-[85%] ${
                    isResident ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  {/* Bubble Name & Role */}
                  <AppRow className="items-center gap-1.5 px-1">
                    <AppText className="text-xs font-bold text-muted-foreground">
                      {comment.senderName}
                    </AppText>
                    <View className={`px-1.5 py-0.5 rounded ${roleStyle.bg}`}>
                      <AppText className={`text-[10px] font-bold uppercase tracking-wider ${roleStyle.text}`}>
                        {roleLabel}
                      </AppText>
                    </View>
                  </AppRow>

                  {/* Chat Bubble Body */}
                  <View
                    className={`p-2.5 rounded-2xl ${
                      isResident
                        ? "bg-primary/10 border border-primary/25 dark:bg-primary/20 dark:border-primary/30 rounded-se-none"
                        : "bg-card border border-border/80 rounded-ss-none"
                    }`}
                  >
                    {/* Render attachment image if present */}
                    {typeof comment.image === "string" && (
                      <Pressable
                        onPress={() => {
                          setSelectedViewerImage(comment.image as string);
                          setIsViewerVisible(true);
                        }}
                        accessibilityLabel={t("tickets.openAttachment")}
                        accessibilityRole="imagebutton"
                        className="mb-2 w-52 h-36 rounded-xl overflow-hidden border border-border/40 active:opacity-90"
                      >
                        <Image source={comment.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                      </Pressable>
                    )}
                    {comment.content ? (
                      <AppText className="text-sm text-foreground leading-5 text-start px-1 py-0.5">
                        {comment.content}
                      </AppText>
                    ) : null}
                  </View>

                  {/* Time */}
                  <AppText className="text-[10px] text-muted-foreground/80 px-1 mt-0.5">
                    {comment.createdAt}
                  </AppText>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Sticky Comment Input Box at the bottom */}
      <View
        className="w-full border-t border-border bg-card"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        {/* Selected Photo Preview */}
        {selectedPhoto && (
          <View className="px-4 pt-3 flex-row max-w-xl self-center w-full">
            <View className="w-20 h-20 rounded-xl border border-border bg-muted overflow-hidden relative">
              <Pressable
                onPress={() => {
                  setSelectedViewerImage(selectedPhoto);
                  setIsViewerVisible(true);
                }}
                accessibilityLabel={t("tickets.openAttachment")}
                accessibilityRole="imagebutton"
                className="w-full h-full active:opacity-90"
              >
                <Image source={selectedPhoto} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              </Pressable>
              <Pressable
                onPress={() => setSelectedPhoto(null)}
                accessibilityLabel={t("tickets.removeAttachment")}
                accessibilityRole="button"
                className="absolute top-1 end-1 bg-rose-600 w-5 h-5 rounded-full items-center justify-center border border-card shadow-sm z-10 active:opacity-75"
              >
                <AppIcon name="trash" size={10} colorToken="--primary-foreground" />
              </Pressable>
            </View>
          </View>
        )}

        <View className="w-full max-w-xl self-center px-4 py-3 flex-row items-center gap-3">
          <Pressable
            onPress={handlePickImage}
            accessibilityLabel={t("worker.mediaSourceCamera")}
            accessibilityRole="button"
            className="w-11 h-11 rounded-full bg-secondary border border-border items-center justify-center active:opacity-75"
          >
            <AppIcon name="camera" size={20} colorToken="--foreground" />
          </Pressable>

          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder={t("tickets.addComment")}
            placeholderTextColor="#A1A1AA"
            style={[
              directionStyle,
              {
                textAlignVertical: "top",
              },
            ]}
            className="flex-1 min-h-[44px] max-h-[100px] bg-background border border-border rounded-2xl px-4 py-2.5 text-base text-foreground"
            multiline
          />
          <Pressable
            onPress={handleSubmitComment}
            disabled={sendLoading}
            accessibilityLabel={t("tickets.send")}
            accessibilityRole="button"
            className="w-11 h-11 rounded-full bg-primary items-center justify-center active:opacity-70 shadow-sm disabled:opacity-50"
          >
            {sendLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <AppIcon name="send" size={16} colorToken="--primary-foreground" />
            )}
          </Pressable>
        </View>
      </View>

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
    </KeyboardAvoidingView>
  );
}
