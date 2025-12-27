import { useState, useCallback, useMemo } from "react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useSettingsStore } from "@/stores/settings-store";
import { showNotificationPermissionPrompt } from "@/lib/notification-permission";
import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubscriptionForm } from "./subscription-form";
import { QuickAddGrid } from "@/components/features/quick-add";
import { categories } from "@/config/categories";
import { useUIStore } from "@/stores/ui-store";
import type { QuickAddService } from "@/config/quick-add-services";

type DialogView = "quick-add" | "form";

/**
 * AddSubscriptionDialog - Controlled by useUIStore
 *
 * Opens when: activeModal === "addSubscription"
 * Supports: prefillData for Quick-Add from EmptyState
 */
export function AddSubscriptionDialog() {
  // Centralized state from UIStore
  const activeModal = useUIStore((s) => s.activeModal);
  const prefillData = useUIStore((s) => s.prefillData);
  const closeModal = useUIStore((s) => s.closeModal);
  const openModal = useUIStore((s) => s.openModal);

  // Local state for internal dialog flow (only for in-dialog service selection)
  const [selectedService, setSelectedService] =
    useState<QuickAddService | null>(null);

  // Determine if dialog should be open
  const isOpen = activeModal === "addSubscription";

  // Derive view from state instead of managing in useEffect
  // If prefillData is present with a name OR skipToForm is true, show form; otherwise show grid
  // If user selected a service in-dialog, show form
  const view: DialogView = useMemo(() => {
    if (isOpen && prefillData?.name) {
      return "form";
    }
    if (isOpen && prefillData?.skipToForm) {
      return "form";
    }
    if (selectedService) {
      return "form";
    }
    return "quick-add";
  }, [isOpen, prefillData?.name, prefillData?.skipToForm, selectedService]);

  const handleSuccess = useCallback(() => {
    setSelectedService(null);
    closeModal();

    // Just-in-Time notification permission prompt (Story 2.9)
    // Trigger only after first subscription AND permission prompt never seen
    const subscriptions = useSubscriptionStore.getState().subscriptions;
    const { notificationPermission, hasSeenNotificationPrompt } =
      useSettingsStore.getState();

    // Condition: This is the user's first subscription ever OR first active sub,
    // AND they haven't seen the prompt yet.
    if (
      subscriptions.length === 1 &&
      notificationPermission === "default" &&
      !hasSeenNotificationPrompt
    ) {
      // Use setTimeout to ensure toast appears after dialog close animation completes (Radix Dialog)
      setTimeout(() => {
        const subscriptionName = subscriptions[0].name;
        showNotificationPermissionPrompt(subscriptionName);
      }, 400); // 400ms is safer for most exit animations
    }
  }, [closeModal]);

  const handleServiceSelect = useCallback((service: QuickAddService) => {
    setSelectedService(service);
  }, []);

  const handleCustomClick = useCallback(() => {
    // Set a dummy service to trigger form view
    setSelectedService({
      id: "__custom__",
      name: "",
      categoryId: "other",
      iconName: "package",
    } as QuickAddService);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedService(null);
  }, []);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        openModal("addSubscription");
      } else {
        setSelectedService(null);
        closeModal();
      }
    },
    [openModal, closeModal]
  );

  // Build initial values from selected service OR prefillData
  const getInitialValues = useCallback(() => {
    // Priority 1: PrefillData from UIStore (EmptyState Quick-Add)
    if (prefillData?.name) {
      return {
        name: prefillData.name,
        categoryId: prefillData.categoryId,
        icon: prefillData.icon,
        color: prefillData.color,
      };
    }

    // Priority 2: Selected service from internal dialog flow (not custom)
    if (selectedService && selectedService.id !== "__custom__") {
      const categoryMeta = categories.get(selectedService.categoryId);
      return {
        name: selectedService.name,
        categoryId: selectedService.categoryId,
        icon: selectedService.iconName,
        color: categoryMeta.color,
      };
    }

    return undefined;
  }, [prefillData, selectedService]);

  // Determine dialog title based on state
  const getDialogTitle = () => {
    if (view === "quick-add") {
      return "Hızlı Abonelik Ekle";
    }
    if (prefillData?.name) {
      return prefillData.name;
    }
    if (selectedService && selectedService.id !== "__custom__") {
      return selectedService.name;
    }
    return "Yeni Abonelik Ekle";
  };

  return (
    <>
      {/* Dialog - Controlled by UIStore */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-[500px] p-0 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>
              {view === "quick-add"
                ? "Popüler servisleri hızlıca ekleyin veya özel bir abonelik oluşturun."
                : "Abonelik bilgilerini girerek yeni bir abonelik ekleyin."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-2">
            {view === "quick-add" ? (
              <QuickAddGrid
                onSelect={handleServiceSelect}
                onCustomClick={handleCustomClick}
              />
            ) : (
              <div className="space-y-4">
                {/* Back button - only show if NOT from prefillData and NOT skipToForm */}
                {!prefillData?.name && !prefillData?.skipToForm && (
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="flex items-center gap-1 -ml-2 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Geri
                  </Button>
                )}

                <SubscriptionForm
                  initialValues={getInitialValues()}
                  onSuccess={handleSuccess}
                  onCancel={
                    prefillData?.name || prefillData?.skipToForm
                      ? handleSuccess
                      : handleBack
                  }
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
