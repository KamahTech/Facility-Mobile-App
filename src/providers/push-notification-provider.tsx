import React from "react";
import * as Notifications from "expo-notifications";
import { useUserStore } from "@/stores/user-store";
import { usePushNotificationStore } from "@/stores/push-notification-store";
import { handleNotificationNavigation } from "@/lib/notification-router";

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const sessionId = useUserStore((state) => state.sessionId);
  const registerDevice = usePushNotificationStore((state) => state.registerDevice);

  // Set the notification handler to control whether an alert is shown when the app is in the foreground
  React.useEffect(() => {
    Notifications.setNotificationHandler({
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
      void registerDevice();
    }
  }, [sessionId, registerDevice]);

  React.useEffect(() => {
    if (!sessionId) return;

    const subscription = Notifications.addPushTokenListener((tokenObj) => {
      const currentToken = usePushNotificationStore.getState().expoPushToken;
      if (tokenObj?.data && tokenObj.data !== currentToken) {
        void registerDevice(true);
      }
    });

    return () => subscription.remove();
  }, [registerDevice, sessionId]);

  // Handle notification tap actions
  React.useEffect(() => {
    let coldLaunchTimer: ReturnType<typeof setTimeout> | null = null;

    // 1. Handle background/foreground notification tap
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data) {
        handleNotificationNavigation(data, useUserStore.getState().accountType);
      }
    });

    // 2. Handle cold launch from notification
    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          const data = response.notification.request.content.data;
          if (data) {
            // Delay slightly to allow navigation/Expo Router layout to mount
            coldLaunchTimer = setTimeout(() => {
              handleNotificationNavigation(
                data,
                useUserStore.getState().accountType,
              );
            }, 1000);
          }
        }
      })
      .catch(() => {
        // The app can continue normally when no native notification response is available.
      });

    return () => {
      subscription.remove();
      if (coldLaunchTimer) clearTimeout(coldLaunchTimer);
    };
  }, []);

  return <>{children}</>;
}
export default PushNotificationProvider;
