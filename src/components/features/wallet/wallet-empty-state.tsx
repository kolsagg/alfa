import { Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";

/**
 * WalletEmptyState - Shown when no cards exist
 *
 * Story 8.8: AC2
 * - Centered Wallet icon (48x48px icon in a larger container)
 * - Title: "Henüz kart eklenmedi"
 * - Description: High-level purpose of card management
 * - Badge: "Yakında" (Coming Soon)
 *
 * Styling matches src/components/layout/empty-state.tsx patterns
 */
export function WalletEmptyState() {
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

      {/* Coming Soon Badge */}
      <Badge variant="secondary" data-testid="wallet-coming-soon-badge">
        {WALLET_STRINGS.COMING_SOON_BADGE}
      </Badge>
    </section>
  );
}
