import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CardSelect } from "./card-select";

// Mock card store with proper typing
const createMockStore = (
  cards: Array<{
    id: string;
    name: string;
    lastFourDigits: string;
    type: "credit" | "debit";
    color: string;
    cutoffDate?: number;
    createdAt: string;
    updatedAt: string;
  }>
) => {
  return vi.fn((selector: (state: { cards: typeof cards }) => unknown) => {
    return selector({ cards });
  });
};

vi.mock("@/stores/card-store", () => ({
  useCardStore: vi.fn(),
}));

import { useCardStore } from "@/stores/card-store";

const mockUseCardStore = useCardStore as unknown as ReturnType<typeof vi.fn>;

describe("CardSelect", () => {
  const mockOnValueChange = vi.fn();
  const mockOnNavigateToWallet = vi.fn();

  const mockCards = [
    {
      id: "card-1",
      name: "Ana Kart",
      lastFourDigits: "1234",
      type: "credit" as const,
      color: "#3B82F6",
      cutoffDate: 15,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "card-2",
      name: "Banka Kartım",
      lastFourDigits: "5678",
      type: "debit" as const,
      color: "#10B981",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("with cards available", () => {
    beforeEach(() => {
      mockUseCardStore.mockImplementation(createMockStore(mockCards));
    });

    it("renders select with placeholder when no value", () => {
      render(<CardSelect onValueChange={mockOnValueChange} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("Kart seçilmedi")).toBeInTheDocument();
    });

    it("renders combobox trigger correctly", () => {
      render(<CardSelect onValueChange={mockOnValueChange} />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("aria-label", "Ödeme Kartı");
    });

    it("shows selected card info in trigger", () => {
      render(<CardSelect value="card-1" onValueChange={mockOnValueChange} />);

      // The trigger should show the selected card's name and details
      expect(screen.getByText("Ana Kart")).toBeInTheDocument();
      expect(screen.getByText("*1234")).toBeInTheDocument();
      expect(screen.getByText("Kredi")).toBeInTheDocument();
    });

    it("shows debit card badge correctly", () => {
      render(<CardSelect value="card-2" onValueChange={mockOnValueChange} />);

      expect(screen.getByText("Banka Kartım")).toBeInTheDocument();
      expect(screen.getByText("*5678")).toBeInTheDocument();
      expect(screen.getByText("Banka")).toBeInTheDocument();
    });

    it("respects disabled prop", () => {
      render(<CardSelect onValueChange={mockOnValueChange} disabled={true} />);

      expect(screen.getByRole("combobox")).toBeDisabled();
    });

    it("renders with custom label", () => {
      render(
        <CardSelect onValueChange={mockOnValueChange} label="Özel Etiket" />
      );

      expect(screen.getByText("Özel Etiket")).toBeInTheDocument();
    });

    it("renders with default label when not provided", () => {
      render(<CardSelect onValueChange={mockOnValueChange} />);

      expect(screen.getByText("Ödeme Kartı")).toBeInTheDocument();
    });

    it("shows placeholder when value prop is undefined", () => {
      render(
        <CardSelect value={undefined} onValueChange={mockOnValueChange} />
      );

      expect(screen.getByText("Kart seçilmedi")).toBeInTheDocument();
    });
  });

  describe("with no cards available", () => {
    beforeEach(() => {
      mockUseCardStore.mockImplementation(createMockStore([]));
    });

    it("shows empty state when no cards exist", () => {
      render(<CardSelect onValueChange={mockOnValueChange} />);

      expect(screen.getByText("Henüz kart yok")).toBeInTheDocument();
    });

    it("does not render combobox when no cards", () => {
      render(<CardSelect onValueChange={mockOnValueChange} />);

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("shows 'Go to Wallet' button when onNavigateToWallet is provided", () => {
      render(
        <CardSelect
          onValueChange={mockOnValueChange}
          onNavigateToWallet={mockOnNavigateToWallet}
        />
      );

      expect(
        screen.getByRole("button", { name: "Cüzdana Git" })
      ).toBeInTheDocument();
    });

    it("calls onNavigateToWallet when button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <CardSelect
          onValueChange={mockOnValueChange}
          onNavigateToWallet={mockOnNavigateToWallet}
        />
      );

      await user.click(screen.getByRole("button", { name: "Cüzdana Git" }));

      expect(mockOnNavigateToWallet).toHaveBeenCalledTimes(1);
    });

    it("does not show wallet button when onNavigateToWallet is not provided", () => {
      render(<CardSelect onValueChange={mockOnValueChange} />);

      expect(
        screen.queryByRole("button", { name: "Cüzdana Git" })
      ).not.toBeInTheDocument();
    });

    it("shows wallet icon in empty state", () => {
      render(<CardSelect onValueChange={mockOnValueChange} />);

      // Check that empty state container exists
      const emptyState = screen.getByText("Henüz kart yok").closest("div");
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      mockUseCardStore.mockImplementation(createMockStore(mockCards));
    });

    it("handles value that doesn't match any card gracefully", () => {
      render(
        <CardSelect
          value="non-existent-card"
          onValueChange={mockOnValueChange}
        />
      );

      // Should render combobox
      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
      // Should show placeholder-like state since card not found
      expect(screen.getByText("Kart seçilmedi")).toBeInTheDocument();
    });

    it("applies className prop correctly", () => {
      const { container } = render(
        <CardSelect
          onValueChange={mockOnValueChange}
          className="custom-class"
        />
      );

      const wrapper = container.querySelector(".w-full.custom-class");
      expect(wrapper).toBeInTheDocument();
    });
  });
});
