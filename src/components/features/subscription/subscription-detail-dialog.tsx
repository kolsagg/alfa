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
import { formatCurrency } from "./utils";
import { Edit2, Trash2 } from "lucide-react";

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
    custom: "Özel",
  }[subscription.billingCycle];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{subscription.name}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-3 pt-2">
              {/* Category Badge */}
              <div className="flex items-center gap-2">
                <CategoryBadge
                  categoryId={subscription.categoryId}
                  size="default"
                />
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

        <DialogFooter className="flex-row gap-2 sm:gap-2">
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
