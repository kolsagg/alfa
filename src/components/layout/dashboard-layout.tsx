import { type ReactNode } from "react";
import { Header } from "./header";
import { NotificationBanner } from "@/components/features/NotificationBanner";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * DashboardLayout - Legacy layout component
 *
 * @deprecated This component is deprecated as of Story 8.1.
 * Use RootLayout with React Router instead.
 *
 * This component is kept for backward compatibility with existing tests.
 * New pages should use the routing system via RootLayout.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-jakarta">
      <Header />
      <div className="px-4 pt-2">
        <NotificationBanner />
      </div>
      <main className="flex-1 px-4 py-6 pb-24">{children}</main>
    </div>
  );
}
