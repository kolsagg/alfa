import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpendingSummary } from "./spending-summary";

// Mock the stores
const mockSubscriptions = [
  {
    id: "1",
    name: "Netflix",
    amount: 10,
    currency: "USD",
    billingCycle: "monthly",
    isActive: true,
  },
  {
    id: "2",
    name: "Spotify",
    amount: 50,
    currency: "TRY",
    billingCycle: "monthly",
    isActive: true,
  },
];

const mockRates = {
  TRY: 1,
  USD: 30,
};

vi.mock("@/stores/subscription-store", () => ({
  useSubscriptionStore: (
    fn: (state: {
      subscriptions: typeof mockSubscriptions;
    }) => typeof mockSubscriptions
  ) => fn({ subscriptions: mockSubscriptions }),
}));

const fetchRatesMock = vi.fn();
vi.mock("@/stores/fx-store", () => ({
  useFXStore: () => ({
    rates: mockRates,
    fetchRates: fetchRatesMock,
    isLoading: false,
  }),
}));

describe("SpendingSummary Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls fetchRates on mount", () => {
    render(<SpendingSummary />);
    expect(fetchRatesMock).toHaveBeenCalled();
  });

  it("displays correctly calculated monthly and yearly totals", () => {
    render(<SpendingSummary />);

    // 10 USD * 30 + 50 TRY = 350 TRY
    expect(screen.getByText("₺350")).toBeInTheDocument();
    // 350 * 12 = 4200 TRY
    expect(screen.getByText("₺4.200")).toBeInTheDocument();
  });

  it("shows currency note when mixed currencies are present", () => {
    render(<SpendingSummary />);
    expect(screen.getAllByText("(Döviz kurları dahil)")[0]).toBeInTheDocument();
  });
});
