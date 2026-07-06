import "../global.css";

import { Stack } from "expo-router";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { createStackScreenOptions } from "@/constants/navigation";
import { useThemeToken } from "@/hooks/use-theme-token";
import { I18nProvider } from "@/providers/i18n-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider>
            <ThemeProvider>
              <I18nProvider>
                <RootStack />
              </I18nProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const background = useThemeToken("--background");

  return (
    <Stack screenOptions={createStackScreenOptions(background)}>
      <Stack.Screen name="on-boarding" />
      <Stack.Screen name="choose-login-method" />
      <Stack.Screen name="login" />
      <Stack.Screen name="language" />
      <Stack.Screen name="(resident)" />
      <Stack.Screen name="(worker)" />
    </Stack>
  );
}
