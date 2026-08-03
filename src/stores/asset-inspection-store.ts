import { create } from "zustand";
import type { ChecklistItemResult, FinalInspectionResult, InspectionPhoto } from "@/lib/api/asset-inspection";

export interface LocalChecklistState {
  result: ChecklistItemResult;
  notes: string;
}

export interface LocalPhotoItem {
  id: string;
  name: string;
  mimetype: string;
  data: string; // base64 data URL
  uri?: string;
  isExisting?: boolean;
  contentUrl?: string;
}

export interface DraftInspectionState {
  inspectionId: string;
  notes: string;
  finalResult: FinalInspectionResult;
  checklist: Record<string, LocalChecklistState>; // itemId -> state
  photos: LocalPhotoItem[];
  isDirty: boolean;
}

interface AssetInspectionStore {
  activeDrafts: Record<string, DraftInspectionState>;
  initDraft: (inspectionId: string, initialData?: {
    notes?: string;
    finalResult?: FinalInspectionResult;
    checklist?: Array<{ id: string; result: ChecklistItemResult; notes?: string }>;
    photos?: InspectionPhoto[];
  }) => void;
  updateChecklistItem: (inspectionId: string, itemId: string, result: ChecklistItemResult, notes?: string) => void;
  updateOverallNotes: (inspectionId: string, notes: string) => void;
  updateFinalResult: (inspectionId: string, result: FinalInspectionResult) => void;
  addPhoto: (inspectionId: string, photo: LocalPhotoItem) => void;
  removePhoto: (inspectionId: string, photoId: string) => void;
  clearDraft: (inspectionId: string) => void;
  getDraftPayload: (inspectionId: string) => {
    notes?: string;
    finalResult?: "passed" | "failed";
    checklist?: Array<{ id: string; result: "pass" | "fail" | "na"; notes?: string }>;
    photos?: Array<{ name: string; mimetype: string; data: string }>;
  };
}

export const useAssetInspectionStore = create<AssetInspectionStore>((set, get) => ({
  activeDrafts: {},

  initDraft: (inspectionId, initialData) => {
    set((state) => {
      if (state.activeDrafts[inspectionId] && state.activeDrafts[inspectionId].isDirty) {
        return state; // Preserve unsaved user edits
      }

      const checklistMap: Record<string, LocalChecklistState> = {};
      if (initialData?.checklist) {
        initialData.checklist.forEach((item) => {
          checklistMap[item.id] = {
            result: item.result,
            notes: item.notes || "",
          };
        });
      }

      const photosList: LocalPhotoItem[] = (initialData?.photos || []).map((p, idx) => ({
        id: p.id || p.attachmentId || `existing-${idx}`,
        name: p.name || `photo-${idx}.jpg`,
        mimetype: p.mimetype || "image/jpeg",
        data: p.data || "",
        contentUrl: p.contentUrl,
        isExisting: true,
      }));

      return {
        activeDrafts: {
          ...state.activeDrafts,
          [inspectionId]: {
            inspectionId,
            notes: initialData?.notes || "",
            finalResult: initialData?.finalResult || false,
            checklist: checklistMap,
            photos: photosList,
            isDirty: false,
          },
        },
      };
    });
  },

  updateChecklistItem: (inspectionId, itemId, result, notes) => {
    set((state) => {
      const draft = state.activeDrafts[inspectionId];
      if (!draft) return state;

      const currentItem = draft.checklist[itemId] || { result: false, notes: "" };
      const newResult = result;
      const newNotes = notes !== undefined ? notes : currentItem.notes;

      const updatedChecklist = {
        ...draft.checklist,
        [itemId]: {
          result: newResult,
          notes: newNotes,
        },
      };

      // Check if any checklist line fails. If so, automatically force finalResult = 'failed'
      let computedFinalResult = draft.finalResult;
      const hasAnyFail = Object.values(updatedChecklist).some((item) => item.result === "fail");
      if (hasAnyFail) {
        computedFinalResult = "failed";
      }

      return {
        activeDrafts: {
          ...state.activeDrafts,
          [inspectionId]: {
            ...draft,
            checklist: updatedChecklist,
            finalResult: computedFinalResult,
            isDirty: true,
          },
        },
      };
    });
  },

  updateOverallNotes: (inspectionId, notes) => {
    set((state) => {
      const draft = state.activeDrafts[inspectionId];
      if (!draft) return state;
      return {
        activeDrafts: {
          ...state.activeDrafts,
          [inspectionId]: {
            ...draft,
            notes,
            isDirty: true,
          },
        },
      };
    });
  },

  updateFinalResult: (inspectionId, result) => {
    set((state) => {
      const draft = state.activeDrafts[inspectionId];
      if (!draft) return state;

      // If any checklist line fails, user cannot manually set result to passed
      const hasAnyFail = Object.values(draft.checklist).some((item) => item.result === "fail");
      const effectiveResult = hasAnyFail ? "failed" : result;

      return {
        activeDrafts: {
          ...state.activeDrafts,
          [inspectionId]: {
            ...draft,
            finalResult: effectiveResult,
            isDirty: true,
          },
        },
      };
    });
  },

  addPhoto: (inspectionId, photo) => {
    set((state) => {
      const draft = state.activeDrafts[inspectionId];
      if (!draft) return state;
      if (draft.photos.length >= 10) return state; // Limit max 10 photos

      return {
        activeDrafts: {
          ...state.activeDrafts,
          [inspectionId]: {
            ...draft,
            photos: [...draft.photos, photo],
            isDirty: true,
          },
        },
      };
    });
  },

  removePhoto: (inspectionId, photoId) => {
    set((state) => {
      const draft = state.activeDrafts[inspectionId];
      if (!draft) return state;

      return {
        activeDrafts: {
          ...state.activeDrafts,
          [inspectionId]: {
            ...draft,
            photos: draft.photos.filter((p) => p.id !== photoId),
            isDirty: true,
          },
        },
      };
    });
  },

  clearDraft: (inspectionId) => {
    set((state) => {
      const newDrafts = { ...state.activeDrafts };
      delete newDrafts[inspectionId];
      return { activeDrafts: newDrafts };
    });
  },

  getDraftPayload: (inspectionId) => {
    const draft = get().activeDrafts[inspectionId];
    if (!draft) return {};

    const checklistItems = Object.entries(draft.checklist)
      .filter(([_, item]) => item.result === "pass" || item.result === "fail" || item.result === "na")
      .map(([id, item]) => ({
        id,
        result: item.result as "pass" | "fail" | "na",
        notes: item.notes ? item.notes.slice(0, 1000) : undefined,
      }));

    const photosPayload = draft.photos
      .filter((p) => Boolean(p.data))
      .map((p) => ({
        name: p.name,
        mimetype: p.mimetype,
        data: p.data,
      }));

    return {
      notes: draft.notes ? draft.notes.slice(0, 10000) : undefined,
      finalResult: draft.finalResult === "passed" || draft.finalResult === "failed" ? draft.finalResult : undefined,
      checklist: checklistItems.length > 0 ? checklistItems : undefined,
      photos: photosPayload.length > 0 ? photosPayload : undefined,
    };
  },
}));
