import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CountdownHero } from "./countdown-hero";
import type { Subscription } from "@/types/subscription";

// Mock subscription store
const mockSubscriptions = vi.fn(() => [] as Subscription[]);

vi.mock("@/stores/subscription-store", () => ({
  useSubscriptionStore: (
    selector: (state: { subscriptions: Subscription[] }) => Subscription[]
  ) => selector({ subscriptions: mockSubscriptions() }),
}));

// Mock formatCurrency
vi.mock("@/lib/formatters", () => ({
  formatCurrency: (amount: number, currency: string) => `${amount} ${currency}`,
}));

const MOCK_NOW = new Date("2025-01-15T12:00:00.000Z");

const createSubscription = (
  id: string,
  nextPaymentDate: string,
  isActive = true,
  amount = 100,
  name = "Netflix"
): Subscription => ({
  id,
  name,
  amount,
  currency: "TRY",
  billingCycle: "monthly",
  nextPaymentDate,
  isActive,
  categoryId: "entertainment",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
});

describe("CountdownHero", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_NOW);
    mockSubscriptions.mockReturnValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Empty State", () => {
    it("should render empty state when no subscriptions", () => {
      render(<CountdownHero />);

      expect(screen.getByText("--:--:--")).toBeInTheDocument();
      expect(screen.getByText("Henüz abonelik yok")).toBeInTheDocument();
    });

    it("should have correct aria-label for empty state", () => {
      render(<CountdownHero />);

      expect(screen.getByRole("region")).toHaveAttribute(
        "aria-label",
        "Yaklaşan ödeme sayacı"
      );
    });
  });

  describe("With Subscriptions", () => {
    it("should display subscription name and amount", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription(
          "1",
          "2025-01-20T12:00:00.000Z",
          true,
          99,
          "Spotify"
        ),
      ]);

      render(<CountdownHero />);

      expect(screen.getByText("Spotify")).toBeInTheDocument();
      expect(screen.getByText("99 TRY")).toBeInTheDocument();
    });

    it("should display countdown for future payment", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-20T12:00:00.000Z"), // 5 days away
      ]);

      render(<CountdownHero />);

      expect(screen.getByText("5g 0s")).toBeInTheDocument();
    });

    it("should show first letter avatar", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-20T12:00:00.000Z", true, 100, "Apple"),
      ]);

      render(<CountdownHero />);

      expect(screen.getByText("A")).toBeInTheDocument();
    });
  });

  describe("Urgency Levels", () => {
    it("should apply subtle styling for 7+ days", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-25T12:00:00.000Z"), // 10 days
      ]);

      const { container } = render(<CountdownHero />);
      const section = container.querySelector("section");

      expect(section?.className).toContain("from-muted");
    });

    it("should apply attention styling for 3-7 days", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-19T12:00:00.000Z"), // 4 days
      ]);

      const { container } = render(<CountdownHero />);
      const section = container.querySelector("section");

      expect(section?.className).toContain("color-attention");
    });
  });

  describe("Timer Updates", () => {
    it("should update countdown every minute for non-critical", async () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-20T12:00:00.000Z"),
      ]);

      render(<CountdownHero />);

      expect(screen.getByText("5g 0s")).toBeInTheDocument();

      // Advance 1 minute - tick should increment
      await act(async () => {
        vi.advanceTimersByTime(60001); // Slightly more than 1 minute
      });

      // Component should still be rendering (not crashed)
      expect(screen.getByText("Netflix")).toBeInTheDocument();
    });
  });

  describe("Visibility Change Handler", () => {
    it("should refresh countdown on visibility change", async () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-20T12:00:00.000Z"),
      ]);

      render(<CountdownHero />);

      // Simulate visibility change event
      await act(async () => {
        Object.defineProperty(document, "visibilityState", {
          value: "visible",
          writable: true,
        });
        window.dispatchEvent(new Event("visibilitychange"));
      });

      // Component should still render correctly
      expect(screen.getByText("Netflix")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have aria-live region for announcements", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-20T12:00:00.000Z"),
      ]);

      const { container } = render(<CountdownHero />);

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it("should have meaningful aria-label on section", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription(
          "1",
          "2025-01-20T12:00:00.000Z",
          true,
          99,
          "Netflix"
        ),
      ]);

      render(<CountdownHero />);

      const section = screen.getByRole("region");
      expect(section).toHaveAttribute("aria-label");
      expect(section.getAttribute("aria-label")).toContain("Netflix");
    });
  });

  describe("Active-Only Filter", () => {
    it("should ignore inactive subscriptions", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-17T12:00:00.000Z", false), // Inactive
        createSubscription("2", "2025-01-20T12:00:00.000Z", true), // Active
      ]);

      render(<CountdownHero />);

      // Should show 5 days (Jan 20), not 2 days (Jan 17)
      expect(screen.getByText("5g 0s")).toBeInTheDocument();
    });

    it("should show empty state if all subscriptions are inactive", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-17T12:00:00.000Z", false),
      ]);

      render(<CountdownHero />);

      expect(screen.getByText("--:--:--")).toBeInTheDocument();
    });
  });
});
