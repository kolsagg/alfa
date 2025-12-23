import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for lazy-loaded pages
 */
export function LoadingSkeleton() {
  return (
    <div className="space-y-4" data-testid="loading-skeleton">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
