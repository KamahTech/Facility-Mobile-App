import React from "react";
import * as Notifications from "expo-notifications";
import { useUserStore } from "@/stores/user-store";
import { usePushNotificationStore } from "@/stores/push-notification-store";
import { handleNotificationNavigation } from "@/lib/notification-router";

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const sessionId = useUserStore((state) => state.sessionId);
  const accountType = useUserStore((state) => state.accountType);
  const registerDevice = usePushNotificationStore((state) => state.registerDevice);

  // Set the notification handler to control whether an alert is shown when the app is in the foreground
  React.useEffect(() => {
    const subscription = Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const data = notification.request.content.data || {};
        const activeTicketId = usePushNotificationStore.getState().activeTicketId;
        const activeChatTicketId = usePushNotificationStore.getState().activeChatTicketId;

        // Suppress notifications if the user is currently on the screen that shows the realtime updates
        const ticketId = (data.ticketId as string) || "";
        const screen = String(data.screen || "").toLowerCase();

        const isViewingChat = screen === "ticket_chat" && ticketId && String(ticketId) === String(activeChatTicketId);
        const isViewingDetails = screen === "ticket" && ticketId && String(ticketId) === String(activeTicketId);

        if (isViewingChat || isViewingDetails) {
          console.log("[PushNotificationProvider] Suppressing push notification because user is viewing target screen", {
            screen,
            ticketId,
          });
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          } as any;
        }

        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        } as any;
      },
    });

    // Cleanup: reset handler to default behavior
    return () => {
      Notifications.setNotificationHandler(null);
    };
  }, []);

  // Register device token with backend when user is logged in
  React.useEffect(() => {
    if (sessionId) {
      registerDevice(sessionId);
    }
  }, [sessionId, registerDevice]);

  // Handle notification tap actions
  React.useEffect(() => {
    // 1. Handle background/foreground notification tap
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data) {
        handleNotificationNavigation(data, useUserStore.getState().accountType);
      }
    });

    // 2. Handle cold launch from notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        if (data) {
          // Delay slightly to allow navigation/Expo Router layout to mount
          setTimeout(() => {
            handleNotificationNavigation(data, useUserStore.getState().accountType);
          }, 1000);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [accountType]);

  return <>{children}</>;
}
export default PushNotificationProvider;
