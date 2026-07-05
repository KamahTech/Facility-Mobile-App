import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";

export type ConnectedUnit = {
  id: string;
  buildingNumber: string;
  unitNumber: string;
  unitType: "residential" | "office" | "retail";
  ownershipType: "owner" | "tenant";
  contactNumber?: string;
};

export function useUnitStore() {
  const queryClient = useQueryClient();

  const query = useQuery<ConnectedUnit[]>({
    queryKey: ["connected-units"],
    queryFn: () => apiRequest("/resident/units", {}),
    enabled: true, // Auto fetch
  });

  const connectMutation = useMutation({
    mutationFn: (newUnit: Omit<ConnectedUnit, "id">) =>
      apiRequest("/resident/units/connect", newUnit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connected-units"] });
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/resident/units/${id}/disconnect`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connected-units"] });
    }
  });

  const units = query.data || [];
  const loading = query.isLoading || connectMutation.isPending || disconnectMutation.isPending;
  const error = query.error?.message || connectMutation.error?.message || disconnectMutation.error?.message || null;

  const fetchUnits = React.useCallback(async () => {
    await query.refetch();
  }, [query]);

  const connectUnit = React.useCallback(async (newUnit: Omit<ConnectedUnit, "id">) => {
    return await connectMutation.mutateAsync(newUnit);
  }, [connectMutation]);

  const disconnectUnit = React.useCallback(async (id: string) => {
    await disconnectMutation.mutateAsync(id);
  }, [disconnectMutation]);

  const clearError = React.useCallback(() => {}, []);

  return {
    units,
    loading,
    error,
    fetchUnits,
    connectUnit,
    disconnectUnit,
    clearError,
  };
}
