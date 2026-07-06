import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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

export type PaginatedDeposits = {
  items: MaintenanceDeposit[];
  nextCursor: string | false;
  hasMore: boolean;
};

export function useDepositsStore() {
  const query = useInfiniteQuery<PaginatedDeposits>({
    queryKey: ["deposits"],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedDeposits>("/resident/deposits", { limit: 20, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
  });

  const deposits = React.useMemo(() => query.data?.pages.flatMap((page) => page.items) || [], [query.data]);
  const loading = query.isLoading || query.isFetchingNextPage;
  const error = query.error?.message || null;

  const fetchDeposits = React.useCallback(async () => {
    await query.refetch();
  }, [query]);

  const fetchNextPage = React.useCallback(async () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      await query.fetchNextPage();
    }
  }, [query]);

  const fetchUnitDeposits = React.useCallback(async (unitId: string, limit = 50, cursor?: string) => {
    const res = await apiRequest<PaginatedDeposits>(`/resident/owner-units/${unitId}/maintenance-deposits`, { limit, cursor });
    return res?.items || (Array.isArray(res) ? res : []);
  }, []);

  const clearError = React.useCallback(() => {}, []);

  return {
    deposits,
    loading,
    error,
    fetchDeposits,
    fetchNextPage,
    hasNextPage: query.hasNextPage,
    fetchUnitDeposits,
    clearError,
  };
}
