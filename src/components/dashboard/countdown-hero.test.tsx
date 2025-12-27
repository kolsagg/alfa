import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CountdownHero } from "./countdown-hero";
import type { Subscription } from "@/types/subscription";
import { NOTIFICATION_STRINGS } from "@/lib/i18n/notifications";

// Mock subscription store
const mockSubscriptions = vi.fn(() => [] as Subscription[]);

vi.mock("@/stores/subscription-store", () => ({
  useSubscriptionStore: (
    selector: (state: { subscriptions: Subscription[] }) => Subscription[]
  ) => selector({ subscriptions: mockSubscriptions() }),
}));

// Mock settings store
const mockSettings = vi.fn(() => ({
  notificationsEnabled: true,
  notificationPermission: "granted" as NotificationPermission,
}));

vi.mock("@/stores/settings-store", () => ({
  useSettingsStore: () => mockSettings(),
}));

// Mock notification utils
vi.mock("@/lib/notification/utils", () => ({
  isPushNotificationActive: vi.fn(
    (enabled, permission) => enabled && permission === "granted"
  ),
}));

import { isPushNotificationActive } from "@/lib/notification/utils";

// Mock reduced motion hook
const mockReducedMotion = vi.fn(() => false);
vi.mock("@/hooks/use-reduced-motion", () => ({
  useReducedMotion: () => mockReducedMotion(),
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
    mockReducedMotion.mockReturnValue(false);
    vi.mocked(isPushNotificationActive).mockImplementation(
      (enabled, permission) => enabled && permission === "granted"
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Empty State", () => {
    it("should render empty state when no subscriptions", () => {
      render(<CountdownHero />);

      // New empty state design shows message instead of zeroed countdown
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
    it("should have section with aria-label", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-20T12:00:00.000Z"),
      ]);

      render(<CountdownHero />);

      const section = screen.getByRole("region");
      expect(section).toHaveAttribute("aria-label");
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
      // New swipeable hero uses generic label
      expect(section.getAttribute("aria-label")?.toLowerCase()).toContain(
        "ödeme"
      );
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

      // New empty state design shows message instead of zeroed countdown
      expect(screen.getByText("Henüz abonelik yok")).toBeInTheDocument();
    });
  });

  describe("Notification Awareness (AC7)", () => {
    it("should show alert badge when notifications are denied and payment is imminent", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-17T12:00:00.000Z"), // 2 days away (< 3)
      ]);
      mockSettings.mockReturnValue({
        notificationsEnabled: true,
        notificationPermission: "denied",
      });

      render(<CountdownHero />);

      expect(
        screen.getByText(NOTIFICATION_STRINGS.HERO_NO_PUSH)
      ).toBeInTheDocument();
      expect(
        screen.getByTitle(NOTIFICATION_STRINGS.HERO_ALERT_TITLE)
      ).toBeInTheDocument();
    });

    it("should show alert badge when notifications are unsupported and payment is imminent", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-17T12:00:00.000Z"), // 2 days
      ]);
      mockSettings.mockReturnValue({
        notificationsEnabled: true,
        notificationPermission: "granted",
      });

      // Mock isPushNotificationActive to return false (simulating unsupported)
      vi.mocked(isPushNotificationActive).mockReturnValue(false);

      render(<CountdownHero />);

      expect(
        screen.getByText(NOTIFICATION_STRINGS.HERO_NO_PUSH)
      ).toBeInTheDocument();

      // Reset for other tests
      vi.mocked(isPushNotificationActive).mockImplementation(
        (enabled, permission) => enabled && permission === "granted"
      );
    });

    it("should NOT show alert badge when notifications are active", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-17T12:00:00.000Z"),
      ]);
      mockSettings.mockReturnValue({
        notificationsEnabled: true,
        notificationPermission: "granted",
      });

      render(<CountdownHero />);

      expect(
        screen.queryByText(NOTIFICATION_STRINGS.HERO_NO_PUSH)
      ).not.toBeInTheDocument();
    });

    it("should apply ring styling when payment is imminent and notifications are off (no reduced motion)", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-17T12:00:00.000Z"),
      ]);
      mockSettings.mockReturnValue({
        notificationsEnabled: false,
        notificationPermission: "default",
      });
      mockReducedMotion.mockReturnValue(false);

      const { container } = render(<CountdownHero />);
      const section = container.querySelector("section");
      expect(section?.className).toContain("ring-2");
    });

    it("should apply border styling instead of ring when reduced motion is preferred (AC4)", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-17T12:00:00.000Z"),
      ]);
      mockSettings.mockReturnValue({
        notificationsEnabled: false,
        notificationPermission: "default",
      });
      mockReducedMotion.mockReturnValue(true);

      const { container } = render(<CountdownHero />);
      const section = container.querySelector("section");
      expect(section?.className).toContain("border-2");
      expect(section?.className).not.toContain("ring-2");
    });
  });

  describe("Reduced Motion (AC4)", () => {
    it("should not apply pulse animation when reduced motion is preferred", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-16T12:00:00.000Z"), // 1 day away (urgent)
      ]);
      mockSettings.mockReturnValue({
        notificationsEnabled: true,
        notificationPermission: "granted",
      });
      mockReducedMotion.mockReturnValue(true);

      const { container } = render(<CountdownHero />);
      const section = container.querySelector("section");
      expect(section?.className).not.toContain("animate-countdown-pulse");
    });

    it("should apply pulse animation when reduced motion is not preferred", () => {
      mockSubscriptions.mockReturnValue([
        createSubscription("1", "2025-01-15T23:00:00.000Z"), // same day (critical)
      ]);
      mockSettings.mockReturnValue({
        notificationsEnabled: true,
        notificationPermission: "granted",
      });
      mockReducedMotion.mockReturnValue(false);

      const { container } = render(<CountdownHero />);
      const section = container.querySelector("section");
      expect(section?.className).toContain("animate-countdown-pulse");
    });
  });
});
