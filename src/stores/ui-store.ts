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

  /** Story 4.5 - Date filter for subscription list (ISO date string or null) */
  dateFilter: string | null;

  // Actions
  openModal: (
    modal: ModalType,
    subscriptionId?: string,
    prefill?: SubscriptionPrefillData
  ) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;

  /** Story 4.5 - Set date filter for subscription list */
  setDateFilter: (dateFilter: string | null) => void;
  /** Story 4.5 - Clear date filter */
  clearDateFilter: () => void;
}

export const useUIStore = createStore<UIState>(
  (set) => ({
    activeModal: null,
    editingSubscriptionId: null,
    prefillData: null,
    isLoading: false,
    dateFilter: null,

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

    setDateFilter: (dateFilter) => set({ dateFilter }),
    clearDateFilter: () => set({ dateFilter: null }),
  }),
  {
    name: "UIStore",
    skipPersist: true, // Non-persisted store
  }
);
