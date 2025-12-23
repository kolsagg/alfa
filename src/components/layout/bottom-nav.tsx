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
    },
    { id: "wallet", path: ROUTES.WALLET, label: "Cüzdan", icon: Wallet },
    { id: "settings", path: ROUTES.SETTINGS, label: "Ayarlar", icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Alt navigasyon"
    >
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          // Action button (no routing)
          if (item.path === null) {
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={item.action}
                className="flex flex-col items-center justify-center gap-1 touch-target rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          }

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 touch-target rounded-lg transition-colors px-3 py-2 ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
