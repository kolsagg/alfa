import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Subscription } from "@/types/subscription";
import type { SubscriptionInput } from "@/stores/subscription-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SubscriptionForm } from "./subscription-form";

interface EditSubscriptionDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Map subscription to form initial values
 */
function mapToFormValues(sub: Subscription): Partial<SubscriptionInput> {
  return {
    name: sub.name,
    amount: sub.amount,
    currency: sub.currency,
    billingCycle: sub.billingCycle,
    nextPaymentDate: sub.nextPaymentDate,
    categoryId: sub.categoryId || "other",
    color: sub.color,
    icon: sub.icon,
    cardId: sub.cardId,
    isActive: sub.isActive,
  };
}

/**
 * EditSubscriptionDialog wraps SubscriptionForm in edit mode
 * - Pre-populates form with existing subscription data
 * - Blocks dialog close during submission
 */
export function EditSubscriptionDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: EditSubscriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle subscription not found
  useEffect(() => {
    if (open && !subscription) {
      toast.error("Bu abonelik artık mevcut değil");
      const timer = setTimeout(() => onOpenChange(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open, subscription, onOpenChange]);

  const handleOpenChange = (newOpen: boolean) => {
    // Block close during submission
    if (isSubmitting) return;
    onOpenChange(newOpen);
  };

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  if (!subscription) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Aboneliği Düzenle</DialogTitle>
          <DialogDescription>
            {subscription.name} aboneliğini düzenleyin.
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm
          mode="edit"
          subscriptionId={subscription.id}
          initialValues={mapToFormValues(subscription)}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
          onSubmittingChange={setIsSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
