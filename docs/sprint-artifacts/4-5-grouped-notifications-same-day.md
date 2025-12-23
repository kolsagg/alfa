# Story 4.5: Gruplanmış Bildirimler (Aynı Gün)

Status: done

## Story

As a **user**,
I want **birden fazla aynı gün ödemesini tek bir bildirimde gruplanmış olarak almak**,
so that **aynı gün gerçekleşecek çok sayıda ödeme için ayrı ayrı uyarılarla rahatsız edilmem**.

## Acceptance Criteria

### AC1: Batch Processing in Dispatcher

**Given** bildirim zamanı gelmiş birden fazla kayıt aynı `paymentDueAt` gününe (gün başlangıcı bazlı) sahipse
**When** `checkAndDispatchNotifications` servisi çalıştığında
**Then** bu bildirimleri tek bir batch olarak gruplamalıdır
**And** batch içindeki tüm abonelikleri `markBatchAsNotified` action'ı ile tek seferde işaretlemelidir.

### AC2: Aggregated Notification Content (Localized)

**Given** aynı gün için 2 veya daha fazla bildirim mevcutsa
**When** bildirim görüntülendiğinde
**Then** başlık "Birden Fazla Ödeme Yaklaşıyor" olmalıdır
**And** içerik metni "{{count}} adet ödeme {{daysText}} yapılacak - Toplam {{totalAmount}}" formatında olmalıdır.
**And** tutar formatlaması projenin `formatCurrency` util'ini kullanmalıdır.

### AC3: Single Notification Fallback

**Given** ödeme günü için sadece tek bir bildirim mevcutsa
**When** dispatcher çalıştığında
**Then** Story 4.4'te tanımlanan standart tekli bildirim davranışına geri dönmelidir.

### AC4: Filtered Dashboard Redirection & Cleanup

**Given** gruplanmış bir bildirime tıklandığında
**When** uygulama açıldığında
**Then** varsa açık olan tüm modalları (Edit/Detail) kapatmalıdır
**And** Dashboard'a yönlendirip `uiStore.dateFilter` state'ini ilgili günün ISO string'i olarak set etmelidir.
**And** Abonelik listesi hem `categoryFilter` hem de `dateFilter` kriterlerini birlikte (AND mantığıyla) uygulamalıdır.

### AC5: Sensory Urgency (Aggregated)

**Given** gruplanmış bildirimdeki ödemelerden biri "imminent" (<= 1 gün) ise
**When** görüntülendiğinde
**Then** "imminent" titreşim ve görsel vurgu desenini kullanmalıdır.

## Tasks / Subtasks

- [x] **Task 1: Store & Utils Preparation**

  - [x] 1.1 `src/stores/notification-schedule-store.ts` dosyasına `markBatchAsNotified(subscriptionIds: string[])` action'ı ekle.
  - [x] 1.2 `src/lib/subscription-list-utils.ts` içerisine `filterByDate` (isSameDay check) util'i ekle.
  - [x] 1.3 `processSubscriptions` fonksiyonunu hem kategori hem tarih filtresini destekleyecek şekilde güncelle.

- [x] **Task 2: Grouping Dispatcher Logic**

  - [x] 2.1 `src/services/notification-dispatcher.ts` içerisinde `pending` kayıtları `paymentDueAt` gününe göre grupla.
  - [x] 2.2 Dispatch öncesi (grup içindeki her öğe için) store durumunu `getState()` ile tekrar kontrol ederek race-condition önle.
  - [x] 2.3 `logReliability` fonksiyonunu batch status (success/error) kaydedecek şekilde güncelle.

- [x] **Task 3: Multi-Subscription Display Service**

  - [x] 3.1 `src/lib/notification/display-service.ts` içerisinde `displayGroupedNotification` fonksiyonunu implement et.
  - [x] 3.2 Toplam tutar hesaplamasında `formatCurrency` util'ini kullan.
  - [x] 3.3 Tıklama (onclick) handler'ına `uiStore.closeModal()` ve `dateFilter` atama mantığını ekle.

- [x] **Task 4: UI Integration (Dashboard)**
  - [x] 4.1 `src/stores/ui-store.ts` içerisine `dateFilter: string | null` state ve action'larını ekle.
  - [x] 4.2 `SubscriptionList` bileşenine aktif bir `dateFilter` varsa "Filtreyi Temizle" butonu/chip'i ekle.
  - [x] 4.3 Liste başlığında aktif filtre bilgilerini (Tarih ve Kategori) ARIA live region üzerinden anons et.

## Dev Notes

### 🏗️ Architecture: Filtering & Combined Logic

`dateFilter` ve `categoryFilter` birlikte çalışmalıdır:

```typescript
const filtered = subscriptions.filter((s) => {
  const matchesCategory = !categoryId || s.categoryId === categoryId;
  const matchesDate =
    !dateFilter || isSameDay(parseISO(s.nextPaymentDate), parseISO(dateFilter));
  return matchesCategory && matchesDate;
});
```

### 📂 Revised Structure

- `src/services/notification-dispatcher.ts` (Batch logic)
- `src/lib/notification/display-service.ts` (Grouped UI)
- `src/stores/notification-schedule-store.ts` (New batch action)
- `src/stores/ui-store.ts` (dateFilter state)
- `src/components/features/subscription/subscription-list.tsx` (Clear filter UI)

## Dev Agent Record

### Context Reference

- `docs/epics.md#Story-4.5`
- `src/services/notification-dispatcher.ts`
- `src/lib/notification/display-service.ts`
- `src/lib/subscription-list-utils.ts`

### Agent Model Used

Gemini Antigravity (2025-12-23)

### Completion Notes

**Implementation Summary:**

- ✅ **AC1 (Batch Processing)**: Implemented `groupEntriesByPaymentDate` in dispatcher, uses `markBatchAsNotified` store action
- ✅ **AC2 (Aggregated Content)**: `displayGroupedNotification` function with Turkish localized title/body, uses `formatCurrency` utility for all amounts (AC2 requirement)
- ✅ **AC3 (Single Fallback)**: Dispatcher automatically uses single notification when only 1 subscription in group
- ✅ **AC4 (Dashboard Redirect)**: `dateFilter` state in UIStore, `setDateFilter`/`clearDateFilter` actions, date chip in SubscriptionList
- ✅ **AC5 (Sensory Urgency)**: Uses imminent vibration pattern [200, 100, 200] when payment is urgent (aligned display service interfaces)

**Test Coverage:**

- Unit tests for `markBatchAsNotified` in notification-schedule-store.test.ts
- Unit tests for `filterByDate` and updated `processSubscriptions` in subscription-list-utils.test.ts
- Unit tests for `displayGroupedNotification` in display-service.test.ts
- Dispatcher tests updated for batch logging format

## File List

### New Files

- (none)

### Modified Files

- `src/stores/notification-schedule-store.ts` - Added `markBatchAsNotified` action
- `src/stores/notification-schedule-store.test.ts` - Added tests for batch notification marking
- `src/lib/subscription-list-utils.ts` - Added `filterByDate` util, updated `processSubscriptions` with dateFilter param
- `src/lib/subscription-list-utils.test.ts` - Added tests for date filtering and combined filters
- `src/services/notification-dispatcher.ts` - Refactored with batch grouping logic, batch reliability logging
- `src/services/notification-dispatcher.test.ts` - Updated reliability log test format
- `src/lib/notification/display-service.ts` - Added `displayGroupedNotification` function with AC4 onclick handler
- `src/lib/notification/display-service.test.ts` - Added tests for grouped notification display
- `src/stores/ui-store.ts` - Added `dateFilter` state, `setDateFilter`, `clearDateFilter` actions
- `src/components/features/subscription/subscription-list.tsx` - Added date filter support, clear chip, ARIA announcement

## Change Log

- **2025-12-23**: Story 4.5 implementation completed
  - Batch notification processing implemented
  - Grouped notification display with aggregate content
  - Date filter UI integration with clear button
  - ARIA accessibility for filter announcements
  - Fixed AC2: Integrated `formatCurrency` in display service
  - Aligned display service interfaces and fixed accessibility announcements
