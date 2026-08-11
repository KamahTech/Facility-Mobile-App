import React from "react";
import {
  type InfiniteData,
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { EncodedImage } from "@/lib/media";
import { useUnitStore } from "@/stores/unit-store";
import {
  toPositiveIntegerId,
  toPositiveNumber,
} from "@/lib/api-identifiers";
import { stripHtml } from "@/lib/strip-html";

export type RequestStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type RequestComment = {
  id: string;
  senderName: string;
  senderRole: "resident" | "admin" | "worker";
  content: string;
  createdAt: string; // YYYY-MM-DD HH:MM:SS
  image?: string | boolean; // raw base64, data URL or false
};

export type PaginatedComments = {
  items: RequestComment[];
  nextCursor: string | false;
  hasMore: boolean;
};

export type TaskMaterial = {
  id: string;
  productId: string;
  productName: string;
  uomId?: string;
  uomName?: string;
  quantity: number;
  alreadyIssued?: number;
  facilityAvailable?: number;
  mainAvailable?: number;
  toPurchase?: number;
  needsPurchase?: boolean;
  selected?: boolean;
};

export type Product = {
  id: string;
  name: string;
  uomId?: string;
  uomName?: string;
};

export function useTicketCommentsQuery(ticketId: string) {
  return useInfiniteQuery<PaginatedComments>({
    queryKey: ["ticket-comments", ticketId],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedComments>(`/tickets/${ticketId}/comments/page`, {
        limit: 50,
        cursor: pageParam || false,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
  });
}

export type PaginatedProducts = {
  items: Product[];
  nextCursor: string | false;
  hasMore: boolean;
};

export function useMaterialProductsInfiniteQuery(query: string, enabled = true, limit = 20) {
  return useInfiniteQuery<PaginatedProducts>({
    queryKey: ["material-products", query, limit],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedProducts>("/worker/material-products", {
        query: query.trim(),
        limit,
        cursor: pageParam || false,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled,
  });
}

export type RelatedDocument = {
  id: string;
  name: string;
  state: string;
  date?: string;
  amountTotal?: number;
  origin?: string;
};

export type RelatedDocumentsResponse = {
  pickings?: RelatedDocument[];
  quotations?: RelatedDocument[];
  purchaseOrders?: RelatedDocument[];
};

export function useRelatedDocumentsQuery(ticketId: string, accountType: "resident" | "worker") {
  const route = accountType === "resident"
    ? `/resident/tickets/${ticketId}/related-documents`
    : `/worker/tasks/${ticketId}/related-documents`;
    
  return useQuery<RelatedDocumentsResponse>({
    queryKey: ["related-documents", ticketId, accountType],
    queryFn: () => apiRequest<RelatedDocumentsResponse>(route, {}),
    enabled: !!ticketId,
  });
}

export type MaintenanceRequest = {
  id: string;
  category: "plumbing" | "electrical" | "hvac" | "cleaning" | "security" | "carpentry" | "other";
  description: string;
  unitId: string;
  unitNumber: string;
  buildingNumber: string;
  projectName: string;
  status: RequestStatus;
  createdAt: string; // YYYY-MM-DD
  updatedAt: string; // YYYY-MM-DD
  workerName?: string | boolean;
  assignedToCurrentUser?: boolean;
  notes?: string | boolean;
  subject?: string;
  workerPhase?: "accepted" | "inspected" | "working" | "completed" | boolean;
  comments: RequestComment[];
  materials?: TaskMaterial[];
  team?: string | boolean;
  priority?: string;
  contactEmail?: string | boolean;
  contactPhone?: string | boolean;
  warrantyType?: string | boolean;
  workflowStage?: string | boolean;
  visitFrom?: string | boolean;
  visitTo?: string | boolean;
  maintenanceFrom?: string | boolean;
  maintenanceTo?: string | boolean;
  materialRequirement?: string | boolean;
  propertyContext?: Record<string, unknown>;
  attachments?: {
    id: string;
    name: string;
    mimetype?: string;
    contentUrl: string;
  }[];
  relatedDocumentsEndpoint?: string;
  workerRelatedDocumentsEndpoint?: string;
};

export type RequestCommentImage = string | false;

export type InspectTaskMaterialParam = {
  productId: string;
  quantity?: number;
  uomId?: string;
  selected?: boolean;
};

export type InspectTaskParams = {
  notes: string;
  materials?: InspectTaskMaterialParam[];
  deadline?: string;
  photos?: EncodedImage[];
};

export type TaskWorkflowParams = {
  action: "schedule_visit" | "inspection_done" | "schedule_maintenance" | "start_maintenance" | "done" | "cancel";
  visitFrom?: string;
  visitTo?: string;
  materialRequirement?: "need" | "noneed";
  maintenanceFrom?: string;
  maintenanceTo?: string;
};

export type PaginatedRequests = {
  items: MaintenanceRequest[];
  nextCursor: string | false;
  hasMore: boolean;
};

function normalizeMaintenanceRequest(item: MaintenanceRequest) {
  const rawItem = item as MaintenanceRequest & {
    descriptionPlain?: string;
    description_plain?: string;
  };

  return {
    ...rawItem,
    description: stripHtml(
      rawItem.descriptionPlain ||
        rawItem.description_plain ||
        rawItem.description,
    ),
  };
}

export type CreateTicketParams = {
  category: string;
  description: string;
  unitId: string;
  subject?: string;
  warrantyType?: "in" | "out" | "other";
  priority?: string;
  contactEmail?: string;
  contactPhone?: string;
  attachments?: { name?: string; mimetype?: string; data: string }[];
};

export function useMaintenanceRequestQuery(
  requestId: string,
  accountType: "resident" | "worker",
) {
  const queryClient = useQueryClient();
  const listQueryKey =
    accountType === "resident" ? ["resident-requests"] : ["worker-tasks"];
  const detailQueryKey = ["maintenance-request", accountType, requestId];

  return useQuery<MaintenanceRequest>({
    queryKey: detailQueryKey,
    queryFn: async () => {
      if (!requestId || requestId === "false") {
        throw new Error("Invalid request ID");
      }

      // 1. Try direct detail endpoint first (per BACKEND_API_REQUIREMENTS.md)
      const detailRoute =
        accountType === "resident"
          ? `/resident/tickets/${requestId}`
          : `/worker/tasks/${requestId}`;

      try {
        const directTicket = await apiRequest<MaintenanceRequest>(
          detailRoute,
          {},
          { showErrorToast: false },
        );
        if (directTicket && directTicket.id) {
          return normalizeMaintenanceRequest(directTicket);
        }
      } catch {
        // Direct detail route not supported or returned error, fallback to cache/list lookup
      }

      // 2. Try to find in cached list query data
      const cachedList =
        queryClient.getQueryData<InfiniteData<PaginatedRequests>>(listQueryKey);
      const cachedItem = cachedList?.pages
        .flatMap((page) => page.items)
        .find((candidate) => String(candidate.id) === String(requestId));

      if (cachedItem) {
        return normalizeMaintenanceRequest(cachedItem);
      }

      // 3. Fallback: Fetch list from backend and locate matching ticket
      const listRoute =
        accountType === "resident" ? "/resident/tickets" : "/worker/tasks";
      const response = await apiRequest<PaginatedRequests | MaintenanceRequest[]>(
        listRoute,
        { limit: 100 },
        { showErrorToast: false },
      );
      const items = Array.isArray(response)
        ? response
        : response?.items || [];
      const found = items.find(
        (candidate) => String(candidate.id) === String(requestId),
      );

      if (found) {
        return normalizeMaintenanceRequest(found);
      }

      throw new Error("Ticket not found");
    },
    initialData: () => {
      const cached =
        queryClient.getQueryData<InfiniteData<PaginatedRequests>>(listQueryKey);
      const item = cached?.pages
        .flatMap((page) => page.items)
        .find((candidate) => String(candidate.id) === String(requestId));
      return item ? normalizeMaintenanceRequest(item) : undefined;
    },
    enabled: Boolean(requestId && requestId !== "false"),
  });
}

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
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map(normalizeMaintenanceRequest),
      })),
    }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: enableResidentRequests,
  });

  const workerTasksQuery = useInfiniteQuery<PaginatedRequests>({
    queryKey: ["worker-tasks"],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedRequests>("/worker/tasks", { limit: 20, cursor: pageParam }),
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map(normalizeMaintenanceRequest),
      })),
    }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: enableWorkerTasks,
  });

  // Mutations
  const createRequestMutation = useMutation({
    mutationFn: (params: CreateTicketParams) => {
      const payload: Record<string, unknown> = {
        category: params.category,
        description: params.description,
        unitId: toPositiveIntegerId(params.unitId, "unitId"),
      };

      if (params.subject) payload.subject = params.subject;
      if (params.warrantyType) payload.warrantyType = params.warrantyType;
      if (params.priority) payload.priority = params.priority;
      if (params.contactEmail) payload.contactEmail = params.contactEmail;
      if (params.contactPhone) payload.contactPhone = params.contactPhone;
      if (params.attachments && params.attachments.length > 0) {
        payload.attachments = params.attachments;
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
    onSuccess: (newComment: any, params) => {
      queryClient.invalidateQueries({ queryKey: ["resident-requests"] });
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });

      const commentsQueryKey = ["ticket-comments", params.requestId];
      queryClient.setQueryData<any>(commentsQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any, idx: number) => {
            if (idx !== 0) return page;
            const exists = page.items.some((c: any) => String(c.id) === String(newComment.id));
            if (exists) return page;
            return {
              ...page,
              items: [...page.items, newComment],
            };
          }),
        };
      });
    }
  });

  const acceptTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/worker/tasks/${id}/accept`, {}),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
      queryClient.invalidateQueries({
        queryKey: ["maintenance-request", "worker", id],
      });
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

      const formattedMaterials = params.inspectParams.materials?.map((m) => ({
        productId: toPositiveIntegerId(m.productId, "productId"),
        quantity: toPositiveNumber(m.quantity ?? 1, "quantity"),
        uomId: m.uomId ? toPositiveIntegerId(m.uomId, "uomId") : undefined,
        selected: m.selected ?? true,
      }));
      
      const inspectParams = {
        ...params.inspectParams,
        materials: formattedMaterials,
        photos: mappedPhotos,
      };
      
      return apiRequest(`/worker/tasks/${params.id}/inspect`, inspectParams);
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
      queryClient.invalidateQueries({
        queryKey: ["maintenance-request", "worker", params.id],
      });
    }
  });

  const startTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/worker/tasks/${id}/start`, {}),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
      queryClient.invalidateQueries({
        queryKey: ["maintenance-request", "worker", id],
      });
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/worker/tasks/${id}/complete`, {}),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
      queryClient.invalidateQueries({
        queryKey: ["maintenance-request", "worker", id],
      });
    }
  });

  const taskWorkflowMutation = useMutation({
    mutationFn: (params: { ticketId: string; workflowParams: TaskWorkflowParams }) =>
      apiRequest(`/worker/tasks/${params.ticketId}/workflow`, params.workflowParams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["resident-requests"] });
    },
  });

  const addMaterialMutation = useMutation({
    mutationFn: (params: { ticketId: string; productId: string; quantity: number; uomId?: string; selected?: boolean }) =>
      apiRequest(`/worker/tasks/${params.ticketId}/materials`, {
        productId: toPositiveIntegerId(params.productId, "productId"),
        quantity: toPositiveNumber(params.quantity, "quantity"),
        uomId: params.uomId
          ? toPositiveIntegerId(params.uomId, "uomId")
          : undefined,
        selected: params.selected,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["resident-requests"] });
    }
  });

  const updateMaterialMutation = useMutation({
    mutationFn: (params: { ticketId: string; lineId: string; quantity: number; selected?: boolean }) =>
      apiRequest(`/worker/tasks/${params.ticketId}/materials/${params.lineId}/update`, {
        quantity: toPositiveNumber(params.quantity, "quantity"),
        selected: params.selected,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["resident-requests"] });
    }
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (params: { ticketId: string; lineId: string }) =>
      apiRequest(`/worker/tasks/${params.ticketId}/materials/${params.lineId}/delete`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["resident-requests"] });
    }
  });

  const createPickingMutation = useMutation({
    mutationFn: (params: { ticketId: string; lineIds?: string[] }) =>
      apiRequest(`/worker/tasks/${params.ticketId}/create-picking`, {
        lineIds: params.lineIds?.map((lineId) =>
          toPositiveIntegerId(lineId, "lineId"),
        ),
      }),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["related-documents", params.ticketId] });
    },
  });

  const createRFQsMutation = useMutation({
    mutationFn: (ticketId: string) =>
      apiRequest(`/worker/tasks/${ticketId}/create-rfqs`, {}),
    onSuccess: (_, ticketId) => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["related-documents", ticketId] });
    },
  });

  const createQuotationMutation = useMutation({
    mutationFn: (ticketId: string) =>
      apiRequest(`/worker/tasks/${ticketId}/create-quotation`, {}),
    onSuccess: (_, ticketId) => {
      queryClient.invalidateQueries({ queryKey: ["worker-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["related-documents", ticketId] });
    },
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
    completeTaskMutation.isPending ||
    taskWorkflowMutation.isPending ||
    addMaterialMutation.isPending ||
    updateMaterialMutation.isPending ||
    deleteMaterialMutation.isPending ||
    createPickingMutation.isPending ||
    createRFQsMutation.isPending ||
    createQuotationMutation.isPending;

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
    taskWorkflowMutation.error?.message ||
    addMaterialMutation.error?.message ||
    updateMaterialMutation.error?.message ||
    deleteMaterialMutation.error?.message ||
    createPickingMutation.error?.message ||
    createRFQsMutation.error?.message ||
    createQuotationMutation.error?.message ||
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
  const { mutateAsync: taskWorkflowMutateAsync, reset: resetTaskWorkflowMutation } = taskWorkflowMutation;
  const { mutateAsync: addMaterialMutateAsync, reset: resetAddMaterialMutation } = addMaterialMutation;
  const { mutateAsync: updateMaterialMutateAsync, reset: resetUpdateMaterialMutation } = updateMaterialMutation;
  const { mutateAsync: deleteMaterialMutateAsync, reset: resetDeleteMaterialMutation } = deleteMaterialMutation;
  const { mutateAsync: createPickingMutateAsync, reset: resetCreatePickingMutation } = createPickingMutation;
  const { mutateAsync: createRFQsMutateAsync, reset: resetCreateRFQsMutation } = createRFQsMutation;
  const { mutateAsync: createQuotationMutateAsync, reset: resetCreateQuotationMutation } = createQuotationMutation;

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

  const createRequest = React.useCallback(
    async (
      categoryOrParams: string | CreateTicketParams,
      description?: string,
      unitId?: string,
      extra?: Partial<CreateTicketParams>
    ) => {
      let finalParams: CreateTicketParams;
      if (typeof categoryOrParams === "object") {
        finalParams = categoryOrParams;
      } else {
        finalParams = {
          category: categoryOrParams,
          description: description || "",
          unitId: unitId || "",
          ...extra,
        };
      }

      const unit = units.find((u) => u.id === finalParams.unitId);
      const realUnitId = unit?.source === "mobile_unit_link" ? unit.unitId : unit?.id;
      return await createRequestMutateAsync({
        ...finalParams,
        unitId: realUnitId || finalParams.unitId,
      });
    },
    [createRequestMutateAsync, units]
  );

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

  const taskWorkflow = React.useCallback(
    async (ticketId: string, workflowParams: TaskWorkflowParams) => {
      return await taskWorkflowMutateAsync({ ticketId, workflowParams });
    },
    [taskWorkflowMutateAsync]
  );

  const addMaterial = React.useCallback(async (ticketId: string, productId: string, quantity: number, uomId?: string, selected?: boolean) => {
    return await addMaterialMutateAsync({ ticketId, productId, quantity, uomId, selected });
  }, [addMaterialMutateAsync]);

  const updateMaterial = React.useCallback(async (ticketId: string, lineId: string, quantity: number, selected?: boolean) => {
    return await updateMaterialMutateAsync({ ticketId, lineId, quantity, selected });
  }, [updateMaterialMutateAsync]);

  const deleteMaterial = React.useCallback(async (ticketId: string, lineId: string) => {
    return await deleteMaterialMutateAsync({ ticketId, lineId });
  }, [deleteMaterialMutateAsync]);

  const createPicking = React.useCallback(async (ticketId: string, lineIds?: string[]) => {
    return await createPickingMutateAsync({ ticketId, lineIds });
  }, [createPickingMutateAsync]);

  const createRFQs = React.useCallback(async (ticketId: string) => {
    return await createRFQsMutateAsync(ticketId);
  }, [createRFQsMutateAsync]);

  const createQuotation = React.useCallback(async (ticketId: string) => {
    return await createQuotationMutateAsync(ticketId);
  }, [createQuotationMutateAsync]);

  const clearError = React.useCallback(() => {
    resetCreateRequestMutation();
    resetCancelRequestMutation();
    resetAddCommentMutation();
    resetAcceptTaskMutation();
    resetInspectTaskMutation();
    resetStartTaskMutation();
    resetCompleteTaskMutation();
    resetTaskWorkflowMutation();
    resetAddMaterialMutation();
    resetUpdateMaterialMutation();
    resetDeleteMaterialMutation();
    resetCreatePickingMutation();
    resetCreateRFQsMutation();
    resetCreateQuotationMutation();
  }, [
    resetCreateRequestMutation,
    resetCancelRequestMutation,
    resetAddCommentMutation,
    resetAcceptTaskMutation,
    resetInspectTaskMutation,
    resetStartTaskMutation,
    resetCompleteTaskMutation,
    resetTaskWorkflowMutation,
    resetAddMaterialMutation,
    resetUpdateMaterialMutation,
    resetDeleteMaterialMutation,
    resetCreatePickingMutation,
    resetCreateRFQsMutation,
    resetCreateQuotationMutation,
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
    taskWorkflow,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    createPicking,
    createRFQs,
    createQuotation,
    clearError,
  };
}
