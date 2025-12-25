/**
 * ImportConfirmDialog Tests
 *
 * Story 8.6: Tests for import confirmation dialog
 * AC4: Danger Zone styling, subscription preview
 * AC5: Auto-backup toggle
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportConfirmDialog } from "./import-confirm-dialog";

describe("ImportConfirmDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    subscriptionCount: 5,
    mostRecentSubscription: "Netflix",
    autoBackup: true,
    onAutoBackupChange: vi.fn(),
    onConfirm: vi.fn(),
    isProcessing: false,
  };

  describe("AC4: Danger Zone Styling", () => {
    it("should render with danger zone title", () => {
      render(<ImportConfirmDialog {...defaultProps} />);
      expect(screen.getByText("Tehlike Bölgesi")).toBeInTheDocument();
    });

    it("should have destructive styled confirm button", () => {
      render(<ImportConfirmDialog {...defaultProps} />);
      const confirmButton = screen.getByTestId("confirm-import-button");
      expect(confirmButton).toHaveClass("bg-destructive");
    });
  });

  describe("AC4: Subscription Preview", () => {
    it("should display subscription count", () => {
      render(<ImportConfirmDialog {...defaultProps} />);
      expect(screen.getByText(/5/)).toBeInTheDocument();
      expect(screen.getByText(/abone içeriyor/)).toBeInTheDocument();
    });

    it("should display most recent subscription name", () => {
      render(<ImportConfirmDialog {...defaultProps} />);
      expect(screen.getByText("Netflix")).toBeInTheDocument();
      expect(screen.getByText("En son eklenen:")).toBeInTheDocument();
    });

    it("should not show most recent if not provided", () => {
      render(
        <ImportConfirmDialog
          {...defaultProps}
          mostRecentSubscription={undefined}
        />
      );
      expect(screen.queryByText("En son eklenen:")).not.toBeInTheDocument();
    });

    it("should display warning message", () => {
      render(<ImportConfirmDialog {...defaultProps} />);
      expect(
        screen.getByText(/mevcut verilerinizin üzerine yazacaktır/)
      ).toBeInTheDocument();
    });
  });

  describe("AC5: Auto-backup Toggle", () => {
    it("should render auto-backup checkbox", () => {
      render(<ImportConfirmDialog {...defaultProps} />);
      expect(screen.getByTestId("auto-backup-checkbox")).toBeInTheDocument();
    });

    it("should show checkbox as checked when autoBackup is true", () => {
      render(<ImportConfirmDialog {...defaultProps} autoBackup={true} />);
      const checkbox = screen.getByTestId("auto-backup-checkbox");
      expect(checkbox).toHaveAttribute("data-state", "checked");
    });

    it("should show checkbox as unchecked when autoBackup is false", () => {
      render(<ImportConfirmDialog {...defaultProps} autoBackup={false} />);
      const checkbox = screen.getByTestId("auto-backup-checkbox");
      expect(checkbox).toHaveAttribute("data-state", "unchecked");
    });

    it("should call onAutoBackupChange when checkbox clicked", async () => {
      const onAutoBackupChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ImportConfirmDialog
          {...defaultProps}
          autoBackup={false}
          onAutoBackupChange={onAutoBackupChange}
        />
      );

      await user.click(screen.getByTestId("auto-backup-checkbox"));

      expect(onAutoBackupChange).toHaveBeenCalled();
    });
  });

  describe("Dialog Actions", () => {
    it("should call onConfirm when confirm button clicked", async () => {
      const onConfirm = vi.fn();
      const user = userEvent.setup();

      render(<ImportConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByTestId("confirm-import-button"));

      expect(onConfirm).toHaveBeenCalled();
    });

    it("should call onOpenChange(false) when cancel button clicked", async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ImportConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />
      );

      await user.click(screen.getByText("İptal"));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should disable buttons when processing", () => {
      render(<ImportConfirmDialog {...defaultProps} isProcessing={true} />);

      expect(screen.getByTestId("confirm-import-button")).toBeDisabled();
      expect(screen.getByText("İptal")).toBeDisabled();
    });

    it("should show processing text when processing", () => {
      render(<ImportConfirmDialog {...defaultProps} isProcessing={true} />);
      expect(screen.getByText("İşleniyor...")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper dialog structure", () => {
      render(<ImportConfirmDialog {...defaultProps} />);
      expect(screen.getByTestId("import-confirm-dialog")).toBeInTheDocument();
    });

    it("should have associated label for checkbox", () => {
      render(<ImportConfirmDialog {...defaultProps} />);
      const label = screen.getByText(/Verileri değiştirmeden önce/);
      expect(label).toHaveAttribute("for", "auto-backup");
    });
  });
});
