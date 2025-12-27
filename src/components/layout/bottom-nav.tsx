import { useState } from "react";
import { LayoutDashboard, Plus, Settings, Wallet } from "lucide-react";
import { NavLink } from "react-router";
import { useUIStore } from "@/stores/ui-store";
import { ROUTES } from "@/router/routes";
import { CreateOptionsPanel } from "@/components/features/create-options-sheet";
import { CardFormDialog } from "@/components/features/wallet/card-form-dialog";

interface NavItemConfig {
  id: string;
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
}

/**
 * Trigger subtle haptic feedback if supported (PWA/Mobile)
 * Uses 10ms vibration for a gentle tap feel
 */
function triggerHapticFeedback(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(10);
    } catch {
      // Vibration not supported or permission denied
    }
  }
}

/**
 * BottomNav - Spotify-inspired bottom navigation
 *
 * Features:
 * - Navigation items: Dashboard, Wallet, Settings
 * - Create button (+ / ×) on the right - opens floating panel
 * - Panel floats above navbar (navbar stays visible)
 * - Icon toggles between + and × when panel is open
 */
export function BottomNav() {
  const openModal = useUIStore((s) => s.openModal);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);

  // Navigation items
  const navItems: NavItemConfig[] = [
    {
      id: "dashboard",
      path: ROUTES.DASHBOARD,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { id: "wallet", path: ROUTES.WALLET, label: "Cüzdan", icon: Wallet },
    { id: "settings", path: ROUTES.SETTINGS, label: "Ayarlar", icon: Settings },
  ];

  /**
   * Handle navigation click with haptic feedback
   */
  const handleNavigationClick = () => {
    triggerHapticFeedback();
  };

  /**
   * Handle create button click - toggle panel
   */
  const handleCreateClick = () => {
    triggerHapticFeedback();
    setIsCreatePanelOpen(!isCreatePanelOpen);
  };

  /**
   * Handle subscription selection from panel
   */
  const handleSelectSubscription = () => {
    openModal("addSubscription");
  };

  /**
   * Handle card selection from panel
   */
  const handleSelectCard = () => {
    setIsCardDialogOpen(true);
  };

  return (
    <>
      {/* Floating Create Panel - above navbar */}
      <CreateOptionsPanel
        open={isCreatePanelOpen}
        onClose={() => setIsCreatePanelOpen(false)}
        onSelectSubscription={handleSelectSubscription}
        onSelectCard={handleSelectCard}
      />

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-[-1px] left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-bottom"
        aria-label="Alt navigasyon"
      >
        <div className="flex h-16 items-center justify-around px-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === ROUTES.DASHBOARD}
                onClick={handleNavigationClick}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 touch-target rounded-lg transition-nav px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                    isActive
                      ? "text-primary bg-primary/10 scale-105 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
                aria-label={item.label}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      strokeWidth={isActive ? 2.5 : 2}
                      className="h-5 w-5 transition-all"
                    />
                    <span className="text-xs font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Create Button - rightmost, toggles + / × with circle animation */}
          <button
            type="button"
            onClick={handleCreateClick}
            className="relative flex flex-col items-center justify-center gap-1 touch-target px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none text-muted-foreground hover:text-foreground"
            aria-label={isCreatePanelOpen ? "Kapat" : "Ekle"}
            aria-expanded={isCreatePanelOpen}
          >
            {/* White circle highlight - centered, animates size */}
            <div
              className={`
                absolute rounded-full bg-foreground transition-all duration-500 ease-out
                left-1/2 -translate-x-1/2
                ${
                  isCreatePanelOpen
                    ? "w-10 h-10 opacity-100 top-0"
                    : "w-0 h-0 opacity-0 top-2"
                }
              `}
              aria-hidden="true"
            />

            {/* Plus icon with rotation - centered in circle when open */}
            <div
              className={`
                relative z-10 h-5 w-5 transition-all duration-300 ease-out
                ${
                  isCreatePanelOpen
                    ? "rotate-[135deg] text-background"
                    : "rotate-0"
                }
              `}
            >
              <Plus className="h-5 w-5" />
            </div>

            {/* Label - fades out when open */}
            <span
              className={`
                text-xs font-medium whitespace-nowrap transition-all duration-300 ease-out
                ${
                  isCreatePanelOpen
                    ? "opacity-0 max-h-0 overflow-hidden"
                    : "opacity-100 max-h-6"
                }
              `}
            >
              Ekle
            </span>
          </button>
        </div>
      </nav>

      {/* Card Form Dialog - triggered from panel */}
      <CardFormDialog
        open={isCardDialogOpen}
        onOpenChange={setIsCardDialogOpen}
        mode="add"
        onSuccess={() => setIsCardDialogOpen(false)}
        onCancel={() => setIsCardDialogOpen(false)}
      />
    </>
  );
}
