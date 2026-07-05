import type { AppIconName } from "@/constants/icons";
import type { TranslationKey } from "@/constants/translations";

export type ServiceItem = {
  id: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: AppIconName;
};

export const serviceItems: ServiceItem[] = [
  {
    id: "plumbing",
    titleKey: "services.plumbing",
    descriptionKey: "services.plumbingDesc",
    icon: "plumbing",
  },
  {
    id: "electrical",
    titleKey: "services.electrical",
    descriptionKey: "services.electricalDesc",
    icon: "electrical",
  },
  {
    id: "hvac",
    titleKey: "services.hvac",
    descriptionKey: "services.hvacDesc",
    icon: "hvac",
  },
  {
    id: "cleaning",
    titleKey: "services.cleaning",
    descriptionKey: "services.cleaningDesc",
    icon: "cleaning",
  },
  {
    id: "security",
    titleKey: "services.security",
    descriptionKey: "services.securityDesc",
    icon: "security",
  },
  {
    id: "carpentry",
    titleKey: "services.carpentry",
    descriptionKey: "services.carpentryDesc",
    icon: "carpentry",
  },
  {
    id: "other",
    titleKey: "services.other",
    descriptionKey: "services.otherDesc",
    icon: "otherService",
  },
];
