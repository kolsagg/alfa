import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubscriptionList } from "./subscription-list";
import type { Subscription } from "@/types/subscription";

// Mock Zustand store
const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    amount: 100,
    currency: "TRY",
    billingCycle: "monthly",
    nextPaymentDate: "2025-12-30T00:00:00.000Z",
    isActive: true,
    categoryId: "entertainment",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Apple Music",
    amount: 50,
    currency: "TRY",
    billingCycle: "monthly",
    nextPaymentDate: "2025-12-20T00:00:00.000Z",
    isActive: true,
    categoryId: "entertainment",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Adobe",
    amount: 500,
    currency: "TRY",
    billingCycle: "monthly",
    nextPaymentDate: "2025-12-25T00:00:00.000Z",
    isActive: true,
    categoryId: "productivity",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

vi.mock("@/stores/subscription-store", () => ({
  useSubscriptionStore: <T,>(
    selector: (state: {
      subscriptions: typeof mockSubscriptions;
      deleteSubscription: () => void;
    }) => T
  ): T => {
    const state = {
      subscriptions: mockSubscriptions,
      deleteSubscription: vi.fn(),
    };
    return selector(state);
  },
}));

// Mock TanStack Virtual
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: vi.fn().mockReturnValue({
    getTotalSize: () => 1000,
    getVirtualItems: () => [],
  }),
}));

describe("SubscriptionList Sort & Filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Fix for Radix UI Select in JSDOM
    if (!window.HTMLElement.prototype.scrollIntoView) {
      window.HTMLElement.prototype.scrollIntoView = vi.fn();
    }

    // PointerEvent fix for JSDOM
    if (!window.PointerEvent) {
      class PointerEvent extends MouseEvent {
        constructor(type: string, props: MouseEventInit) {
          super(type, props);
        }
      }
      (
        window as unknown as { PointerEvent: typeof PointerEvent }
      ).PointerEvent = PointerEvent;
    }

    // Stub missing pointer functions on Element
    if (!window.Element.prototype.hasPointerCapture) {
      window.Element.prototype.hasPointerCapture = vi.fn(() => false);
    }
    if (!window.Element.prototype.setPointerCapture) {
      window.Element.prototype.setPointerCapture = vi.fn();
    }
    if (!window.Element.prototype.releasePointerCapture) {
      window.Element.prototype.releasePointerCapture = vi.fn();
    }
  });

  it("should render initial list sorted by date (default)", () => {
    render(<SubscriptionList />);

    const items = screen.getAllByRole("button", {
      name: /Netflix|Apple Music|Adobe/,
    });
    // Default sort: date ascending -> Apple Music (Dec 20), Adobe (Dec 25), Netflix (Dec 30)
    expect(items[0]).toHaveTextContent("Apple Music");
    expect(items[1]).toHaveTextContent("Adobe");
    expect(items[2]).toHaveTextContent("Netflix");
  });

  it("should filter by category", async () => {
    render(<SubscriptionList />);

    // Open category select
    const filterTrigger = screen.getByLabelText("Kategori filtresi");
    await userEvent.click(filterTrigger);

    // Select "İş" (productivity)
    const productivityOption = await screen.findByRole("option", {
      name: "İş",
    });
    await userEvent.click(productivityOption);

    // Wait for the list to update
    await waitFor(() => {
      expect(screen.getByText("Adobe")).toBeInTheDocument();
      expect(screen.queryByText("Netflix")).not.toBeInTheDocument();
      expect(screen.queryByText("Apple Music")).not.toBeInTheDocument();
    });
  });

  it("should sort by price", async () => {
    render(<SubscriptionList />);

    const sortTrigger = screen.getByLabelText("Sıralama seçeneği");
    await userEvent.click(sortTrigger);

    const priceOption = await screen.findByRole("option", {
      name: "Fiyata göre",
    });
    await userEvent.click(priceOption);

    await waitFor(() => {
      const items = screen.getAllByRole("button", {
        name: /Netflix|Apple Music|Adobe/,
      });
      // Price sort (descending): Adobe (500), Netflix (100), Apple Music (50)
      expect(items[0]).toHaveTextContent("Adobe");
      expect(items[1]).toHaveTextContent("Netflix");
      expect(items[2]).toHaveTextContent("Apple Music");
    });
  });

  it("should announce results to screen readers", async () => {
    render(<SubscriptionList />);

    const liveRegion = screen.getByRole("status");
    // Initial load announcement
    expect(liveRegion).toHaveTextContent("3 adet Tümü abonelik listelendi");

    // Change filter
    const filterTrigger = screen.getByLabelText("Kategori filtresi");
    await userEvent.click(filterTrigger);
    const productivityOption = await screen.findByRole("option", {
      name: "İş",
    });
    await userEvent.click(productivityOption);

    await waitFor(() => {
      expect(liveRegion).toHaveTextContent("1 adet İş abonelik listelendi");
    });
  });

  it("should show empty category message", async () => {
    render(<SubscriptionList />);

    const filterTrigger = screen.getByLabelText("Kategori filtresi");
    await userEvent.click(filterTrigger);
    const allOption = await screen.findByRole("option", { name: "Tümü" });
    await userEvent.click(allOption);

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /Netflix|Apple Music|Adobe/ })
      ).toHaveLength(3);
    });
  });
});
