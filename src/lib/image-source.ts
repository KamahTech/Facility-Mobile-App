import { API_BASE_URL } from "@/constants/api";
import { getSessionId } from "@/lib/api-client";

export type BackendImageValue = string | false | null | undefined;

function getApiOrigin() {
  return API_BASE_URL.replace(/^(https?:\/\/[^/]+).*$/, "$1");
}

function withSessionCookie(uri: string) {
  const sessionId = getSessionId();

  if (!sessionId) {
    return { uri };
  }

  return {
    uri,
    headers: {
      Cookie: `session_id=${sessionId}`,
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

  const apiOrigin = getApiOrigin();

  if (imageUrl.startsWith("/")) {
    return withSessionCookie(`${apiOrigin}${imageUrl}`);
  }

  if (imageUrl.startsWith(apiOrigin)) {
    return withSessionCookie(imageUrl);
  }

  return { uri: imageUrl };
}

export const getProfileImageSource = getBackendImageSource;
