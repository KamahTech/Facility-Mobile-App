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
  unitNumber: string;
  buildingNumber: string;
  projectName: string;
  mobileUnitLinkId: string | false;
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
  enableUnits?: boolean;
}) {
  const queryClient = useQueryClient();
  const { units } = useUnitStore({ enableUnits: options?.enableUnits ?? false });

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
      
      const payload: Record<string, unknown> = {
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
  const {
    fetchNextPage: fetchNextResidentRequestsPage,
    hasNextPage: hasNextResidentRequestsPage,
    isFetchingNextPage: isFetchingNextResidentRequestsPage,
    refetch: refetchResidentRequests,
  } = residentRequestsQuery;
  const {
    fetchNextPage: fetchNextWorkerTasksPage,
    hasNextPage: hasNextWorkerTasksPage,
    isFetchingNextPage: isFetchingNextWorkerTasksPage,
    refetch: refetchWorkerTasks,
  } = workerTasksQuery;
  const { mutateAsync: createRequestMutateAsync, reset: resetCreateRequestMutation } = createRequestMutation;
  const { mutateAsync: cancelRequestMutateAsync, reset: resetCancelRequestMutation } = cancelRequestMutation;
  const { mutateAsync: addCommentMutateAsync, reset: resetAddCommentMutation } = addCommentMutation;
  const { mutateAsync: acceptTaskMutateAsync, reset: resetAcceptTaskMutation } = acceptTaskMutation;
  const { mutateAsync: inspectTaskMutateAsync, reset: resetInspectTaskMutation } = inspectTaskMutation;
  const { mutateAsync: startTaskMutateAsync, reset: resetStartTaskMutation } = startTaskMutation;
  const { mutateAsync: completeTaskMutateAsync, reset: resetCompleteTaskMutation } = completeTaskMutation;

  // Actions
  const fetchResidentRequests = React.useCallback(async () => {
    await refetchResidentRequests();
  }, [refetchResidentRequests]);

  const fetchNextResidentRequests = React.useCallback(async () => {
    if (hasNextResidentRequestsPage && !isFetchingNextResidentRequestsPage) {
      await fetchNextResidentRequestsPage();
    }
  }, [
    fetchNextResidentRequestsPage,
    hasNextResidentRequestsPage,
    isFetchingNextResidentRequestsPage,
  ]);

  const fetchWorkerTasks = React.useCallback(async () => {
    await refetchWorkerTasks();
  }, [refetchWorkerTasks]);

  const fetchNextWorkerTasks = React.useCallback(async () => {
    if (hasNextWorkerTasksPage && !isFetchingNextWorkerTasksPage) {
      await fetchNextWorkerTasksPage();
    }
  }, [
    fetchNextWorkerTasksPage,
    hasNextWorkerTasksPage,
    isFetchingNextWorkerTasksPage,
  ]);

  const createRequest = React.useCallback(async (category: string, description: string, unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    const source = unit?.source;
    return await createRequestMutateAsync({ category, description, unitId, source });
  }, [createRequestMutateAsync, units]);

  const cancelRequest = React.useCallback(async (id: string) => {
    await cancelRequestMutateAsync(id);
  }, [cancelRequestMutateAsync]);

  const addRequestComment = React.useCallback(
    async (requestId: string, content: string, image: RequestCommentImage = false, imageName: string | false = false) => {
      return await addCommentMutateAsync({ requestId, content, image, imageName });
    },
    [addCommentMutateAsync]
  );

  const acceptTask = React.useCallback(async (id: string) => {
    await acceptTaskMutateAsync(id);
  }, [acceptTaskMutateAsync]);

  const inspectTask = React.useCallback(async (id: string, inspectParams: InspectTaskParams) => {
    await inspectTaskMutateAsync({ id, inspectParams });
  }, [inspectTaskMutateAsync]);

  const startTask = React.useCallback(async (id: string) => {
    await startTaskMutateAsync(id);
  }, [startTaskMutateAsync]);

  const completeTask = React.useCallback(async (id: string) => {
    await completeTaskMutateAsync(id);
  }, [completeTaskMutateAsync]);

  const clearError = React.useCallback(() => {
    resetCreateRequestMutation();
    resetCancelRequestMutation();
    resetAddCommentMutation();
    resetAcceptTaskMutation();
    resetInspectTaskMutation();
    resetStartTaskMutation();
    resetCompleteTaskMutation();
  }, [
    resetCreateRequestMutation,
    resetCancelRequestMutation,
    resetAddCommentMutation,
    resetAcceptTaskMutation,
    resetInspectTaskMutation,
    resetStartTaskMutation,
    resetCompleteTaskMutation,
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
