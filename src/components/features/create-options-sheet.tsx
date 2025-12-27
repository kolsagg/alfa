/**
 * CreateOptionsPanel - Spotify-style floating panel for adding items
 *
 * Features:
 * - Floats above navbar (navbar visible underneath)
 * - No close button - uses navbar × to close
 * - Compact, floating appearance with backdrop
 * - Smooth open AND close animations via CSS
 */

import { CreditCard, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateOption {
  id: "subscription" | "card";
  icon: typeof Receipt;
  title: string;
  description: string;
}

const CREATE_OPTIONS: CreateOption[] = [
  {
    id: "subscription",
    icon: Receipt,
    title: "Abonelik Ekle",
    description: "Netflix, Spotify gibi abonelikleri takip et",
  },
  {
    id: "card",
    icon: CreditCard,
    title: "Kart Ekle",
    description: "Kredi veya banka kartını tanımla",
  },
];

interface CreateOptionsPanelProps {
  open: boolean;
  onClose: () => void;
  onSelectSubscription: () => void;
  onSelectCard: () => void;
}

export function CreateOptionsPanel({
  open,
  onClose,
  onSelectSubscription,
  onSelectCard,
}: CreateOptionsPanelProps) {
  const handleSelect = (optionId: "subscription" | "card") => {
    onClose();
    // Small delay for animation
    setTimeout(() => {
      if (optionId === "subscription") {
        onSelectSubscription();
      } else {
        onSelectCard();
      }
    }, 250);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 transition-all duration-200",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Backdrop - clicking closes */}
      <div
        className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Panel - positioned above navbar, slides from bottom */}
      <div
        className={cn(
          "absolute left-4 right-4 mx-auto max-w-md",
          "bottom-[calc(4rem+env(safe-area-inset-bottom)+1rem)]", // Above navbar
          "rounded-2xl border border-border/50 bg-card shadow-2xl",
          "transition-all duration-300 ease-out",
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[100%]"
        )}
        role="dialog"
        aria-label="Ekleme seçenekleri"
        aria-hidden={!open}
      >
        <div className="p-4 space-y-2">
          {CREATE_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                tabIndex={open ? 0 : -1}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl p-4 text-left",
                  "transition-colors hover:bg-muted/50 active:bg-muted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">
                    {option.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
