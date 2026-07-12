import React from "react";
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import {
  normalizeOwnerDetails,
  normalizeOwnerStatementResponse,
  normalizeTotalInvoiced,
} from "@/lib/owner-normalization";
import { type MobileUnitLinkItem } from "@/stores/unit-store";

export type OwnerUnit = {
  id: string;
  name: string;
  unitNumber: string;
  buildingNumber: string;
  projectName: string;
  phaseName: string;
  floorNumber: string;
  state: string;
  totalArea: number;
  operationalArea: number;
  annualMaintenanceDeposit: number;
  ownerLineIds: string[];
  facilityOwnerIds: string[];
};

export type OwnerFinancialSummary = {
  unitId: string;
  totalInvoiced: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueAmount: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  unpaidInvoiceCount: number;
  overdueInvoiceCount: number;
  maintenanceDepositReturn: number;
  claimCount: number;
  claimAmountToInvoice: number;
  claimDifference: number;
  serviceEstimatedCost: number;
  serviceActualCost: number;
  ownerLineEstimatedCost: number;
  ownerLineActualCost: number;
};

export type OwnerStatement = {
  summary: OwnerFinancialSummary;
  units: {
    unit: OwnerUnit;
    financialSummary: OwnerFinancialSummary;
  }[];
  totalSummary: {
    totalInvoiced: number;
    paidAmount: number;
    unpaidAmount: number;
    overdueAmount: number;
  };
  unitSummaries: OwnerFinancialSummary[];
};

export type OwnerClaim = {
  id: string;
  reference: string;
  date: string;
  state: string;
  unitId: string;
  unitNumber: string;
  buildingNumber: string;
  projectName: string;
  estimatedCost: number;
  actualCost: number;
  maintenanceDepositReturn: number;
  difference: number;
  amountToInvoice: number;
  totalInvoiced: number;
  invoiceId?: string | boolean;
  services?: OwnerServiceCost[];
};

export type OwnerServiceCost = {
  id: string;
  source: "owner_service" | "claim_service";
  claimId?: string;
  claimReference?: string;
  unitId: string;
  unitNumber: string;
  serviceName: string;
  productName: string;
  estimatedCost: number;
  actualCost: number;
  difference: number;
  totalInvoiced: number;
};

export type OwnerInquiryParams = {
  sourceType: "invoice" | "claim" | "deposit" | "service" | "unit";
  sourceId: string;
  subject: string;
  details: string;
};

export type PaginatedClaims = {
  items: OwnerClaim[];
  nextCursor: string | false;
  hasMore: boolean;
};

export type PaginatedServices = {
  items: OwnerServiceCost[];
  nextCursor: string | false;
  hasMore: boolean;
};

export type TenantsResponse = {
  ok: boolean;
  data: {
    unitId: string;
    items: MobileUnitLinkItem[];
  };
};

export function useTenantsQuery(unitId?: string) {
  return useQuery<TenantsResponse>({
    queryKey: ["unit-tenants", unitId],
    queryFn: () => apiRequest<TenantsResponse>(`/resident/owner-units/${unitId}/tenants`, {}),
    enabled: !!unitId,
  });
}

export function useOwnerStore(options?: {
  enableOwnerUnits?: boolean;
  enableStatement?: boolean;
  enableClaims?: boolean;
  enableServices?: boolean;
}) {
  const queryClient = useQueryClient();
  const [currentClaim, setCurrentClaim] = React.useState<OwnerClaim | null>(null);

  const enableOwnerUnits = options?.enableOwnerUnits ?? false;
  const enableStatement = options?.enableStatement ?? false;
  const enableClaims = options?.enableClaims ?? false;
  const enableServices = options?.enableServices ?? false;

  // Queries
  const ownerUnitsQuery = useQuery<OwnerUnit[]>({
    queryKey: ["owner-units"],
    queryFn: () => apiRequest<OwnerUnit[]>("/resident/owner-units", {}),
    enabled: enableOwnerUnits,
  });

  const statementQuery = useQuery<OwnerStatement>({
    queryKey: ["owner-statement"],
    queryFn: async () => {
      const data = await apiRequest<Record<string, unknown>>("/resident/statement", {});
      if (!data) return data;
      return normalizeOwnerStatementResponse(data) as OwnerStatement;
    },
    enabled: enableStatement,
  });

  const claimsQuery = useInfiniteQuery<PaginatedClaims>({
    queryKey: ["owner-claims"],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedClaims>("/resident/claims", { limit: 20, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: enableClaims,
  });

  const servicesQuery = useInfiniteQuery<PaginatedServices>({
    queryKey: ["owner-services"],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedServices>("/resident/services", { limit: 20, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    enabled: enableServices,
  });

  // Mutations
  const submitInquiryMutation = useMutation({
    mutationFn: (params: OwnerInquiryParams) => apiRequest("/resident/owner-inquiries/submit", params),
  });

  const removeTenantMutation = useMutation({
    mutationFn: (params: { unitId: string; unitLinkId: string }) =>
      apiRequest(`/resident/owner-units/${params.unitId}/tenants/${params.unitLinkId}/remove`, {}),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ["unit-tenants", params.unitId] });
    }
  });

  // Mapped States
  const ownerUnits = ownerUnitsQuery.data || [];
  const statement = statementQuery.data || null;
  
  const claims = React.useMemo(() => {
    const list = claimsQuery.data?.pages.flatMap((page) => page.items) || [];
    return list.map((item) => normalizeTotalInvoiced(item) as OwnerClaim);
  }, [claimsQuery.data]);

  const services = React.useMemo(() => {
    const list = servicesQuery.data?.pages.flatMap((page) => page.items) || [];
    return list.map((item) => normalizeTotalInvoiced(item) as OwnerServiceCost);
  }, [servicesQuery.data]);

  const loading =
    ownerUnitsQuery.isLoading ||
    statementQuery.isLoading ||
    claimsQuery.isLoading ||
    claimsQuery.isFetchingNextPage ||
    servicesQuery.isLoading ||
    servicesQuery.isFetchingNextPage ||
    submitInquiryMutation.isPending ||
    removeTenantMutation.isPending;

  const error =
    ownerUnitsQuery.error?.message ||
    statementQuery.error?.message ||
    claimsQuery.error?.message ||
    servicesQuery.error?.message ||
    submitInquiryMutation.error?.message ||
    removeTenantMutation.error?.message ||
    null;

  const ownerUnitsError = ownerUnitsQuery.error?.message || null;
  const statementError = statementQuery.error?.message || null;
  const { refetch: refetchOwnerUnits } = ownerUnitsQuery;
  const { refetch: refetchStatement } = statementQuery;
  const {
    fetchNextPage: fetchNextClaimsPage,
    hasNextPage: hasNextClaimsPage,
    isFetchingNextPage: isFetchingNextClaimsPage,
    refetch: refetchClaims,
  } = claimsQuery;
  const {
    fetchNextPage: fetchNextServicesPage,
    hasNextPage: hasNextServicesPage,
    isFetchingNextPage: isFetchingNextServicesPage,
    refetch: refetchServices,
  } = servicesQuery;
  const { mutateAsync: submitInquiryMutateAsync, reset: resetSubmitInquiryMutation } = submitInquiryMutation;

  // Actions
  const fetchOwnerUnits = React.useCallback(async () => {
    await refetchOwnerUnits();
  }, [refetchOwnerUnits]);

  const fetchOwnerUnitDetails = React.useCallback(async (unitId: string) => {
    const data = await apiRequest<Record<string, unknown>>(`/resident/owner-units/${unitId}`, {});
    if (data && data.financialSummary) {
      data.financialSummary = {
        ...normalizeTotalInvoiced(data.financialSummary as Record<string, unknown>),
      };
    }
    return data as OwnerUnit & { financialSummary?: OwnerFinancialSummary };
  }, []);

  const fetchFinancialSummary = React.useCallback(async (unitId: string) => {
    const data = await apiRequest<Record<string, unknown>>(`/resident/owner-units/${unitId}/financial-summary`, {});
    if (data) {
      return normalizeTotalInvoiced(data) as OwnerFinancialSummary;
    }
    return data;
  }, []);

  const fetchStatement = React.useCallback(async () => {
    await refetchStatement();
  }, [refetchStatement]);

  const fetchClaims = React.useCallback(async () => {
    await refetchClaims();
  }, [refetchClaims]);

  const fetchNextClaims = React.useCallback(async () => {
    if (hasNextClaimsPage && !isFetchingNextClaimsPage) {
      await fetchNextClaimsPage();
    }
  }, [fetchNextClaimsPage, hasNextClaimsPage, isFetchingNextClaimsPage]);

  const fetchClaimDetails = React.useCallback(async (claimId: string) => {
    const details = await apiRequest<Record<string, unknown>>(`/resident/claims/${claimId}`, {});
    if (details) {
      const normalizedDetails = normalizeOwnerDetails(details) as OwnerClaim;
      setCurrentClaim(normalizedDetails);
      return normalizedDetails;
    }
    setCurrentClaim(details);
    return details;
  }, []);

  const fetchServices = React.useCallback(async () => {
    await refetchServices();
  }, [refetchServices]);

  const fetchNextServices = React.useCallback(async () => {
    if (hasNextServicesPage && !isFetchingNextServicesPage) {
      await fetchNextServicesPage();
    }
  }, [fetchNextServicesPage, hasNextServicesPage, isFetchingNextServicesPage]);

  const submitInquiry = React.useCallback(async (params: OwnerInquiryParams) => {
    return await submitInquiryMutateAsync(params);
  }, [submitInquiryMutateAsync]);

  const removeTenant = React.useCallback(async (unitId: string, unitLinkId: string) => {
    return await removeTenantMutation.mutateAsync({ unitId, unitLinkId });
  }, [removeTenantMutation]);

  const clearError = React.useCallback(() => {
    resetSubmitInquiryMutation();
    removeTenantMutation.reset();
  }, [resetSubmitInquiryMutation, removeTenantMutation]);

  return {
    ownerUnits,
    statement,
    claims,
    services,
    loading,
    error,
    ownerUnitsError,
    statementError,
    currentClaim,
    fetchOwnerUnits,
    fetchOwnerUnitDetails,
    fetchFinancialSummary,
    fetchStatement,
    fetchClaims,
    fetchNextClaims,
    hasNextClaims: claimsQuery.hasNextPage,
    fetchClaimDetails,
    fetchServices,
    fetchNextServices,
    hasNextServices: servicesQuery.hasNextPage,
    submitInquiry,
    removeTenant,
    clearError,
  };
}
