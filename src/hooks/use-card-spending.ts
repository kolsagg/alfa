/**
 * useCardSpending Hook - Per-Card Monthly Spending Calculator
 *
 * Story 6.4: AC1, AC5
 * - Memoized spending calculations for optimal performance
 * - Real-time updates when subscriptions/cards change
 * - Supports 60fps performance with large subscription lists
 */

import { useMemo } from "react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useCardStore } from "@/stores/card-store";
import {
  calculateCardSpending,
  calculateUnassignedSpending,
  type SpendingInfo,
} from "@/lib/spending-calculator";
import type { Card } from "@/types/card";
import type { Subscription } from "@/types/subscription";

/**
 * CardSpendingData - Per-card spending with card reference
 */
export interface CardSpendingData {
  card: Card;
  spending: SpendingInfo;
}

/**
 * AllSpendingData - Complete spending breakdown
 */
export interface AllSpendingData {
  cardSpending: CardSpendingData[];
  unassignedSpending: SpendingInfo;
  unassignedSubscriptions: Subscription[];
  hasUnassigned: boolean;
}

/**
 * Hook to get spending info for a specific card
 *
 * @param cardId - Card ID to get spending for
 * @returns SpendingInfo for the specified card
 */
export function useCardSpending(cardId: string): SpendingInfo {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  return useMemo(() => {
    return calculateCardSpending(cardId, subscriptions);
  }, [cardId, subscriptions]);
}

/**
 * Hook to get spending info for unassigned subscriptions
 *
 * @returns SpendingInfo for subscriptions without cardId
 */
export function useUnassignedSpending(): SpendingInfo {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  return useMemo(() => {
    return calculateUnassignedSpending(subscriptions);
  }, [subscriptions]);
}

/**
 * Hook to get spending for all cards at once
 *
 * @returns AllSpendingData with per-card breakdown and unassigned
 */
export function useAllCardSpending(): AllSpendingData {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const cards = useCardStore((s) => s.cards);

  return useMemo(() => {
    const cardSpending: CardSpendingData[] = cards.map((card) => ({
      card,
      spending: calculateCardSpending(card.id, subscriptions),
    }));

    const unassignedSpending = calculateUnassignedSpending(subscriptions);

    // Filter unassigned active subscriptions
    const unassignedSubscriptions = subscriptions.filter(
      (sub) => sub.isActive && !sub.cardId
    );

    return {
      cardSpending,
      unassignedSpending,
      unassignedSubscriptions,
      hasUnassigned: unassignedSpending.subscriptionCount > 0,
    };
  }, [subscriptions, cards]);
}
