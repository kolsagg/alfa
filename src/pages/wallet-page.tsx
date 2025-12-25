import { useEffect } from "react";
import { WalletEmptyState } from "@/components/features/wallet";
import { WALLET_STRINGS } from "@/lib/i18n/wallet";

/**
 * WalletPage - Card management page
 *
 * Story 8.8: Enhanced Wallet page structure
 * - AC1: Structured layout matching dashboard/settings patterns
 * - AC2: Empty state with Coming Soon badge
 * - AC3: i18n integration
 * - AC4: Document title updates and accessibility
 *
 * Note: Card CRUD will be implemented in Epic 6.
 * This page currently shows a static empty state.
 */
export default function WalletPage() {
  // AC4: Update document title on mount and restore on unmount (H1, M2 Fix)
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${WALLET_STRINGS.WALLET_TITLE} | SubTracker`;
    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <div className="px-4 pt-2 space-y-6" data-testid="wallet-page">
      {/* Page Header - AC1 */}
      <header className="space-y-1" data-testid="wallet-header">
        <h1 className="text-2xl font-bold" data-testid="wallet-page-title">
          {WALLET_STRINGS.WALLET_TITLE}
        </h1>
        <p
          className="text-muted-foreground text-sm"
          data-testid="wallet-page-description"
        >
          {WALLET_STRINGS.WALLET_DESCRIPTION}
        </p>
      </header>

      {/* Empty State - AC2 */}
      <WalletEmptyState />
    </div>
  );
}
