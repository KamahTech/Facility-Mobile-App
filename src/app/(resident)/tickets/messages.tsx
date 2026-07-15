import React from "react";
import { View } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useLocalSearchParams, Stack } from "expo-router";
import { router } from "@/lib/navigation";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { useRequestsStore, useTicketCommentsQuery } from "@/stores/requests-store";
import { ChatView } from "@/components/chat-view";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function ResidentTicketMessagesScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const params = useLocalSearchParams();
  const requestId = params.id as string;

  const isTransitionFinished = useScreenTransition();
  const { requests, addRequestComment } = useRequestsStore({ enableResidentRequests: true });
  const commentsQuery = useTicketCommentsQuery(requestId);

  const request = requests.find((r) => r.id === requestId);

  const comments = React.useMemo(() => {
    return commentsQuery.data?.pages.flatMap((page) => [...page.items].reverse()) || [];
  }, [commentsQuery.data?.pages]);

  const showLoading = !isTransitionFinished || commentsQuery.isLoading;

  if (showLoading) {
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
        <View className="flex-1 items-center justify-center">
          <AppActivityIndicator size="large"  />
        </View>
      </View>
    );
  }

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

  const handleSendComment = async (
    content: string,
    imageBase64: string | false,
    imageName: string | false
  ) => {
    await addRequestComment(request.id, content, imageBase64, imageName);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatView
        ticketId={request.id}
        comments={comments}
        accountType="resident"
        onSendComment={handleSendComment}
        onBack={() => router.back()}
        isLoadingMore={commentsQuery.isFetchingNextPage}
        onLoadMore={() => {
          if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
            commentsQuery.fetchNextPage();
          }
        }}
        hasNextPage={commentsQuery.hasNextPage}
        composerDisabled={!request.workerName}
        composerDisabledPlaceholder={t("tickets.waitingForWorker")}
      />
    </>
  );
}
