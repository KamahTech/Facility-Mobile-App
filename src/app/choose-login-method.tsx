import { router } from "expo-router";

import { ActionCard } from "@/components/action-card";
import { AppScreen } from "@/components/app-screen";
import { useI18n } from "@/hooks/use-i18n";

export default function ChooseLoginMethodScreen() {
  const { t } = useI18n();

  return (
    <AppScreen
      description={t("auth.chooseAccountDescription")}
      title={t("auth.chooseAccountTitle")}
    >
      <ActionCard
        description={t("auth.residentDescription")}
        icon="resident"
        onPress={() => router.push({ pathname: "/login", params: { type: "resident" } } as any)}
        title={t("auth.residentTitle")}
      />
      <ActionCard
        description={t("auth.workerDescription")}
        icon="worker"
        onPress={() => router.push({ pathname: "/login", params: { type: "worker" } } as any)}
        title={t("auth.workerTitle")}
      />
    </AppScreen>
  );
}
