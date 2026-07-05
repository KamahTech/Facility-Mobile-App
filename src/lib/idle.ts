/**
 * Safely schedules a callback to run during a browser/runtime's idle periods.
 * Falls back to `setTimeout` if `requestIdleCallback` is not available in the environment.
 */
export function runOnIdle(callback: () => void): { cancel: () => void } {
  if (typeof requestIdleCallback !== "undefined") {
    const handle = requestIdleCallback(() => callback());
    return {
      cancel: () => cancelIdleCallback(handle),
    };
  }

  const handle = setTimeout(callback, 0);
  return {
    cancel: () => clearTimeout(handle),
  };
}
