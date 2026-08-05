import React from "react";
import {
  type InfiniteData,
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { TranslationKey } from "@/constants/translations";

export type InvoiceStatus = "paid" | "pending" | "overdue";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  amount: number;
  status: InvoiceStatus;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  paidDate?: string | boolean; // YYYY-MM-DD or false
  sourceType?: string;
  rentalContractId?: string;
  rentalContractType?: "single" | "multi";
  unitId?: string | false;
  chargeType?: string;
  currencyCode?: string;
  pdfUrl?: string;
  lineItems?: InvoiceLineItem[];
};

export type InvoiceLineItem = {
  id: string;
  label: string;
  amount: number;
};

export type PaginatedInvoices = {
  items: Invoice[];
  nextCursor: string | false;
  hasMore: boolean;
};

export function useInvoiceQuery(invoiceId: string) {
  const queryClient = useQueryClient();

  return useQuery<Invoice | null>({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      if (!invoiceId || invoiceId === "false") {
        return null;
      }

      // 1. Try direct detail endpoint (suppressing error toast if route is missing on backend)
      try {
        const directInvoice = await apiRequest<Invoice>(
          `/resident/invoices/${invoiceId}`,
          {},
          { showErrorToast: false }
        );
        if (directInvoice && directInvoice.id) {
          return directInvoice;
        }
      } catch {
        // Detail endpoint not supported or returned error, fall back to list search
      }

      // 2. Check query cache for paginated invoices
      const cached = queryClient
        .getQueryData<InfiniteData<PaginatedInvoices>>(["invoices"])
        ?.pages.flatMap((page) => page.items)
        .find((invoice) => String(invoice.id) === String(invoiceId));

      if (cached) {
        return cached;
      }

      // 3. Fallback: Fetch /resident/invoices list endpoint and find item by ID
      try {
        const listData = await apiRequest<PaginatedInvoices>(
          "/resident/invoices",
          { limit: 100 },
          { showErrorToast: false }
        );
        const found = listData?.items?.find(
          (invoice) => String(invoice.id) === String(invoiceId)
        );
        if (found) {
          return found;
        }
      } catch {
        // Ignore fallback error
      }

      return null;
    },
    initialData: () =>
      queryClient
        .getQueryData<InfiniteData<PaginatedInvoices>>(["invoices"])
        ?.pages.flatMap((page) => page.items)
        .find((invoice) => String(invoice.id) === String(invoiceId)),
    enabled: Boolean(invoiceId && invoiceId !== "false"),
  });
}

export function useInvoicesStore() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery<PaginatedInvoices>({
    queryKey: ["invoices"],
    queryFn: ({ pageParam }) =>
      apiRequest<PaginatedInvoices>("/resident/invoices", { limit: 20, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
  });

  const payMutation = useMutation({
    mutationFn: (params: { id: string }) =>
      apiRequest(`/resident/invoices/${params.id}/pay`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["owner-statement"] });
      queryClient.invalidateQueries({ queryKey: ["owner-units"] });
      queryClient.invalidateQueries({ queryKey: ["connected-units-summary"] });
    }
  });

  const invoices = React.useMemo(() => query.data?.pages.flatMap((page) => page.items) || [], [query.data]);
  const loading = query.isLoading || query.isFetchingNextPage || payMutation.isPending;
  const error = query.error?.message || payMutation.error?.message || null;
  const { fetchNextPage: fetchNextInvoicesPage, hasNextPage, isFetchingNextPage, refetch } = query;
  const { mutateAsync: payMutateAsync, reset: resetPayMutation } = payMutation;

  const fetchInvoices = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  const fetchNextPage = React.useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextInvoicesPage();
    }
  }, [fetchNextInvoicesPage, hasNextPage, isFetchingNextPage]);

  const payInvoice = React.useCallback(async (id: string) => {
    return await payMutateAsync({ id });
  }, [payMutateAsync]);

  const getTotalDueBalance = React.useCallback(() => {
    return invoices
      .filter((inv) => inv.status === "pending" || inv.status === "overdue")
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  const clearError = React.useCallback(() => {
    resetPayMutation();
  }, [resetPayMutation]);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    fetchNextPage,
    hasNextPage: query.hasNextPage,
    payInvoice,
    getTotalDueBalance,
    clearError,
  };
}
