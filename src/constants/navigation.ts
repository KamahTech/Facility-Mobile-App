import type { ColorValue } from "react-native";

export function createStackScreenOptions(backgroundColor: ColorValue) {
  return {
    ...stackScreenOptions,
    contentStyle: {
      backgroundColor,
    },
  };
}

export const stackScreenOptions = {
  headerShown: false,
  animation: "ios_from_right",
} as const;
