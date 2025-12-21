import { createStore } from "./create-store";
import type { Category } from "@/types/common";

type ModalType =
  | "addSubscription"
  | "editSubscription"
  | "confirmDelete"
  | null;

/**
 * Prefill data for AddSubscriptionDialog
 * Used when opening the dialog from Quick-Add or EmptyState
 */
export interface SubscriptionPrefillData {
  name?: string;
  categoryId?: Category;
  icon?: string;
  color?: string;
  skipToForm?: boolean; // Skip quick-add grid and go directly to form
}

interface UIState {
  activeModal: ModalType;
  editingSubscriptionId: string | null;
  prefillData: SubscriptionPrefillData | null;
  isLoading: boolean;

  // Actions
  openModal: (
    modal: ModalType,
    subscriptionId?: string,
    prefill?: SubscriptionPrefillData
  ) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = createStore<UIState>(
  (set) => ({
    activeModal: null,
    editingSubscriptionId: null,
    prefillData: null,
    isLoading: false,

    openModal: (modal, subscriptionId, prefill) =>
      set({
        activeModal: modal,
        editingSubscriptionId: subscriptionId ?? null,
        prefillData: prefill ?? null,
      }),
    closeModal: () =>
      set({
        activeModal: null,
        editingSubscriptionId: null,
        prefillData: null,
      }),
    setLoading: (loading) => set({ isLoading: loading }),
  }),
  {
    name: "UIStore",
    skipPersist: true, // Non-persisted store
  }
);
