import { LayoutDashboard, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItem = "dashboard" | "add" | "settings";

interface BottomNavProps {
  activeItem?: NavItem;
  onNavigate?: (item: NavItem) => void;
}

export function BottomNav({
  activeItem = "dashboard",
  onNavigate,
}: BottomNavProps) {
  const items: { id: NavItem; label: string; icon: typeof LayoutDashboard }[] =
    [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "add", label: "Ekle", icon: Plus },
      { id: "settings", label: "Ayarlar", icon: Settings },
    ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Alt navigasyon"
    >
      <div className="flex h-16 items-center justify-around px-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onNavigate?.(item.id)}
              className={`flex flex-col items-center justify-center gap-1 touch-target rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
