/**
 * Route path constants for the application
 * Use these instead of hardcoded strings for type-safety and maintainability
 */
export const ROUTES = {
  DASHBOARD: "/",
  SETTINGS: "/settings",
  WALLET: "/wallet",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Page titles for document.title updates
 */
export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Dashboard | SubTracker",
  [ROUTES.SETTINGS]: "Ayarlar | SubTracker",
  [ROUTES.WALLET]: "Cüzdan | SubTracker",
};
