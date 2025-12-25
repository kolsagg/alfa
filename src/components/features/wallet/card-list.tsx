import { useState } from "react";
import { Plus } from "lucide-react";
import { useCardStore } from "@/stores/card-store";
import { CardVisual } from "./card-visual";
import { CardFormDialog } from "./card-form-dialog";
import { Button } from "@/components/ui/button";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";
import type { Card } from "@/types/card";

/**
 * CardList - Grid layout for displaying all cards
 *
 * Story 6.2: AC1, AC3, AC4
 * - Responsive grid: 1-col mobile, 2-col desktop
 * - Efficient Zustand selector for minimal re-renders
 * - Handles Add/Edit dialog state
 * - Header with Add Card button
 */

interface CardListProps {
  onAddCard?: () => void;
}

export function CardList({ onAddCard }: CardListProps) {
  // Efficient selector - only re-renders when cards array changes
  const cards = useCardStore((s) => s.cards);

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

      {/* Cards Grid */}
      {cards.length > 0 && (
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          data-testid="card-list-grid"
        >
          {cards.map((card) => (
            <CardVisual
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
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
