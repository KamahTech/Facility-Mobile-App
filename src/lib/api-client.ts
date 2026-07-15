import axios, { isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/constants/api";
import { useToastStore } from "@/stores/toast-store";
import { getFriendlyErrorMessage } from "@/lib/error-formatter";

let currentAccessToken: string | null = null;
let currentAccessTokenExpiresAt: number | null = null;
let currentLanguage: string | null = null;
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
      const expiresAtValue = await SecureStore.getItemAsync(
        "access_token_expires_at",
      );
      const expiresAt = Number(expiresAtValue);
      if (accessToken && Number.isFinite(expiresAt) && expiresAt > Date.now()) {
        currentAccessToken = accessToken;
        currentAccessTokenExpiresAt = expiresAt;
        return accessToken;
      }

      await Promise.allSettled([
        SecureStore.deleteItemAsync("access_token"),
        SecureStore.deleteItemAsync("access_token_expires_at"),
      ]);
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
  expiresInSeconds?: number,
) => {
  const expiresAt =
    accessToken &&
    Number.isFinite(expiresInSeconds) &&
    Number(expiresInSeconds) > 0
      ? Date.now() + Number(expiresInSeconds) * 1000
      : null;
  const write = sessionWriteQueue.then(async () => {
    try {
      if (accessToken) {
        if (!expiresAt) {
          throw new Error("Access token expiry is required");
        }
        await SecureStore.setItemAsync("access_token", accessToken);
        await SecureStore.setItemAsync(
          "access_token_expires_at",
          String(expiresAt),
        );
      } else {
        await Promise.all([
          SecureStore.deleteItemAsync("access_token"),
          SecureStore.deleteItemAsync("access_token_expires_at"),
        ]);
      }
    } catch (error) {
      await Promise.allSettled([
        SecureStore.deleteItemAsync("access_token"),
        SecureStore.deleteItemAsync("access_token_expires_at"),
      ]);
      currentAccessToken = null;
      currentAccessTokenExpiresAt = null;
      initPromise = Promise.resolve(null);
      throw error;
    }

    currentAccessToken = accessToken;
    currentAccessTokenExpiresAt = expiresAt;
    initPromise = Promise.resolve(accessToken);
  });

  sessionWriteQueue = write.catch(() => undefined);
  await write;
};

let sessionExpiredHandler: (() => void | Promise<void>) | null = null;
let sessionExpirationPromise: Promise<void> | null = null;

export const setSessionExpiredHandler = (
  handler: () => void | Promise<void>,
) => {
  sessionExpiredHandler = handler;
};

const handleSessionExpired = async () => {
  if (!sessionExpirationPromise) {
    sessionExpirationPromise = Promise.resolve(
      sessionExpiredHandler?.(),
    ).finally(() => {
      sessionExpirationPromise = null;
    });
  }
  await sessionExpirationPromise;
};

export type ApiParams = Record<string, unknown>;
export type ApiResponse = unknown;
export type ApiRequestOptions = {
  showErrorToast?: boolean;
};

function isAccessTokenAuthenticationError(message: unknown): boolean {
  const normalizedMessage = String(message || "").toLowerCase();
  return (
    normalizedMessage.includes("session expired") ||
    normalizedMessage.includes("sessionexpiredexception") ||
    /\b(?:invalid|expired)\b.*\b(?:access\s+)?token\b/.test(normalizedMessage)
  );
}

class SessionExpiredError extends Error {}

export async function apiRequest<T = ApiResponse>(
  route: string,
  params: ApiParams = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const isAuthRoute = route.startsWith("/auth/");

  // Ensure session is initialized before sending any request
  if (!currentAccessToken) {
    await initializeSession();
  }

  if (!isAuthRoute && !currentAccessToken) {
    await handleSessionExpired();
    throw new SessionExpiredError("No valid access token is available");
  }

  if (
    !isAuthRoute &&
    currentAccessToken &&
    currentAccessTokenExpiresAt !== null &&
    currentAccessTokenExpiresAt <= Date.now()
  ) {
    await handleSessionExpired();
    throw new SessionExpiredError("Access token has expired");
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

  try {
    const response = await axios.post(url, payload, {
      headers,
      timeout: 15000,
    });
    const result = response.data;

    // Handle Odoo-level JSON-RPC errors
    if (result.error) {
      const errMsg = result.error.message || JSON.stringify(result.error);

      const isAuthError = isAccessTokenAuthenticationError(errMsg);

      if (!isAuthRoute && isAuthError) {
        await handleSessionExpired();
        throw new SessionExpiredError(errMsg);
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

      const isAuthError = isAccessTokenAuthenticationError(errMsg);

      if (!isAuthRoute && isAuthError) {
        await handleSessionExpired();
        throw new SessionExpiredError(errMsg);
      }

      throw new Error(errMsg);
    }

    return Object.prototype.hasOwnProperty.call(data, "data")
      ? data.data
      : data;
  } catch (error: unknown) {
    const axiosError = isAxiosError(error) ? error : null;
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
    const errMsg = responseError?.message || "";

    const isAuthError = isAccessTokenAuthenticationError(errMsg);

    if (!isAuthRoute && isAuthError) {
      await handleSessionExpired();
      throw new SessionExpiredError(errMsg);
    }

    if (error instanceof SessionExpiredError) {
      throw error;
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
