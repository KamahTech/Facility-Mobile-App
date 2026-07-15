import axios, { isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/constants/api";
import { useToastStore } from "@/stores/toast-store";
import { getFriendlyErrorMessage } from "@/lib/error-formatter";

let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;
let currentLanguage: string | null = null;
let sessionRevision = 0;
let sessionWriteQueue: Promise<void> = Promise.resolve();

export const setApiLanguage = (language: string | null) => {
  currentLanguage = language;
};

let initPromise: Promise<string | null> | null = null;

// Initialize session ID from storage
export const initializeSession = () => {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
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
  })();

  return initPromise;
};

export const getSessionId = () => currentAccessToken;

export const setSessionId = async (
  accessToken: string | null,
  refreshToken?: string | null,
) => {
  // Invalidate any refresh request that started for the previous local session.
  sessionRevision += 1;
  const write = sessionWriteQueue.then(async () => {
    try {
      // Store a rotated refresh token first. The old one becomes invalid as soon as
      // refresh succeeds, so we must not report success unless the new pair is durable.
      if (refreshToken) {
        await SecureStore.setItemAsync("refresh_token", refreshToken);
      } else if (refreshToken === null) {
        await SecureStore.deleteItemAsync("refresh_token");
      }

      if (accessToken) {
        await SecureStore.setItemAsync("access_token", accessToken);
      } else {
        await SecureStore.deleteItemAsync("access_token");
      }
    } catch (error) {
      // Never leave a partially-written token pair that cannot be refreshed later.
      await Promise.allSettled([
        SecureStore.deleteItemAsync("access_token"),
        SecureStore.deleteItemAsync("refresh_token"),
      ]);
      currentAccessToken = null;
      currentRefreshToken = null;
      initPromise = Promise.resolve(null);
      throw error;
    }

    currentAccessToken = accessToken;
    if (refreshToken !== undefined) currentRefreshToken = refreshToken;
    initPromise = Promise.resolve(accessToken);
  });

  sessionWriteQueue = write.catch(() => undefined);
  await write;
};

let sessionExpiredHandler: (() => void | Promise<void>) | null = null;

export const setSessionExpiredHandler = (
  handler: () => void | Promise<void>,
) => {
  sessionExpiredHandler = handler;
};

const handleSessionExpired = async () => {
  if (sessionExpiredHandler) {
    await sessionExpiredHandler();
  }
};

export type ApiParams = Record<string, unknown>;
export type ApiResponse = unknown;
export type ApiRequestOptions = {
  showErrorToast?: boolean;
  _isRetry?: boolean;
};

let refreshPromise: Promise<{
  accessToken: string;
  refreshToken: string;
}> | null = null;

class RefreshRejectedError extends Error {}

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
        throw new RefreshRejectedError("No refresh token available");
      }

      const submittedRefreshToken = currentRefreshToken;
      const submittedSessionRevision = sessionRevision;

      const url = `${API_BASE_URL}/auth/refresh`;
      const payload = {
        jsonrpc: "2.0",
        method: "call",
        params: {
          refreshToken: submittedRefreshToken,
        },
        id: Date.now(),
      };

      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      const result = response.data;
      if (result.error) {
        throw new RefreshRejectedError(
          result.error.message || "Failed to refresh token",
        );
      }

      const data = result.result;
      if (!data || data.ok === false) {
        const err = data?.error || {};
        throw new RefreshRejectedError(
          err.message || "Refresh token request failed",
        );
      }

      const resData = Object.prototype.hasOwnProperty.call(data, "data")
        ? data.data
        : data;
      const accessToken = resData?.accessToken || resData?.access_token;
      const refreshToken = resData?.refreshToken || resData?.refresh_token;
      if (!accessToken || !refreshToken) {
        throw new RefreshRejectedError(
          "Refresh response did not contain a complete token pair",
        );
      }

      // Logout or a new login may have happened while the request was in flight.
      if (
        currentRefreshToken !== submittedRefreshToken ||
        sessionRevision !== submittedSessionRevision
      ) {
        throw new Error("Session changed while token refresh was in progress");
      }

      return { accessToken, refreshToken };
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        throw new RefreshRejectedError("Refresh token was rejected");
      }
      console.error("Token refresh failed:", error);
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

let tokenRefreshPromise: Promise<string> | null = null;

async function refreshTokenFlow(): Promise<string> {
  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  tokenRefreshPromise = (async () => {
    try {
      const newTokens = await performTokenRefresh();
      const { accessToken, refreshToken } = newTokens;

      try {
        await setSessionId(accessToken, refreshToken);
      } catch {
        throw new RefreshRejectedError(
          "Failed to securely store the refreshed token pair",
        );
      }

      const { useUserStore } = require("@/stores/user-store");
      useUserStore.setState({
        sessionId: accessToken,
      });

      return accessToken;
    } catch (error) {
      // A network/timeout failure is recoverable. Keep the current tokens so a
      // later request can retry, as required by the backend authentication guide.
      if (error instanceof RefreshRejectedError) {
        await handleSessionExpired();
      }
      throw error;
    } finally {
      tokenRefreshPromise = null;
    }
  })();

  return tokenRefreshPromise;
}

export async function apiRequest<T = ApiResponse>(
  route: string,
  params: ApiParams = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  // Ensure session is initialized before sending any request
  if (!currentAccessToken) {
    await initializeSession();
  }

  // If a token refresh is currently in progress, wait for it to complete
  if (tokenRefreshPromise) {
    await tokenRefreshPromise;
  }

  const url = `${API_BASE_URL}${route}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (currentAccessToken) {
    headers["Authorization"] = `Bearer ${currentAccessToken}`;
  }

  if (currentLanguage) {
    headers["X-Language"] = currentLanguage;
    headers["Accept-Language"] =
      currentLanguage === "ar" ? "ar-EG,ar;q=0.9,en;q=0.8" : "en-US,en;q=0.9";
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
    const response = await axios.post(url, payload, {
      headers,
      timeout: 15000,
    });
    const result = response.data;

    // Handle Odoo-level JSON-RPC errors
    if (result.error) {
      const errMsg = result.error.message || JSON.stringify(result.error);

      const isAuthError =
        errMsg.toLowerCase().includes("session expired") ||
        errMsg.toLowerCase().includes("sessionexpiredexception") ||
        errMsg.toLowerCase().includes("invalid access token") ||
        errMsg.toLowerCase().includes("expired access token");

      if (!isAuthRoute && isAuthError) {
        if (options._isRetry) {
          await handleSessionExpired();
          throw new Error(
            "Session expired. Retried request failed authentication.",
          );
        }

        try {
          await refreshTokenFlow();

          // Delay retry slightly to allow Odoo database transaction commit to settle
          await new Promise((resolve) => setTimeout(resolve, 150));

          // Retry the request
          return await apiRequest<T>(route, params, {
            ...options,
            _isRetry: true,
          });
        } catch (refreshErr) {
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
      const errMsg = err.message || "API request failed";

      const isAuthError =
        errMsg.toLowerCase().includes("session expired") ||
        errMsg.toLowerCase().includes("sessionexpiredexception") ||
        errMsg.toLowerCase().includes("invalid access token") ||
        errMsg.toLowerCase().includes("expired access token");

      if (!isAuthRoute && isAuthError) {
        if (options._isRetry) {
          await handleSessionExpired();
          throw new Error(
            "Session expired. Retried request failed authentication.",
          );
        }

        try {
          await refreshTokenFlow();

          // Delay retry slightly to allow Odoo database transaction commit to settle
          await new Promise((resolve) => setTimeout(resolve, 150));

          // Retry the request
          return await apiRequest<T>(route, params, {
            ...options,
            _isRetry: true,
          });
        } catch (refreshErr) {
          throw refreshErr;
        }
      }

      throw new Error(errMsg);
    }

    return Object.prototype.hasOwnProperty.call(data, "data")
      ? data.data
      : data;
  } catch (error: unknown) {
    const axiosError = isAxiosError(error) ? error : null;
    const status = axiosError?.response?.status;
    const responseData = axiosError?.response?.data as
      | {
          error?: { code?: string | number; message?: string };
          result?: {
            ok?: boolean;
            error?: { code?: string | number; message?: string };
          };
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
      if (options._isRetry) {
        // A fresh access token followed by a plain access_denied response is a
        // business permission failure, not an expired session.
        if (
          errCode === "access_denied" &&
          !errMsg.toLowerCase().includes("expired") &&
          !errMsg.toLowerCase().includes("invalid") &&
          !errMsg.toLowerCase().includes("session")
        ) {
          throw error;
        }

        await handleSessionExpired();
        throw new Error(
          "Session expired. Retried request failed authentication.",
        );
      }

      try {
        await refreshTokenFlow();

        // Delay retry slightly to allow Odoo database transaction commit to settle
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Retry the request
        return await apiRequest<T>(route, params, {
          ...options,
          _isRetry: true,
        });
      } catch (refreshErr) {
        throw refreshErr;
      }
    }

    if (options.showErrorToast !== false) {
      const friendly = getFriendlyErrorMessage(error);
      useToastStore.getState().showToast(friendly, "error");
    }

    console.error(
      `[API Error] ${route}:`,
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}
