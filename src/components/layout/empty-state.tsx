import { Sparkles } from "lucide-react";
import { QuickAddGrid } from "@/components/features/quick-add";
import { useUIStore, type SubscriptionPrefillData } from "@/stores/ui-store";
import { categories } from "@/config/categories";
import type { QuickAddService } from "@/config/quick-add-services";

/**
 * EmptyState - Shown when user has no subscriptions
 *
 * Features:
 * - Welcome message with illustration
 * - Quick-Add Grid for popular services
 * - "Özel Abonelik Ekle" CTA
 * - Tutorial hint for first-time users
 * - Opens AddSubscriptionDialog via useUIStore
 */
export function EmptyState() {
  const openModal = useUIStore((s) => s.openModal);

  const handleQuickAddSelect = (service: QuickAddService) => {
    const categoryMeta = categories.get(service.categoryId);
    const prefill: SubscriptionPrefillData = {
      name: service.name,
      categoryId: service.categoryId,
      icon: service.iconName,
      color: categoryMeta.color,
    };
    openModal("addSubscription", undefined, prefill);
  };

  const handleCustomClick = () => {
    openModal("addSubscription", undefined, { skipToForm: true });
  };

  return (
    <section
      className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border/30 bg-muted/20 px-6 py-12 md:py-16 text-center"
      role="status"
      aria-live="polite"
      aria-label="Abonelik yok, başlamak için bir servis seçin"
    >
      {/* Illustration */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-10 w-10 text-primary" aria-hidden="true" />
        </div>
      </div>

      {/* Welcome Message */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold font-jakarta text-foreground md:text-2xl">
          Merhaba! 👋
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Aboneliklerini takip etmeye hazır mısın?
        </p>
      </div>

      {/* Quick-Add Grid */}
      <div className="w-full max-w-md">
        <QuickAddGrid
          onSelect={handleQuickAddSelect}
          onCustomClick={handleCustomClick}
        />
      </div>

      {/* Tutorial Hint */}
      <p className="text-xs text-muted-foreground/70 max-w-sm">
        Başlamak için hızlı listeden seçim yapın, alttaki{" "}
        <strong>+ butonuna</strong> basın veya ayarlardan hatırlatıcıları
        yapılandırın.
      </p>
    </section>
  );
}
