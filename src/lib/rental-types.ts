export type ContractType = "single" | "multi";

export type ContractState =
  | "draft"
  | "active"
  | "rented"
  | "expired"
  | "termination"
  | "cancelled";

export type PaymentPeriod =
  | "monthly"
  | "one_third"
  | "quarterly"
  | "biannually"
  | "annually";

export type InstallmentType = "rent" | "insurance" | "service";

export type InstallmentState =
  | "due"
  | "invoiced"
  | "partial_paid"
  | "paid"
  | "overdue";

export type ServiceType = "electricity" | "water" | "other";

export type ServiceBillState =
  | "draft"
  | "reviewed"
  | "confirmed"
  | "paid"
  | "cancel";

export interface RentalCurrency {
  id: string | false;
  code: string;
  symbol: string;
}

export interface RentalUnitSummary {
  id: string;
  name: string;
  projectId: string | false;
  buildingId: string | false;
}

export interface RentalSummary {
  activeContracts: number;
  totalOutstanding: number;
  overdueAmount: number;
  nextPaymentDate: string | false;
  nextPaymentAmount: number;
  currency: RentalCurrency;
}

export interface RentalContract {
  id: string;
  contractType: ContractType;
  reference: string;
  state: ContractState;
  period: PaymentPeriod;
  startDate: string | false;
  endDate: string | false;
  adjustedStartDate: string | false;
  adjustedEndDate: string | false;
  gracePeriodDays: number;
  rentalPrice: number;
  insuranceAmount: number;
  annualIncrease: boolean;
  annualIncreasePercent: number;
  currency: RentalCurrency;
  unitIds: string[];
  units: RentalUnitSummary[];
  installmentCount: number;
  outstandingAmount: number;
  overdueAmount: number;
  notes: string;
}

export function isValidInvoiceId(invoiceId: unknown): invoiceId is string {
  return typeof invoiceId === "string" && /^\d+$/.test(invoiceId);
}

export interface RentalInstallment {
  id: string;
  contractId: string;
  contractType: ContractType;
  name: string;
  type: InstallmentType;
  dueDate: string | false;
  amount: number;
  discount: number;
  amountAfterDiscount: number;
  paidAmount: number;
  remainingAmount: number;
  state: InstallmentState;
  invoiceId: string | false;
  invoiceNumber: string;
  paymentStatus: string | false;
  unitIds: string[];
  currency: RentalCurrency;
  note: string;
}

export interface RentalServiceBill {
  id: string;
  reference: string;
  serviceType: ServiceType;
  serviceDate: string;
  unitId: string | false;
  unitName: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  totalAmount: number;
  state: ServiceBillState;
  invoiceId: string | false;
  invoiceNumber: string;
  paymentStatus: string | false;
  currency: RentalCurrency;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | false;
  hasMore: boolean;
}

export interface GetContractsParams {
  contractType?: ContractType;
  state?: string;
  unitId?: string | number;
  limit?: number;
  cursor?: string | number;
  lang?: string;
}

export interface GetInstallmentsParams {
  contractType?: ContractType;
  state?: string;
  installmentType?: string;
  limit?: number;
  cursor?: string | number;
  lang?: string;
}

export interface GetServiceBillsParams {
  serviceType?: string;
  unitId?: string | number;
  limit?: number;
  cursor?: string | number;
  lang?: string;
}
