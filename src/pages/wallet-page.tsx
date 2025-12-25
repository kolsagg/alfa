import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { WalletEmptyState } from "@/components/features/wallet/wallet-empty-state";
import { CardList } from "@/components/features/wallet/card-list";
import { CardFormDialog } from "@/components/features/wallet/card-form-dialog";
import { Button } from "@/components/ui/button";
import { useCardStore } from "@/stores/card-store";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";

/**
 * WalletPage - Card management page
 *
 * Story 8.8: Enhanced Wallet page structure
 * Story 6.2: Full card management implementation
 * - AC1: Card list/grid with responsive layout
 * - AC2: Visual card representation
 * - AC3: Add card flow from header and empty state
 * - AC4: Edit/delete flow
 * - AC5: Enhanced empty state with CTA
 * - AC6: Performance optimizations with Zustand selectors
 */
export default function WalletPage() {
  // Efficient selector - only re-renders when cards array length changes for conditional
  const hasCards = useCardStore((s) => s.cards.length > 0);

  // Dialog state for header Add button and empty state CTA
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // AC4: Update document title on mount and restore on unmount
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${WALLET_STRINGS.WALLET_TITLE} | SubTracker`;
    return () => {
      document.title = originalTitle;
    };
  }, []);

  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
  };

  return (
    <div className="px-4 pt-2 space-y-6" data-testid="wallet-page">
      {/* Page Header - AC1 */}
      <header
        className="flex items-center justify-between"
        data-testid="wallet-header"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold" data-testid="wallet-page-title">
            {WALLET_STRINGS.WALLET_TITLE}
          </h1>
          <p
            className="text-muted-foreground text-sm"
            data-testid="wallet-page-description"
          >
            {WALLET_STRINGS.WALLET_DESCRIPTION}
          </p>
        </div>

        {/* Header Add Card Button - AC3 */}
        {hasCards && (
          <Button
            variant="default"
            size="sm"
            onClick={handleOpenAddDialog}
            className="min-h-[44px] min-w-[44px] gap-2"
            aria-label={WALLET_STRINGS.ADD_CARD}
            data-testid="wallet-header-add-button"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{WALLET_STRINGS.ADD_CARD}</span>
          </Button>
        )}
      </header>

      {/* Conditional Content - AC1, AC5 */}
      {hasCards ? (
        <CardList />
      ) : (
        <WalletEmptyState onAddCard={handleOpenAddDialog} />
      )}

      {/* Add Card Dialog triggered from header or empty state */}
      <CardFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="add"
        onSuccess={handleAddSuccess}
        onCancel={() => setIsAddDialogOpen(false)}
      />
    </div>
  );
}
