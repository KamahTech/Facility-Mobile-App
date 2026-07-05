import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";

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
  source: string;
  claimId: string;
  claimReference: string;
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

export function useOwnerStore(options?: {
  enableOwnerUnits?: boolean;
  enableStatement?: boolean;
  enableClaims?: boolean;
  enableServices?: boolean;
}) {
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
      const data = await apiRequest<any>("/resident/statement", {});
      if (!data) return data;

      const totalSummary = data.summary || data.totalSummary || {};
      const totalInvoiced =
        totalSummary.totalInvoiced !== undefined ? totalSummary.totalInvoiced :
        totalSummary.totallinvoices !== undefined ? totalSummary.totallinvoices :
        totalSummary.totalinvoices !== undefined ? totalSummary.totalinvoices :
        totalSummary.total_invoiced !== undefined ? totalSummary.total_invoiced : 0;

      const rawUnits = data.units || data.unitSummaries || [];
      const unitSummaries = rawUnits.map((item: any) => {
        const summary = item.financialSummary ? item.financialSummary : item;
        const summaryTotalInvoiced =
          summary.totalInvoiced !== undefined ? summary.totalInvoiced :
          summary.totallinvoices !== undefined ? summary.totallinvoices :
          summary.totalinvoices !== undefined ? summary.totalinvoices :
          summary.total_invoiced !== undefined ? summary.total_invoiced : 0;

        return {
          ...summary,
          totalInvoiced: summaryTotalInvoiced,
        };
      });

      return {
        ...data,
        totalSummary: {
          ...totalSummary,
          totalInvoiced,
        },
        unitSummaries,
      };
    },
    enabled: enableStatement,
  });

  const claimsQuery = useQuery<OwnerClaim[]>({
    queryKey: ["owner-claims"],
    queryFn: async () => {
      const list = await apiRequest<any[]>("/resident/claims", { limit: 100 });
      if (!list) return [];
      return list.map((item) => {
        const totalInvoiced =
          item.totalInvoiced !== undefined ? item.totalInvoiced :
          item.totallinvoices !== undefined ? item.totallinvoices :
          item.totalinvoices !== undefined ? item.totalinvoices :
          item.total_invoiced !== undefined ? item.total_invoiced : 0;
        return {
          ...item,
          totalInvoiced,
        };
      });
    },
    enabled: enableClaims,
  });

  const servicesQuery = useQuery<OwnerServiceCost[]>({
    queryKey: ["owner-services"],
    queryFn: async () => {
      const list = await apiRequest<any[]>("/resident/services", { limit: 100 });
      if (!list) return [];
      return list.map((item) => {
        const totalInvoiced =
          item.totalInvoiced !== undefined ? item.totalInvoiced :
          item.totallinvoices !== undefined ? item.totallinvoices :
          item.totalinvoices !== undefined ? item.totalinvoices :
          item.total_invoiced !== undefined ? item.total_invoiced : 0;
        return {
          ...item,
          totalInvoiced,
        };
      });
    },
    enabled: enableServices,
  });

  // Mutations
  const submitInquiryMutation = useMutation({
    mutationFn: (params: OwnerInquiryParams) => apiRequest("/resident/owner-inquiries/submit", params),
  });

  // Mapped States
  const ownerUnits = ownerUnitsQuery.data || [];
  const statement = statementQuery.data || null;
  const claims = claimsQuery.data || [];
  const services = servicesQuery.data || [];
  const loading =
    ownerUnitsQuery.isLoading ||
    statementQuery.isLoading ||
    claimsQuery.isLoading ||
    servicesQuery.isLoading ||
    submitInquiryMutation.isPending;

  const error =
    ownerUnitsQuery.error?.message ||
    statementQuery.error?.message ||
    claimsQuery.error?.message ||
    servicesQuery.error?.message ||
    submitInquiryMutation.error?.message ||
    null;

  // Actions
  const fetchOwnerUnits = React.useCallback(async () => {
    await ownerUnitsQuery.refetch();
  }, [ownerUnitsQuery]);

  const fetchOwnerUnitDetails = React.useCallback(async (unitId: string) => {
    const data = await apiRequest<any>(`/resident/owner-units/${unitId}`, {});
    if (data && data.financialSummary) {
      const summary = data.financialSummary;
      const totalInvoiced =
        summary.totalInvoiced !== undefined ? summary.totalInvoiced :
        summary.totallinvoices !== undefined ? summary.totallinvoices :
        summary.totalinvoices !== undefined ? summary.totalinvoices :
        summary.total_invoiced !== undefined ? summary.total_invoiced : 0;
      data.financialSummary = {
        ...summary,
        totalInvoiced,
      };
    }
    return data as OwnerUnit & { financialSummary?: OwnerFinancialSummary };
  }, []);

  const fetchFinancialSummary = React.useCallback(async (unitId: string) => {
    const data = await apiRequest<any>(`/resident/owner-units/${unitId}/financial-summary`, {});
    if (data) {
      const totalInvoiced =
        data.totalInvoiced !== undefined ? data.totalInvoiced :
        data.totallinvoices !== undefined ? data.totallinvoices :
        data.totalinvoices !== undefined ? data.totalinvoices :
        data.total_invoiced !== undefined ? data.total_invoiced : 0;
      return {
        ...data,
        totalInvoiced,
      } as OwnerFinancialSummary;
    }
    return data;
  }, []);

  const fetchStatement = React.useCallback(async () => {
    await statementQuery.refetch();
  }, [statementQuery]);

  const fetchClaims = React.useCallback(async () => {
    await claimsQuery.refetch();
  }, [claimsQuery]);

  const fetchClaimDetails = React.useCallback(async (claimId: string) => {
    const details = await apiRequest<any>(`/resident/claims/${claimId}`, {});
    if (details) {
      const totalInvoiced =
        details.totalInvoiced !== undefined ? details.totalInvoiced :
        details.totallinvoices !== undefined ? details.totallinvoices :
        details.totalinvoices !== undefined ? details.totalinvoices :
        details.total_invoiced !== undefined ? details.total_invoiced : 0;

      const services = (details.services || []).map((svc: any) => {
        const svcTotalInvoiced =
          svc.totalInvoiced !== undefined ? svc.totalInvoiced :
          svc.totallinvoices !== undefined ? svc.totallinvoices :
          svc.totalinvoices !== undefined ? svc.totalinvoices :
          svc.total_invoiced !== undefined ? svc.total_invoiced : 0;
        return {
          ...svc,
          totalInvoiced: svcTotalInvoiced,
        };
      });

      const normalizedDetails = {
        ...details,
        totalInvoiced,
        services,
      } as OwnerClaim;
      setCurrentClaim(normalizedDetails);
      return normalizedDetails;
    }
    setCurrentClaim(details);
    return details;
  }, []);

  const fetchServices = React.useCallback(async () => {
    await servicesQuery.refetch();
  }, [servicesQuery]);

  const submitInquiry = React.useCallback(async (params: OwnerInquiryParams) => {
    return await submitInquiryMutation.mutateAsync(params);
  }, [submitInquiryMutation]);

  const clearError = React.useCallback(() => {}, []);

  return {
    ownerUnits,
    statement,
    claims,
    services,
    loading,
    error,
    currentClaim,
    fetchOwnerUnits,
    fetchOwnerUnitDetails,
    fetchFinancialSummary,
    fetchStatement,
    fetchClaims,
    fetchClaimDetails,
    fetchServices,
    submitInquiry,
    clearError,
  };
}
