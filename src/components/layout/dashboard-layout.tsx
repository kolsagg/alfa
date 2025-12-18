import type { ReactNode } from "react";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { AddSubscriptionDialog } from "@/components/features/subscription/add-subscription-dialog";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-jakarta">
      <Header />
      <main className="flex-1 px-4 py-6 pb-24">{children}</main>
      <BottomNav />
      <AddSubscriptionDialog />
    </div>
  );
}
