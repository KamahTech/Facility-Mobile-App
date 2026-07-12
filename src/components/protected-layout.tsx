import React from "react";
import { View } from "react-native";
import { AppActivityIndicator } from "@/components/app-activity-indicator";
import { Redirect, type Href } from "expo-router";

import { useUserStore } from "@/stores/user-store";

type ProtectedLayoutProps = {
  accountType: "resident" | "worker";
  children: React.ReactNode;
};

const fallbackByAccountType: Record<ProtectedLayoutProps["accountType"], Href> = {
  resident: "/home",
  worker: "/worker",
};

export function ProtectedLayout({ accountType, children }: ProtectedLayoutProps) {
  const {
    accountType: currentAccountType,
    initialize,
    initialized,
    sessionId,
  } = useUserStore();

  React.useEffect(() => {
    if (!initialized) {
      void initialize();
    }
  }, [initialize, initialized]);

  if (!initialized) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <AppActivityIndicator size="large"  />
      </View>
    );
  }

  if (!sessionId) {
    return <Redirect href="/choose-login-method" />;
  }

  if (currentAccountType && currentAccountType !== accountType) {
    return <Redirect href={fallbackByAccountType[currentAccountType]} />;
  }

  return children;
}
