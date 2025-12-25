import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";

/**
 * WalletEmptyState - Shown when no cards exist
 *
 * Story 8.8: AC2 (initial implementation)
 * Story 6.2: AC5 (enhanced with Add Card CTA)
 * - Centered Wallet icon (48x48px icon in a larger container)
 * - Title: "Henüz kart eklenmedi"
 * - Description: High-level purpose of card management
 * - CTA Button: "İlk Kartınızı Ekleyin" (Add Your First Card)
 *
 * Styling matches src/components/layout/empty-state.tsx patterns
 */

interface WalletEmptyStateProps {
  onAddCard?: () => void;
}

export function WalletEmptyState({ onAddCard }: WalletEmptyStateProps) {
  return (
    <section
      className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border/30 bg-muted/20 px-6 py-12 md:py-16 text-center"
      role="status"
      aria-live="polite"
      aria-label={WALLET_STRINGS.EMPTY_TITLE}
      data-testid="wallet-empty-state"
    >
      {/* Icon with glow effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Wallet
            className="h-12 w-12 text-primary"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Title and Description */}
      <div className="space-y-2">
        <h2
          className="text-xl font-semibold font-jakarta text-foreground md:text-2xl"
          data-testid="wallet-empty-title"
        >
          {WALLET_STRINGS.EMPTY_TITLE}
        </h2>
        <p
          className="text-sm text-muted-foreground max-w-sm"
          data-testid="wallet-empty-description"
        >
          {WALLET_STRINGS.EMPTY_DESCRIPTION}
        </p>
      </div>

      {/* Add Card CTA Button (Story 6.2: AC5) */}
      <Button
        onClick={onAddCard}
        size="lg"
        className="min-h-[44px] gap-2"
        aria-label={WALLET_STRINGS.ADD_FIRST_CARD}
        data-testid="wallet-empty-add-button"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        {WALLET_STRINGS.ADD_FIRST_CARD}
      </Button>
    </section>
  );
}
