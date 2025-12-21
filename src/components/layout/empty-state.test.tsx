import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "./empty-state";
import type { Category } from "@/types/common";

// Mock useUIStore
const mockOpenModal = vi.fn();
vi.mock("@/stores/ui-store", () => ({
  useUIStore: (selector: (state: unknown) => unknown) => {
    const state = {
      openModal: mockOpenModal,
    };
    return selector(state);
  },
  // Export the type for imports
  SubscriptionPrefillData: {},
}));

// Mock QuickAddGrid to simplify testing
vi.mock("@/components/features/quick-add", () => ({
  QuickAddGrid: ({
    onSelect,
    onCustomClick,
  }: {
    onSelect: (service: {
      id: string;
      name: string;
      categoryId: Category;
      iconName: string;
    }) => void;
    onCustomClick: () => void;
  }) => (
    <div data-testid="quick-add-grid">
      <button
        onClick={() =>
          onSelect({
            id: "netflix",
            name: "Netflix",
            categoryId: "entertainment",
            iconName: "tv",
          })
        }
      >
        Netflix
      </button>
      <button onClick={onCustomClick}>Özel Abonelik Ekle</button>
    </div>
  ),
}));

describe("EmptyState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render welcome message", () => {
    render(<EmptyState />);

    expect(screen.getByText("Merhaba! 👋")).toBeInTheDocument();
    expect(
      screen.getByText("Aboneliklerini takip etmeye hazır mısın?")
    ).toBeInTheDocument();
  });

  it("should render QuickAddGrid", () => {
    render(<EmptyState />);

    expect(screen.getByTestId("quick-add-grid")).toBeInTheDocument();
  });

  it("should render tutorial hint", () => {
    render(<EmptyState />);

    expect(
      screen.getByText(/başlamak için hızlı listeden seçim yapın/i)
    ).toBeInTheDocument();
  });

  it("should have correct accessibility attributes", () => {
    render(<EmptyState />);

    const section = screen.getByRole("status");
    expect(section).toHaveAttribute("aria-live", "polite");
    expect(section).toHaveAttribute(
      "aria-label",
      "Abonelik yok, başlamak için bir servis seçin"
    );
  });

  it("should call openModal with prefillData when a service is selected", () => {
    render(<EmptyState />);

    fireEvent.click(screen.getByText("Netflix"));

    expect(mockOpenModal).toHaveBeenCalledWith(
      "addSubscription",
      undefined,
      expect.objectContaining({
        name: "Netflix",
        categoryId: "entertainment",
        icon: "tv",
      })
    );
  });

  it("should call openModal with skipToForm for custom add", () => {
    render(<EmptyState />);

    fireEvent.click(screen.getByText("Özel Abonelik Ekle"));

    expect(mockOpenModal).toHaveBeenCalledWith("addSubscription", undefined, {
      skipToForm: true,
    });
  });

  it("should have illustration icon", () => {
    render(<EmptyState />);

    // Check for Sparkles icon (rendered as SVG with aria-hidden)
    const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenElements.length).toBeGreaterThan(0);
  });
});
