import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiRequest } from "@/lib/api-client";

// Simple fallback UUID generator
function generateUUID() {
  let d = new Date().getTime();
  let d2 = 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

type PushNotificationState = {
  expoPushToken: string | null;
  deviceId: string | null;
  isRegistered: boolean;
  activeTicketId: string | null;
  activeChatTicketId: string | null;

  setActiveTicketId: (id: string | null) => void;
  setActiveChatTicketId: (id: string | null) => void;
  registerDevice: (accessToken: string) => Promise<void>;
  unregisterDevice: () => Promise<void>;
};

export const usePushNotificationStore = create<PushNotificationState>((set, get) => ({
  expoPushToken: null,
  deviceId: null,
  isRegistered: false,
  activeTicketId: null,
  activeChatTicketId: null,

  setActiveTicketId: (id) => set({ activeTicketId: id }),
  setActiveChatTicketId: (id) => set({ activeChatTicketId: id }),

  registerDevice: async (accessToken: string) => {
    if (get().isRegistered) return;

    try {
      // 1. Ensure this is a physical device (push notifications require real devices)
      if (!Device.isDevice) {
        console.log("[PushNotifications] Simulators do not support remote push notifications.");
        return;
      }

      // 2. Request Notification Permissions
      const currentPerms = await Notifications.getPermissionsAsync();
      let status = currentPerms.status;
      if (status !== "granted") {
        const request = await Notifications.requestPermissionsAsync();
        status = request.status;
      }

      if (status !== "granted") {
        console.warn("[PushNotifications] Permission for notifications was not granted.");
        return;
      }

      // Android requires a channel configuration for notifications to display
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4F46E5",
        });
      }

      // 3. Retrieve or generate unique deviceId (persisted UUID in SecureStore)
      let deviceId = await SecureStore.getItemAsync("device_installation_id");
      if (!deviceId) {
        deviceId = generateUUID();
        await SecureStore.setItemAsync("device_installation_id", deviceId);
      }

      // 4. Retrieve EAS projectId
      const projectId =
        Constants.easConfig?.projectId ??
        Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.warn("[PushNotifications] EAS projectId is missing from configuration.");
        return;
      }

      // 5. Get Expo push token
      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

      // 6. Register with the backend
      console.log("[PushNotifications] Registering push token with backend...", {
        deviceId,
        platform: Platform.OS,
        projectId,
      });

      await apiRequest("/notifications/push/register", {
        expoPushToken,
        deviceId,
        platform: Platform.OS === "android" ? "android" : "ios",
        projectId,
      });

      set({
        expoPushToken,
        deviceId,
        isRegistered: true,
      });
    } catch (error) {
      console.error("[PushNotifications] Failed to register push token with backend:", error);
    }
  },

  unregisterDevice: async () => {
    const { deviceId, isRegistered } = get();
    if (!isRegistered || !deviceId) return;

    try {
      console.log("[PushNotifications] Unregistering device from backend:", deviceId);
      await apiRequest("/notifications/push/unregister", {
        deviceId,
      });
    } catch (error) {
      console.error("[PushNotifications] Failed to unregister device from backend:", error);
    } finally {
      set({
        isRegistered: false,
        expoPushToken: null,
      });
    }
  },
}));
