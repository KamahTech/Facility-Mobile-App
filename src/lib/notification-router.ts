import { router } from "@/lib/navigation";
import { type Href } from "expo-router";

export interface NavigationPayload {
  notificationId?: string;
  type?: string;
  screen?: string;
  ticketId?: string;
  visitorId?: string;
  updateId?: string;
  invoiceId?: string;
}

export function handleNotificationNavigation(
  payload: NavigationPayload,
  accountType: "resident" | "worker" | null
) {
  let ticketId = payload.ticketId;
  let visitorId = payload.visitorId;
  let updateId = payload.updateId;
  let invoiceId = payload.invoiceId;
  let screen = payload.screen;
  let type = payload.type || "";

  const nid = payload.notificationId || "";
  const match = nid.match(/^([a-zA-Z_]+)-(\w+)$/);
  
  let parsedType = "";
  let parsedId = "";
  if (match) {
    parsedType = match[1].toLowerCase();
    parsedId = match[2];
  }

  // Fallbacks if direct IDs are missing (parsing from "ticket-7" etc.)
  if (parsedId) {
    if (parsedType === "ticket") {
      ticketId = ticketId || parsedId;
    } else if (parsedType === "visitor") {
      visitorId = visitorId || parsedId;
    } else if (parsedType === "update" || parsedType === "news" || parsedType === "poll") {
      updateId = updateId || parsedId;
    } else if (parsedType === "invoice") {
      invoiceId = invoiceId || parsedId;
    }
  }

  // Determine screen from type or parsed values if not explicitly provided
  if (!screen) {
    const checkType = (type || parsedType || "").toLowerCase();
    if (checkType === "maintenance" || checkType === "task_assigned" || checkType === "inspection") {
      screen = "ticket";
    } else if (checkType === "ticket_chat" || checkType === "comment") {
      screen = "ticket_chat";
    } else if (checkType === "visitor") {
      screen = "visitor";
    } else if (checkType === "announcement" || checkType === "community" || checkType === "update" || checkType === "news" || checkType === "poll") {
      screen = "community";
    } else if (checkType === "payment" || checkType === "invoice") {
      screen = "invoice";
    }
  }

  const normalizedScreen = (screen || "").toLowerCase();

  console.log("[NotificationRouter] Resolving notification route:", {
    normalizedScreen,
    ticketId,
    visitorId,
    updateId,
    invoiceId,
    accountType,
  });

  if (accountType === "worker") {
    // Worker routes
    if (normalizedScreen === "ticket") {
      if (ticketId) {
        router.push({
          pathname: "/(worker)/worker/details",
          params: { id: ticketId },
        } as any);
        return true;
      }
    } else if (normalizedScreen === "ticket_chat") {
      if (ticketId) {
        router.push({
          pathname: "/(worker)/worker/messages",
          params: { id: ticketId },
        } as any);
        return true;
      }
    }
  } else {
    // Resident routes
    if (normalizedScreen === "ticket") {
      if (ticketId) {
        router.push({
          pathname: "/(resident)/tickets/details",
          params: { id: ticketId },
        } as any);
        return true;
      }
    } else if (normalizedScreen === "ticket_chat") {
      if (ticketId) {
        router.push({
          pathname: "/(resident)/tickets/messages",
          params: { id: ticketId },
        } as any);
        return true;
      }
    } else if (normalizedScreen === "visitor") {
      router.push("/(resident)/home/invite-visitor" as Href);
      return true;
    } else if (normalizedScreen === "community") {
      const idToUse = updateId || ticketId; // backend maps updates to updateId/ticketId
      if (idToUse) {
        router.push({
          pathname: "/(resident)/home/post/[id]",
          params: { id: idToUse },
        } as any);
        return true;
      }
    } else if (normalizedScreen === "invoice") {
      if (invoiceId) {
        router.push({
          pathname: "/(resident)/invoices/[id]",
          params: { id: invoiceId },
        } as any);
        return true;
      }
    }
  }

  return false;
}
