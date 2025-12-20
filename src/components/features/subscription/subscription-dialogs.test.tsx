import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubscriptionCard } from "./subscription-card";
import { SubscriptionDetailDialog } from "./subscription-detail-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { EditSubscriptionDialog } from "./edit-subscription-dialog";
import { DeletionCelebration } from "./deletion-celebration";
import { SubscriptionList } from "./subscription-list";
import type { Subscription } from "@/types/subscription";

// Mock Zustand store
const mockSubscriptions: Subscription[] = [];
const mockDeleteSubscription = vi.fn(() => true);
const mockGetSubscriptionById = vi.fn((id: string) =>
  mockSubscriptions.find((s) => s.id === id)
);
const mockUpdateSubscription = vi.fn(() => true);
const mockAddSubscription = vi.fn();

vi.mock("@/stores/subscription-store", () => ({
  useSubscriptionStore: (selector: (state: unknown) => unknown) => {
    const state = {
      subscriptions: mockSubscriptions,
      deleteSubscription: mockDeleteSubscription,
      getSubscriptionById: mockGetSubscriptionById,
      updateSubscription: mockUpdateSubscription,
      addSubscription: mockAddSubscription,
    };
    return selector(state);
  },
}));

// Mock matchMedia for useReducedMotion
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("reduced-motion") ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const mockSubscription: Subscription = {
  id: "test-uuid-123",
  name: "Netflix",
  amount: 99.99,
  currency: "TRY",
  billingCycle: "monthly",
  nextPaymentDate: new Date("2025-01-15").toISOString(),
  isActive: true,
  categoryId: "entertainment",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("SubscriptionCard", () => {
  it("should render subscription details", () => {
    render(<SubscriptionCard subscription={mockSubscription} />);

    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("99.99 ₺")).toBeInTheDocument();
    expect(screen.getByText("Aylık")).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(
      <SubscriptionCard subscription={mockSubscription} onClick={handleClick} />
    );

    const card = screen.getByRole("button");
    await userEvent.click(card);

    expect(handleClick).toHaveBeenCalledWith(mockSubscription);
  });

  it("should be keyboard accessible", async () => {
    const handleClick = vi.fn();
    render(
      <SubscriptionCard subscription={mockSubscription} onClick={handleClick} />
    );

    const card = screen.getByRole("button");
    card.focus();
    fireEvent.keyDown(card, { key: "Enter" });

    expect(handleClick).toHaveBeenCalledWith(mockSubscription);
  });

  it("should trigger on Space key", async () => {
    const handleClick = vi.fn();
    render(
      <SubscriptionCard subscription={mockSubscription} onClick={handleClick} />
    );

    const card = screen.getByRole("button");
    card.focus();
    fireEvent.keyDown(card, { key: " " });

    expect(handleClick).toHaveBeenCalledWith(mockSubscription);
  });
});

describe("SubscriptionDetailDialog", () => {
  it("should display subscription details when open", () => {
    render(
      <SubscriptionDetailDialog
        subscription={mockSubscription}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("99.99 ₺")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /düzenle/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sil/i })).toBeInTheDocument();
  });

  it("should call onEdit when Düzenle button is clicked", async () => {
    const handleEdit = vi.fn();
    render(
      <SubscriptionDetailDialog
        subscription={mockSubscription}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={handleEdit}
        onDelete={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /düzenle/i }));
    expect(handleEdit).toHaveBeenCalled();
  });

  it("should call onDelete when Sil button is clicked", async () => {
    const handleDelete = vi.fn();
    render(
      <SubscriptionDetailDialog
        subscription={mockSubscription}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={handleDelete}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /sil/i }));
    expect(handleDelete).toHaveBeenCalled();
  });

  it("should show error state when subscription is null", async () => {
    render(
      <SubscriptionDetailDialog
        subscription={null}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/artık mevcut değil/i)).toBeInTheDocument();
  });
});

describe("DeleteConfirmationDialog", () => {
  it("should display positive framing title and savings message", () => {
    render(
      <DeleteConfirmationDialog
        subscription={mockSubscription}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText(/Netflix'i bırakıyorsun/i)).toBeInTheDocument();
    expect(screen.getByText(/tasarruf edeceksin/i)).toBeInTheDocument();
    expect(screen.getByText(/Aylık 99.99 ₺/)).toBeInTheDocument();
  });

  it("should have Vazgeç and Evet, iptal et buttons", () => {
    render(
      <DeleteConfirmationDialog
        subscription={mockSubscription}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /vazgeç/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /evet, iptal et/i })
    ).toBeInTheDocument();
  });

  it("should call onConfirm when delete is confirmed", async () => {
    const handleConfirm = vi.fn().mockResolvedValue(true);
    render(
      <DeleteConfirmationDialog
        subscription={mockSubscription}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /evet, iptal et/i })
    );

    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalled();
    });
  });

  it("should close dialog when Vazgeç is clicked", async () => {
    const handleOpenChange = vi.fn();
    render(
      <DeleteConfirmationDialog
        subscription={mockSubscription}
        open={true}
        onOpenChange={handleOpenChange}
        onConfirm={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /vazgeç/i }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("should show loading state during deletion", async () => {
    const handleConfirm = vi.fn(
      () =>
        new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 100))
    );
    render(
      <DeleteConfirmationDialog
        subscription={mockSubscription}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /evet, iptal et/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/siliniyor/i)).toBeInTheDocument();
    });
  });
});

describe("EditSubscriptionDialog", () => {
  it("should pre-populate form with subscription data", () => {
    render(
      <EditSubscriptionDialog
        subscription={mockSubscription}
        open={true}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue("Netflix")).toBeInTheDocument();
    expect(screen.getByDisplayValue("99.99")).toBeInTheDocument();
  });

  it("should show error state when subscription is null", () => {
    render(
      <EditSubscriptionDialog
        subscription={null}
        open={true}
        onOpenChange={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText(/artık mevcut değil/i)).toBeInTheDocument();
  });
});

describe("DeletionCelebration", () => {
  beforeEach(() => {
    mockMatchMedia(false); // Default: no reduced motion
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show confetti when reduced motion is not preferred", async () => {
    mockMatchMedia(false);
    render(<DeletionCelebration show={true} />);

    // Should have confetti particles (div elements with confetti animation)
    const particles = document.querySelectorAll(".animate-confetti-fall");
    expect(particles.length).toBeGreaterThan(0);
  });

  it("should show checkmark when reduced motion is preferred", async () => {
    mockMatchMedia(true);
    render(<DeletionCelebration show={true} />);

    // Should have success pulse animation
    const successElement = document.querySelector(".animate-success-pulse");
    expect(successElement).toBeInTheDocument();
  });

  it("should call onComplete after animation", async () => {
    mockMatchMedia(true); // Shorter duration (800ms)
    const handleComplete = vi.fn();
    render(<DeletionCelebration show={true} onComplete={handleComplete} />);

    // Fast-forward to end of animation - wrap in act() for React state updates
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(handleComplete).toHaveBeenCalled();
  });

  it("should not render when show is false", () => {
    render(<DeletionCelebration show={false} />);

    expect(document.querySelector(".animate-confetti-fall")).toBeNull();
    expect(document.querySelector(".animate-success-pulse")).toBeNull();
  });
});

describe("SubscriptionList Integration", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    mockSubscriptions.length = 0;
    vi.clearAllMocks();
  });

  it("should show empty state when no subscriptions", () => {
    render(<SubscriptionList />);

    expect(screen.getByText(/henüz abonelik eklenmedi/i)).toBeInTheDocument();
  });

  it("should render subscription cards when subscriptions exist", () => {
    mockSubscriptions.push(mockSubscription);

    render(<SubscriptionList />);

    expect(screen.getByText("Netflix")).toBeInTheDocument();
  });
});
describe("AddSubscriptionDialog Integration", () => {
  it("should show QuickAddGrid by default", async () => {
    // Need a component that triggers the dialog
    const { AddSubscriptionDialog } = await import("./add-subscription-dialog");
    render(<AddSubscriptionDialog />);

    // Click the FAB to open dialog
    await userEvent.click(screen.getByLabelText("Abonelik ekle"));

    expect(screen.getByText("Hızlı Abonelik Ekle")).toBeInTheDocument();
    expect(screen.getByText("Netflix")).toBeInTheDocument();
  });

  it("should transition to form when a service is selected", async () => {
    const { AddSubscriptionDialog } = await import("./add-subscription-dialog");
    render(<AddSubscriptionDialog />);

    await userEvent.click(screen.getByLabelText("Abonelik ekle"));
    await userEvent.click(screen.getByText("Netflix"));

    // Now should show form with Netflix pre-filled
    expect(screen.getByDisplayValue("Netflix")).toBeInTheDocument();
    expect(screen.getByText("Geri")).toBeInTheDocument();
  });

  it("should go back to grid when Geri is clicked", async () => {
    const { AddSubscriptionDialog } = await import("./add-subscription-dialog");
    render(<AddSubscriptionDialog />);

    await userEvent.click(screen.getByLabelText("Abonelik ekle"));
    await userEvent.click(screen.getByText("Netflix"));
    await userEvent.click(screen.getByText("Geri"));

    expect(screen.getByText("Hızlı Abonelik Ekle")).toBeInTheDocument();
  });

  it("should pre-populate category and icon from selected service", async () => {
    const { AddSubscriptionDialog } = await import("./add-subscription-dialog");
    render(<AddSubscriptionDialog />);

    await userEvent.click(screen.getByLabelText("Abonelik ekle"));
    await userEvent.click(screen.getByText("Spotify"));

    // Check if category is selected (Music/Entertainment)
    // The CategorySelect shows the label
    expect(screen.getByText("Eğlence")).toBeInTheDocument();
  });
});
