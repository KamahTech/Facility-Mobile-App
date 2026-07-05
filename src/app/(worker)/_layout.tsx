import { Stack } from "expo-router";

import { createStackScreenOptions } from "@/constants/navigation";
import { useThemeToken } from "@/hooks/use-theme-token";

export default function WorkerLayout() {
  const background = useThemeToken("--background");

  return <Stack screenOptions={createStackScreenOptions(background)} />;
}
