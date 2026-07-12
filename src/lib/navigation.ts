import { router as expoRouter } from "expo-router";

type RouterPushTarget = Parameters<typeof expoRouter.push>[0];

const DUPLICATE_NAVIGATION_WINDOW_MS = 800;

let lastPushTarget = "";
let lastPushTime = 0;

function getNavigationKey(target: RouterPushTarget) {
  return typeof target === "string" ? target : JSON.stringify(target);
}

export function guardedPush(target: RouterPushTarget) {
  const now = Date.now();
  const navigationKey = getNavigationKey(target);

  if (
    navigationKey === lastPushTarget &&
    now - lastPushTime < DUPLICATE_NAVIGATION_WINDOW_MS
  ) {
    return;
  }

  lastPushTarget = navigationKey;
  lastPushTime = now;
  expoRouter.push(target);
}

export const router = {
  ...expoRouter,
  push: guardedPush,
};

