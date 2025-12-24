import { LayoutDashboard, Plus, Settings, Wallet } from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { ROUTES } from "@/router/routes";

interface NavItemConfig {
  id: string;
  path: string | null; // null for action buttons (no routing)
  label: string;
  icon: typeof LayoutDashboard;
  action?: () => void;
  isCenter?: boolean;
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

export function BottomNav() {
  const openModal = useUIStore((s) => s.openModal);

  const navItems: NavItemConfig[] = [
    {
      id: "dashboard",
      path: ROUTES.DASHBOARD,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "add",
      path: null,
      label: "Ekle",
      icon: Plus,
      action: () => openModal("addSubscription"),
      isCenter: true,
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
   * Handle center action button click
   */
  const handleActionClick = (action?: () => void) => {
    triggerHapticFeedback();
    action?.();
  };

  /**
   * Check if current path matches the nav item
   * For dashboard, we need exact match since it's the root
   * Note: NavLink handle this internally, but we keep this for consistent Icon strokeWidth prop
   */

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-bottom"
      aria-label="Alt navigasyon"
    >
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          // Center Action Button (Elevated FAB pattern)
          if (item.path === null && item.isCenter) {
            return (
              <Button
                key={item.id}
                variant="default"
                onClick={() => handleActionClick(item.action)}
                className="relative -top-4 flex flex-col items-center justify-center gap-0.5 touch-target rounded-full w-14 h-14 shadow-lg transition-nav hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={item.label}
              >
                <Icon strokeWidth={2.5} className="h-6 w-6" />
                <span className="text-[10px] font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </Button>
            );
          }

          // Regular action button (non-routing, not center)
          if (item.path === null) {
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleActionClick(item.action)}
                className="flex flex-col items-center justify-center gap-1 touch-target rounded-lg transition-nav text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </Button>
            );
          }

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
      </div>
    </nav>
  );
}
