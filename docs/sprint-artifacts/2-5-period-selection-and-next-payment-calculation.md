# Story 2.5: Period Selection and Next Payment Calculation

Status: done

## Dev Agent Record

### Context Reference

- `src/types/subscription.ts`
- `src/stores/subscription-store.ts`
- `src/components/features/subscription/subscription-form.tsx`
- `src/components/features/subscription/utils.ts`

### Agent Model Used

Antigravity (Google DeepMind)

### Debug Log References

- None

### Completion Notes List

- Story context created - exhaustive analysis of PRD, Arch, UX and previous stories completed.
- Custom period logic aligned with `date-fns` usage patterns.
- Schema update plan defined to preserve data integrity.
- Implemented v2 schema with `customDays` and migration logic.

### File List

- `docs/sprint-artifacts/2-5-period-selection-and-next-payment-calculation.md`
- `src/types/subscription.ts`
- `src/stores/subscription-store.ts`
- `src/stores/subscription-store.test.ts`
- `src/components/features/subscription/subscription-form.tsx`
- `src/components/features/subscription/subscription-form.test.tsx`
- `src/components/features/subscription/subscription-card.tsx`
- `src/components/features/subscription/subscription-card.test.tsx`
- `src/components/features/subscription/subscription-detail-dialog.tsx`

## Story

**As a** user,
**I want** to set custom billing periods (e.g., every 45 days),
**so that** the app correctly calculates my next payment date even for non-standard subscription cycles.

## Tasks / Subtasks

- [x] 1. Data Model & Migration (AC: 5)

  - [ ] Add `customDays: z.number().int().min(1).max(365).optional()` to `SubscriptionSchema` in `src/types/subscription.ts`.
  - [ ] Update `Subscription` and `SubscriptionInput` types.
  - [ ] Increment `version` to `2` in `src/stores/subscription-store.ts`.
  - [ ] Implement migration logic: verify existing subscriptions carry over correctly.
  - [ ] Unit Test: Create a test case in `src/stores/subscription-store.test.ts` that mocks v1 state and verifies successful migration to v2 (ensuring `customDays` is handled as optional).

- [x] 2. Update SubscriptionForm UI (AC: 1, 2, 7)

  - [x] Add "custom" (Özel - Gün) option to the Period `Select` in `src/components/features/subscription/subscription-form.tsx`.
  - [x] Implement conditional rendering for the `customDays` input.
  - [x] **Input Handling:** Use explicit number conversion or `z.coerce.number()` pattern for `customDays` to ensure schema compliance.
  - [x] Ensure the field matches shadcn `Input` styling and has 44x44px touch target.
  - [x] Update defaults or initial values to support optional `customDays`.

- [x] 3. Enhance Payment Calculation Logic (AC: 3, 4)

  - [x] **Integration Only:** `calculateNextPaymentDate` in `src/components/features/subscription/utils.ts` ALREADY supports `customDays` with infinite loop protection. Do NOT rewrite this utility; only ensure the form passes the correctly parsed `customDays` value.
  - [x] Update `SubscriptionForm` implementation to pass the correct `customDays` to `calculateNextPaymentDate`.
  - [x] Update the "Bir sonraki ödeme" helper text in `SubscriptionForm` to reactively use this utility (likely already works if utility is used correctly, but needs verification).

- [x] 4. Update Display Logic (AC: 6)

  - [x] Update `src/components/features/subscription/subscription-card.tsx` to handle "custom" period display.
  - [x] Update `src/components/features/subscription/subscription-detail-dialog.tsx` to show detail format (e.g., "45 günde bir").
  - [x] Check if `SubscriptionList` or other components need specific handling for custom cycles.

- [x] 5. Unit & Integration Tests (AC: All)
  - [x] Add tests to `src/components/features/subscription/subscription-form.test.tsx` for custom period selection.
  - [x] Test edge cases: 1 day, 365 days, empty custom days (should default to 30), invalid input (strings, decimals).
  - [x] Test past date calculation with custom days (e.g., start 2 months ago with 45 days period).

## Acceptance Criteria

1. **Given** the "Ekle" veya "Düzenle" formu açık
   **When** kullanıcı "Periyot" (Billing Cycle) seçeneğine tıklar
   **Then** standart seçeneklerin (Haftalık, Aylık, Yıllık) yanı sıra "Özel (Gün)" seçeneği görünür.

2. **Given** "Özel (Gün)" seçeneği seçildiğinde
   **When** form güncellenir
   **Then** "Gün Sayısı" (Custom Days) adında yeni bir sayısal input alanı belirir
   **And** bu alan varsayılan olarak `30` değerini alır
   **And** minimum değer `1`, maksimum değer `365` olarak sınırlandırılır (Zod validation).

3. **Given** kullanıcı "Özel (Gün)" ve bir gün sayısı (örn: 45) girdiğinde
   **When** "İlk Ödeme Tarihi" seçildiğinde
   **Then** sistem `45` günlük periyotlarla bir sonraki ödeme tarihini (nextPaymentDate) otomatik olarak ileriye dönük hesaplar
   **And** kullanıcıya "Bir sonraki ödeme: [Tarih]" şeklinde yardımcı metin gösterilir.

4. **Given** "İlk Ödeme Tarihi" geçmiş bir tarih olduğunda
   **When** periyot "Özel (Gün)" olarak seçilirse
   **Then** sistem periyotları ekleyerek bugünden sonraki ilk ödeme tarihini bulur (FR25).

5. **Given** form kaydedildiğinde
   **When** `customDays` değeri girilmişse
   **Then** bu değer abonelik objesiyle birlikte `customDays` property'si altında localStorage'a kaydedilir
   **And** Zod şeması bu yeni property'yi destekler.

6. **Given** abonelik detayları görüntülendiğinde
   **When** periyot "Özel" ise
   **Then** "[X] günde bir" şeklinde periyot bilgisi gösterilir (örn: "45 günde bir").

7. **Given** tüm interaktif elementler
   **When** klavye ile navigasyon yapılırsa
   **Then** "Gün Sayısı" inputuna doğal bir sırayla odaklanılır
   **And** 44x44px touch target kuralına uyulur.
