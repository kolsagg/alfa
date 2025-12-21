import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineView } from "./timeline-view";
import { TimelineItem } from "./timeline-item";
import type { Subscription } from "@/types/subscription";

// Mock current date for consistent testing
const MOCK_TODAY = new Date("2025-01-15T12:00:00.000Z");

// Mock subscription store
const mockSubscriptions: Subscription[] = [];
vi.mock("@/stores/subscription-store", () => ({
  useSubscriptionStore: (
    fn: (state: { subscriptions: Subscription[] }) => Subscription[]
  ) => fn({ subscriptions: mockSubscriptions }),
}));

describe("TimelineView", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_TODAY);
    mockSubscriptions.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createSubscription = (
    id: string,
    name: string,
    nextPaymentDate: string,
    amount: number = 100
  ): Subscription => ({
    id,
    name,
    amount,
    currency: "TRY",
    billingCycle: "monthly",
    nextPaymentDate,
    isActive: true,
    categoryId: "entertainment",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  });

  it("should render empty state when no subscriptions", () => {
    render(<TimelineView />);

    expect(screen.getByText("Yaklaşan ödeme yok")).toBeInTheDocument();
    expect(
      screen.getByText(/Abonelik ekleyerek ödeme takibine/)
    ).toBeInTheDocument();
  });

  it("should render skeleton when loading", () => {
    render(<TimelineView isLoading={true} />);

    // Should have skeleton elements
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should render past due section at top", () => {
    mockSubscriptions.push(
      createSubscription("1", "Netflix", "2025-01-10T00:00:00.000Z"), // Past due
      createSubscription("2", "Spotify", "2025-01-20T00:00:00.000Z") // Upcoming
    );

    render(<TimelineView />);

    expect(screen.getByText(/Gecikmiş/)).toBeInTheDocument();
    expect(screen.getByText(/Yaklaşan/)).toBeInTheDocument();

    // Past due section should appear first in DOM
    const pastDueSection = screen.getByLabelText("Gecikmiş ödemeler");
    const upcomingSection = screen.getByLabelText("Yaklaşan ödemeler");
    expect(pastDueSection.compareDocumentPosition(upcomingSection)).toBe(4); // 4 = FOLLOWING
  });

  it("should display correct count in section headers", () => {
    mockSubscriptions.push(
      createSubscription("1", "Netflix", "2025-01-10T00:00:00.000Z"),
      createSubscription("2", "Spotify", "2025-01-05T00:00:00.000Z"),
      createSubscription("3", "YouTube", "2025-01-20T00:00:00.000Z")
    );

    render(<TimelineView />);

    expect(screen.getByText("Gecikmiş (2)")).toBeInTheDocument();
    expect(screen.getByText("Yaklaşan (1)")).toBeInTheDocument();
  });

  it("should only show upcoming section when no past due", () => {
    mockSubscriptions.push(
      createSubscription("1", "Netflix", "2025-01-20T00:00:00.000Z")
    );

    render(<TimelineView />);

    expect(screen.queryByText(/Gecikmiş/)).not.toBeInTheDocument();
    expect(screen.getByText(/Yaklaşan/)).toBeInTheDocument();
  });
});

describe("TimelineItem", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createSubscription = (
    nextPaymentDate: string,
    name: string = "Netflix"
  ): Subscription => ({
    id: "test-id",
    name,
    amount: 99.9,
    currency: "TRY",
    billingCycle: "monthly",
    nextPaymentDate,
    isActive: true,
    categoryId: "entertainment",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  });

  it("should render subscription details", () => {
    const sub = createSubscription("2025-01-20T00:00:00.000Z");
    render(<TimelineItem subscription={sub} />);

    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("99.90 ₺")).toBeInTheDocument();
    expect(screen.getByText("20 Oca")).toBeInTheDocument();
  });

  it("should show 'Bugün' for today payments", () => {
    const sub = createSubscription("2025-01-15T00:00:00.000Z");
    render(<TimelineItem subscription={sub} />);

    expect(screen.getByText("Bugün")).toBeInTheDocument();
  });

  it("should show past due text for overdue payments", () => {
    const sub = createSubscription("2025-01-12T00:00:00.000Z");
    render(<TimelineItem subscription={sub} />);

    expect(screen.getByText("3 gün gecikti")).toBeInTheDocument();
  });

  it("should show 'Yarın' for tomorrow payments", () => {
    const sub = createSubscription("2025-01-16T00:00:00.000Z");
    render(<TimelineItem subscription={sub} />);

    expect(screen.getByText("Yarın")).toBeInTheDocument();
  });

  it("should have correct aria-label", () => {
    const sub = createSubscription("2025-01-20T00:00:00.000Z");
    render(<TimelineItem subscription={sub} />);

    const item = screen.getByRole("listitem");
    expect(item).toHaveAttribute("aria-label", "Netflix, 99.90 ₺, 5 gün sonra");
  });

  it("should be focusable for keyboard navigation", () => {
    const sub = createSubscription("2025-01-20T00:00:00.000Z");
    render(<TimelineItem subscription={sub} />);

    const item = screen.getByRole("listitem");
    expect(item).toHaveAttribute("tabIndex", "0");
  });
});
