import { useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
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
import type { QuickAddService } from "@/config/quick-add-services";

type DialogView = "quick-add" | "form";

export function AddSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<DialogView>("quick-add");
  const [selectedService, setSelectedService] =
    useState<QuickAddService | null>(null);

  const handleSuccess = () => {
    setOpen(false);
    // Reset state when dialog closes
    setView("quick-add");
    setSelectedService(null);
  };

  const handleServiceSelect = (service: QuickAddService) => {
    setSelectedService(service);
    setView("form");
  };

  const handleCustomClick = () => {
    setSelectedService(null);
    setView("form");
  };

  const handleBack = () => {
    setSelectedService(null);
    setView("quick-add");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when dialog closes
      setView("quick-add");
      setSelectedService(null);
    }
  };

  // Build initial values from selected service
  const getInitialValues = () => {
    if (!selectedService) return undefined;

    const categoryMeta = categories.get(selectedService.categoryId);
    return {
      name: selectedService.name,
      categoryId: selectedService.categoryId,
      icon: selectedService.iconName,
      color: categoryMeta.color,
    };
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow min-h-[56px] min-w-[56px]"
        aria-label="Abonelik ekle"
      >
        <Plus size={24} />
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {view === "quick-add"
                ? "Hızlı Abonelik Ekle"
                : selectedService
                ? selectedService.name
                : "Yeni Abonelik Ekle"}
            </DialogTitle>
            <DialogDescription>
              {view === "quick-add"
                ? "Popüler servisleri hızlıca ekleyin veya özel bir abonelik oluşturun."
                : "Abonelik bilgilerini girerek yeni bir abonelik ekleyin."}
            </DialogDescription>
          </DialogHeader>

          {view === "quick-add" ? (
            <QuickAddGrid
              onSelect={handleServiceSelect}
              onCustomClick={handleCustomClick}
            />
          ) : (
            <div className="space-y-4">
              {/* Back button to return to grid */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-1 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Geri
              </Button>

              <SubscriptionForm
                initialValues={getInitialValues()}
                onSuccess={handleSuccess}
                onCancel={handleBack}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
