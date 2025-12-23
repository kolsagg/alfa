import { Link, useLocation } from "react-router";
import { Settings, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ImminentPaymentsBadge } from "@/components/features/ImminentPaymentsBadge";
import { ROUTES } from "@/router/routes";

/**
 * Header Component
 *
 * Story 4.7 AC5: Added ImminentPaymentsBadge - shows count of imminent payments
 * when push notifications are not active.
 *
 * Story 8.2 AC1: Settings button navigates to /#/settings instead of opening a Sheet
 */
export function Header() {
  const location = useLocation();
  const isSettingsPage = location.pathname === ROUTES.SETTINGS;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {isSettingsPage && (
            <Button variant="ghost" size="icon" asChild className="-ml-2">
              <Link to={ROUTES.DASHBOARD} aria-label="Geri">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <h1 className="text-xl font-bold tracking-tight text-foreground font-jakarta">
            SubTracker
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Story 4.7 AC5: Badge for imminent payments when notifications are off */}
          <ImminentPaymentsBadge />
          <ThemeToggle />
          {/* Story 8.2 AC1: Navigate to Settings page instead of opening Sheet */}
          {!isSettingsPage && (
            <Button variant="outline" size="icon" asChild>
              <Link to={ROUTES.SETTINGS} aria-label="Ayarlar">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
