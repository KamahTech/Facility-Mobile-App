type OwnerAmountSource = {
  totalInvoiced?: unknown;
  totallinvoices?: unknown;
  totalinvoices?: unknown;
  total_invoiced?: unknown;
};

type OwnerStatementResponse = {
  summary?: OwnerAmountSource;
  totalSummary?: OwnerAmountSource;
  units?: unknown[];
  unitSummaries?: unknown[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function normalizeTotalInvoiced<T extends OwnerAmountSource>(source: T): T & { totalInvoiced: number } {
  const totalInvoiced =
    source.totalInvoiced ??
    source.totallinvoices ??
    source.totalinvoices ??
    source.total_invoiced;

  return {
    ...source,
    totalInvoiced: asNumber(totalInvoiced),
  };
}

export function normalizeOwnerStatementResponse<T extends OwnerStatementResponse>(data: T) {
  const totalSummary = normalizeTotalInvoiced(data.summary || data.totalSummary || {});
  const rawUnits = data.units || data.unitSummaries || [];
  const unitSummaries = rawUnits.map((item) => {
    const itemRecord = asRecord(item);
    const summary = asRecord(itemRecord.financialSummary || itemRecord);
    return normalizeTotalInvoiced(summary);
  });

  return {
    ...data,
    totalSummary,
    unitSummaries,
  };
}

export function normalizeOwnerDetails<T extends Record<string, unknown>>(data: T) {
  const services = Array.isArray(data.services)
    ? data.services.map((service) => normalizeTotalInvoiced(asRecord(service)))
    : data.services;

  return {
    ...normalizeTotalInvoiced(data),
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
