import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { Header } from "../components/layout/header";
import { BottomNav } from "../components/layout/bottom-nav";
import { CountdownHero } from "../components/dashboard/countdown-hero";
import type { Subscription } from "@/types/subscription";

// Mock subscription store for CountdownHero
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

// Mock ui-store for BottomNav
vi.mock("@/stores/ui-store", () => ({
  useUIStore: () => ({
    openModal: vi.fn(),
  }),
}));

describe("Dashboard Layout Components", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSubscriptions.mockReturnValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Header", () => {
    it("renders app title", () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );
      expect(screen.getByText("SubTracker")).toBeInTheDocument();
    });

    it("renders theme toggle", () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );
      // ThemeToggle and Settings button are both present
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it("renders settings link", () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );
      expect(screen.getByLabelText("Ayarlar")).toBeInTheDocument();
    });
  });

  describe("BottomNav", () => {
    it("renders all navigation items", () => {
      render(
        <MemoryRouter>
          <BottomNav />
        </MemoryRouter>
      );
      expect(screen.getByLabelText("Dashboard")).toBeInTheDocument();
      expect(screen.getByLabelText("Ekle")).toBeInTheDocument();
      expect(screen.getByLabelText("Ayarlar")).toBeInTheDocument();
      expect(screen.getByLabelText("Cüzdan")).toBeInTheDocument();
    });

    it("highlights dashboard as active when on root path", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <BottomNav />
        </MemoryRouter>
      );
      const dashboardLink = screen.getByLabelText("Dashboard");
      expect(dashboardLink).toHaveAttribute("aria-current", "page");
    });

    it("highlights settings as active when on settings path", () => {
      render(
        <MemoryRouter initialEntries={["/settings"]}>
          <BottomNav />
        </MemoryRouter>
      );
      const settingsLink = screen.getByLabelText("Ayarlar");
      expect(settingsLink).toHaveAttribute("aria-current", "page");
    });

    it("has proper touch target class on buttons", () => {
      render(
        <MemoryRouter>
          <BottomNav />
        </MemoryRouter>
      );
      // The "Ekle" button is a Button, others are NavLinks
      const addButton = screen.getByLabelText("Ekle");
      expect(addButton).toHaveClass("touch-target");
    });
  });

  describe("CountdownHero", () => {
    it("renders placeholder text when empty", () => {
      render(<CountdownHero />);
      expect(screen.getByText("Bir sonraki ödeme")).toBeInTheDocument();
      expect(screen.getByText("--:--:--")).toBeInTheDocument();
    });

    it("has tabular-nums for countdown display", () => {
      render(<CountdownHero />);
      const countdown = screen.getByText("--:--:--");
      expect(countdown).toHaveClass("tabular-nums");
    });
  });

  describe("DashboardLayout", () => {
    it("renders children within main area", () => {
      render(
        <MemoryRouter>
          <DashboardLayout>
            <div data-testid="child">Test Child</div>
          </DashboardLayout>
        </MemoryRouter>
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("renders header", () => {
      render(
        <MemoryRouter>
          <DashboardLayout>
            <div>Content</div>
          </DashboardLayout>
        </MemoryRouter>
      );
      expect(screen.getByText("SubTracker")).toBeInTheDocument();
    });
  });
});
