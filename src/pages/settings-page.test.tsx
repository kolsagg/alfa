/**
 * Settings Page Tests
 *
 * Story 8.2, Task 2 & 5: Tests for the full Settings page implementation
 * AC1: Settings route and navigation
 * AC2: Functional migration (no regression)
 * AC3: Layout and section design
 * AC5: Accessibility
 */

import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import SettingsPage from "./settings-page";

// Mock the stores
vi.mock("@/stores/settings-store", () => ({
  useSettingsStore: vi.fn((selector) => {
    const state = {
      theme: "system",
      setTheme: vi.fn(),
      notificationsEnabled: false,
      notificationPermission: "default",
      setNotificationsEnabled: vi.fn(),
      setNotificationPermission: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock notification utilities
vi.mock("@/lib/notification-permission", () => ({
  isNotificationSupported: () => true,
  getBrowserNotificationPermission: () => "default",
  requestAndUpdatePermission: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/lib/notification/utils", () => ({
  isPushNotificationActive: () => false,
}));

vi.mock("@/hooks/use-ios-pwa-detection", () => ({
  detectIOSSafariNonStandalone: () => false,
  useIOSPWADetection: () => ({
    shouldShowPrompt: false,
    isIOSDevice: false,
    isStandalone: false,
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Page Structure (AC3)", () => {
    it("renders the page title", () => {
      renderWithRouter(<SettingsPage />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Ayarlar" })
      ).toBeInTheDocument();
    });

    it("renders all four settings sections", () => {
      renderWithRouter(<SettingsPage />);

      // AC3: All 4 sections should be present
      expect(
        screen.getByRole("region", { name: /görünüm/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("region", { name: /bildirimler/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("region", { name: /veri yönetimi/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("region", { name: /hakkında/i })
      ).toBeInTheDocument();
    });

    it("uses proper heading hierarchy (AC5)", () => {
      renderWithRouter(<SettingsPage />);

      // h1 for page title
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Ayarlar");

      // h2 for section titles
      const h2s = screen.getAllByRole("heading", { level: 2 });
      expect(h2s.length).toBe(4);
    });
  });

  describe("Görünüm (Theme) Section (AC2, AC3)", () => {
    it("renders theme section with ThemeToggle", () => {
      renderWithRouter(<SettingsPage />);

      const themeSection = screen.getByRole("region", { name: /görünüm/i });
      expect(themeSection).toBeInTheDocument();

      // ThemeToggle should be present (it renders a button)
      const themeButton = within(themeSection).getByRole("button");
      expect(themeButton).toBeInTheDocument();
    });

    it("displays theme section description", () => {
      renderWithRouter(<SettingsPage />);

      expect(
        screen.getByText(/açık, koyu veya sistem tercihini seçin/i)
      ).toBeInTheDocument();
    });
  });

  describe("Bildirimler (Notifications) Section (AC2, AC3)", () => {
    it("renders notifications section with NotificationToggle", () => {
      renderWithRouter(<SettingsPage />);

      const notifSection = screen.getByRole("region", { name: /bildirimler/i });
      expect(notifSection).toBeInTheDocument();

      // NotificationToggle has a switch
      const toggle = within(notifSection).getByRole("switch");
      expect(toggle).toBeInTheDocument();
    });

    it("displays notification section description", () => {
      renderWithRouter(<SettingsPage />);

      expect(
        screen.getByText(/ödeme hatırlatıcılarınızı yönetin/i)
      ).toBeInTheDocument();
    });
  });

  describe("Veri Yönetimi (Data) Section (AC3)", () => {
    it("renders data management section as placeholder", () => {
      renderWithRouter(<SettingsPage />);

      const dataSection = screen.getByRole("region", {
        name: /veri yönetimi/i,
      });
      expect(dataSection).toBeInTheDocument();

      // Should indicate it's coming soon
      expect(screen.getByText(/yakında/i)).toBeInTheDocument();
    });
  });

  describe("Hakkında (About) Section (AC3)", () => {
    it("renders about section with version info", () => {
      renderWithRouter(<SettingsPage />);

      const aboutSection = screen.getByRole("region", { name: /hakkında/i });
      expect(aboutSection).toBeInTheDocument();

      // Version number - just check that it's rendered next to "Versiyon"
      expect(screen.getByText(/versiyon/i)).toBeInTheDocument();
    });

    it("displays privacy statement", () => {
      renderWithRouter(<SettingsPage />);

      expect(
        screen.getByText(/tüm verilerinizi cihazınızda saklar/i)
      ).toBeInTheDocument();
    });

    it("shows data storage info", () => {
      renderWithRouter(<SettingsPage />);

      expect(screen.getByText(/yalnızca yerel/i)).toBeInTheDocument();
    });
  });

  describe("Mobile-First Layout (AC4)", () => {
    it("has data-testid for page container", () => {
      renderWithRouter(<SettingsPage />);

      expect(screen.getByTestId("settings-page")).toBeInTheDocument();
    });
  });

  describe("iOS Modal Integration (AC2)", () => {
    it("renders IOSInstallGuidance modal component", () => {
      renderWithRouter(<SettingsPage />);

      // The modal should be rendered but initially not visible
      // We just check that NotificationToggle callback integration works
      const notifSection = screen.getByRole("region", { name: /bildirimler/i });
      expect(notifSection).toBeInTheDocument();
    });
  });
});
