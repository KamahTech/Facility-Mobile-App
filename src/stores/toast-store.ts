import { create } from "zustand";

export type ToastType = "error" | "success" | "info";

type ToastState = {
  message: string | null;
  type: ToastType;
  visible: boolean;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "info",
  visible: false,
  showToast: (message, type = "info") => {
    set({ message, type, visible: true });
  },
  hideToast: () => set({ visible: false }),
}));
