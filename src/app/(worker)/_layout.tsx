import { Stack } from "expo-router";
import { PortalHost, PortalProvider } from "@gorhom/portal";
import { ScrollAnimationProvider } from "@/providers/scroll-animation-provider";

import { ProtectedLayout } from "@/components/protected-layout";
import { createStackScreenOptions } from "@/constants/navigation";
import { useThemeToken } from "@/hooks/use-theme-token";

export default function WorkerLayout() {
  const background = useThemeToken("--background");

  return (
    <PortalProvider>
      <ScrollAnimationProvider>
        <ProtectedLayout accountType="worker">
          <Stack screenOptions={createStackScreenOptions(background)} />
          <PortalHost name="worker-root" />
        </ProtectedLayout>
      </ScrollAnimationProvider>
    </PortalProvider>
  );
}
