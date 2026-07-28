import React from "react";
import * as Notifications from "expo-notifications";
import { useUserStore } from "@/stores/user-store";
import { usePushNotificationStore } from "@/stores/push-notification-store";
import { handleNotificationNavigation } from "@/lib/notification-router";

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const sessionId = useUserStore((state) => state.sessionId);
  const initialized = useUserStore((state) => state.initialized);
  const accountType = useUserStore((state) => state.accountType);
  const registerDevice = usePushNotificationStore((state) => state.registerDevice);
  const pendingNavigationRef = React.useRef<Notifications.NotificationContentInput["data"] | null>(
    null,
  );

  const navigateFromNotification = React.useCallback(
    async (data: Notifications.NotificationContentInput["data"]) => {
      if (!initialized || !sessionId || !accountType) {
        pendingNavigationRef.current = data;
        return false;
      }

      pendingNavigationRef.current = null;
      const handled = handleNotificationNavigation(data || {}, accountType);
      await Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
      return handled;
    },
    [accountType, initialized, sessionId],
  );

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
          return {
            shouldShowBanner: false,
            shouldShowList: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          };
        }

        return {
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        };
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

  React.useEffect(() => {
    if (
      initialized &&
      sessionId &&
      accountType &&
      pendingNavigationRef.current
    ) {
      void navigateFromNotification(pendingNavigationRef.current);
    }
  }, [accountType, initialized, navigateFromNotification, sessionId]);

  // Handle notification tap actions only after authentication has been restored.
  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data) {
        void navigateFromNotification(data);
      }
    });

    if (initialized && sessionId && accountType) {
      void Notifications.getLastNotificationResponseAsync()
        .then((response) => {
          const data = response?.notification.request.content.data;
          if (data) {
            return navigateFromNotification(data);
          }
        })
        .catch(() => undefined);
    }

    return () => {
      subscription.remove();
    };
  }, [
    accountType,
    initialized,
    navigateFromNotification,
    sessionId,
  ]);

  return <>{children}</>;
}
export default PushNotificationProvider;
