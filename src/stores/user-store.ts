import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { apiRequest, setSessionId, initializeSession, setSessionExpiredHandler } from "@/lib/api-client";
import { router } from "expo-router";

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  profileImageUrl?: string | false;
};

type UserState = {
  profile: UserProfile | null;
  sessionId: string | null;
  accountType: "resident" | "worker" | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string, accountType: "resident" | "worker") => Promise<void>;
  requestOtp: (name: string, email: string, password: string, phone?: string) => Promise<any>;
  signup: (name: string, email: string, password: string, otp: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  updateProfileImage: (image: string | false) => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  deleteAccount: () => Promise<void>;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  profile: UserProfile;
  accountType?: "resident" | "worker";
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  sessionId: null,
  accountType: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    try {
      const storedSession = await initializeSession();
      const accountType = (await SecureStore.getItemAsync("account_type")) as "resident" | "worker" | null;
      const profileStr = await SecureStore.getItemAsync("profile_data");
      
      if (!storedSession) {
        set({ initialized: true });
        return;
      }
      
      set({
        sessionId: storedSession,
        accountType,
        profile: profileStr ? JSON.parse(profileStr) : null,
        initialized: true,
      });
    } catch (e: unknown) {
      set({ initialized: true });
      console.error("Initialization of user session failed:", e);
    }
  },

  login: async (email, password, accountType) => {
    set({ loading: true, error: null });
    try {
      const endpoint = accountType === "worker" ? "/auth/worker/login" : "/auth/login";
      const response = await apiRequest<AuthResponse>(endpoint, { email, password });
      const { accessToken, refreshToken, profile } = response;
      
      await setSessionId(accessToken, refreshToken);
      await SecureStore.setItemAsync("account_type", accountType);
      await SecureStore.setItemAsync("profile_data", JSON.stringify(profile));
      await SecureStore.deleteItemAsync("logged_out");

      set({
        sessionId: accessToken,
        accountType,
        profile,
        loading: false,
        error: null,
      });
    } catch (e: unknown) {
      set({ loading: false, error: getErrorMessage(e, "Login failed") });
      throw e;
    }
  },

  requestOtp: async (name, email, password, phone) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest<{ ok?: boolean }>("/auth/signup/request-otp", { name, email, password, phone });
      set({ loading: false, error: null });
      return response;
    } catch (e: unknown) {
      set({ loading: false, error: getErrorMessage(e, "Failed to request OTP") });
      throw e;
    }
  },

  signup: async (name, email, password, otp, phone) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest<AuthResponse>("/auth/signup", { name, email, password, otp, phone });
      const { accessToken, refreshToken, profile } = response;
      
      await setSessionId(accessToken, refreshToken);
      await SecureStore.setItemAsync("account_type", "resident");
      await SecureStore.setItemAsync("profile_data", JSON.stringify(profile));
      await SecureStore.deleteItemAsync("logged_out");

      set({
        sessionId: accessToken,
        accountType: "resident",
        profile,
        loading: false,
        error: null,
      });
    } catch (e: unknown) {
      set({ loading: false, error: getErrorMessage(e, "Signup failed") });
      throw e;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await apiRequest("/auth/logout", {});
    } catch (e) {
      console.warn("Logout request to backend failed, clearing local session anyway.", e);
    } finally {
      await setSessionId(null, null);
      await SecureStore.deleteItemAsync("account_type");
      await SecureStore.deleteItemAsync("profile_data");
      await SecureStore.setItemAsync("logged_out", "true");
      set({
        sessionId: null,
        accountType: null,
        profile: null,
        loading: false,
        error: null,
      });
    }
  },

  updateProfile: async (updated) => {
    set({ loading: true, error: null });
    try {
      const updatedProfile = await apiRequest<UserProfile>("/me/update", updated);
      
      await SecureStore.setItemAsync("profile_data", JSON.stringify(updatedProfile));
      set({
        profile: updatedProfile,
        loading: false,
      });
    } catch (e: unknown) {
      set({ loading: false, error: getErrorMessage(e, "Profile update failed") });
      throw e;
    }
  },

  updateProfileImage: async (image) => {
    set({ loading: true, error: null });
    try {
      const updatedProfile = await apiRequest<UserProfile>("/me/profile-image", { image });

      await SecureStore.setItemAsync("profile_data", JSON.stringify(updatedProfile));
      set({
        profile: updatedProfile,
        loading: false,
      });
    } catch (e: unknown) {
      set({ loading: false, error: getErrorMessage(e, "Profile image update failed") });
      throw e;
    }
  },

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await apiRequest<UserProfile>("/me", {});
      await SecureStore.setItemAsync("profile_data", JSON.stringify(profile));
      set({
        profile,
        loading: false,
      });
    } catch (e: unknown) {
      set({ loading: false, error: getErrorMessage(e, "Failed to fetch profile") });
      throw e;
    }
  },

  clearError: () => set({ error: null }),

  deleteAccount: async () => {
    set({ loading: true, error: null });
    try {
      await apiRequest("/me/delete", {});
      await setSessionId(null, null);
      await SecureStore.deleteItemAsync("account_type");
      await SecureStore.deleteItemAsync("profile_data");
      await SecureStore.setItemAsync("logged_out", "true");
      set({
        sessionId: null,
        accountType: null,
        profile: null,
        loading: false,
        error: null,
      });
    } catch (e: unknown) {
      set({ loading: false, error: getErrorMessage(e, "Account deletion failed") });
      throw e;
    }
  },
}));

// Handle session expiration: clear local data, update store, and redirect to login screen
setSessionExpiredHandler(async () => {
  try {
    await setSessionId(null, null);
    await SecureStore.deleteItemAsync("account_type");
    await SecureStore.deleteItemAsync("profile_data");
    await SecureStore.setItemAsync("logged_out", "true");
  } catch (error) {
    console.error("Failed to clear session storage in session expiration handler:", error);
  }

  useUserStore.setState({
    sessionId: null,
    accountType: null,
    profile: null,
    loading: false,
    error: "Session expired. Please login again.",
  });

  router.replace("/choose-login-method" as any);
});
