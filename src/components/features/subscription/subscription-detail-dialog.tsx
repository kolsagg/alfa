import { useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import type { Subscription } from "@/types/subscription";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/ui/category-badge";
import { formatCurrency } from "@/lib/formatters";
import { Edit2, Trash2, CreditCard } from "lucide-react";
import { useCardStore } from "@/stores/card-store";

interface SubscriptionDetailDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * SubscriptionDetailDialog shows subscription details
 * - Displays name, amount, currency, category badge, next payment date
 * - "Düzenle" button opens edit form
 * - "Sil" button shows confirmation dialog
 */
export function SubscriptionDetailDialog({
  subscription,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: SubscriptionDetailDialogProps) {
  // Get linked card info (must be before any conditional returns)
  const cards = useCardStore((s) => s.cards);
  const linkedCard = subscription?.cardId
    ? cards.find((c) => c.id === subscription.cardId)
    : null;

  // Handle subscription not found (rehydration might have deleted it)
  useEffect(() => {
    if (open && !subscription) {
      toast.error("Bu abonelik artık mevcut değil");
      const timer = setTimeout(() => onOpenChange(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open, subscription, onOpenChange]);

  if (!subscription) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hata</DialogTitle>
            <DialogDescription>
              Bu abonelik artık mevcut değil
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const formattedAmount = formatCurrency(
    subscription.amount,
    subscription.currency
  );

  const formattedDate = format(
    new Date(subscription.nextPaymentDate),
    "d MMMM yyyy",
    { locale: tr }
  );

  const billingCycleLabel = {
    monthly: "Aylık",
    yearly: "Yıllık",
    weekly: "Haftalık",
    custom:
      subscription.billingCycle === "custom" && subscription.customDays
        ? `${subscription.customDays} günde bir`
        : "Özel",
  }[subscription.billingCycle];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">{subscription.name}</DialogTitle>
            <DialogDescription asChild>
              <div className="flex flex-col gap-3 pt-2">
                {/* Badges Row: Category (Left) - Card (Right) */}
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge
                    categoryId={subscription.categoryId}
                    size="default"
                  />

                  {/* Linked Card Badge */}
                  {linkedCard && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <CreditCard className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {linkedCard.name}
                        <span className="mx-1 opacity-50">|</span>
                        {linkedCard.bankName}
                        {linkedCard.lastFourDigits && (
                          <span className="ml-1 font-mono text-[10px] opacity-70">
                            •••• {linkedCard.lastFourDigits}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="text-3xl font-bold text-foreground">
                  {formattedAmount}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    / {billingCycleLabel?.toLowerCase()}
                  </span>
                </div>

                {/* Next Payment */}
                <div className="text-sm text-muted-foreground">
                  Sonraki ödeme:{" "}
                  <span className="font-medium text-foreground">
                    {formattedDate}
                  </span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2 p-6 pt-0">
          <Button
            variant="outline"
            onClick={onEdit}
            className="flex-1 min-h-[44px]"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="flex-1 min-h-[44px]"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
