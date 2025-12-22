# Story 3.4: Subscription List View

Status: done

## Story

As a **kullanıcı**,
I want **tüm aboneliklerimi bir listede görmek**,
so that **onları kolayca yönetebilmem**.

## Acceptance Criteria

### AC1: Enhanced List Display

**Given** kullanıcının abonelikleri var
**When** abonelik listesini görüntüler
**Then** her kart şunları gösterir: isim, ikon, kategori badge, fiyat, sonraki ödeme tarihi
**And** kartlar tıklanabilir (detay görüntüleme/düzenleme)
**And** liste smooth scroll ile 60fps performans sağlar

### AC2: Virtualization for Large Lists

**Given** kullanıcının 100+ aboneliği var
**When** liste render edilir
**Then** `@tanstack/react-virtual` ile virtualization uygulanır
**And** sadece görünen items DOM'a eklenir (windowing)
**And** scroll performansı 60fps'i korur (DevTools Performance tab ile doğrulanabilir)
**And** initial render < 100ms içinde tamamlanır

### AC3: Sorting Options

**Given** kullanıcının birden fazla aboneliği var
**When** sıralama seçeneğini değiştirir
**Then** aşağıdaki sıralama seçenekleri mevcut:

- **Tarihe göre** (varsayılan): En yakın ödeme önce
- **Fiyata göre**: En pahalıdan en ucuza
- **İsme göre**: A-Z alfabetik
  **And** seçili sıralama görsel olarak belirtilir
  **And** sıralama değişikliği anında uygulanır (< 16ms)

### AC4: Category Filtering

**Given** kullanıcının farklı kategorilerde abonelikleri var
**When** kategori filtresi uygular
**Then** sadece seçili kategorideki abonelikler listelenir
**And** "Tümü" seçeneği tüm abonelikleri gösterir (varsayılan)
**And** filtre değişikliği anında uygulanır
**And** boş sonuç durumunda "Bu kategoride abonelik yok" mesajı gösterilir
**And** filtre değişiminde sonuç sayısı ARIA live region ile duyurulur

### AC5: Empty State

**Given** kullanıcının hiç aboneliği yok
**When** listeyi görüntüler
**Then** mevcut EmptyState component'i gösterilir
**And** mesaj friendly ve encouraging tonunda olur

### AC6: Accessibility

**Given** liste render edildi
**When** kullanıcı screen reader veya klavye kullanır
**Then** her item için anlamlı aria-label sağlanır
**And** sort/filter kontrolleri klavye ile erişilebilir
**And** focus order mantıklı (controls → list items)
**And** 44x44px minimum touch target korunur
**And** filtre sonuçları değiştikçe (`aria-live="polite"`) geri bildirim verilir

### AC7: Performance Thresholds

**Given** 100 abonelik ile test edildiğinde
**When** performans ölçülür
**Then** initial render < 100ms
**And** scroll maintains 60fps
**And** sort/filter operations < 16ms
**And** memory usage stable (no leaks on scroll)

## Tasks / Subtasks

- [x] **Task 1: Install @tanstack/react-virtual (AC: #2)**

  - [x] 1.1 Run `npm install @tanstack/react-virtual`
  - [x] 1.2 Verify package.json updated correctly
  - [x] 1.3 Verify TypeScript types available

- [x] **Task 2: Update SubscriptionCard for Icon Support (AC: #1)**

  - [x] 2.1 Update `src/components/features/subscription/subscription-card.tsx` to accept and render icons
  - [x] 2.2 Implement dynamic `lucide-react` icon rendering logic (safe rendering with fallback)
  - [x] 2.3 Style icon layout according to design system

- [x] **Task 3: Create Sorting/Filtering Utils (AC: #3, #4)**

  - [x] 3.1 Create `src/lib/subscription-list-utils.ts` with sorting functions
  - [x] 3.2 Implement Zod schema for `SortOption` and `FilterOption`
  - [x] 3.3 Implement `sortByDate(subscriptions)` - en yakın ödeme önce
  - [x] 3.4 Implement `sortByPrice(subscriptions)` - pahalıdan ucuza
  - [x] 3.5 Implement `sortByName(subscriptions)` - A-Z
  - [x] 3.6 Implement `filterByCategory(subscriptions, categoryId)`
  - [x] 3.7 Create `src/lib/subscription-list-utils.test.ts`

- [x] **Task 4: Enhanced SubscriptionList Component (AC: #1, #2, #3, #4, #5, #6)**

  - [x] 4.1 Refactor `SubscriptionList` to use `useVirtualizer` hook
  - [x] 4.2 Use `estimateSize: 92` (80px + 12px gap) for precise virtualization
  - [x] 4.3 Add sort dropdown (Select component from shadcn/ui)
  - [x] 4.4 Add category filter tabs or dropdown
  - [x] 4.5 Add ARIA live region for "X adet sonuç bulundu" feedback
  - [x] 4.6 Wire up states using `useMemo`
  - [x] 4.7 Add micro-animations (`animate-in fade-in`) for item entry

- [x] **Task 5: Testing & Performance Validation (AC: #1, #2, #5, #7)**

  - [x] 5.1 Update `subscription-list.test.tsx`
  - [x] 5.2 Test sorting/filtering functionality
  - [x] 5.3 Test virtualization renders correct items
  - [x] 5.4 Verify performance metrics (100+ items)

## Dev Notes

### Architecture Compliance

- **Location:**
  - `src/components/features/subscription/subscription-list.tsx`
  - `src/components/features/subscription/subscription-card.tsx` (UPDATE REQUIRED)
- **Utilities:** `src/lib/subscription-list-utils.ts`
- **Reuse:**
  - `Select` from `@/components/ui/select`
  - `EmptyState` ← mevcut
  - `CategoryBadge` ← mevcut

### Technical Implementation

#### Lucide Icon Rendering Pattern

```typescript
import * as Icons from "lucide-react";

const IconComponent =
  (subscription.icon &&
    (Icons[subscription.icon as keyof typeof Icons] as any)) ||
  Icons.CreditCard;
// Render: <IconComponent size={20} className="..." />
```

#### @tanstack/react-virtual Usage Pattern

```typescript
const virtualizer = useVirtualizer({
  count: subscriptions.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 92, // 80px card + 12px gap
  overscan: 5,
});
```

#### Zod Validation Pattern

```typescript
export const SortOptionSchema = z.enum(["date", "price", "name"]);
export type SortOption = z.infer<typeof SortOptionSchema>;
```

### Critical Implementation Notes

#### ⚠️ VIRTUALIZATION CONTAINER HEIGHT

`useVirtualizer` requires a **fixed height** parent (e.g., `h-[500px] overflow-auto`).

#### ⚠️ ICON RENDERING

`SubscriptionCard` MUST be updated to show the `icon` property. If none exists, use a default fallback (e.g., `CreditCard`).

#### ⚠️ ARIA LIVE ANNOUNCEMENTS

Update the announcement text whenever `filteredSubscriptions.length` changes to inform screen reader users.

#### ⚠️ PRESERVE DIALOG FLOW

Virtualization must NOT break the existing detail/edit/delete dialog coordination.

### Previous Story Learnings (3-2, 3-3)

- `formatCurrency` centralized at `@/lib/formatters.ts`
- Zustand selector pattern for state.
- Urgency colors from `index.css`.

### Testing Checklist (Critical Path)

- [x] Nearest payment first (Date sort)
- [x] Highest price first (Price sort)
- [x] Turkish-aware A-Z (Name sort)
- [x] Filter by category matches exactly
- [x] "X adet bulundu" announced to screen readers
- [x] 60fps scroll with 100+ items (Virtualization verified)
- [x] Virtualization activates for 20+ items
- [x] Dialogs trigger correctly from virtualized items

### Dependencies

**Package to Install:**

```bash
npm install @tanstack/react-virtual
```

**Version:** Latest stable (3.x as of Dec 2025)

### References

- [Source: docs/epics.md#Story 3.4] - Acceptance criteria
- [Source: docs/architecture.md#Selector Pattern] - Zustand patterns
- [Source: src/components/features/subscription/subscription-list.tsx] - Current implementation
- [Source: src/components/features/subscription/subscription-card.tsx] - Card component (UPDATED)
- [Source: src/lib/formatters.ts] - Currency formatting
- [Source: src/types/common.ts] - CategorySchema for category IDs

## Dev Agent Record

### Context Reference

- Story: docs/sprint-artifacts/3-4-subscription-list-view.md

### Agent Model Used

Claude 3.5 Sonnet / Antigravity

### Debug Log References

- Build: ✅ Passed
- Lint: ✅ Passed (with expected react-compiler warning for TanStack Virtual)
- Tests: ✅ 314 passed (Added 5 integration tests for sort/filter)

### Completion Notes List

- Installed @tanstack/react-virtual v3.13.13 for virtualization
- Updated SubscriptionCard to display subscription icons with dynamic lucide-react rendering and color support
- Created subscription-list-utils.ts with Zod-validated sorting (date/price/name) and category filtering
- Comprehensive test suite: 25 unit tests for utils + 5 integration tests for SubscriptionList component
- Refactored SubscriptionList with virtualization (20+ items threshold), sort dropdown, category filter
- Added ARIA live region for screen reader announcements on filter changes
- **Review Fixes Applied:** Added Zod runtime validation for SortOption, added missing UI tests for sort/filter/ARIA, updated SubscriptionCard tests for icon/color verification.

### File List

**Files Created:**

- `src/lib/subscription-list-utils.ts`
- `src/lib/subscription-list-utils.test.ts`
- `src/components/features/subscription/subscription-list.test.tsx` (Added UI integration tests)

**Files Modified:**

- `src/components/features/subscription/subscription-list.tsx` - Added Zod validation + components
- `src/components/features/subscription/subscription-card.tsx` - Icon rendering
- `src/components/features/subscription/subscription-card.test.tsx` - Verified icon/color rendering
- `package.json` - Dependency sync
