import { describe, it, expect, vi, beforeEach } from "vitest";
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

describe("DashboardLayout Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({
      notificationPermission: "default",
      notificationPermissionDeniedAt: undefined,
      notificationBannerDismissedAt: undefined,
    } as Partial<SettingsState>);
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
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
    expect(screen.getByTestId("add-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});
