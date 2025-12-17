import { createStore } from "./create-store";

type ModalType =
  | "addSubscription"
  | "editSubscription"
  | "confirmDelete"
  | null;

interface UIState {
  activeModal: ModalType;
  editingSubscriptionId: string | null;
  isLoading: boolean;

  // Actions
  openModal: (modal: ModalType, subscriptionId?: string) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = createStore<UIState>(
  (set) => ({
    activeModal: null,
    editingSubscriptionId: null,
    isLoading: false,

    openModal: (modal, subscriptionId) =>
      set({
        activeModal: modal,
        editingSubscriptionId: subscriptionId ?? null,
      }),
    closeModal: () =>
      set({
        activeModal: null,
        editingSubscriptionId: null,
      }),
    setLoading: (loading) => set({ isLoading: loading }),
  }),
  {
    name: "UIStore",
    skipPersist: true, // Non-persisted store
  }
);
