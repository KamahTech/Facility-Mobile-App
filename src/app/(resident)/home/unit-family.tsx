import { View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { AppText } from "@/components/app-text";
import { ScreenHeader } from "@/components/screen-header";
import { UnitFamilyMembersCard } from "@/components/unit-family-members-card";
import { useAppInsets } from "@/hooks/use-app-insets";
import { useI18n } from "@/hooks/use-i18n";

export default function UnitFamilyScreen() {
  const { t } = useI18n();
  const insets = useAppInsets();
  const { unitId } = useLocalSearchParams<{ unitId?: string }>();

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingStart: insets.left,
        paddingEnd: insets.right,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title={t("familyTenant.familyMembers")} onBack={() => router.back()} />

      <View className="flex-1 w-full max-w-xl self-center px-5 pt-5">
        {unitId ? (
          <UnitFamilyMembersCard unitId={unitId} />
        ) : (
          <AppText className="text-center text-sm text-muted-foreground">
            {t("connectUnit.noUnits")}
          </AppText>
        )}
      </View>
    </View>
  );
}
