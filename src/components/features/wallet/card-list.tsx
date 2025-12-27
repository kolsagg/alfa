import { useState } from "react";
import { Plus } from "lucide-react";
import { useCardStore } from "@/stores/card-store";
import { useAllCardSpending } from "@/hooks/use-card-spending";
import { CardVisual } from "./card-visual";
import { CardFormDialog } from "./card-form-dialog";
import { UnassignedSpending } from "./unassigned-spending";
import { Button } from "@/components/ui/button";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";
import type { Card } from "@/types/card";

/**
 * CardList - Grid layout for displaying all cards with spending
 *
 * Story 6.2: AC1, AC3, AC4
 * Story 6.4: Per-card spending display integration
 * - Responsive grid: 1-col mobile, 2-col desktop
 * - Efficient Zustand selector for minimal re-renders
 * - Handles Add/Edit dialog state
 * - All cards: Click opens edit dialog
 * - Per-card spending display
 * - Unassigned subscriptions section
 */

interface CardListProps {
  onAddCard?: () => void;
}

export function CardList({ onAddCard }: CardListProps) {
  // Efficient selector - only re-renders when cards array changes
  const cards = useCardStore((s) => s.cards);

  // Get all card spending with memoization (Story 6.4)
  const { cardSpending, unassignedSpending, hasUnassigned } =
    useAllCardSpending();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  const handleAddClick = () => {
    setSelectedCard(null);
    setDialogMode("add");
    setIsDialogOpen(true);
    onAddCard?.();
  };

  const handleCardClick = (card: Card) => {
    // All cards: open edit dialog
    setSelectedCard(card);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCard(null);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedCard(null);
  };

  return (
    <div className="space-y-4" data-testid="card-list">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {cards.length === 0
            ? WALLET_STRINGS.EMPTY_TITLE
            : `${cards.length} Kart`}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddClick}
          className="min-h-[44px] min-w-[44px] gap-2"
          aria-label={WALLET_STRINGS.ADD_CARD}
          data-testid="card-list-add-button"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{WALLET_STRINGS.ADD_CARD}</span>
        </Button>
      </div>

      {/* Cards Grid with Spending (Story 6.4) */}
      {cards.length > 0 && (
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          data-testid="card-list-grid"
        >
          {cardSpending.map(({ card, spending }) => (
            <CardVisual
              key={card.id}
              card={card}
              spending={spending}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
      )}

      {/* Unassigned Subscriptions Section (Story 6.4: AC3) */}
      {hasUnassigned && (
        <UnassignedSpending
          spending={unassignedSpending}
          className="mt-4"
          data-testid="card-list-unassigned"
        />
      )}

      {/* Card Form Dialog */}
      <CardFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        initialValues={selectedCard}
        onSuccess={handleSuccess}
        onCancel={handleDialogClose}
      />
    </div>
  );
}
