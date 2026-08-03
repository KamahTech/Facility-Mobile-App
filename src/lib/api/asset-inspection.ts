import { apiRequest } from "@/lib/api-client";

export type AssetStatus = "operational" | "maintenance" | "out_of_service" | "retired";

export interface WorkerAssetListItem {
  id: string;
  name: string;
  code: string;
  typeId: string;
  typeName: string;
  status: AssetStatus;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  lastInspectionDate: string | false;
  lastMaintenanceDate: string | false;
  failureRate: number;
}

export interface AssetDocument {
  id: string;
  name: string;
  type: "manual" | "warranty" | "certificate" | "drawing" | "other";
  date: string;
  filename: string;
  contentUrl: string;
}

export interface ChecklistTemplateSummary {
  id: string;
  name: string;
  itemCount: number;
}

export interface MaintenanceHistoryItem {
  id: string;
  name: string;
  type: "corrective" | "preventive";
  requestDate: string;
  closeDate: string | false;
  status: string;
}

export interface SparePartHistoryItem {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  uom: string;
}

export type InspectionState = "draft" | "in_progress" | "submitted" | "reviewed" | "approved" | "rejected";
export type FinalInspectionResult = "passed" | "failed" | false;
export type ChecklistItemResult = "pass" | "fail" | "na" | false;

export interface InspectionPhoto {
  id?: string;
  attachmentId?: string;
  name: string;
  mimetype: string;
  contentUrl?: string;
  data?: string;
}

export interface CompactInspection {
  id: string;
  name: string;
  assetId: string;
  assetName: string;
  templateId: string;
  inspectionDate: string;
  state: InspectionState;
  result: FinalInspectionResult;
  notes?: string;
  maintenanceRequestId?: string | false;
  photos?: InspectionPhoto[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  instructions?: string;
  required: boolean;
  result: ChecklistItemResult;
  notes?: string;
}

export interface InspectionDetail extends CompactInspection {
  checklist: ChecklistItem[];
}

export interface WorkerAssetDetail extends WorkerAssetListItem {
  warrantyExpirationDate: string | false;
  purchaseDate: string | false;
  checklistTemplates: ChecklistTemplateSummary[];
  documents: AssetDocument[];
  inspectionHistory: CompactInspection[];
  maintenanceHistory: MaintenanceHistoryItem[];
  sparePartsHistory: SparePartHistoryItem[];
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string | false;
  hasMore: boolean;
}

export interface InspectionSavePayload {
  notes?: string;
  finalResult?: "passed" | "failed";
  checklist?: Array<{
    id: string;
    result: "pass" | "fail" | "na";
    notes?: string;
  }>;
  photos?: Array<{
    name: string;
    mimetype: string;
    data: string;
  }>;
}

/**
 * List active assigned assets for the worker
 */
export async function getWorkerAssets(params?: {
  limit?: number;
  cursor?: string;
}): Promise<PaginatedResult<WorkerAssetListItem>> {
  return apiRequest<PaginatedResult<WorkerAssetListItem>>("/worker/assets", params || {});
}

/**
 * Get detailed asset information including history, documents, and checklist templates
 */
export async function getAssetDetail(assetId: string): Promise<WorkerAssetDetail> {
  return apiRequest<WorkerAssetDetail>(`/worker/assets/${assetId}`);
}

/**
 * Start an inspection for an asset using an optional template ID
 */
export async function startInspection(
  assetId: string,
  templateId?: string
): Promise<InspectionDetail> {
  return apiRequest<InspectionDetail>(`/worker/assets/${assetId}/inspections/start`, {
    templateId,
  });
}

/**
 * List the worker's inspection records
 */
export async function getWorkerInspections(params?: {
  limit?: number;
  cursor?: string;
}): Promise<PaginatedResult<CompactInspection>> {
  return apiRequest<PaginatedResult<CompactInspection>>("/worker/inspections", params || {});
}

/**
 * Get full inspection details including checklist items
 */
export async function getInspectionDetail(inspectionId: string): Promise<InspectionDetail> {
  return apiRequest<InspectionDetail>(`/worker/inspections/${inspectionId}`);
}

/**
 * Save draft changes for an in_progress or draft inspection
 */
export async function saveInspectionDraft(
  inspectionId: string,
  payload: InspectionSavePayload
): Promise<InspectionDetail> {
  return apiRequest<InspectionDetail>(
    `/worker/inspections/${inspectionId}/save`,
    payload as unknown as Record<string, unknown>
  );
}

/**
 * Submit an inspection for review and automatic ticket creation
 */
export async function submitInspection(
  inspectionId: string,
  payload?: InspectionSavePayload
): Promise<InspectionDetail> {
  return apiRequest<InspectionDetail>(
    `/worker/inspections/${inspectionId}/submit`,
    (payload || {}) as unknown as Record<string, unknown>
  );
}
