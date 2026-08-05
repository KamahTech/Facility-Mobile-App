type OwnerAmountSource = Record<string, unknown>;

type OwnerStatementResponse = {
  summary?: OwnerAmountSource;
  totalSummary?: OwnerAmountSource;
  units?: unknown[];
  unitSummaries?: unknown[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function normalizeTotalInvoiced<T extends OwnerAmountSource>(source: T): T & { totalInvoiced: number } {
  return normalizeFinancialSummaryRecord(source);
}

export function normalizeFinancialSummaryRecord<T extends OwnerAmountSource>(source: T) {
  const rawTotal =
    source.totalInvoiced ??
    source.totallinvoices ??
    source.totalinvoices ??
    source.total_invoiced;

  const rawPaid = source.paidAmount ?? source.paid_amount ?? source.paid;
  const rawUnpaid = source.unpaidAmount ?? source.unpaid_amount ?? source.unpaid;
  const rawOverdue = source.overdueAmount ?? source.overdue_amount ?? source.overdue;

  let paidAmount = asNumber(rawPaid);
  let unpaidAmount = asNumber(rawUnpaid);
  let totalInvoiced = asNumber(rawTotal);
  const overdueAmount = asNumber(rawOverdue);

  // If totalInvoiced is 0 but paid and unpaid exist, sum them up
  if (totalInvoiced === 0 && (paidAmount > 0 || unpaidAmount > 0)) {
    totalInvoiced = paidAmount + unpaidAmount;
  }

  // If unpaidAmount is 0 and totalInvoiced > paidAmount, derive unpaidAmount
  if (unpaidAmount === 0 && totalInvoiced > paidAmount) {
    unpaidAmount = Math.max(0, totalInvoiced - paidAmount);
  }

  const invoiceCount = asNumber(source.invoiceCount ?? source.invoice_count);
  const paidInvoiceCount = asNumber(source.paidInvoiceCount ?? source.paid_invoice_count);
  const unpaidInvoiceCount = asNumber(source.unpaidInvoiceCount ?? source.unpaid_invoice_count);
  const overdueInvoiceCount = asNumber(source.overdueInvoiceCount ?? source.overdue_invoice_count);

  const maintenanceDepositReturn = asNumber(
    source.maintenanceDepositReturn ?? source.maintenance_deposit_return ?? source.depositReturn ?? source.deposit_return,
  );
  const claimCount = asNumber(source.claimCount ?? source.claim_count);
  const claimAmountToInvoice = asNumber(
    source.claimAmountToInvoice ?? source.claim_amount_to_invoice ?? source.amountToInvoice ?? source.amount_to_invoice,
  );
  const claimDifference = asNumber(source.claimDifference ?? source.claim_difference ?? source.difference);
  const serviceEstimatedCost = asNumber(
    source.serviceEstimatedCost ?? source.service_estimated_cost ?? source.estimatedCost ?? source.estimated_cost,
  );
  const serviceActualCost = asNumber(
    source.serviceActualCost ?? source.service_actual_cost ?? source.actualCost ?? source.actual_cost,
  );
  const ownerLineEstimatedCost = asNumber(source.ownerLineEstimatedCost ?? source.owner_line_estimated_cost);
  const ownerLineActualCost = asNumber(source.ownerLineActualCost ?? source.owner_line_actual_cost);

  return {
    ...source,
    unitId: String(source.unitId || source.unit_id || ""),
    totalInvoiced,
    paidAmount,
    unpaidAmount,
    overdueAmount,
    invoiceCount,
    paidInvoiceCount,
    unpaidInvoiceCount,
    overdueInvoiceCount,
    maintenanceDepositReturn,
    claimCount,
    claimAmountToInvoice,
    claimDifference,
    serviceEstimatedCost,
    serviceActualCost,
    ownerLineEstimatedCost,
    ownerLineActualCost,
  };
}

export function normalizeOwnerStatementResponse<T extends OwnerStatementResponse>(data: T) {
  const rawUnits = (data.units || data.unitSummaries || []) as Record<string, unknown>[];
  const unitSummaries = rawUnits.map((item) => {
    const itemRecord = asRecord(item);
    const summary = asRecord(itemRecord.financialSummary || itemRecord);
    return normalizeFinancialSummaryRecord(summary);
  });

  const rawSummary = asRecord(data.summary || data.totalSummary || {});
  const normalizedSummary = normalizeFinancialSummaryRecord(rawSummary);

  const hasTopSummary =
    normalizedSummary.totalInvoiced > 0 ||
    normalizedSummary.paidAmount > 0 ||
    normalizedSummary.unpaidAmount > 0 ||
    normalizedSummary.overdueAmount > 0;

  const totalSummary = hasTopSummary
    ? normalizedSummary
    : unitSummaries.reduce(
        (acc, curr) => ({
          ...acc,
          totalInvoiced: acc.totalInvoiced + curr.totalInvoiced,
          paidAmount: acc.paidAmount + curr.paidAmount,
          unpaidAmount: acc.unpaidAmount + curr.unpaidAmount,
          overdueAmount: acc.overdueAmount + curr.overdueAmount,
          invoiceCount: acc.invoiceCount + curr.invoiceCount,
          paidInvoiceCount: acc.paidInvoiceCount + curr.paidInvoiceCount,
          unpaidInvoiceCount: acc.unpaidInvoiceCount + curr.unpaidInvoiceCount,
          overdueInvoiceCount: acc.overdueInvoiceCount + curr.overdueInvoiceCount,
          maintenanceDepositReturn: acc.maintenanceDepositReturn + curr.maintenanceDepositReturn,
          claimCount: acc.claimCount + curr.claimCount,
          claimAmountToInvoice: acc.claimAmountToInvoice + curr.claimAmountToInvoice,
          claimDifference: acc.claimDifference + curr.claimDifference,
          serviceEstimatedCost: acc.serviceEstimatedCost + curr.serviceEstimatedCost,
          serviceActualCost: acc.serviceActualCost + curr.serviceActualCost,
          ownerLineEstimatedCost: acc.ownerLineEstimatedCost + curr.ownerLineEstimatedCost,
          ownerLineActualCost: acc.ownerLineActualCost + curr.ownerLineActualCost,
        }),
        {
          unitId: "",
          totalInvoiced: 0,
          paidAmount: 0,
          unpaidAmount: 0,
          overdueAmount: 0,
          invoiceCount: 0,
          paidInvoiceCount: 0,
          unpaidInvoiceCount: 0,
          overdueInvoiceCount: 0,
          maintenanceDepositReturn: 0,
          claimCount: 0,
          claimAmountToInvoice: 0,
          claimDifference: 0,
          serviceEstimatedCost: 0,
          serviceActualCost: 0,
          ownerLineEstimatedCost: 0,
          ownerLineActualCost: 0,
        },
      );

  return {
    ...data,
    units: (data.units || []) as { unit: any; financialSummary: any }[],
    summary: totalSummary,
    totalSummary,
    unitSummaries,
  };
}

export function normalizeOwnerDetails<T extends Record<string, unknown>>(data: T) {
  const services = Array.isArray(data.services)
    ? data.services.map((service) => normalizeFinancialSummaryRecord(asRecord(service)))
    : data.services;

  return {
    ...normalizeFinancialSummaryRecord(data),
    services,
  };
}

export function normalizeFacilityOwnerPeriod<T extends Record<string, unknown>>(data: T) {
  const rawStartDate =
    data.startDate ??
    data.start_date ??
    data.dateStart ??
    data.date_start ??
    data.dateFrom ??
    data.date_from ??
    data.from_date ??
    data.fromDate;

  const rawEndDate =
    data.endDate ??
    data.end_date ??
    data.dateEnd ??
    data.date_end ??
    data.dateTo ??
    data.date_to ??
    data.to_date ??
    data.toDate;

  const startDate = typeof rawStartDate === "string" ? rawStartDate : "";
  const endDate = typeof rawEndDate === "string" ? rawEndDate : "";

  const durationDays =
    typeof data.durationDays === "number"
      ? data.durationDays
      : typeof data.duration_days === "number"
      ? data.duration_days
      : typeof data.duration === "number"
      ? data.duration
      : undefined;

  const rawAllocation = asRecord(data.residentAllocation || data.resident_allocation || data.allocation);
  const totalAllocated = asNumber(rawAllocation.totalAllocated ?? rawAllocation.total_allocated ?? rawAllocation.allocated ?? data.allocatedServiceCosts ?? data.allocated_service_costs);
  const paidAmount = asNumber(rawAllocation.paidAmount ?? rawAllocation.paid_amount ?? rawAllocation.paid);
  const unpaidAmount = asNumber(rawAllocation.unpaidAmount ?? rawAllocation.unpaid_amount ?? rawAllocation.unpaid ?? Math.max(0, totalAllocated - paidAmount));

  const residentAllocation = (totalAllocated > 0 || paidAmount > 0 || unpaidAmount > 0)
    ? {
        totalAllocated,
        paidAmount,
        unpaidAmount,
      }
    : undefined;

  return {
    ...data,
    id: String(data.id || data.name || data.reference || Math.random()),
    reference: String(data.reference || data.name || data.code || ""),
    state: String(data.state || data.status || ""),
    projectName: String(data.projectName || data.project_name || data.project || ""),
    startDate,
    endDate,
    durationDays,
    allocatedServiceCosts: typeof data.allocatedServiceCosts === "number" ? data.allocatedServiceCosts : typeof data.allocated_service_costs === "number" ? data.allocated_service_costs : undefined,
    residentAllocation: residentAllocation || (data.residentAllocation as any),
  };
}
