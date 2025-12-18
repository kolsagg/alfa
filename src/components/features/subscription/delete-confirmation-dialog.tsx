import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Subscription } from "@/types/subscription";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "./utils";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
}

/**
 * Format savings text based on billing cycle
 * Uses positive framing: "tasarruf edeceksin"
 */
function formatSavingsText(subscription: Subscription): string {
  const amount = formatCurrency(subscription.amount, subscription.currency);
  switch (subscription.billingCycle) {
    case "monthly":
      return `Aylık ${amount}`;
    case "yearly":
      return `Yıllık ${amount}`;
    case "weekly":
      return `Haftalık ${amount}`;
    case "custom":
      return amount;
    default:
      return amount;
  }
}

/**
 * DeleteConfirmationDialog for destructive delete action
 * - Uses AlertDialog for proper a11y pattern
 * - Positive framing: "bırakıyorsun" + savings message
 * - Loading state blocks dialog close
 */
export function DeleteConfirmationDialog({
  subscription,
  open,
  onOpenChange,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle subscription not found
  useEffect(() => {
    if (open && !subscription) {
      toast.error("Bu abonelik artık mevcut değil");
      const timer = setTimeout(() => onOpenChange(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open, subscription, onOpenChange]);

  const handleConfirm = async () => {
    if (!subscription) return;

    setIsDeleting(true);
    try {
      const success = await onConfirm();
      if (!success) {
        toast.error("Silme işlemi başarısız");
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Block close during deletion
    if (isDeleting) return;
    onOpenChange(newOpen);
  };

  if (!subscription) {
    return (
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hata</AlertDialogTitle>
            <AlertDialogDescription>
              Bu abonelik artık mevcut değil
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {subscription.name}&apos;i bırakıyorsun
          </AlertDialogTitle>
          <AlertDialogDescription className="text-success">
            {formatSavingsText(subscription)} tasarruf edeceksin ✨
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex-1 min-h-[44px]"
          >
            Vazgeç
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 min-h-[44px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Siliniyor...
              </>
            ) : (
              "Evet, iptal et"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
