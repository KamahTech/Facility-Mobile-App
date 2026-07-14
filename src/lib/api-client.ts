import axios, { isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/constants/api";
import { useToastStore } from "@/stores/toast-store";
import { getFriendlyErrorMessage } from "@/lib/error-formatter";

let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;
let currentLanguage: string | null = null;

export const setApiLanguage = (language: string | null) => {
  currentLanguage = language;
};

// Initialize session ID from storage
export const initializeSession = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync("access_token");
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (accessToken && refreshToken) {
      currentAccessToken = accessToken;
      currentRefreshToken = refreshToken;
      return accessToken;
    }
    return null;
  } catch (error) {
    console.error("Failed to load tokens from SecureStore", error);
    return null;
  }
};

export const getSessionId = () => currentAccessToken;

export const setSessionId = async (accessToken: string | null, refreshToken?: string | null) => {
  currentAccessToken = accessToken;
  if (refreshToken !== undefined) {
    currentRefreshToken = refreshToken;
  }
  
  try {
    if (accessToken) {
      await SecureStore.setItemAsync("access_token", accessToken);
    } else {
      await SecureStore.deleteItemAsync("access_token");
    }
    
    if (refreshToken) {
      await SecureStore.setItemAsync("refresh_token", refreshToken);
    } else if (refreshToken === null) {
      await SecureStore.deleteItemAsync("refresh_token");
    }
  } catch (error) {
    console.error("Failed to set tokens in SecureStore", error);
  }
};

let sessionExpiredHandler: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: () => void) => {
  sessionExpiredHandler = handler;
};

const handleSessionExpired = () => {
  if (sessionExpiredHandler) {
    sessionExpiredHandler();
  }
};

export type ApiParams = Record<string, unknown>;
export type ApiResponse = unknown;
export type ApiRequestOptions = {
  showErrorToast?: boolean;
};

let refreshPromise: Promise<{
  accessToken: string;
  refreshToken: string;
}> | null = null;

async function performTokenRefresh(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      if (!currentRefreshToken) {
        throw new Error("No refresh token available");
      }

      const url = `${API_BASE_URL}/auth/refresh`;
      const payload = {
        jsonrpc: "2.0",
        method: "call",
        params: {
          refreshToken: currentRefreshToken,
        },
        id: Date.now(),
      };

      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      const result = response.data;
      if (result.error) {
        throw new Error(result.error.message || "Failed to refresh token");
      }

      const data = result.result;
      if (!data || data.ok === false) {
        const err = data?.error || {};
        throw new Error(err.message || "Refresh token request failed");
      }

      const resData = Object.prototype.hasOwnProperty.call(data, "data") ? data.data : data;
      return resData;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T = ApiResponse>(
  route: string,
  params: ApiParams = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${route}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (currentAccessToken) {
    headers["Authorization"] = `Bearer ${currentAccessToken}`;
  }

  if (currentLanguage) {
    headers["X-Language"] = currentLanguage;
    headers["Accept-Language"] = currentLanguage === "ar" ? "ar-EG,ar;q=0.9,en;q=0.8" : "en-US,en;q=0.9";
  }

  const getBackendLang = (lang: unknown) => {
    if (lang === "ar" || lang === "ar_001") return "ar_001";
    if (lang === "en" || lang === "en_US") return "en_US";
    return lang;
  };

  const backendLang = getBackendLang(currentLanguage);
  const requestParams = { ...params } as ApiParams;
  if (requestParams.lang !== undefined) {
    requestParams.lang = getBackendLang(requestParams.lang);
  } else if (backendLang) {
    requestParams.lang = backendLang;
  }

  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: requestParams,
    id: Date.now(),
  };

  const isAuthRoute =
    route === "/auth/login" ||
    route === "/auth/worker/login" ||
    route === "/auth/logout" ||
    route === "/auth/refresh" ||
    route.startsWith("/auth/");

  try {
    const response = await axios.post(url, payload, { headers, timeout: 15000 });
    const result = response.data;

    // Handle Odoo-level JSON-RPC errors
    if (result.error) {
      const errMsg = result.error.message || JSON.stringify(result.error);
      const errCode = result.error.code;

      const isAuthError = 
        errCode === "access_denied" ||
        errCode === 100 ||
        errMsg.toLowerCase().includes("session expired") ||
        errMsg.toLowerCase().includes("sessionexpiredexception") ||
        errMsg.toLowerCase().includes("access denied") ||
        errMsg.toLowerCase().includes("unauthorized");

      if (!isAuthRoute && isAuthError) {
        try {
          const newTokens = await performTokenRefresh();
          const { accessToken, refreshToken } = newTokens;
          await setSessionId(accessToken, refreshToken);

          const { useUserStore } = require("@/stores/user-store");
          useUserStore.setState({
            sessionId: accessToken,
          });

          // Retry the request
          return await apiRequest<T>(route, params, options);
        } catch (refreshErr) {
          handleSessionExpired();
          throw refreshErr;
        }
      }
      throw new Error(errMsg);
    }

    const data = result.result;
    if (data === undefined || data === null) {
      throw new Error("No response data from Odoo service.");
    }

    if (data.ok === false) {
      const err = data.error || {};
      throw new Error(err.message || "API request failed");
    }

    return Object.prototype.hasOwnProperty.call(data, "data") ? data.data : data;
  } catch (error: unknown) {
    const axiosError = isAxiosError(error) ? error : null;
    const status = axiosError?.response?.status;
    const responseData = axiosError?.response?.data as
      | {
          error?: { code?: string | number; message?: string };
          result?: { ok?: boolean; error?: { code?: string | number; message?: string } };
        }
      | undefined;
    const responseError = responseData?.error || responseData?.result?.error;
    const errCode = responseError?.code;
    const errMsg = responseError?.message || "";

    const isAuthError = 
      status === 401 ||
      errCode === "access_denied" ||
      errMsg.toLowerCase().includes("session expired") ||
      errMsg.toLowerCase().includes("sessionexpiredexception") ||
      errMsg.toLowerCase().includes("access denied") ||
      errMsg.toLowerCase().includes("unauthorized");

    if (!isAuthRoute && isAuthError) {
      try {
        const newTokens = await performTokenRefresh();
        const { accessToken, refreshToken } = newTokens;
        await setSessionId(accessToken, refreshToken);

        const { useUserStore } = require("@/stores/user-store");
        useUserStore.setState({
          sessionId: accessToken,
        });

        // Retry the request
        return await apiRequest<T>(route, params, options);
      } catch (refreshErr) {
        handleSessionExpired();
        throw refreshErr;
      }
    }

    if (options.showErrorToast !== false) {
      const friendly = getFriendlyErrorMessage(error);
      useToastStore.getState().showToast(friendly, "error");
    }

    console.error(`[API Error] ${route}:`, error instanceof Error ? error.message : error);
    throw error;
  }
}
