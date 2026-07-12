import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "@/hooks/use-i18n";

/**
 * Custom hook to get safe area insets that automatically adjust side boundaries for RTL support.
 * 
 * - In LTR, `left` corresponds to physical left notch, and `right` corresponds to physical right notch.
 * - In RTL, `left` (which maps to `paddingStart`) corresponds to physical right notch, and `right` 
 *   (which maps to `paddingEnd`) corresponds to physical left notch.
 */
export function useAppInsets() {
  const insets = useSafeAreaInsets();
  const { isRTL } = useI18n();

  return {
    ...insets,
    left: isRTL ? insets.right : insets.left,
    right: isRTL ? insets.left : insets.right,
  };
}
