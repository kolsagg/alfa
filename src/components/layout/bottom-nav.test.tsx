import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { BottomNav } from "./bottom-nav";
import { ROUTES } from "@/router/routes";

// Mock useUIStore
const mockOpenModal = vi.fn();
vi.mock("@/stores/ui-store", () => ({
  useUIStore: (
    selector: (state: { openModal: typeof mockOpenModal }) => unknown
  ) => selector({ openModal: mockOpenModal }),
}));

// Helper to render with router
function renderWithRouter(initialRoute = "/") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <LocationDisplay />
      <BottomNav />
    </MemoryRouter>
  );
}

// Helper component to display current location for testing
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
}

describe("BottomNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render all navigation items", () => {
      renderWithRouter();

      expect(screen.getByLabelText("Dashboard")).toBeInTheDocument();
      expect(screen.getByLabelText("Ekle")).toBeInTheDocument();
      expect(screen.getByLabelText("Cüzdan")).toBeInTheDocument();
      expect(screen.getByLabelText("Ayarlar")).toBeInTheDocument();
    });

    it("should have proper navigation role and aria-label", () => {
      renderWithRouter();

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Alt navigasyon");
    });

    it("should render center button with elevated styling", () => {
      renderWithRouter();

      const addButton = screen.getByLabelText("Ekle");
      expect(addButton).toHaveClass("rounded-full");
      expect(addButton).toHaveClass("shadow-lg");
      expect(addButton).toHaveClass("-top-4"); // Elevated positioning
      expect(addButton).toHaveClass("focus-visible:ring-2");
    });
  });

  describe("Active State (AC1, AC5, AC6)", () => {
    it("should mark Dashboard as active when on root path", () => {
      renderWithRouter("/");

      const dashboardLink = screen.getByLabelText("Dashboard");
      expect(dashboardLink).toHaveAttribute("aria-current", "page");
      expect(dashboardLink).toHaveClass("text-primary");
      expect(dashboardLink).toHaveClass("bg-primary/10");
      expect(dashboardLink).toHaveClass("scale-105");
    });

    it("should mark Settings as active when on /settings", () => {
      renderWithRouter("/settings");

      const settingsLink = screen.getByLabelText("Ayarlar");
      expect(settingsLink).toHaveAttribute("aria-current", "page");
      expect(settingsLink).toHaveClass("text-primary");
      expect(settingsLink).toHaveClass("bg-primary/10");

      // Dashboard should NOT be active
      const dashboardLink = screen.getByLabelText("Dashboard");
      expect(dashboardLink).not.toHaveAttribute("aria-current");
      expect(dashboardLink).toHaveClass("text-muted-foreground");
    });

    it("should mark Wallet as active when on /wallet", () => {
      renderWithRouter("/wallet");

      const walletLink = screen.getByLabelText("Cüzdan");
      expect(walletLink).toHaveAttribute("aria-current", "page");
      expect(walletLink).toHaveClass("text-primary");
      expect(walletLink).toHaveClass("bg-primary/10");
    });

    it("should apply strokeWidth=2.5 to active icon", () => {
      renderWithRouter("/settings");

      const settingsLink = screen.getByLabelText("Ayarlar");
      const icon = settingsLink.querySelector("svg");
      // Note: We check the attribute since Lucide renders it to the SVG
      expect(icon).toHaveAttribute("stroke-width", "2.5");
    });

    it("should apply strokeWidth=2 to inactive icons", () => {
      renderWithRouter("/settings");

      const dashboardLink = screen.getByLabelText("Dashboard");
      const icon = dashboardLink.querySelector("svg");
      expect(icon).toHaveAttribute("stroke-width", "2");
    });
  });

  describe("Navigation (AC2, AC5)", () => {
    it("should navigate to settings when clicking Settings", () => {
      renderWithRouter("/");

      const settingsLink = screen.getByLabelText("Ayarlar");
      fireEvent.click(settingsLink);

      expect(screen.getByTestId("current-location")).toHaveTextContent(
        "/settings"
      );
    });

    it("should navigate to wallet when clicking Cüzdan", () => {
      renderWithRouter("/");

      const walletLink = screen.getByLabelText("Cüzdan");
      fireEvent.click(walletLink);

      expect(screen.getByTestId("current-location")).toHaveTextContent(
        "/wallet"
      );
    });

    it("should navigate to dashboard when clicking Dashboard", () => {
      renderWithRouter("/settings");

      const dashboardLink = screen.getByLabelText("Dashboard");
      fireEvent.click(dashboardLink);

      expect(screen.getByTestId("current-location")).toHaveTextContent("/");
    });

    it("should NOT change URL when clicking Add button", () => {
      renderWithRouter("/");

      const addButton = screen.getByLabelText("Ekle");
      fireEvent.click(addButton);

      // URL should still be root
      expect(screen.getByTestId("current-location")).toHaveTextContent("/");
    });
  });

  describe("Center Action Button (AC3)", () => {
    it("should open addSubscription modal when clicking Add button", () => {
      renderWithRouter();

      const addButton = screen.getByLabelText("Ekle");
      fireEvent.click(addButton);

      expect(mockOpenModal).toHaveBeenCalledWith("addSubscription");
    });

    it("should have visual distinction as FAB", () => {
      renderWithRouter();

      const addButton = screen.getByLabelText("Ekle");
      expect(addButton).toHaveClass("rounded-full");
      expect(addButton).toHaveClass("w-14");
      expect(addButton).toHaveClass("h-14");
      expect(addButton).toHaveClass("shadow-lg");
      expect(addButton).toHaveClass("-top-4");
    });
  });

  describe("Haptic Feedback (AC2)", () => {
    it("should call navigator.vibrate on navigation click if supported", () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: vibrateMock,
        writable: true,
        configurable: true,
      });

      renderWithRouter("/");

      const settingsLink = screen.getByLabelText("Ayarlar");
      fireEvent.click(settingsLink);

      expect(vibrateMock).toHaveBeenCalledWith(10);
    });

    it("should call navigator.vibrate on Add button click if supported", () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: vibrateMock,
        writable: true,
        configurable: true,
      });

      renderWithRouter("/");

      const addButton = screen.getByLabelText("Ekle");
      fireEvent.click(addButton);

      expect(vibrateMock).toHaveBeenCalledWith(10);
    });
  });

  describe("Touch Target & Layout (AC4)", () => {
    it("should have touch-target class for minimum 44px touch areas", () => {
      renderWithRouter();

      const dashboardLink = screen.getByLabelText("Dashboard");
      expect(dashboardLink).toHaveClass("touch-target");

      const addButton = screen.getByLabelText("Ekle");
      expect(addButton).toHaveClass("touch-target");
    });

    it("should have safe-area-bottom class for iOS PWA support", () => {
      renderWithRouter();

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("safe-area-bottom");
    });

    it("should have whitespace-nowrap on labels to prevent wrapping", () => {
      renderWithRouter();

      const dashboardLink = screen.getByLabelText("Dashboard");
      const label = dashboardLink.querySelector("span");
      expect(label).toHaveClass("whitespace-nowrap");
    });
  });

  describe("Transitions (AC2)", () => {
    it("should have transition-nav class for smooth animations", () => {
      renderWithRouter();

      const dashboardLink = screen.getByLabelText("Dashboard");
      expect(dashboardLink).toHaveClass("transition-nav");

      const addButton = screen.getByLabelText("Ekle");
      expect(addButton).toHaveClass("transition-nav");
    });

    it("should have focus ring classes for accessibility", () => {
      renderWithRouter();

      const dashboardLink = screen.getByLabelText("Dashboard");
      expect(dashboardLink).toHaveClass("focus-visible:ring-2");
    });
  });

  describe("Route Path Constants", () => {
    it("should use ROUTES constants for navigation", () => {
      // Verify ROUTES are used correctly
      expect(ROUTES.DASHBOARD).toBe("/");
      expect(ROUTES.SETTINGS).toBe("/settings");
      expect(ROUTES.WALLET).toBe("/wallet");
    });
  });
});
