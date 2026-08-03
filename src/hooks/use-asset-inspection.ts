import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkerAssets,
  getAssetDetail,
  startInspection,
  getWorkerInspections,
  getInspectionDetail,
  saveInspectionDraft,
  submitInspection,
  type WorkerAssetListItem,
  type WorkerAssetDetail,
  type CompactInspection,
  type InspectionDetail,
  type InspectionSavePayload,
} from "@/lib/api/asset-inspection";

export const ASSET_INSPECTION_KEYS = {
  all: ["asset-inspection"] as const,
  assetsList: () => [...ASSET_INSPECTION_KEYS.all, "assets-list"] as const,
  assetDetail: (id: string) => [...ASSET_INSPECTION_KEYS.all, "asset-detail", id] as const,
  inspectionsList: () => [...ASSET_INSPECTION_KEYS.all, "inspections-list"] as const,
  inspectionDetail: (id: string) => [...ASSET_INSPECTION_KEYS.all, "inspection-detail", id] as const,
};

export function useWorkerAssetsInfiniteQuery(limit = 20) {
  return useInfiniteQuery({
    queryKey: ASSET_INSPECTION_KEYS.assetsList(),
    queryFn: ({ pageParam }) => getWorkerAssets({ limit, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore && lastPage.nextCursor ? (lastPage.nextCursor as string) : undefined),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAssetDetailQuery(assetId: string, enabled = true) {
  return useQuery({
    queryKey: ASSET_INSPECTION_KEYS.assetDetail(assetId),
    queryFn: () => getAssetDetail(assetId),
    enabled: Boolean(assetId) && enabled,
    staleTime: 1000 * 60 * 2,
    retry: (failureCount, error: any) => {
      // Do not retry on access_denied
      if (error?.message?.toLowerCase().includes("access") || error?.message?.toLowerCase().includes("denied")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useWorkerInspectionsInfiniteQuery(limit = 20) {
  return useInfiniteQuery({
    queryKey: ASSET_INSPECTION_KEYS.inspectionsList(),
    queryFn: ({ pageParam }) => getWorkerInspections({ limit, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore && lastPage.nextCursor ? (lastPage.nextCursor as string) : undefined),
    staleTime: 1000 * 60,
  });
}

export function useInspectionDetailQuery(inspectionId: string, enabled = true) {
  return useQuery({
    queryKey: ASSET_INSPECTION_KEYS.inspectionDetail(inspectionId),
    queryFn: () => getInspectionDetail(inspectionId),
    enabled: Boolean(inspectionId) && enabled,
    staleTime: 1000 * 30,
  });
}

export function useStartInspectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assetId, templateId }: { assetId: string; templateId?: string }) =>
      startInspection(assetId, templateId),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(ASSET_INSPECTION_KEYS.inspectionDetail(data.id), data);
      queryClient.invalidateQueries({ queryKey: ASSET_INSPECTION_KEYS.inspectionsList() });
      queryClient.invalidateQueries({ queryKey: ASSET_INSPECTION_KEYS.assetDetail(variables.assetId) });
    },
  });
}

export function useSaveInspectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inspectionId, payload }: { inspectionId: string; payload: InspectionSavePayload }) =>
      saveInspectionDraft(inspectionId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(ASSET_INSPECTION_KEYS.inspectionDetail(data.id), data);
      queryClient.invalidateQueries({ queryKey: ASSET_INSPECTION_KEYS.inspectionsList() });
      if (data.assetId) {
        queryClient.invalidateQueries({ queryKey: ASSET_INSPECTION_KEYS.assetDetail(data.assetId) });
      }
    },
  });
}

export function useSubmitInspectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inspectionId, payload }: { inspectionId: string; payload?: InspectionSavePayload }) =>
      submitInspection(inspectionId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(ASSET_INSPECTION_KEYS.inspectionDetail(data.id), data);
      queryClient.invalidateQueries({ queryKey: ASSET_INSPECTION_KEYS.inspectionsList() });
      if (data.assetId) {
        queryClient.invalidateQueries({ queryKey: ASSET_INSPECTION_KEYS.assetDetail(data.assetId) });
      }
    },
  });
}
