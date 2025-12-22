import { useState, useCallback, type ReactNode } from "react";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { AddSubscriptionDialog } from "@/components/features/subscription/add-subscription-dialog";
import { NotificationBanner } from "@/components/features/NotificationBanner";
import { SettingsSheet } from "@/components/features/settings";
import { useUIStore } from "@/stores/ui-store";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openModal = useUIStore((s) => s.openModal);

  const handleNavigate = useCallback(
    (item: "dashboard" | "add" | "settings") => {
      if (item === "settings") {
        setSettingsOpen(true);
      } else if (item === "add") {
        openModal("addSubscription");
      }
      // "dashboard" does nothing - we're already there
    },
    [openModal]
  );

  return (
    <div className="flex min-h-screen flex-col bg-background font-jakarta">
      <Header />
      <div className="px-4 pt-2">
        <NotificationBanner />
      </div>
      <main className="flex-1 px-4 py-6 pb-24">{children}</main>
      <BottomNav onNavigate={handleNavigate} />
      <AddSubscriptionDialog />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
