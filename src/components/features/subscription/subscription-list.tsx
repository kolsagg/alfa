import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useSubscriptionStore } from "@/stores/subscription-store";
import type { Subscription } from "@/types/subscription";
import { SubscriptionCard } from "./subscription-card";
import { SubscriptionDetailDialog } from "./subscription-detail-dialog";
import { EditSubscriptionDialog } from "./edit-subscription-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { DeletionCelebration } from "./deletion-celebration";

/**
 * SubscriptionList manages the subscription list view with dialog orchestration
 * - Displays subscription cards
 * - Handles detail → edit/delete flow
 * - Shows deletion celebration
 */
export function SubscriptionList() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const deleteSubscription = useSubscriptionStore((s) => s.deleteSubscription);

  // Selected subscription for dialogs
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  // Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);

  // Handle card click - open detail dialog
  const handleCardClick = useCallback((subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDetailOpen(true);
  }, []);

  // Handle edit button in detail dialog
  const handleEdit = useCallback(() => {
    setDetailOpen(false);
    setEditOpen(true);
  }, []);

  // Handle delete button in detail dialog
  const handleDeleteClick = useCallback(() => {
    setDetailOpen(false);
    setDeleteOpen(true);
  }, []);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async (): Promise<boolean> => {
    if (!selectedSubscription) return false;

    const success = deleteSubscription(selectedSubscription.id);
    if (success) {
      toast.success(`${selectedSubscription.name} silindi`);
      setShowCelebration(true);
      // Close delete dialog and clear selection after celebration starts
      setDeleteOpen(false);
      setSelectedSubscription(null);
    }
    return success;
  }, [selectedSubscription, deleteSubscription]);

  // Handle edit success
  const handleEditSuccess = useCallback(() => {
    setEditOpen(false);
    setSelectedSubscription(null);
  }, []);

  // Handle celebration complete
  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
  }, []);

  // Empty state
  if (subscriptions.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground font-jakarta">
          Aboneliklerim
        </h2>
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/50 bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Henüz abonelik eklenmedi
          </p>
          <p className="text-xs text-muted-foreground/70">
            Alt menüden &quot;Ekle&quot; butonuna dokunarak başlayın
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground font-jakarta">
          Aboneliklerim
        </h2>
        <div className="space-y-3">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onClick={handleCardClick}
            />
          ))}
        </div>
      </section>

      {/* Detail Dialog */}
      <SubscriptionDetailDialog
        subscription={selectedSubscription}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Edit Dialog */}
      <EditSubscriptionDialog
        subscription={selectedSubscription}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        subscription={selectedSubscription}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />

      {/* Deletion Celebration */}
      <DeletionCelebration
        show={showCelebration}
        onComplete={handleCelebrationComplete}
      />
    </>
  );
}
