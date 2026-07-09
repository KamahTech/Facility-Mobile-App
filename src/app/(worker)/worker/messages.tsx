import React from "react";
import { View } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { useI18n } from "@/hooks/use-i18n";
import { useRequestsStore } from "@/stores/requests-store";
import { ChatView } from "@/components/chat-view";

export default function WorkerTicketMessagesScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const taskId = params.id as string;

  const { requests, addRequestComment } = useRequestsStore({ enableWorkerTasks: true });

  const task = requests.find((r) => r.id === taskId);

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
