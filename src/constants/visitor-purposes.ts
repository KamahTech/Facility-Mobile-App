import type { TranslationKey } from "@/constants/translations";

export type VisitorPurposeId =
  | "social"
  | "maintenance"
  | "delivery"
  | "business"
  | "other";

export type VisitorPurposeOption = {
  id: VisitorPurposeId;
  labelKey: TranslationKey;
};

export const visitorPurposeOptions: VisitorPurposeOption[] = [
  {
    id: "social",
    labelKey: "inviteVisitor.purposeSocial",
  },
  {
    id: "maintenance",
    labelKey: "inviteVisitor.purposeMaintenance",
  },
  {
    id: "delivery",
    labelKey: "inviteVisitor.purposeDelivery",
  },
  {
    id: "business",
    labelKey: "inviteVisitor.purposeBusiness",
  },
  {
    id: "other",
    labelKey: "inviteVisitor.purposeOther",
  },
];
