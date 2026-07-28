const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

if (!configuredApiBaseUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_BASE_URL is required. Configure it for the current EAS environment.",
  );
}

if (!/^https?:\/\//.test(configuredApiBaseUrl)) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL must be an absolute HTTP(S) URL.");
}

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, "");
