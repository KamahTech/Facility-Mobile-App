import React from "react";
import { Redirect } from "expo-router";
import { useUserStore } from "@/stores/user-store";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { initialize, initialized, sessionId, accountType } = useUserStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }} className="bg-background">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (sessionId) {
    if (accountType === "worker") {
      return <Redirect href="/worker" />;
    }
    return <Redirect href="/home" />;
  }

  return <Redirect href="/on-boarding" />;
}
