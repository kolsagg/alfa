import { Share, PlusSquare, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settings-store";
import { useIOSPWADetection } from "@/hooks/use-ios-pwa-detection";

export function IOSInstallGuidance() {
  const { shouldShowPrompt } = useIOSPWADetection();
  const dismissIOSPrompt = useSettingsStore((state) => state.dismissIOSPrompt);

  if (!shouldShowPrompt) return null;

  return (
    <Dialog
      open={shouldShowPrompt}
      onOpenChange={(open) => !open && dismissIOSPrompt()}
    >
      <DialogContent className="sm:max-w-[425px] rounded-t-3xl sm:rounded-3xl border-none bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex justify-between items-center mb-2">
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              Ana Ekrana Ekle
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={dismissIOSPrompt}
              className="rounded-full h-8 w-8 hover:bg-muted"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Kapat</span>
            </Button>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            SubTracker'ı tam ekran modunda kullanmak ve bildirimlerden haberdar
            olmak için ana ekranınıza ekleyin.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4 mb-6 aspect-square overflow-hidden rounded-2xl bg-muted/50">
          <img
            src="/assets/ios-guidance.png"
            alt="iOS Kurulum Rehberi"
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/90 tabular-nums">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </span>
              <span>Safari'de 'Paylaş' simgesine dokunun</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-foreground/90 tabular-nums mt-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </span>
              <span>'Ana Ekrana Ekle' seçeneğini seçin</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-start gap-4 p-3 rounded-xl bg-accent/50 border border-border/50">
            <Share className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">1. Paylaş Simgesi</p>
              <p className="text-xs text-muted-foreground">
                Tarayıcınızın alt kısmındaki yukarı oklu kutucuğa dokunun.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-3 rounded-xl bg-accent/50 border border-border/50">
            <PlusSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">2. Ana Ekrana Ekle</p>
              <p className="text-xs text-muted-foreground">
                Açılan menüde aşağı kaydırıp "Ana Ekrana Ekle" butonunu bulun.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={dismissIOSPrompt}
            className="w-full h-12 rounded-xl text-md font-medium shadow-lg shadow-primary/20"
          >
            Anladım
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
