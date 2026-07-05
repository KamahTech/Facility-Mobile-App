import { AppScreen } from "@/components/app-screen";
import { useI18n } from "@/hooks/use-i18n";

export default function OnBoardingScreen() {
  const { t } = useI18n();

  return (
    <AppScreen
      action={{
        href: "/choose-login-method",
        label: t("actions.getStarted"),
      }}
      description={t("onboarding.description")}
      title={t("onboarding.title")}
    />
  );
}
