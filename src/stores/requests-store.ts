import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { EncodedImage } from "@/lib/media";

export type RequestStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type RequestComment = {
  id: string;
  senderName: string;
  senderRole: "resident" | "admin" | "worker";
  content: string;
  createdAt: string; // YYYY-MM-DD HH:MM
  image?: string | boolean; // raw base64, data URL or false
};

export type MaintenanceRequest = {
  id: string;
  category: "plumbing" | "electrical" | "hvac" | "cleaning" | "security" | "carpentry" | "other";
  description: string;
  unitId: string;
  status: RequestStatus;
  createdAt: string; // YYYY-MM-DD
  updatedAt: string; // YYYY-MM-DD
  workerName?: string | boolean;
  notes?: string | boolean;
  workerPhase?: "accepted" | "inspected" | "working" | "completed" | boolean;
  comments: RequestComment[];
};

export type RequestCommentImage = string | false;

export type InspectTaskParams = {
  notes: string;
  materials?: string;
  deadline?: string;
  photos?: EncodedImage[];
};

export function useRequestsStore(options?: {
  enableResidentRequests?: boolean;
  enableWorkerTasks?: boolean;
}) {
  const queryClient = useQueryClient();

  const enableResidentRequests = options?.enableResidentRequests ?? false;
  const enableWorkerTasks = options?.enableWorkerTasks ?? false;

  // Queries
  const residentRequestsQuery = useQuery<MaintenanceRequest[]>({
    queryKey: ["resident-requests"],
    queryFn: () => apiRequest("/resident/tickets", { limit: 100 }),
    enabled: enableResidentRequests,
  });

  const workerTasksQuery = useQuery<MaintenanceRequest[]>({
    queryKey: ["worker-tasks"],
    queryFn: () => apiRequest("/worker/tasks", { limit: 100 }),
    enabled: enableWorkerTasks,
  });

  // Mutations
  const createRequestMutation = useMutation({
    mutationFn: (params: { category: string; description: string; unitId: string }) =>
      apiRequest("/resident/tickets/create", params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resident-requests"] });
    }
  });

  const cancelRequestMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/resident/tickets/${id}/cancel`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resident-requests"] });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: (params: { requestId: string; content: string; image?: RequestCommentImage; imageName?: string | false }) =>
      apiRequest(`/tickets/${params.requestId}/comments`, {
        content: params.content,
        image: params.image,
        imageName: params.imageName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resident-requests"] });
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
    }
  });

  const acceptTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/worker/tasks/${id}/accept`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
    }
  });

  const inspectTaskMutation = useMutation({
    mutationFn: (params: { id: string; inspectParams: InspectTaskParams }) =>
      apiRequest(`/worker/tasks/${params.id}/inspect`, params.inspectParams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
    }
  });

  const startTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/worker/tasks/${id}/start`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/worker/tasks/${id}/complete`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
    }
  });

  // State mapping (returns whichever has active queries or data)
  const requests = residentRequestsQuery.data || workerTasksQuery.data || [];

  const loading =
    residentRequestsQuery.isLoading ||
    workerTasksQuery.isLoading ||
    createRequestMutation.isPending ||
    cancelRequestMutation.isPending ||
    addCommentMutation.isPending ||
    acceptTaskMutation.isPending ||
    inspectTaskMutation.isPending ||
    startTaskMutation.isPending ||
    completeTaskMutation.isPending;

  const error =
    residentRequestsQuery.error?.message ||
    workerTasksQuery.error?.message ||
    createRequestMutation.error?.message ||
    cancelRequestMutation.error?.message ||
    addCommentMutation.error?.message ||
    acceptTaskMutation.error?.message ||
    inspectTaskMutation.error?.message ||
    startTaskMutation.error?.message ||
    completeTaskMutation.error?.message ||
    null;

  // Actions
  const fetchResidentRequests = React.useCallback(async () => {
    await residentRequestsQuery.refetch();
  }, [residentRequestsQuery]);

  const fetchWorkerTasks = React.useCallback(async () => {
    await workerTasksQuery.refetch();
  }, [workerTasksQuery]);

  const createRequest = React.useCallback(async (category: string, description: string, unitId: string) => {
    return await createRequestMutation.mutateAsync({ category, description, unitId });
  }, [createRequestMutation]);

  const cancelRequest = React.useCallback(async (id: string) => {
    await cancelRequestMutation.mutateAsync(id);
  }, [cancelRequestMutation]);

  const addRequestComment = React.useCallback(
    async (requestId: string, content: string, image: RequestCommentImage = false, imageName: string | false = false) => {
      return await addCommentMutation.mutateAsync({ requestId, content, image, imageName });
    },
    [addCommentMutation]
  );

  const acceptTask = React.useCallback(async (id: string) => {
    await acceptTaskMutation.mutateAsync(id);
  }, [acceptTaskMutation]);

  const inspectTask = React.useCallback(async (id: string, inspectParams: InspectTaskParams) => {
    await inspectTaskMutation.mutateAsync({ id, inspectParams });
  }, [inspectTaskMutation]);

  const startTask = React.useCallback(async (id: string) => {
    await startTaskMutation.mutateAsync(id);
  }, [startTaskMutation]);

  const completeTask = React.useCallback(async (id: string) => {
    await completeTaskMutation.mutateAsync(id);
  }, [completeTaskMutation]);

  const clearError = React.useCallback(() => {
    if (enableResidentRequests) {
      residentRequestsQuery.refetch({ cancelRefetch: true }).catch(() => undefined);
    }
    if (enableWorkerTasks) {
      workerTasksQuery.refetch({ cancelRefetch: true }).catch(() => undefined);
    }
    createRequestMutation.reset();
    cancelRequestMutation.reset();
    addCommentMutation.reset();
    acceptTaskMutation.reset();
    inspectTaskMutation.reset();
    startTaskMutation.reset();
    completeTaskMutation.reset();
  }, [
    enableResidentRequests,
    enableWorkerTasks,
    residentRequestsQuery,
    workerTasksQuery,
    createRequestMutation,
    cancelRequestMutation,
    addCommentMutation,
    acceptTaskMutation,
    inspectTaskMutation,
    startTaskMutation,
    completeTaskMutation,
  ]);

  return {
    requests,
    loading,
    error,
    fetchResidentRequests,
    fetchWorkerTasks,
    createRequest,
    cancelRequest,
    addRequestComment,
    acceptTask,
    inspectTask,
    startTask,
    completeTask,
    clearError,
  };
}
