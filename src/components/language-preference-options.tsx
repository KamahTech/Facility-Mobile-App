import React from "react";
import { Alert, View } from "react-native";

import { AppText } from "@/components/app-text";
import { SettingOptionCard } from "@/components/setting-option-card";
import type { AppIconName } from "@/constants/icons";
import type { TranslationKey } from "@/constants/translations";
import { useI18n } from "@/hooks/use-i18n";
import type { LanguagePreference } from "@/lib/language-storage";

type LanguageOption = {
  value: LanguagePreference;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon?: AppIconName;
  iconNode?: React.ReactNode;
};

const languageOptions: LanguageOption[] = [
  {
    value: "system",
    labelKey: "language.system",
    descriptionKey: "language.systemDescription",
    icon: "language",
  },
  {
    value: "en",
    labelKey: "language.english",
    descriptionKey: "language.englishDescription",
    iconNode: <AppText className="text-sm font-bold text-foreground">EN</AppText>,
  },
  {
    value: "ar",
    labelKey: "language.arabic",
    descriptionKey: "language.arabicDescription",
    iconNode: <AppText className="text-base font-bold text-foreground">ع</AppText>,
  },
];

export function LanguagePreferenceOptions() {
  const { t, languagePreference, setLanguagePreference } = useI18n();

  const handleSelectLanguage = React.useCallback(
    (value: LanguagePreference) => {
      if (value === languagePreference) {
        return;
      }

      Alert.alert(
        t("language.changeConfirmTitle"),
        t("language.changeConfirmMessage"),
        [
          { text: t("actions.cancel"), style: "cancel" },
          {
            text: t("actions.confirm"),
            style: "default",
            onPress: () => {
              setLanguagePreference(value);
            },
          },
        ],
      );
    },
    [languagePreference, setLanguagePreference, t],
  );

  return (
    <View className="flex-col gap-4">
      {languageOptions.map((option) => (
        <SettingOptionCard
          key={option.value}
          title={t(option.labelKey)}
          description={t(option.descriptionKey)}
          icon={option.icon}
          iconNode={option.iconNode}
          selected={languagePreference === option.value}
          onPress={() => handleSelectLanguage(option.value)}
        />
      ))}
    </View>
  );
}
