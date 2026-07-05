import type { AppIconName } from "@/constants/icons";
import type { TranslationKey } from "@/constants/translations";

export type QuickActionIconName = Extract<
  AppIconName,
  "linkUnit" | "invoices" | "requestService" | "inviteVisitor" | "feedback" | "facility" | "tickets"
>;

export type QuickActionItem = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: QuickActionIconName;
  route: string;
};

export const quickActions: QuickActionItem[] = [
  {
    titleKey: "quickActions.connectUnit",
    descriptionKey: "quickActions.connectUnitDescription",
    icon: "linkUnit",
    route: "/home/connect-unit",
  },
  {
    titleKey: "quickActions.viewInvoices",
    descriptionKey: "quickActions.viewInvoicesDescription",
    icon: "invoices",
    route: "/invoices",
  },
  {
    titleKey: "quickActions.requestService",
    descriptionKey: "quickActions.requestServiceDescription",
    icon: "requestService",
    route: "/home/request-service",
  },
  {
    titleKey: "quickActions.inviteVisitor",
    descriptionKey: "quickActions.inviteVisitorDescription",
    icon: "inviteVisitor",
    route: "/home/invite-visitor",
  },
  {
    titleKey: "quickActions.feedback",
    descriptionKey: "quickActions.feedbackDescription",
    icon: "feedback",
    route: "/home/feedback",
  },
  {
    titleKey: "quickActions.deposits",
    descriptionKey: "quickActions.depositsDescription",
    icon: "linkUnit",
    route: "/profile/deposits",
  },
  {
    titleKey: "quickActions.ownerClaims",
    descriptionKey: "quickActions.ownerClaimsDescription",
    icon: "tickets",
    route: "/profile/claims",
  },
  {
    titleKey: "quickActions.serviceCosts",
    descriptionKey: "quickActions.serviceCostsDescription",
    icon: "requestService",
    route: "/profile/services",
  },
];

