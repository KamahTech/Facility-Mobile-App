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
