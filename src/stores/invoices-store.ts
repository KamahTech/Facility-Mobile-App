import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
};

export function useInvoicesStore() {
  const queryClient = useQueryClient();

  const query = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: () => apiRequest("/resident/invoices", { limit: 100 }),
    enabled: true, // Auto fetch
  });

  const payMutation = useMutation({
    mutationFn: (params: { id: string }) =>
      apiRequest(`/resident/invoices/${params.id}/pay`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    }
  });

  const invoices = React.useMemo(() => query.data || [], [query.data]);
  const loading = query.isLoading || payMutation.isPending;
  const error = query.error?.message || payMutation.error?.message || null;

  const fetchInvoices = React.useCallback(async () => {
    await query.refetch();
  }, [query]);

  const payInvoice = React.useCallback(async (id: string) => {
    return await payMutation.mutateAsync({ id });
  }, [payMutation]);

  const getTotalDueBalance = React.useCallback(() => {
    return invoices
      .filter((inv) => inv.status === "pending" || inv.status === "overdue")
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  const clearError = React.useCallback(() => {}, []);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    payInvoice,
    getTotalDueBalance,
    clearError,
  };
}
