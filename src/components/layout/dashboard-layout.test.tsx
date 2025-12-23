import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardLayout } from "./dashboard-layout";
import { useSettingsStore } from "@/stores/settings-store";
import type { SettingsState } from "@/stores/settings-store";
import { ThemeProvider } from "@/components/providers/theme-provider";

// Mock child components that are not relevant to integration test or cause issues
vi.mock("@/components/features/subscription/add-subscription-dialog", () => ({
  AddSubscriptionDialog: () => <div data-testid="add-dialog" />,
}));

vi.mock("./header", () => ({
  Header: () => <div data-testid="header" />,
}));

vi.mock("./bottom-nav", () => ({
  BottomNav: () => <div data-testid="bottom-nav" />,
}));

// Mock notification-permission for isNotificationSupported
vi.mock("@/lib/notification-permission", () => ({
  isNotificationSupported: vi.fn(() => true),
}));

// Mock iOS detection
vi.mock("@/hooks/use-ios-pwa-detection", () => ({
  useIOSPWADetection: vi.fn(() => ({ shouldShowPrompt: false })),
  detectIOSSafariNonStandalone: vi.fn(() => false),
}));

import { isNotificationSupported } from "@/lib/notification-permission";

const mockedIsNotificationSupported = vi.mocked(isNotificationSupported);

describe("DashboardLayout Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedIsNotificationSupported.mockReturnValue(true);
    useSettingsStore.setState({
      notificationPermission: "default",
      notificationPermissionDeniedAt: undefined,
      notificationBannerDismissedAt: undefined,
    } as Partial<SettingsState>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the NotificationBanner when permission is denied", () => {
    useSettingsStore.setState({
      notificationPermission: "denied",
      notificationPermissionDeniedAt: new Date().toISOString(),
    } as Partial<SettingsState>);

    render(
      <ThemeProvider>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </ThemeProvider>
    );

    expect(screen.getByText(/Bildirimler kapalı/i)).toBeInTheDocument();
  });

  it("should not render the NotificationBanner when permission is granted", () => {
    useSettingsStore.setState({
      notificationPermission: "granted",
    } as Partial<SettingsState>);

    render(
      <ThemeProvider>
        <DashboardLayout>
          <div>Dashboard Content</div>
        </DashboardLayout>
      </ThemeProvider>
    );

    expect(screen.queryByText(/Bildirimler kapalı/i)).not.toBeInTheDocument();
  });

  it("should render layout components and children", () => {
    render(
      <ThemeProvider>
        <DashboardLayout>
          <div data-testid="child-content">Dashboard Content</div>
        </DashboardLayout>
      </ThemeProvider>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    // Note: BottomNav and AddSubscriptionDialog are now in RootLayout (Story 8.1)
    // This deprecated DashboardLayout only renders Header + content
  });
});
