import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type KeyboardAwareScrollContentProps = React.ComponentProps<typeof KeyboardAwareScrollView> & {
  bottomOffset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function KeyboardAwareScrollContent({
  bottomOffset = 24,
  keyboardShouldPersistTaps = "handled",
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  ...props
}: KeyboardAwareScrollContentProps) {
  return (
    <KeyboardAwareScrollView
      bottomOffset={bottomOffset}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      contentContainerStyle={contentContainerStyle}
      {...props}
    />
  );
}
