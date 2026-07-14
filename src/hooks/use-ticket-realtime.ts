import React from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";

import { API_BASE_URL } from "@/constants/api";
import { apiRequest, getSessionId } from "@/lib/api-client";
import type { PaginatedRequests } from "@/stores/requests-store";

type RealtimeCommentPayload = {
  ticketId: string;
  comment: {
    id: string;
    [key: string]: unknown;
  };
};

function findCommentPayload(
  value: unknown,
  commentCreatedType: string,
): RealtimeCommentPayload | null {
  if (!value || typeof value !== "object") return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const payload = findCommentPayload(item, commentCreatedType);
      if (payload) return payload;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  if (
    record.type === commentCreatedType &&
    record.payload &&
    typeof record.payload === "object"
  ) {
    const payload = record.payload as Partial<RealtimeCommentPayload>;
    if (payload.ticketId && payload.comment?.id) {
      return payload as RealtimeCommentPayload;
    }
  }

  for (const child of Object.values(record)) {
    const payload = findCommentPayload(child, commentCreatedType);
    if (payload) return payload;
  }

  return null;
}

export function useTicketRealtime(ticketId: string, accountType: "resident" | "worker") {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = 1000;
    let connectionGeneration = 0;
    let isConnecting = false;
    let isDestroyed = false;
    let appState: AppStateStatus = AppState.currentState;

    const isActive = () => !isDestroyed && appState === "active";

    const clearReconnect = () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    const closeSocket = () => {
      connectionGeneration += 1;
      isConnecting = false;
      const currentSocket = socket;
      socket = null;
      if (!currentSocket) return;

      currentSocket.onopen = null;
      currentSocket.onmessage = null;
      currentSocket.onerror = null;
      currentSocket.onclose = null;
      if (
        currentSocket.readyState === WebSocket.OPEN ||
        currentSocket.readyState === WebSocket.CONNECTING
      ) {
        currentSocket.close();
      }
    };

    const applyComment = (payload: RealtimeCommentPayload) => {
      if (String(payload.ticketId) !== String(ticketId)) return;

      const commentsQueryKey = ["ticket-comments", String(ticketId)];
      queryClient.setQueryData<any>(commentsQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any, index: number) => {
            if (index !== 0) return page;
            const exists = page.items.some(
              (comment: any) => String(comment.id) === String(payload.comment.id),
            );
            return exists ? page : { ...page, items: [...page.items, payload.comment] };
          }),
        };
      });

      const requestsQueryKey = [
        accountType === "resident" ? "resident-requests" : "worker-tasks",
      ];
      queryClient.setQueryData<InfiniteData<PaginatedRequests>>(
        requestsQueryKey,
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                String(item.id) === String(ticketId)
                  ? {
                      ...item,
                      comments: item.comments.some(
                        (comment) => String(comment.id) === String(payload.comment.id),
                      )
                        ? item.comments
                        : [...item.comments, payload.comment as any],
                    }
                  : item,
              ),
            })),
          };
        },
      );
    };

    let connect: () => Promise<void>;

    const scheduleReconnect = () => {
      if (!isActive() || reconnectTimeout) return;
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
        void connect();
      }, reconnectDelay);
    };

    connect = async () => {
      if (!isActive() || isConnecting) return;
      if (
        socket?.readyState === WebSocket.OPEN ||
        socket?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      isConnecting = true;
      const generation = ++connectionGeneration;

      try {
        const realtimeData = await apiRequest<{
          websocketUrl: string;
          channel: string;
          commentCreatedType: string;
        }>(`/tickets/${ticketId}/realtime`, {}, { showErrorToast: false });

        if (!isActive() || generation !== connectionGeneration) return;

        const origin = API_BASE_URL.replace(/\/facility_mobile_api\/v1\/?$/, "");
        const wsProtocol = origin.startsWith("https:") ? "wss:" : "ws:";
        const wsUrl = `${wsProtocol}//${origin.replace(/^https?:\/\//, "")}${realtimeData.websocketUrl}`;
        const sessionId = getSessionId();
        const headers: Record<string, string> = {};
        if (sessionId) {
          headers["Authorization"] = `Bearer ${sessionId}`;
        }
        const nextSocket = new (WebSocket as any)(
          wsUrl,
          undefined,
          sessionId ? { headers } : undefined,
        ) as WebSocket;
        socket = nextSocket;

        nextSocket.onopen = () => {
          if (!isActive() || generation !== connectionGeneration || socket !== nextSocket) {
            closeSocket();
            return;
          }
          isConnecting = false;
          reconnectDelay = 1000;
          nextSocket.send(
            JSON.stringify({
              event_name: "subscribe",
              data: { channels: [realtimeData.channel], last: 0 },
            }),
          );
        };

        nextSocket.onmessage = (event) => {
          if (!isActive() || generation !== connectionGeneration) return;
          try {
            const payload = findCommentPayload(
              JSON.parse(String(event.data)),
              realtimeData.commentCreatedType,
            );
            if (payload) applyComment(payload);
          } catch {
            // Ignore non-JSON websocket keepalive frames.
          }
        };

        nextSocket.onerror = () => {
          // The close callback owns reconnection. Background socket errors are expected.
        };

        nextSocket.onclose = () => {
          if (socket === nextSocket) socket = null;
          isConnecting = false;
          if (generation === connectionGeneration) scheduleReconnect();
        };
      } catch {
        isConnecting = false;
        if (generation === connectionGeneration) scheduleReconnect();
      }
    };

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      const wasBackgrounded = appState !== "active";
      appState = nextState;

      if (nextState !== "active") {
        clearReconnect();
        closeSocket();
        return;
      }

      if (wasBackgrounded) {
        reconnectDelay = 1000;
        void queryClient.invalidateQueries({
          queryKey: ["ticket-comments", String(ticketId)],
        });
        void connect();
      }
    });

    void connect();

    return () => {
      isDestroyed = true;
      appStateSubscription.remove();
      clearReconnect();
      closeSocket();
    };
  }, [ticketId, accountType, queryClient]);
}
