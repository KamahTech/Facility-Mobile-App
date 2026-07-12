import React from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { apiRequest, getSessionId } from "@/lib/api-client";
import { API_BASE_URL } from "@/constants/api";
import type { PaginatedRequests } from "@/stores/requests-store";

export function useTicketRealtime(ticketId: string, accountType: "resident" | "worker") {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    let ws: WebSocket | null = null;
    let isDestroyed = false;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = 1000;

    const connect = async () => {
      if (isDestroyed) return;
      try {
        console.log(`[WS] Fetching realtime info for ticket ${ticketId}`);
        // Fetch channel info from backend
        const realtimeData = await apiRequest<{
          websocketUrl: string;
          channel: string;
          commentCreatedType: string;
        }>(`/tickets/${ticketId}/realtime`, {});

        if (isDestroyed) return;

        // Construct WebSocket URL
        const origin = API_BASE_URL.replace("/facility_mobile_api/v1", "");
        const wsProtocol = origin.startsWith("https:") ? "wss:" : "ws:";
        const cleanOrigin = origin.replace(/^https?:\/\//, "");
        const wsUrl = `${wsProtocol}//${cleanOrigin}${realtimeData.websocketUrl}`;

        // Get session ID for cookies header
        const sessionId = getSessionId();
        const headers = sessionId ? { Cookie: `session_id=${sessionId}` } : undefined;

        console.log(`[WS] Connecting to Odoo websocket: ${wsUrl}`);
        
        // Pass headers in the options object (supported by React Native's WebSocket client)
        const socket = new (WebSocket as any)(wsUrl, undefined, headers ? { headers } : undefined);
        ws = socket;

        socket.onopen = () => {
          console.log(`[WS] Connection established for ticket ${ticketId}`);
          reconnectDelay = 1000; // Reset reconnect delay on successful connection
          
          // Send Odoo subscription request
          const subscribePayload = {
            event_name: "subscribe",
            data: {
              channels: [realtimeData.channel],
              last: 0,
            },
          };
          socket.send(JSON.stringify(subscribePayload));
        };

        socket.onmessage = (event: any) => {
          try {
            const rawData = JSON.parse(event.data);
            console.log(`[WS] Received message:`, JSON.stringify(rawData));
            
            // Helper to recursively search the parsed JSON structure to find the comment payload
            const findCommentPayload = (obj: any): { ticketId: string; comment: any } | null => {
              if (!obj || typeof obj !== "object") return null;
              if (Array.isArray(obj)) {
                for (const item of obj) {
                  const res = findCommentPayload(item);
                  if (res) return res;
                }
              }
              if (
                obj.type === realtimeData.commentCreatedType &&
                obj.payload &&
                obj.payload.ticketId &&
                obj.payload.comment
              ) {
                return obj.payload;
              }
              if (obj.message && typeof obj.message === "object") {
                const res = findCommentPayload(obj.message);
                if (res) return res;
              }
              if (obj.payload && typeof obj.payload === "object") {
                const res = findCommentPayload(obj.payload);
                if (res) return res;
              }
              for (const key of Object.keys(obj)) {
                if (typeof obj[key] === "object") {
                  const res = findCommentPayload(obj[key]);
                  if (res) return res;
                }
              }
              return null;
            };

            const payload = findCommentPayload(rawData);
            if (payload && String(payload.ticketId) === String(ticketId)) {
              console.log(`[WS] Parsed comment payload for ticket ${ticketId}:`, payload.comment);
              
              // Update React Query infinite query cache dynamically
              const queryKey = [accountType === "resident" ? "resident-requests" : "worker-tasks"];
              queryClient.setQueryData<InfiniteData<PaginatedRequests>>(
                queryKey,
                (oldData) => {
                  if (!oldData) return oldData;
                  return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                      ...page,
                      items: page.items.map((item) => {
                        if (String(item.id) === String(ticketId)) {
                          const exists = item.comments.some(
                            (c) => String(c.id) === String(payload.comment.id)
                          );
                          if (exists) return item;
                          return {
                            ...item,
                            comments: [...item.comments, payload.comment],
                          };
                        }
                        return item;
                      }),
                    })),
                  };
                }
              );
            }
          } catch (err) {
            console.error("[WS] Error parsing message:", err);
          }
        };

        socket.onclose = (event: any) => {
          console.log(`[WS] Connection closed for ticket ${ticketId}. Code: ${event.code}, Reason: ${event.reason}`);
          if (!isDestroyed) {
            scheduleReconnect();
          }
        };

        socket.onerror = (error: any) => {
          console.error(`[WS] Error on ticket ${ticketId}:`, error);
        };
      } catch (err) {
        console.error(`[WS] Failed to establish realtime connection for ticket ${ticketId}:`, err);
        if (!isDestroyed) {
          scheduleReconnect();
        }
      }
    };

    const scheduleReconnect = () => {
      if (isDestroyed) return;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      console.log(`[WS] Reconnecting in ${reconnectDelay}ms...`);
      reconnectTimeout = setTimeout(() => {
        reconnectDelay = Math.min(reconnectDelay * 2, 30000); // Exponential backoff max 30s
        void connect();
      }, reconnectDelay);
    };

    void connect();

    return () => {
      isDestroyed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        console.log(`[WS] Disconnecting from ticket ${ticketId}`);
        ws.close();
      }
    };
  }, [ticketId, accountType, queryClient]);
}
