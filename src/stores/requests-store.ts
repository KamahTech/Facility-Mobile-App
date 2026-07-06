import React from "react";
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { EncodedImage } from "@/lib/media";
import { useUnitStore } from "@/stores/unit-store";

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

export type PaginatedRequests = {
  items: MaintenanceRequest[];
  nextCursor: string | false;
  hasMore: boolean;
};

export function useRequestsStore(options?: {
  enableResidentRequests?: boolean;
  enableWorkerTasks?: boolean;
}) {
  const queryClient = useQueryClient();
  const { units } = useUnitStore();

  const enableResidentRequests = options?.enableResidentRequests ?? false;
  const enableWorkerTasks = options?.enableWorkerTasks ?? false;

  // Queries
  const residentRequestsQuery = useInfiniteQuery<PaginatedRequests>({
    queryKey: ["resident-requests"],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedRequests>("/resident/tickets", { limit: 20, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: enableResidentRequests,
  });

  const workerTasksQuery = useInfiniteQuery<PaginatedRequests>({
    queryKey: ["worker-tasks"],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedRequests>("/worker/tasks", { limit: 20, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: enableWorkerTasks,
  });

  // Mutations
  const createRequestMutation = useMutation({
    mutationFn: (params: { category: string; description: string; unitId: string; source?: string }) => {
      const unitIdNum = parseInt(params.unitId, 10);
      const isMobile = params.source === "mobile_unit_link";
      
      const payload: Record<string, any> = {
        category: params.category,
        description: params.description,
      };
      
      if (isMobile) {
        payload.mobileUnitLinkId = unitIdNum;
      } else {
        payload.unitId = unitIdNum;
      }
      
      return apiRequest("/resident/tickets/create", payload);
    },
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
    mutationFn: (params: { requestId: string; content: string; image?: RequestCommentImage; imageName?: string | false }) => {
      let normalizedImage = params.image;
      if (typeof normalizedImage === "string" && !normalizedImage.startsWith("data:")) {
        normalizedImage = `data:image/jpeg;base64,${normalizedImage}`;
      }
      return apiRequest(`/tickets/${params.requestId}/comments`, {
        content: params.content,
        image: normalizedImage,
        imageName: params.imageName,
      });
    },
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
    mutationFn: (params: { id: string; inspectParams: InspectTaskParams }) => {
      const mappedPhotos = params.inspectParams.photos?.map((photo) => {
        const hasDataUrlHeader = photo.data.startsWith("data:");
        return {
          ...photo,
          data: hasDataUrlHeader ? photo.data : `data:${photo.mimetype};base64,${photo.data}`,
        };
      });
      
      const inspectParams = {
        ...params.inspectParams,
        photos: mappedPhotos,
      };
      
      return apiRequest(`/worker/tasks/${params.id}/inspect`, inspectParams);
    },
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
  const requests = React.useMemo(() => {
    if (enableResidentRequests) {
      return residentRequestsQuery.data?.pages.flatMap((page) => page.items) || [];
    }
    if (enableWorkerTasks) {
      return workerTasksQuery.data?.pages.flatMap((page) => page.items) || [];
    }
    return [];
  }, [enableResidentRequests, enableWorkerTasks, residentRequestsQuery.data, workerTasksQuery.data]);

  const loading =
    residentRequestsQuery.isLoading ||
    residentRequestsQuery.isFetchingNextPage ||
    workerTasksQuery.isLoading ||
    workerTasksQuery.isFetchingNextPage ||
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

  const fetchNextResidentRequests = React.useCallback(async () => {
    if (residentRequestsQuery.hasNextPage && !residentRequestsQuery.isFetchingNextPage) {
      await residentRequestsQuery.fetchNextPage();
    }
  }, [residentRequestsQuery]);

  const fetchWorkerTasks = React.useCallback(async () => {
    await workerTasksQuery.refetch();
  }, [workerTasksQuery]);

  const fetchNextWorkerTasks = React.useCallback(async () => {
    if (workerTasksQuery.hasNextPage && !workerTasksQuery.isFetchingNextPage) {
      await workerTasksQuery.fetchNextPage();
    }
  }, [workerTasksQuery]);

  const createRequest = React.useCallback(async (category: string, description: string, unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    const source = unit?.source;
    return await createRequestMutation.mutateAsync({ category, description, unitId, source });
  }, [createRequestMutation, units]);

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
    fetchNextResidentRequests,
    hasNextResidentRequests: residentRequestsQuery.hasNextPage,
    fetchWorkerTasks,
    fetchNextWorkerTasks,
    hasNextWorkerTasks: workerTasksQuery.hasNextPage,
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
