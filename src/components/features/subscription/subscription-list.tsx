"use no memo"; // TanStack Virtual's useVirtualizer API is incompatible with React Compiler

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { toast } from "sonner";
import { ArrowUpDown, Filter, X, Calendar } from "lucide-react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useUIStore } from "@/stores/ui-store";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import type { Subscription } from "@/types/subscription";
import { SubscriptionCard } from "./subscription-card";
import { SubscriptionDetailDialog } from "./subscription-detail-dialog";
import { EditSubscriptionDialog } from "./edit-subscription-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { DeletionCelebration } from "./deletion-celebration";
import { EmptyState } from "@/components/layout/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  processSubscriptions,
  getUniqueCategoryIds,
  VIRTUALIZATION_THRESHOLD,
  SortOptionSchema,
  type SortOption,
  DEFAULT_SORT_OPTION,
} from "@/lib/subscription-list-utils";
import { categories } from "@/config/categories";

// Sort option labels (Turkish)
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date", label: "Tarihe göre" },
  { value: "price", label: "Fiyata göre" },
  { value: "name", label: "İsme göre" },
];

interface SubscriptionListProps {
  /** External category filter (controlled by parent) */
  externalCategoryFilter?: string | null;
  /** Callback when internal filter changes (for sync with parent) */
  onExternalCategoryChange?: (categoryId: string | null) => void;
}

/**
 * SubscriptionList manages the subscription list view with dialog orchestration
 * - Displays subscription cards with virtualization for large lists (20+ items)
 * - Supports sorting by date, price, or name
 * - Supports filtering by category
 * - ARIA live announcements for filter changes
 * - Handles detail → edit/delete flow
 * - Shows deletion celebration
 */
export function SubscriptionList({
  externalCategoryFilter,
  onExternalCategoryChange,
}: SubscriptionListProps = {}) {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const deleteSubscription = useSubscriptionStore((s) => s.deleteSubscription);

  // Filter and sort state
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION);
  // Use external filter if provided as a prop, otherwise use internal state
  const [internalCategoryFilter, setInternalCategoryFilter] = useState<
    string | null
  >(null);

  // CRITICAL FIX: null is a valid 'All' filter.
  // We only fall back to internal state if the external prop is strictly undefined.
  const isControlled = externalCategoryFilter !== undefined;
  const categoryFilter = isControlled
    ? externalCategoryFilter
    : internalCategoryFilter;

  const handleCategoryChange = (value: string | null) => {
    if (!isControlled) {
      setInternalCategoryFilter(value);
    }
    // Always notify parent to keep sync
    onExternalCategoryChange?.(value);
  };

  // ARIA live announcement
  const [announcement, setAnnouncement] = useState("");

  // Selected subscription for dialogs
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  // Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);

  // Virtualization ref
  const parentRef = useRef<HTMLDivElement>(null);

  // Story 4.5 - Date filter from UIStore
  const dateFilter = useUIStore((s) => s.dateFilter);
  const clearDateFilter = useUIStore((s) => s.clearDateFilter);

  // Process subscriptions with filter and sort (including dateFilter)
  const processedSubscriptions = useMemo(
    () =>
      processSubscriptions(
        subscriptions,
        categoryFilter,
        sortOption,
        dateFilter
      ),
    [subscriptions, categoryFilter, sortOption, dateFilter]
  );

  // Get unique categories for filter dropdown
  const availableCategories = useMemo(
    () => getUniqueCategoryIds(subscriptions),
    [subscriptions]
  );

  // Announce filter changes for screen readers (Story 4.5: includes date filter)
  useEffect(() => {
    if (subscriptions.length > 0) {
      const count = processedSubscriptions.length;
      const categoryLabel = categoryFilter
        ? categories.get(categoryFilter).label
        : "Tümü";
      const dateLabel = dateFilter
        ? dateFilter.includes(",")
          ? `${format(parseISO(dateFilter.split(",")[0]), "d MMM", {
              locale: tr,
            })} +${dateFilter.split(",").length - 1} gün`
          : format(parseISO(dateFilter), "d MMMM yyyy", { locale: tr })
        : null;

      const filterInfo =
        count === 0
          ? `Seçilen filtrelerle abonelik bulunamadı. (${categoryLabel}${
              dateLabel ? `, ${dateLabel}` : ""
            })`
          : dateLabel
          ? `${count} adet ${categoryLabel} abonelik, ${dateLabel} için`
          : `${count} adet ${categoryLabel} abonelik listelendi`;

      setAnnouncement(filterInfo);
    }
  }, [
    processedSubscriptions.length,
    categoryFilter,
    dateFilter,
    subscriptions.length,
  ]);

  // Virtualizer for large lists
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual opt-out via "use no memo" at file top
  const virtualizer = useVirtualizer({
    count: processedSubscriptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 92, // 80px card + 12px gap
    overscan: 5,
  });

  // Handle card click - open detail dialog
  const handleCardClick = useCallback((subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDetailOpen(true);
  }, []);

  // Handle edit button in detail dialog
  const handleEdit = useCallback(() => {
    setDetailOpen(false);
    setEditOpen(true);
  }, []);

  // Handle delete button in detail dialog
  const handleDeleteClick = useCallback(() => {
    setDetailOpen(false);
    setDeleteOpen(true);
  }, []);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async (): Promise<boolean> => {
    if (!selectedSubscription) return false;

    const success = deleteSubscription(selectedSubscription.id);
    if (success) {
      toast.success(`${selectedSubscription.name} silindi`);
      setShowCelebration(true);
      // Close delete dialog and clear selection after celebration starts
      setDeleteOpen(false);
      setSelectedSubscription(null);
    }
    return success;
  }, [selectedSubscription, deleteSubscription]);

  // Handle edit success
  const handleEditSuccess = useCallback(() => {
    setEditOpen(false);
    setSelectedSubscription(null);
  }, []);

  // Handle celebration complete
  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
  }, []);

  // Empty state - use new EmptyState component
  if (subscriptions.length === 0) {
    return <EmptyState />;
  }

  // Determine if we should use virtualization
  const useVirtualization =
    processedSubscriptions.length >= VIRTUALIZATION_THRESHOLD;

  // Render list items
  const renderListContent = () => {
    // Empty filter result
    if (processedSubscriptions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Filter className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {dateFilter
              ? "Bu tarihte abonelik bulunamadı"
              : "Bu kategoride abonelik bulunamadı"}
          </p>
          {dateFilter && (
            <button
              onClick={clearDateFilter}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Tarih filtresini temizle
            </button>
          )}
        </div>
      );
    }

    // Regular rendering for small lists
    if (!useVirtualization) {
      return (
        <div className="space-y-3">
          {processedSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onClick={handleCardClick}
              className="animate-in fade-in duration-200"
            />
          ))}
        </div>
      );
    }

    // Virtualized rendering for large lists
    return (
      <div
        ref={parentRef}
        className="h-[500px] overflow-auto rounded-lg"
        style={{ contain: "strict" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <SubscriptionCard
                subscription={processedSubscriptions[virtualItem.index]}
                onClick={handleCardClick}
                className="mb-3"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ARIA Live Region for screen readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>

      <section className="space-y-4">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground font-jakarta">
            Aboneliklerim ({processedSubscriptions.length})
          </h2>

          {/* Story 4.5: Active Date Filter Chip */}
          {dateFilter && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
              <Calendar className="w-4 h-4" />
              <span>
                {dateFilter.includes(",")
                  ? `${format(parseISO(dateFilter.split(",")[0]), "d MMM", {
                      locale: tr,
                    })} +${dateFilter.split(",").length - 1}`
                  : format(parseISO(dateFilter), "d MMMM yyyy", { locale: tr })}
              </span>
              <button
                onClick={clearDateFilter}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                aria-label="Tarih filtresini temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Sort and Filter Controls */}
          <div className="flex items-center gap-2">
            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <Select
                value={categoryFilter || "all"}
                onValueChange={(value) =>
                  handleCategoryChange(value === "all" ? null : value)
                }
              >
                <SelectTrigger
                  className="w-[130px] h-9 min-h-[44px]"
                  aria-label="Kategori filtresi"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Filtre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {availableCategories.map((catId) => (
                    <SelectItem key={catId} value={catId}>
                      {categories.get(catId).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort Dropdown */}
            <Select
              value={sortOption}
              onValueChange={(value) => {
                const validated = SortOptionSchema.parse(value);
                setSortOption(validated);
              }}
            >
              <SelectTrigger
                className="w-[140px] h-9 min-h-[44px]"
                aria-label="Sıralama seçeneği"
              >
                <ArrowUpDown className="w-4 h-4 mr-1" />
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List Content */}
        {renderListContent()}
      </section>

      {/* Detail Dialog */}
      <SubscriptionDetailDialog
        subscription={selectedSubscription}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Edit Dialog */}
      <EditSubscriptionDialog
        subscription={selectedSubscription}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        subscription={selectedSubscription}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />

      {/* Deletion Celebration */}
      <DeletionCelebration
        show={showCelebration}
        onComplete={handleCelebrationComplete}
      />
    </>
  );
}
