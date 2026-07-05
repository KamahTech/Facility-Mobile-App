import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";

export type MaintenanceDeposit = {
  id: string;
  unitNumber: string;
  buildingNumber: string;
  periodic: "annual" | "semi_annual" | "quarterly" | "monthly";
  amount: number;
  status: string;
  rate: number;
  returnValue: number;
  expirationDate: string | boolean;
  dateFrom: string | boolean;
  dateTo: string | boolean;
};

export function useDepositsStore() {
  const query = useQuery<MaintenanceDeposit[]>({
    queryKey: ["deposits"],
    queryFn: () => apiRequest("/resident/deposits", {}),
    enabled: true, // Auto fetch
  });

  const deposits = query.data || [];
  const loading = query.isLoading;
  const error = query.error?.message || null;

  const fetchDeposits = React.useCallback(async () => {
    await query.refetch();
  }, [query]);

  const fetchUnitDeposits = React.useCallback(async (unitId: string) => {
    return await apiRequest(`/resident/owner-units/${unitId}/maintenance-deposits`, {});
  }, []);

  const clearError = React.useCallback(() => {}, []);

  return {
    deposits,
    loading,
    error,
    fetchDeposits,
    fetchUnitDeposits,
    clearError,
  };
}
