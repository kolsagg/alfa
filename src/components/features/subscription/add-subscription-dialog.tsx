import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubscriptionForm } from "./subscription-form";

export function AddSubscriptionDialog() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Abonelik Ekle</DialogTitle>
            <DialogDescription>
              Abonelik bilgilerini girerek yeni bir abonelik ekleyin.
            </DialogDescription>
          </DialogHeader>
          <SubscriptionForm
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
