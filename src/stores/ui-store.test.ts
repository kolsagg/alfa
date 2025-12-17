import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "./ui-store";

describe("useUIStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      activeModal: null,
      editingSubscriptionId: null,
      isLoading: false,
    });
  });

  it("should initialize with null modal", () => {
    const { activeModal } = useUIStore.getState();
    expect(activeModal).toBeNull();
  });

  it("should open modal with subscription ID", () => {
    useUIStore.getState().openModal("editSubscription", "test-id-123");

    const state = useUIStore.getState();
    expect(state.activeModal).toBe("editSubscription");
    expect(state.editingSubscriptionId).toBe("test-id-123");
  });

  it("should open modal without subscription ID", () => {
    useUIStore.getState().openModal("addSubscription");

    const state = useUIStore.getState();
    expect(state.activeModal).toBe("addSubscription");
    expect(state.editingSubscriptionId).toBeNull();
  });

  it("should close modal and reset editing ID", () => {
    // First open a modal
    useUIStore.getState().openModal("confirmDelete", "some-id");

    // Then close it
    useUIStore.getState().closeModal();

    const state = useUIStore.getState();
    expect(state.activeModal).toBeNull();
    expect(state.editingSubscriptionId).toBeNull();
  });

  it("should toggle loading state", () => {
    useUIStore.getState().setLoading(true);
    expect(useUIStore.getState().isLoading).toBe(true);

    useUIStore.getState().setLoading(false);
    expect(useUIStore.getState().isLoading).toBe(false);
  });

  it("should NOT persist to localStorage (non-persisted store)", async () => {
    useUIStore.getState().setLoading(true);

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check localStorage - should be empty for UI store
    const keys = Object.keys(localStorage);
    const uiStoreKeys = keys.filter((key) => key.includes("ui"));

    expect(uiStoreKeys.length).toBe(0);
  });
});
