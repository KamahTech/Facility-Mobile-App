import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";

export type ConnectedUnit = {
  id: string;
  source: "odoo_unit" | "mobile_unit_link";
  unitId?: string;
  projectId?: string;
  projectName?: string;
  phaseId?: string;
  phaseName?: string;
  buildingId?: string;
  buildingNumber: string;
  unitNumber: string;
  unitType: string;
  ownershipType: "owner" | "tenant" | "family_member";
  mobileUnitLinkId?: string;
  contactNumber?: string;
  facilityOwnerIds?: string[];
  facilityOwnerLineIds?: string[];
  facilityOwnerId?: string;
  facilityOwnerLineId?: string;
};

export type MobileUnitLinkItem = {
  id: string;
  source: string;
  unitId: string;
  ownershipType: "tenant" | "family_member";
  approvalStatus: "pending" | "approved" | "refused";
  residentPartnerId: string;
  residentName: string;
  residentEmail: string;
  contactNumber: string;
};

export type ConnectUnitParams = {
  unitId?: number | string;
  buildingNumber?: string;
  unitNumber?: string;
  ownershipType: "owner" | "tenant" | "family_member";
  contactNumber?: string;
};

export type FamilyMembersResponse = {
  unitId: string;
  managerRole: "tenant" | "owner";
  items: MobileUnitLinkItem[];
};

export function useFamilyMembersQuery(unitId?: string, enabled = true) {
  return useQuery<FamilyMembersResponse>({
    queryKey: ["family-members", unitId],
    queryFn: () => apiRequest<FamilyMembersResponse>(`/resident/units/${unitId}/family-members`, {}),
    enabled: enabled && !!unitId,
  });
}

export type ConnectedUnitsSummary = {
  connectedUnitCount: number;
  realUnitCount: number;
  mobileUnitLinkCount: number;
};

export type UnitLookupProject = {
  id: string;
  name: string;
};

export type UnitLookupBuilding = {
  id: string;
  number: string;
  name: string;
  projectId: string;
  phaseId?: string;
  phaseName?: string;
};

export type UnitLookupFloor = {
  id: string;
  name: string;
  subSeq?: string;
  buildingId: string;
  projectId?: string;
  phaseId?: string;
};

export type UnitLookupUnit = {
  id: string;
  unitId: string;
  number: string;
  name: string;
  unitType: string;
  projectId: string;
  projectName: string;
  phaseId?: string;
  phaseName?: string;
  buildingId: string;
  buildingNumber: string;
  buildingName?: string;
  floorId?: string;
  floorName?: string;
  disabled?: boolean;
};

export function useProjectsQuery() {
  return useQuery<UnitLookupProject[]>({
    queryKey: ["unit-projects"],
    queryFn: () => apiRequest<UnitLookupProject[]>("/resident/projects", {}),
  });
}

export function useBuildingsQuery(projectId?: string) {
  return useQuery<UnitLookupBuilding[]>({
    queryKey: ["unit-buildings", projectId],
    queryFn: () => apiRequest<UnitLookupBuilding[]>(`/resident/projects/${projectId}/buildings`, {}),
    enabled: !!projectId,
  });
}

export function useFloorsQuery(buildingId?: string) {
  return useQuery<UnitLookupFloor[]>({
    queryKey: ["unit-floors", buildingId],
    queryFn: () => apiRequest<UnitLookupFloor[]>(`/resident/buildings/${buildingId}/floors`, {}),
    enabled: !!buildingId,
  });
}

export function useLookupUnitsQuery(buildingId?: string, floorId?: string) {
  return useQuery<UnitLookupUnit[]>({
    queryKey: ["unit-lookup-units", buildingId, floorId],
    queryFn: () => {
      const payload = floorId ? { floorId: isNaN(Number(floorId)) ? floorId : Number(floorId) } : {};
      return apiRequest<UnitLookupUnit[]>(`/resident/buildings/${buildingId}/units`, payload);
    },
    enabled: !!buildingId,
  });
}

export function useUnitStore(options?: { enableUnits?: boolean; enableSummary?: boolean }) {
  const queryClient = useQueryClient();
  const enableUnits = options?.enableUnits ?? true;
  const enableSummary = options?.enableSummary ?? false;

  const summaryQuery = useQuery<ConnectedUnitsSummary>({
    queryKey: ["connected-units-summary"],
    queryFn: () => apiRequest<ConnectedUnitsSummary>("/resident/units/summary", {}),
    enabled: enableSummary,
  });

  const query = useQuery<ConnectedUnit[]>({
    queryKey: ["connected-units"],
    queryFn: () => apiRequest("/resident/units", {}),
    enabled: enableUnits,
  });

  const connectMutation = useMutation({
    mutationFn: (newUnit: ConnectUnitParams) =>
      apiRequest("/resident/units/connect", newUnit, { showErrorToast: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connected-units"] });
      queryClient.invalidateQueries({ queryKey: ["connected-units-summary"] });
      queryClient.invalidateQueries({ queryKey: ["owner-units"] });
      queryClient.invalidateQueries({ queryKey: ["owner-statement"] });
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/resident/mobile-unit-links/${id}/disconnect`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connected-units"] });
      queryClient.invalidateQueries({ queryKey: ["connected-units-summary"] });
      queryClient.invalidateQueries({ queryKey: ["owner-units"] });
      queryClient.invalidateQueries({ queryKey: ["owner-statement"] });
    }
  });

  const approveFamilyMutation = useMutation({
    mutationFn: (unitLinkId: string) =>
      apiRequest(`/resident/mobile-unit-links/${unitLinkId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
    }
  });

  const rejectFamilyMutation = useMutation({
    mutationFn: (params: { unitLinkId: string; reason: string }) =>
      apiRequest(`/resident/mobile-unit-links/${params.unitLinkId}/reject`, { reason: params.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
    }
  });

  const unitsCount = summaryQuery.data?.connectedUnitCount ?? 0;
  const unitsSummary = summaryQuery.data ?? null;
  const units = query.data || [];
  const isSummaryLoading = summaryQuery.isLoading;
  const loading =
    summaryQuery.isLoading ||
    query.isLoading ||
    connectMutation.isPending ||
    disconnectMutation.isPending ||
    approveFamilyMutation.isPending ||
    rejectFamilyMutation.isPending;

  const error =
    summaryQuery.error?.message ||
    query.error?.message ||
    connectMutation.error?.message ||
    disconnectMutation.error?.message ||
    approveFamilyMutation.error?.message ||
    rejectFamilyMutation.error?.message ||
    null;

  const { refetch: refetchSummary } = summaryQuery;
  const { refetch } = query;
  const { mutateAsync: connectMutateAsync, reset: resetConnectMutation } = connectMutation;
  const { mutateAsync: disconnectMutateAsync, reset: resetDisconnectMutation } = disconnectMutation;
  const { mutateAsync: approveFamilyMutateAsync, reset: resetApproveFamilyMutation } = approveFamilyMutation;
  const { mutateAsync: rejectFamilyMutateAsync, reset: resetRejectFamilyMutation } = rejectFamilyMutation;

  const fetchUnits = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  const fetchUnitsSummary = React.useCallback(async () => {
    await refetchSummary();
  }, [refetchSummary]);

  const connectUnit = React.useCallback(async (newUnit: ConnectUnitParams) => {
    return await connectMutateAsync(newUnit);
  }, [connectMutateAsync]);

  const disconnectUnit = React.useCallback(async (id: string) => {
    await disconnectMutateAsync(id);
  }, [disconnectMutateAsync]);

  const approveFamilyMember = React.useCallback(async (unitLinkId: string) => {
    return await approveFamilyMutateAsync(unitLinkId);
  }, [approveFamilyMutateAsync]);

  const rejectFamilyMember = React.useCallback(async (unitLinkId: string, reason: string) => {
    return await rejectFamilyMutateAsync({ unitLinkId, reason });
  }, [rejectFamilyMutateAsync]);

  const clearError = React.useCallback(() => {
    resetConnectMutation();
    resetDisconnectMutation();
    resetApproveFamilyMutation();
    resetRejectFamilyMutation();
  }, [resetConnectMutation, resetDisconnectMutation, resetApproveFamilyMutation, resetRejectFamilyMutation]);

  return {
    unitsCount,
    unitsSummary,
    units,
    loading,
    isSummaryLoading,
    error,
    fetchUnitsSummary,
    fetchUnits,
    connectUnit,
    disconnectUnit,
    approveFamilyMember,
    rejectFamilyMember,
    clearError,
  };
}
