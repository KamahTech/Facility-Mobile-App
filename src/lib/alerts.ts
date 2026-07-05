import { Alert, type AlertButton } from "react-native";

import type { TranslationKey } from "@/constants/translations";

type Translate = (key: TranslationKey) => string;

export function showTranslatedAlert(
  t: Translate,
  titleKey: TranslationKey,
  messageKey: TranslationKey,
  buttons?: AlertButton[],
) {
  Alert.alert(t(titleKey), t(messageKey), buttons);
}

export function showErrorAlert(t: Translate, message?: string) {
  Alert.alert(t("common.error"), message || t("errors.generic"));
}
