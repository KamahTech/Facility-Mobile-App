import React from "react";
import { View } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useAppInsets } from "@/hooks/use-app-insets";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { useRequestsStore } from "@/stores/requests-store";
import { ChatView } from "@/components/chat-view";
import { useScreenTransition } from "@/hooks/use-screen-transition";

export default function WorkerTicketMessagesScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const params = useLocalSearchParams();
  const taskId = params.id as string;

  const isTransitionFinished = useScreenTransition();
  const { requests, addRequestComment, loading } = useRequestsStore({ enableWorkerTasks: true });

  const task = requests.find((r) => r.id === taskId);

  const showLoading = !isTransitionFinished || (loading && requests.length === 0);

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
        <ScreenHeader title={t("tickets.comments")} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center p-6">
          <AppText className="text-base text-muted-foreground">
            {t("worker.notFound")}
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
    await addRequestComment(task.id, content, imageBase64, imageName);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatView
        ticketId={task.id}
        comments={task.comments}
        accountType="worker"
        onSendComment={handleSendComment}
        onBack={() => router.back()}
      />
    </>
  );
}
