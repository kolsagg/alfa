/**
 * DataSettings Component Tests
 *
 * Story 8.6: Integration tests for data export/import UI
 * Task 5.2: Full flow testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataSettings } from "./data-settings";
import * as backupModule from "@/lib/backup";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSettingsStore } from "@/stores/settings-store";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock backup module
vi.mock("@/lib/backup", () => ({
  exportBackup: vi.fn(),
  parseAndValidateBackup: vi.fn(),
  createPreImportBackup: vi.fn(),
}));

describe("DataSettings", () => {
  const mockSubscription = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Netflix",
    amount: 49.99,
    currency: "TRY" as const,
    billingCycle: "monthly" as const,
    nextPaymentDate: "2025-01-15T00:00:00.000Z",
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset stores
    useSubscriptionStore.setState({
      subscriptions: [mockSubscription],
    });

    useSettingsStore.setState({
      lastBackupDate: undefined,
      theme: "system",
      notificationPermission: "default",
      notificationsEnabled: true,
      notificationDaysBefore: 3,
      notificationTime: "09:00",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("AC1: UI Layout", () => {
    it("should render export button", () => {
      render(<DataSettings />);
      expect(screen.getByTestId("export-button")).toBeInTheDocument();
      expect(screen.getByText("Dışa Aktar")).toBeInTheDocument();
    });

    it("should render import button", () => {
      render(<DataSettings />);
      expect(screen.getByTestId("import-button")).toBeInTheDocument();
      expect(screen.getByText("İçe Aktar")).toBeInTheDocument();
    });

    it("should render last backup indicator with 'never' when no backup", () => {
      render(<DataSettings />);
      expect(screen.getByTestId("last-backup")).toHaveTextContent(
        "Henüz yedeklenmedi"
      );
    });

    it("should render formatted date when backup exists", () => {
      useSettingsStore.setState({
        lastBackupDate: "2025-01-15T14:30:00.000Z",
      });

      render(<DataSettings />);
      expect(screen.getByTestId("last-backup")).toHaveTextContent("Son yedek:");
      // Contains formatted date (Turkish locale)
      expect(screen.getByTestId("last-backup").textContent).toMatch(
        /Ocak|Şubat|Mart|2025/
      );
    });
  });

  describe("AC2: Export Functionality", () => {
    it("should disable export when no subscriptions", () => {
      useSubscriptionStore.setState({ subscriptions: [] });

      render(<DataSettings />);
      expect(screen.getByTestId("export-button")).toBeDisabled();
    });

    it("should call exportBackup on click", async () => {
      vi.mocked(backupModule.exportBackup).mockReturnValue({
        success: true,
        filename: "subtracker-backup-2025-01-15.json",
        sizeBytes: 1000,
        sizeWarning: false,
      });

      const user = userEvent.setup();
      render(<DataSettings />);

      await user.click(screen.getByTestId("export-button"));

      expect(backupModule.exportBackup).toHaveBeenCalled();
    });

    it("should update lastBackupDate on successful export", async () => {
      vi.mocked(backupModule.exportBackup).mockReturnValue({
        success: true,
        filename: "subtracker-backup-2025-01-15.json",
        sizeBytes: 1000,
        sizeWarning: false,
      });

      const user = userEvent.setup();
      render(<DataSettings />);

      await user.click(screen.getByTestId("export-button"));

      await waitFor(() => {
        expect(useSettingsStore.getState().lastBackupDate).toBeDefined();
      });
    });
  });

  describe("Import Flow", () => {
    it("should have hidden file input", () => {
      render(<DataSettings />);
      const fileInput = screen.getByTestId("import-file-input");
      expect(fileInput).toHaveClass("hidden");
      expect(fileInput).toHaveAttribute("accept", ".json,application/json");
    });

    it("should trigger file input on import button click", async () => {
      const user = userEvent.setup();
      render(<DataSettings />);

      const fileInput = screen.getByTestId(
        "import-file-input"
      ) as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, "click");

      await user.click(screen.getByTestId("import-button"));

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe("AC4: Import Validation Errors", () => {
    it("should show error toast for invalid format", async () => {
      const { toast } = await import("sonner");

      vi.mocked(backupModule.parseAndValidateBackup).mockResolvedValue({
        success: false,
        errorCode: "INVALID_FORMAT",
        error: "Invalid JSON",
      });

      render(<DataSettings />);

      const fileInput = screen.getByTestId("import-file-input");
      const file = new File(["invalid"], "backup.json", {
        type: "application/json",
      });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it("should show error for empty backup", async () => {
      const { toast } = await import("sonner");

      vi.mocked(backupModule.parseAndValidateBackup).mockResolvedValue({
        success: false,
        errorCode: "EMPTY_BACKUP",
        error: "Backup is empty",
      });

      render(<DataSettings />);

      const fileInput = screen.getByTestId("import-file-input");
      const file = new File(["{}"], "backup.json", {
        type: "application/json",
      });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it("should show error for version mismatch", async () => {
      const { toast } = await import("sonner");

      vi.mocked(backupModule.parseAndValidateBackup).mockResolvedValue({
        success: false,
        errorCode: "VERSION_MISMATCH",
        error: "Version mismatch",
      });

      render(<DataSettings />);

      const fileInput = screen.getByTestId("import-file-input");
      const file = new File(["{}"], "backup.json", {
        type: "application/json",
      });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe("AC4: Import Confirmation Dialog", () => {
    it("should show confirmation dialog for valid backup", async () => {
      vi.mocked(backupModule.parseAndValidateBackup).mockResolvedValue({
        success: true,
        data: {
          version: "1.0",
          storeVersions: { subscriptions: 2, settings: 4 },
          exportDate: "2025-01-01T00:00:00.000Z",
          subscriptions: [mockSubscription],
        },
        subscriptionCount: 1,
        mostRecentSubscription: "Netflix",
      });

      render(<DataSettings />);

      const fileInput = screen.getByTestId("import-file-input");
      const file = new File(["{}"], "backup.json", {
        type: "application/json",
      });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(screen.getByTestId("import-confirm-dialog")).toBeInTheDocument();
      });
    });
  });

  describe("Full Import Flow Integration", () => {
    it("should call store actions on confirmed import", async () => {
      const mockBackup = {
        version: "1.0",
        storeVersions: { subscriptions: 2, settings: 4 },
        exportDate: "2025-01-01T00:00:00.000Z",
        subscriptions: [mockSubscription],
        settings: { theme: "dark" as const },
      };

      vi.mocked(backupModule.parseAndValidateBackup).mockResolvedValue({
        success: true,
        data: mockBackup,
        subscriptionCount: 1,
        mostRecentSubscription: "Netflix",
      });

      vi.mocked(backupModule.createPreImportBackup).mockReturnValue({
        success: true,
      });

      render(<DataSettings />);

      // 1. Trigger File Selection
      const fileInput = screen.getByTestId("import-file-input");
      fireEvent.change(fileInput, {
        target: { files: [new File([""], "b.json")] },
      });

      // 2. Wait for Dialog and Confirm
      await waitFor(() => {
        expect(screen.getByTestId("import-confirm-dialog")).toBeInTheDocument();
      });

      const confirmBtn = screen.getByTestId("confirm-import-button");
      fireEvent.click(confirmBtn);

      // 3. Verify Store Actions
      await waitFor(() => {
        // These are accessed via getState() in implementation
        expect(useSubscriptionStore.getState().subscriptions).toEqual(
          mockBackup.subscriptions
        );
        expect(useSettingsStore.getState().theme).toBe("dark");
        expect(backupModule.createPreImportBackup).toHaveBeenCalled();
      });
    });

    it("should handle pre-import backup failure", async () => {
      const { toast } = await import("sonner");
      vi.mocked(backupModule.parseAndValidateBackup).mockResolvedValue({
        success: true,
        data: {
          version: "1.0",
          storeVersions: { subscriptions: 2, settings: 4 },
          exportDate: new Date().toISOString(),
          subscriptions: [mockSubscription],
        },
        subscriptionCount: 1,
      });

      vi.mocked(backupModule.createPreImportBackup).mockReturnValue({
        success: false,
        error: "Disk full",
      });

      render(<DataSettings />);

      // Trigger selection
      fireEvent.change(screen.getByTestId("import-file-input"), {
        target: { files: [new File([""], "b.json")] },
      });

      await screen.findByTestId("import-confirm-dialog");
      fireEvent.click(screen.getByTestId("confirm-import-button"));

      await waitFor(
        () => {
          expect(toast.error).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      // Dialog should be gone
      expect(
        screen.queryByTestId("import-confirm-dialog")
      ).not.toBeInTheDocument();
    });
  });
});
