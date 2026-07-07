export function getFriendlyErrorMessage(error: unknown, t?: (key: any) => string): string {
  if (!error) {
    return t ? t("errors.generic") : "Something went wrong. Please try again.";
  }

  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();

  // Network / Connection errors
  if (
    message.includes("network request failed") ||
    message.includes("failed to fetch") ||
    message.includes("timeout") ||
    message.includes("offline")
  ) {
    return t ? t("errors.connectionLost") : "Connection lost. Please check your internet connection and try again.";
  }

  // Session / Authentication errors
  if (
    message.includes("session expired") ||
    message.includes("session_expired") ||
    message.includes("sessionexpiredexception") ||
    message.includes("invalid session")
  ) {
    return t ? t("errors.sessionExpired") : "Session expired. Please log in again.";
  }

  // Access / Permission errors
  if (
    message.includes("access_denied") ||
    message.includes("access denied") ||
    message.includes("forbidden") ||
    message.includes("403")
  ) {
    return t ? t("errors.permissionDenied") : "You do not have permission to perform this action.";
  }

  // Server errors
  if (
    message.includes("500") ||
    message.includes("internal server error") ||
    message.includes("server_error")
  ) {
    return t ? t("errors.serverError") : "Our servers are experiencing temporary issues. Please try again later.";
  }

  // Not found errors
  if (message.includes("404") || message.includes("not found")) {
    return t ? t("errors.generic") : "Something went wrong. Please try again.";
  }

  // Fallback for technical tracebacks and low-level code errors
  if (
    message.includes("traceback") ||
    message.includes("file \"") ||
    message.includes("line ") ||
    message.includes("database error") ||
    message.includes("postgresql") ||
    message.includes("key (") ||
    message.includes("violates") ||
    message.includes("syntax error") ||
    message.includes("unexpected token") ||
    message.includes("json parse") ||
    message.includes("undefined is not")
  ) {
    return t ? t("errors.generic") : "Something went wrong. Please try again.";
  }

  // If the error message is short, user-friendly, and has no tracebacks, keep it
  const originalMessage = error instanceof Error ? error.message : String(error);
  if (originalMessage && originalMessage.length < 120 && !originalMessage.includes("traceback")) {
    return originalMessage;
  }

  return t ? t("errors.generic") : "Something went wrong. Please try again.";
}
