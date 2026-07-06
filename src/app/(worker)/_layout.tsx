import { Stack } from "expo-router";

import { ProtectedLayout } from "@/components/protected-layout";
import { createStackScreenOptions } from "@/constants/navigation";
import { useThemeToken } from "@/hooks/use-theme-token";

export default function WorkerLayout() {
  const background = useThemeToken("--background");

  return (
    <ProtectedLayout accountType="worker">
      <Stack screenOptions={createStackScreenOptions(background)} />
    </ProtectedLayout>
  );
}
