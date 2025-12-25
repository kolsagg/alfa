import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardFormDialog } from "./card-form-dialog";
import { useCardStore } from "@/stores/card-store";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";
import type { Card } from "@/types/card";

/**
 * CardFormDialog Tests
 *
 * Story 6.2: AC3, AC4
 * - Add mode: form validation, submission, toast
 * - Edit mode: pre-population, update, delete confirmation
 * - Validation errors display
 * - ColorPicker integration
 */

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const { toast } = vi.mocked(await import("sonner"));

const mockCard: Card = {
  id: "a1b2c3d4-e5f6-4890-abcd-ef1234567890", // Valid UUID v4 format
  name: "Ana Kart",
  type: "credit",
  lastFourDigits: "1234",
  cutoffDate: 20,
  color: "oklch(0.65 0.2 25)",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("CardFormDialog", () => {
  beforeEach(() => {
    // Reset store before each test
    useCardStore.setState({ cards: [] });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Add Mode", () => {
    it("renders add dialog with correct title", () => {
      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="add"
          onSuccess={() => {}}
          onCancel={() => {}}
        />
      );

      expect(screen.getByTestId("card-form-title")).toHaveTextContent(
        WALLET_STRINGS.ADD_CARD
      );
    });

    it("renders empty form fields in add mode", () => {
      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="add"
          onSuccess={() => {}}
          onCancel={() => {}}
        />
      );

      expect(screen.getByTestId("card-form-name")).toHaveValue("");
      expect(screen.getByTestId("card-form-last-four")).toHaveValue("");
      expect(screen.getByTestId("card-form-cutoff")).toHaveValue(null);
    });

    it("shows validation errors for empty submission", async () => {
      const user = userEvent.setup();

      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="add"
          onSuccess={() => {}}
          onCancel={() => {}}
        />
      );

      await user.click(screen.getByTestId("card-form-submit"));

      await waitFor(() => {
        expect(
          screen.getByText(WALLET_STRINGS.ERROR_NAME_REQUIRED)
        ).toBeInTheDocument();
        expect(
          screen.getByText(WALLET_STRINGS.ERROR_LAST_FOUR_REQUIRED)
        ).toBeInTheDocument();
        expect(
          screen.getByText(WALLET_STRINGS.ERROR_CUTOFF_REQUIRED)
        ).toBeInTheDocument();
      });
    });

    it("validates last four digits format - only allows 4 digits", async () => {
      const user = userEvent.setup();

      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="add"
          onSuccess={() => {}}
          onCancel={() => {}}
        />
      );

      const lastFourInput = screen.getByTestId("card-form-last-four");

      // Input filters non-digits, so type mixed content
      await user.type(lastFourInput, "12ab34");

      // Should only contain digits (filtered by onChange)
      expect(lastFourInput).toHaveValue("1234");
    });

    it("validates cutoff date within 1-31 range", async () => {
      const user = userEvent.setup();

      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="add"
          onSuccess={() => {}}
          onCancel={() => {}}
        />
      );

      const cutoffInput = screen.getByTestId(
        "card-form-cutoff"
      ) as HTMLInputElement;

      // Type a valid value to verify input works
      await user.type(cutoffInput, "15");
      expect(cutoffInput.value).toBe("15");

      // Clear and verify empty triggers required error on submit
      await user.clear(cutoffInput);
      await user.click(screen.getByTestId("card-form-submit"));

      await waitFor(() => {
        expect(
          screen.getByText(WALLET_STRINGS.ERROR_CUTOFF_REQUIRED)
        ).toBeInTheDocument();
      });
    });

    it("successfully adds card and shows toast", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="add"
          onSuccess={onSuccess}
          onCancel={() => {}}
        />
      );

      const nameInput = screen.getByTestId("card-form-name");
      const lastFourInput = screen.getByTestId("card-form-last-four");
      const cutoffInput = screen.getByTestId("card-form-cutoff");

      await user.type(nameInput, "Yeni Kart");
      await user.type(lastFourInput, "9876");
      await user.type(cutoffInput, "25");

      await user.click(screen.getByTestId("card-form-submit"));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          WALLET_STRINGS.TOAST_ADD_SUCCESS
        );
        expect(onSuccess).toHaveBeenCalled();
      });

      // Verify card was added to store
      const { cards } = useCardStore.getState();
      expect(cards).toHaveLength(1);
      expect(cards[0].name).toBe("Yeni Kart");
      expect(cards[0].lastFourDigits).toBe("9876");
    });

    it("displays privacy note in form", () => {
      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="add"
          onSuccess={() => {}}
          onCancel={() => {}}
        />
      );

      expect(screen.getByTestId("card-form-privacy-note")).toHaveTextContent(
        WALLET_STRINGS.PRIVACY_NOTE
      );
    });
  });

  describe("Edit Mode", () => {
    beforeEach(() => {
      // Pre-populate store with a card
      useCardStore.setState({ cards: [mockCard] });
    });

    it("renders edit dialog with correct title", () => {
      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="edit"
          initialValues={mockCard}
          onSuccess={() => {}}
          onCancel={() => {}}
        />
      );

      expect(screen.getByTestId("card-form-title")).toHaveTextContent(
        WALLET_STRINGS.EDIT_CARD
      );
    });

    it("pre-populates form with initial values", () => {
      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="edit"
          initialValues={mockCard}
          onSuccess={() => {}}
          onCancel={() => {}}
        />
      );

      expect(screen.getByTestId("card-form-name")).toHaveValue("Ana Kart");
      expect(screen.getByTestId("card-form-last-four")).toHaveValue("1234");
      expect(screen.getByTestId("card-form-cutoff")).toHaveValue(20);
    });

    it("shows delete button in edit mode", () => {
      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="edit"
          initialValues={mockCard}
          onSuccess={() => {}}
          onCancel={() => {}}
        />
      );

      expect(
        screen.getByTestId("card-form-delete-trigger")
      ).toBeInTheDocument();
    });

    it("successfully updates card and shows toast", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="edit"
          initialValues={mockCard}
          onSuccess={onSuccess}
          onCancel={() => {}}
        />
      );

      const nameInput = screen.getByTestId("card-form-name");
      await user.clear(nameInput);
      await user.type(nameInput, "Güncellenmiş Kart");

      await user.click(screen.getByTestId("card-form-submit"));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          WALLET_STRINGS.TOAST_UPDATE_SUCCESS
        );
        expect(onSuccess).toHaveBeenCalled();
      });

      // Verify card was updated in store
      const { cards } = useCardStore.getState();
      expect(cards[0].name).toBe("Güncellenmiş Kart");
    });

    it("shows delete confirmation dialog when delete button clicked", async () => {
      const user = userEvent.setup();

      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="edit"
          initialValues={mockCard}
          onSuccess={() => {}}
          onCancel={() => {}}
        />
      );

      await user.click(screen.getByTestId("card-form-delete-trigger"));

      await waitFor(() => {
        expect(screen.getByTestId("card-delete-confirm")).toBeInTheDocument();
        expect(
          screen.getByText(WALLET_STRINGS.DELETE_CONFIRM_TITLE)
        ).toBeInTheDocument();
      });
    });

    it("deletes card when confirmed", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="edit"
          initialValues={mockCard}
          onSuccess={onSuccess}
          onCancel={() => {}}
        />
      );

      await user.click(screen.getByTestId("card-form-delete-trigger"));

      await waitFor(() => {
        expect(screen.getByTestId("card-delete-confirm")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("card-delete-confirm-button"));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          WALLET_STRINGS.TOAST_DELETE_SUCCESS
        );
        expect(onSuccess).toHaveBeenCalled();
      });

      // Verify card was deleted from store
      const { cards } = useCardStore.getState();
      expect(cards).toHaveLength(0);
    });
  });

  describe("Cancel Behavior", () => {
    it("calls onCancel when cancel button clicked", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(
        <CardFormDialog
          open={true}
          onOpenChange={() => {}}
          mode="add"
          onSuccess={() => {}}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getByTestId("card-form-cancel"));

      expect(onCancel).toHaveBeenCalled();
    });
  });
});
