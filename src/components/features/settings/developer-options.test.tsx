/**
 * DeveloperOptionsSection Tests
 *
 * Story 7.3: Debug Log Export (Developer Mode)
 * Tests for developer options UI component
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeveloperOptionsSection } from "./developer-options";
import { logger } from "@/lib/event-logger";
import { useSettingsStore } from "@/stores/settings-store";

// Mock dependencies
vi.mock("@/lib/event-logger", () => ({
  logger: {
    getEventLogs: vi.fn(),
    getSessionId: vi.fn(),
    clearEventLogs: vi.fn(),
  },
}));

vi.mock("@/lib/debug-export", () => ({
  generateDebugExport: vi.fn(() => ({
    export_timestamp: new Date().toISOString(),
    export_type: "debug_logs",
    app_version: "1.0.0",
    schema_version: 1,
    browser_info: {
      userAgent: "Chrome-based Browser",
      platform: "macOS",
      language: "en",
    },
    session_summary: {
      session_id: crypto.randomUUID(),
      logs_count: 5,
    },
    event_logs: [],
  })),
  calculateChecksum: vi.fn(() => Promise.resolve("abc123def456")),
  downloadDebugExport: vi.fn(),
  getExportSize: vi.fn(() => 500),
}));

vi.mock("@/types/debug-export", () => ({
  formatBytes: vi.fn((bytes: number) => `${bytes} B`),
}));

describe("DeveloperOptionsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logger.getEventLogs).mockReturnValue([]);
    vi.mocked(logger.getSessionId).mockReturnValue(crypto.randomUUID());

    // Reset store state
    useSettingsStore.setState({
      developerMode: true,
    });
  });

  it("renders developer options section", () => {
    render(<DeveloperOptionsSection />);

    expect(screen.getByTestId("developer-options-section")).toBeInTheDocument();
    expect(screen.getByText(/geliştirici seçenekleri/i)).toBeInTheDocument();
  });

  it("shows log count and estimated size", () => {
    render(<DeveloperOptionsSection />);

    expect(screen.getByTestId("log-stats")).toBeInTheDocument();
    expect(screen.getByText(/log kaydı/i)).toBeInTheDocument();
    expect(screen.getByText(/tahmini boyut/i)).toBeInTheDocument();
  });

  it("renders export debug logs button", () => {
    render(<DeveloperOptionsSection />);

    expect(screen.getByTestId("export-debug-logs-button")).toBeInTheDocument();
    expect(screen.getByText(/debug loglarını dışa aktar/i)).toBeInTheDocument();
  });

  it("renders clear logs button", () => {
    render(<DeveloperOptionsSection />);

    expect(screen.getByTestId("clear-logs-button")).toBeInTheDocument();
    expect(screen.getByText(/logları temizle/i)).toBeInTheDocument();
  });

  it("opens export preview dialog when export button is clicked", async () => {
    render(<DeveloperOptionsSection />);

    const exportButton = screen.getByTestId("export-debug-logs-button");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByTestId("privacy-banner")).toBeInTheDocument();
    });

    // Verify privacy banner text
    expect(
      screen.getByText(/bu dosya kişisel veri içermez/i)
    ).toBeInTheDocument();
  });

  it("shows checksum in export preview dialog", async () => {
    render(<DeveloperOptionsSection />);

    fireEvent.click(screen.getByTestId("export-debug-logs-button"));

    await waitFor(() => {
      expect(screen.getByTestId("checksum-display")).toBeInTheDocument();
    });

    expect(screen.getByText(/sha-256/i)).toBeInTheDocument();
  });

  it("has minify toggle in export preview", async () => {
    render(<DeveloperOptionsSection />);

    fireEvent.click(screen.getByTestId("export-debug-logs-button"));

    await waitFor(() => {
      expect(screen.getByTestId("minify-toggle")).toBeInTheDocument();
    });
  });

  it("shows confirmation dialog when clear logs is clicked", async () => {
    render(<DeveloperOptionsSection />);

    fireEvent.click(screen.getByTestId("clear-logs-button"));

    await waitFor(() => {
      expect(
        screen.getByText(/tüm debug loglarını silmek istediğinize/i)
      ).toBeInTheDocument();
    });
  });

  it("calls clearEventLogs when confirmed", async () => {
    render(<DeveloperOptionsSection />);

    fireEvent.click(screen.getByTestId("clear-logs-button"));

    // Wait for dialog to appear
    await waitFor(() => {
      expect(
        screen.getByText(/tüm debug loglarını silmek istediğinize/i)
      ).toBeInTheDocument();
    });

    // Find and click the confirm button (second "logları temizle" text)
    const confirmButtons = screen.getAllByRole("button", {
      name: /logları temizle/i,
    });
    const confirmButton = confirmButtons[confirmButtons.length - 1];
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(logger.clearEventLogs).toHaveBeenCalled();
    });
  });

  it("has dev mode toggle that disables dev mode", () => {
    render(<DeveloperOptionsSection />);

    const toggle = screen.getByTestId("dev-mode-toggle");
    expect(toggle).toBeInTheDocument();

    fireEvent.click(toggle);

    // Should call setDeveloperMode(false)
    expect(useSettingsStore.getState().developerMode).toBe(false);
  });
});
