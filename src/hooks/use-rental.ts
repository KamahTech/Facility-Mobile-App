import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type {
  RentalSummary,
  RentalContract,
  RentalInstallment,
  RentalServiceBill,
  InstallmentState,
  CursorPage,
  ContractType,
  GetContractsParams,
  GetInstallmentsParams,
  GetServiceBillsParams,
} from "@/lib/rental-types";

// Helper to calculate days overdue
export function calculateDaysOverdue(dueDate: string | false): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return 0;

  // Set due time to end of due date (23:59:59.999) in local time
  const dueEndOfDay = new Date(due);
  dueEndOfDay.setHours(23, 59, 59, 999);

  const now = new Date();
  if (now <= dueEndOfDay) return 0;

  const diffMs = now.getTime() - dueEndOfDay.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// Helper to determine the accurate effective state of a rental installment
export function getInstallmentEffectiveState(installment: RentalInstallment): InstallmentState {
  if (installment.remainingAmount <= 0 || installment.state === "paid") {
    return "paid";
  }

  const daysOverdue = calculateDaysOverdue(installment.dueDate);
  if (installment.remainingAmount > 0 && (installment.state === "overdue" || daysOverdue > 0)) {
    return "overdue";
  }

  if (installment.paidAmount > 0 && installment.remainingAmount > 0) {
    return "partial_paid";
  }

  if (installment.state === "invoiced") {
    return "invoiced";
  }

  return "due";
}

// 1. Rental Summary Query
export function useRentalSummaryQuery() {
  return useQuery<RentalSummary>({
    queryKey: ["rental-summary"],
    queryFn: () => apiRequest<RentalSummary>("/resident/rentals/summary", {}),
  });
}

// Helper to fetch both single & multi contracts and merge/deduplicate by (contractType, id)
async function fetchMergedContracts(params: Omit<GetContractsParams, "contractType">) {
  const [singlePage, multiPage] = await Promise.all([
    apiRequest<CursorPage<RentalContract>>("/resident/rentals", {
      ...params,
      contractType: "single",
    }).catch(() => ({ items: [], nextCursor: false, hasMore: false })),
    apiRequest<CursorPage<RentalContract>>("/resident/rentals", {
      ...params,
      contractType: "multi",
    }).catch(() => ({ items: [], nextCursor: false, hasMore: false })),
  ]);

  const map = new Map<string, RentalContract>();
  [...singlePage.items, ...multiPage.items].forEach((item) => {
    const key = `${item.contractType}_${item.id}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values());
}

// 2. List Rental Contracts Query
export function useRentalContractsQuery(params: GetContractsParams = {}) {
  const { contractType, state, unitId } = params;

  return useQuery<RentalContract[]>({
    queryKey: ["rental-contracts", contractType, state, unitId],
    queryFn: async () => {
      if (contractType) {
        const page = await apiRequest<CursorPage<RentalContract>>("/resident/rentals", {
          ...params,
          limit: 100,
        });
        return page.items;
      }
      return fetchMergedContracts({ state, unitId, limit: 100 });
    },
  });
}

// 3. Rental Contract Detail Query
export function useRentalContractDetailQuery(
  contractId: string | undefined,
  contractType: ContractType = "single"
) {
  return useQuery<RentalContract>({
    queryKey: ["rental-contract-detail", contractId, contractType],
    queryFn: () =>
      apiRequest<RentalContract>(`/resident/rentals/${contractId}`, {
        contractType,
      }),
    enabled: Boolean(contractId),
  });
}

// 4. Contract Installments Query
export function useRentalInstallmentsQuery(
  contractId: string | undefined,
  contractType: ContractType = "single",
  filters: Omit<GetInstallmentsParams, "contractType"> = {}
) {
  return useInfiniteQuery<CursorPage<RentalInstallment>>({
    queryKey: ["rental-installments", contractId, contractType, filters],
    queryFn: ({ pageParam }) =>
      apiRequest<CursorPage<RentalInstallment>>(
        `/resident/rentals/${contractId}/installments`,
        {
          contractType,
          ...filters,
          limit: 20,
          cursor: pageParam,
        }
      ),
    enabled: Boolean(contractId),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
  });
}

// Helper for merging upcoming / overdue installments
async function fetchMergedInstallmentsEndpoint(
  endpoint: string,
  params: Record<string, unknown> = {}
) {
  const [singlePage, multiPage] = await Promise.all([
    apiRequest<CursorPage<RentalInstallment>>(endpoint, {
      ...params,
      contractType: "single",
      limit: 100,
    }).catch(() => ({ items: [], nextCursor: false, hasMore: false })),
    apiRequest<CursorPage<RentalInstallment>>(endpoint, {
      ...params,
      contractType: "multi",
      limit: 100,
    }).catch(() => ({ items: [], nextCursor: false, hasMore: false })),
  ]);

  const map = new Map<string, RentalInstallment>();
  [...singlePage.items, ...multiPage.items].forEach((item) => {
    const key = `${item.contractType}_${item.id}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values());
}

// 5. Upcoming Installments Query
export function useUpcomingInstallmentsQuery() {
  return useQuery<RentalInstallment[]>({
    queryKey: ["rental-installments-upcoming"],
    queryFn: () => fetchMergedInstallmentsEndpoint("/resident/rental-installments/upcoming"),
  });
}

// 6. Overdue Installments Query
export function useOverdueInstallmentsQuery() {
  return useQuery<RentalInstallment[]>({
    queryKey: ["rental-installments-overdue"],
    queryFn: () => fetchMergedInstallmentsEndpoint("/resident/rental-installments/overdue"),
  });
}

// 7. List Service Bills Query
export function useServiceBillsQuery(filters: GetServiceBillsParams = {}) {
  return useInfiniteQuery<CursorPage<RentalServiceBill>>({
    queryKey: ["rental-service-bills", filters],
    queryFn: ({ pageParam }) =>
      apiRequest<CursorPage<RentalServiceBill>>("/resident/service-bills", {
        ...filters,
        limit: 20,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
  });
}

// 8. Service Bill Detail Query
export function useServiceBillDetailQuery(serviceBillId: string | undefined) {
  return useQuery<RentalServiceBill>({
    queryKey: ["rental-service-bill-detail", serviceBillId],
    queryFn: () =>
      apiRequest<RentalServiceBill>(`/resident/service-bills/${serviceBillId}`, {}),
    enabled: Boolean(serviceBillId),
  });
}
