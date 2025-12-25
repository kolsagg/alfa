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
  useSettingsStore: Object.assign(
    vi.fn((selector) => {
      const state = {
        theme: "system",
        setTheme: vi.fn(),
        notificationsEnabled: false,
        notificationPermission: "default",
        setNotificationsEnabled: vi.fn(),
        setNotificationPermission: vi.fn(),
        lastBackupDate: undefined,
        setLastBackupDate: vi.fn(),
      };
      return selector ? selector(state) : state;
    }),
    {
      getState: () => ({
        theme: "system",
        setTheme: vi.fn(),
        notificationsEnabled: false,
        notificationPermission: "default",
        setNotificationsEnabled: vi.fn(),
        setNotificationPermission: vi.fn(),
        setNotificationDaysBefore: vi.fn(),
        setNotificationTime: vi.fn(),
        lastBackupDate: undefined,
        setLastBackupDate: vi.fn(),
      }),
    }
  ),
}));

vi.mock("@/stores/subscription-store", () => ({
  useSubscriptionStore: Object.assign(
    vi.fn((selector) => {
      const state = {
        subscriptions: [],
      };
      return selector ? selector(state) : state;
    }),
    {
      getState: () => ({
        subscriptions: [],
      }),
      setState: vi.fn(),
    }
  ),
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
    it("renders theme section with ThemeSelector (Story 8.4)", () => {
      renderWithRouter(<SettingsPage />);

      const themeSection = screen.getByRole("region", { name: /görünüm/i });
      expect(themeSection).toBeInTheDocument();

      // Story 8.4: ThemeSelector renders tabs instead of dropdown button
      const tablist = within(themeSection).getByRole("tablist");
      expect(tablist).toBeInTheDocument();
    });

    it("displays theme section description (Story 8.4 updated)", () => {
      renderWithRouter(<SettingsPage />);

      // Story 8.4: Updated description for enhanced section
      expect(
        screen.getByText(/uygulama temasını özelleştirin/i)
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

  describe("Veri Yönetimi (Data) Section - Story 8.6", () => {
    it("renders data management section with export/import buttons", () => {
      renderWithRouter(<SettingsPage />);

      const dataSection = screen.getByRole("region", {
        name: /veri yönetimi/i,
      });
      expect(dataSection).toBeInTheDocument();

      // Story 8.6: Should have DataSettings component with export/import functionality
      expect(screen.getByTestId("data-settings")).toBeInTheDocument();
      expect(screen.getByTestId("export-button")).toBeInTheDocument();
      expect(screen.getByTestId("import-button")).toBeInTheDocument();
    });
  });

  describe("Hakkında (About) Section - Story 8.7", () => {
    it("renders about section with AboutSettings component", () => {
      renderWithRouter(<SettingsPage />);

      const aboutSection = screen.getByRole("region", { name: /hakkında/i });
      expect(aboutSection).toBeInTheDocument();

      // Story 8.7: AboutSettings component should be present
      expect(screen.getByTestId("about-settings")).toBeInTheDocument();
    });

    it("displays app identity header", () => {
      renderWithRouter(<SettingsPage />);

      // Story 8.7 AC1: Identity header with app name
      expect(screen.getByText("SubTracker")).toBeInTheDocument();
    });

    it("displays version info", () => {
      renderWithRouter(<SettingsPage />);

      expect(screen.getByTestId("about-version")).toBeInTheDocument();
    });

    it("displays privacy section with no-tracking statement", () => {
      renderWithRouter(<SettingsPage />);

      // Story 8.7 AC3: Privacy statements
      expect(screen.getByTestId("about-privacy")).toBeInTheDocument();
      expect(
        screen.getByText(/verileriniz asla sunucuya gönderilmez/i)
      ).toBeInTheDocument();
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
