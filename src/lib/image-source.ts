import { API_BASE_URL } from "@/constants/api";
import { getSessionId } from "@/lib/api-client";

export type BackendImageValue = string | false | null | undefined;

function getApiOrigin() {
  return API_BASE_URL.replace(/^(https?:\/\/[^/]+).*$/, "$1");
}

function withBearerToken(uri: string) {
  const token = getSessionId();

  if (!token) {
    return { uri };
  }

  return {
    uri,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export function getBackendImageSource(imageUrl: BackendImageValue, fallback?: number) {
  if (!imageUrl) {
    return fallback;
  }

  if (imageUrl.startsWith("data:") || imageUrl.startsWith("file:")) {
    return { uri: imageUrl };
  }

  if (
    !imageUrl.startsWith("/") &&
    !imageUrl.startsWith("http:") &&
    !imageUrl.startsWith("https:")
  ) {
    return { uri: `data:image/jpeg;base64,${imageUrl}` };
  }

  const apiOrigin = getApiOrigin();

  if (imageUrl.startsWith("/")) {
    return withBearerToken(`${apiOrigin}${imageUrl}`);
  }

  if (imageUrl.startsWith(apiOrigin)) {
    return withBearerToken(imageUrl);
  }

  return { uri: imageUrl };
}

export const getProfileImageSource = getBackendImageSource;
