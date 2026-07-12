import React from "react";
import { View, Pressable, TextInput, Alert, FlatList } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useAppInsets } from "@/hooks/use-app-insets";
import { Image } from "expo-image";
import { useGenericKeyboardHandler } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { ScreenHeader } from "@/components/screen-header";
import { MediaSourceSheet } from "@/components/media-source-sheet";
import { FullscreenImageViewer } from "@/components/fullscreen-image-viewer";
import { AppText } from "@/components/app-text";
import { AppIcon } from "@/components/app-icon";
import { AppRow } from "@/components/app-row";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeToken } from "@/hooks/use-theme-token";
import { useAppImagePicker } from "@/hooks/use-image-picker";
import { encodeImageUriAsDataUrl } from "@/lib/media";
import { type RequestComment } from "@/stores/requests-store";
import { getBackendImageSource } from "@/lib/image-source";
import { getDirectionalTextStyle } from "@/lib/i18n-layout";
import { useTicketRealtime } from "@/hooks/use-ticket-realtime";

type ChatViewProps = {
  ticketId: string;
  comments: RequestComment[];
  accountType: "resident" | "worker";
  onSendComment: (content: string, imageBase64: string | false, imageName: string | false) => Promise<void>;
  onBack: () => void;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
};

export function ChatView({
  ticketId,
  comments,
  accountType,
  onSendComment,
  onBack,
  isLoadingMore = false,
  onLoadMore,
  hasNextPage = false,
}: ChatViewProps) {
  const { t, direction } = useI18n();
  const insets = useAppInsets();
  const { pickImage } = useAppImagePicker();
  
  // Register/activate WebSocket connection for realtime chat updates
  useTicketRealtime(ticketId, accountType);

  const directionStyle = getDirectionalTextStyle(direction);
  const background = useThemeToken("--background");

  const [newComment, setNewComment] = React.useState("");
  const [selectedPhoto, setSelectedPhoto] = React.useState<string | null>(null);
  const [isMediaSheetVisible, setIsMediaSheetVisible] = React.useState(false);
  const [selectedViewerImage, setSelectedViewerImage] = React.useState<string | null>(null);
  const [isViewerVisible, setIsViewerVisible] = React.useState(false);
  const [sendLoading, setSendLoading] = React.useState(false);
  
  const listRef = React.useRef<FlatList>(null);
  const keyboardTranslateY = useSharedValue(0);

  // Re-scroll when comments length changes (realtime new messages)
  React.useEffect(() => {
    if (comments.length > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      });
    }
  }, [comments.length]);

  useGenericKeyboardHandler(
    {
      onStart: (event) => {
        "worklet";
        keyboardTranslateY.value = -event.height;
      },
      onMove: (event) => {
        "worklet";
        keyboardTranslateY.value = -event.height;
      },
      onInteractive: (event) => {
        "worklet";
        keyboardTranslateY.value = -event.height;
      },
      onEnd: (event) => {
        "worklet";
        keyboardTranslateY.value = -event.height;
      },
    },
    [],
  );

  const listKeyboardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: keyboardTranslateY.value }],
    };
  });

  const composerKeyboardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: keyboardTranslateY.value }],
    };
  });

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

      await onSendComment(newComment.trim(), imageBase64, imageName);
      setNewComment("");
      setSelectedPhoto(null);
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      });
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

  const renderCommentItem = ({ item }: { item: RequestComment }) => {
    // Aligns messages sent by the current active account to the end (right in LTR)
    const isSelf = item.senderRole === accountType;
    const roleStyle = getRoleBadgeStyle(item.senderRole);
    const roleLabel =
      item.senderRole === "resident"
        ? t("auth.residentTitle")
        : item.senderRole === "worker"
        ? t("auth.workerTitle")
        : t("tickets.adminRole");

    if (isSelf) {
      return (
        <View className="flex-col gap-1 w-[80%] self-end items-end mb-4">
          {/* Chat Bubble Body */}
          <View className="px-4 py-2.5 bg-primary rounded-2xl rounded-tr-none shadow-2xs">
            {/* Render attachment image if present */}
            {typeof item.image === "string" && (
              <Pressable
                onPress={() => {
                  setSelectedViewerImage(item.image as string);
                  setIsViewerVisible(true);
                }}
                accessibilityLabel={t("tickets.openAttachment")}
                accessibilityRole="imagebutton"
                className="mb-2 w-52 h-36 rounded-xl overflow-hidden active:opacity-90"
              >
                <Image source={getBackendImageSource(item.image)} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              </Pressable>
            )}
            {item.content ? (
              <AppText className="text-sm text-primary-foreground leading-5 text-start px-0.5 py-0.5 font-medium">
                {item.content}
              </AppText>
            ) : null}
          </View>

          {/* Time */}
          <AppText className="text-[10px] text-muted-foreground/60 px-1 mt-0.5">
            {item.createdAt}
          </AppText>
        </View>
      );
    }

    return (
      <AppRow className="items-start gap-2.5 w-[85%] self-start mb-4">
        {/* Avatar */}
        <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center shrink-0 mt-4 shadow-3xs border border-border/20">
          <AppIcon name={item.senderRole === "worker" ? "profile" : "security"} size={16} colorToken="--muted-foreground" />
        </View>

        <View className="flex-col gap-1 flex-1 items-start">
          {/* Bubble Name & Role */}
          <AppRow className="items-center gap-1.5 px-1">
            <AppText className="text-xs font-bold text-muted-foreground">
              {item.senderName}
            </AppText>
            <View className={`px-1.5 py-0.5 rounded ${roleStyle.bg}`}>
              <AppText className={`text-[10px] font-bold uppercase tracking-wider ${roleStyle.text}`}>
                {roleLabel}
              </AppText>
            </View>
          </AppRow>

          {/* Chat Bubble Body */}
          <View className="px-4 py-2.5 bg-card rounded-2xl rounded-tl-none w-full shadow-2xs border border-border/40">
            {/* Render attachment image if present */}
            {typeof item.image === "string" && (
              <Pressable
                onPress={() => {
                  setSelectedViewerImage(item.image as string);
                  setIsViewerVisible(true);
                }}
                accessibilityLabel={t("tickets.openAttachment")}
                accessibilityRole="imagebutton"
                className="mb-2 w-52 h-36 rounded-xl overflow-hidden active:opacity-90"
              >
                <Image source={getBackendImageSource(item.image)} style={{ width: "100%", height: "100%" }} contentFit="cover" />
              </Pressable>
            )}
            {item.content ? (
              <AppText className="text-sm text-foreground leading-5 text-start px-0.5 py-0.5">
                {item.content}
              </AppText>
            ) : null}
          </View>

          {/* Time */}
          <AppText className="text-[10px] text-muted-foreground/60 px-1 mt-0.5">
            {item.createdAt}
          </AppText>
        </View>
      </AppRow>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: background,
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <ScreenHeader title={t("tickets.comments")} onBack={onBack} />

      <View className="flex-1 w-full overflow-hidden">
        <Animated.View className="flex-1 w-full max-w-xl self-center px-5" style={listKeyboardStyle}>
          <FlatList
            ref={listRef}
            data={comments}
            keyExtractor={(item) => item.id}
            inverted={true}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: 24,
            }}
            ListEmptyComponent={
              <View
                className="w-full py-16 items-center justify-center rounded-3xl bg-card/50 border border-border/30 shadow-3xs"
                style={{ transform: [{ scaleY: -1 }] }}
              >
                <View className="w-12 h-12 rounded-full bg-secondary/50 items-center justify-center mb-3">
                  <AppIcon name="tickets" size={22} colorToken="--muted-foreground" />
                </View>
                <AppText className="text-sm text-muted-foreground text-center">
                  {t("tickets.noComments")}
                </AppText>
              </View>
            }
            ListFooterComponent={
              isLoadingMore ? (
                <View className="py-4 items-center justify-center" style={{ transform: [{ scaleY: -1 }] }}>
                  <AppActivityIndicator size="small" />
                </View>
              ) : null
            }
            renderItem={renderCommentItem}
            className="flex-1 w-full"
          />
        </Animated.View>
      </View>

      {/* Sticky Comment Input Box at the bottom */}
      <Animated.View
        className="w-full bg-card border-t border-border/30"
        style={[
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
          composerKeyboardStyle,
        ]}
      >
        {/* Selected Photo Preview */}
        {selectedPhoto && (
          <AppRow className="px-4 pt-3 max-w-xl self-center w-full">
            <View className="w-20 h-20 rounded-xl bg-muted overflow-hidden relative border border-border/40 shadow-3xs">
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
                className="absolute top-1 end-1 bg-rose-600 w-5 h-5 rounded-full items-center justify-center shadow-sm z-10 active:opacity-75"
              >
                <AppIcon name="trash" size={10} colorToken="--primary-foreground" />
              </Pressable>
            </View>
          </AppRow>
        )}

        <AppRow className="w-full max-w-xl self-center px-4 py-3 items-center gap-3">
          <Pressable
            onPress={handlePickImage}
            accessibilityLabel={t("worker.mediaSourceCamera")}
            accessibilityRole="button"
            className="w-11 h-11 rounded-full bg-secondary items-center justify-center active:opacity-75 border border-border/20 shadow-3xs"
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
            className="flex-1 min-h-[44px] max-h-[100px] bg-background border border-border/40 rounded-2xl px-4 py-2.5 text-base text-foreground shadow-3xs"
            multiline
          />
          <Pressable
            onPress={handleSubmitComment}
            disabled={sendLoading || (!newComment.trim() && !selectedPhoto)}
            accessibilityLabel={t("tickets.send")}
            accessibilityRole="button"
            className="w-11 h-11 rounded-full bg-primary items-center justify-center active:opacity-70 shadow-sm disabled:opacity-40"
          >
            {sendLoading ? (
              <AppActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <AppIcon name="send" size={16} colorToken="--primary-foreground" />
            )}
          </Pressable>
        </AppRow>
      </Animated.View>

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
