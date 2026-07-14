import axios, { isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/constants/api";
import { useToastStore } from "@/stores/toast-store";
import { getFriendlyErrorMessage } from "@/lib/error-formatter";

let currentSessionId: string | null = null;
let currentLanguage: string | null = null;

export const setApiLanguage = (language: string | null) => {
  currentLanguage = language;
};

// Initialize session ID from storage
export const initializeSession = async () => {
  try {
    const stored = await SecureStore.getItemAsync("session_id");
    if (stored) {
      currentSessionId = stored;
    }
    return stored;
  } catch (error) {
    console.error("Failed to load session ID from SecureStore", error);
    return null;
  }
};

export const getSessionId = () => currentSessionId;

export const setSessionId = async (id: string | null) => {
  currentSessionId = id;
  try {
    if (id) {
      await SecureStore.setItemAsync("session_id", id);
    } else {
      await SecureStore.deleteItemAsync("session_id");
    }
  } catch (error) {
    console.error("Failed to set session ID in SecureStore", error);
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

export async function apiRequest<T = ApiResponse>(
  route: string,
  params: ApiParams = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${route}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (currentSessionId) {
    headers["Cookie"] = `session_id=${currentSessionId}`;
    headers["X-Openerp-Session-Id"] = currentSessionId;
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
    route.startsWith("/auth/");

  try {
    const response = await axios.post(url, payload, { headers, timeout: 15000 });
    const result = response.data;

    // Handle Odoo-level JSON-RPC errors
    if (result.error) {
      const errMsg = result.error.message || JSON.stringify(result.error);
      if (
        !isAuthRoute &&
        (result.error.code === 100 ||
          errMsg.toLowerCase().includes("session expired") ||
          errMsg.toLowerCase().includes("sessionexpiredexception"))
      ) {
        handleSessionExpired();
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

    if (
      !isAuthRoute &&
      (status === 401 ||
        errCode === "access_denied" ||
        errMsg.toLowerCase().includes("session expired") ||
        errMsg.toLowerCase().includes("sessionexpiredexception"))
    ) {
      handleSessionExpired();
    }

    if (options.showErrorToast !== false) {
      const friendly = getFriendlyErrorMessage(error);
      useToastStore.getState().showToast(friendly, "error");
    }

    console.error(`[API Error] ${route}:`, error instanceof Error ? error.message : error);
    throw error;
  }
}
