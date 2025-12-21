# Aktif Bağlam - SubTracker

## Mevcut Odak

**Son Güncelleme:** 2025-12-21

### Tamamlanan Epic'ler

- ✅ **Epic 1:** Project Foundation & Core Infrastructure (6 story)
- ✅ **Epic 2:** Subscription Management + Onboarding (9 story)

### Sonraki Adım

- **Epic 3:** Dashboard & Analytics başlamayı bekliyor
  - 3.1: Monthly/Yearly Spending Summary
  - 3.2: Timeline View (Upcoming Payments)
  - 3.3: Countdown Hero Widget
  - 3.4: Subscription List View
  - 3.5: Category Breakdown Visualization

---

## Son Yapılan Değişiklikler

### Epic 2 Retrospektifi (2025-12-21)

**UX Düzeltmeleri:**

1. **Renk Tutarlılığı:** CSS değişkenleri → sabit OKLCH değerler
   - `src/config/categories.ts` - Kategori renkleri
   - `src/components/features/subscription/color-picker-constants.ts` - ColorPicker renkleri
2. **Akış İyileştirmesi:** "Özel Abonelik Ekle" → `skipToForm: true` flag ile direkt form açılıyor
   - `src/stores/ui-store.ts` - interface güncellendi
   - `src/components/layout/empty-state.tsx` - skipToForm geçiriliyor
   - `src/components/features/subscription/add-subscription-dialog.tsx` - logic güncellendi
3. **İptal Butonu Fix:** skipToForm durumunda İptal butonu dialog'u kapatıyor
4. **ColorPicker Helper Text:** "Abonelik kartının vurgu rengi" eklendi

---

## Önemli Kalıplar ve Tercihler

### Renk Kullanımı (KRITIK)

```typescript
// ❌ YANLIŞ - Tema değişiminde tutarsızlık
color: "var(--color-primary)";

// ✅ DOĞRU - Her temada aynı görünüm
color: "oklch(0.65 0.2 25)";
```

### skipToForm Pattern

```typescript
// EmptyState'ten direkt forma gitmek için
openModal("addSubscription", undefined, { skipToForm: true });

// Dialog'da kontrol
if (prefillData?.skipToForm) {
  // Form view göster
  // İptal butonu dialog'u kapat (handleSuccess)
}
```

### Notification Permission Stub

- `hasSeenNotificationPrompt` flag ile tek seferlik tetikleme garantisi
- `showNotificationPermissionPrompt()` helper fonksiyonu
- iOS Safari detection için `detectIOSSafariNonStandalone()` reuse

---

## Test Durumu

- **Toplam Test:** 199 (3 skipped)
- **DoD Komutu:** `npm run lint && npm run build && npm run test -- --run`
- **Build:** Geçiyor (bundle: 1,157 KB gzip: 330 KB)

---

## Dosya Yapısı Özeti

```
src/
├── components/
│   ├── features/
│   │   ├── subscription/  # Form, Card, Dialogs, Pickers
│   │   └── quick-add/     # QuickAddGrid, QuickAddTile
│   ├── layout/            # Header, BottomNav, DashboardLayout, EmptyState
│   └── ui/                # shadcn/ui bileşenleri
├── config/
│   ├── categories.ts      # Kategori metadata (sabit OKLCH renkler)
│   └── quick-add-services.ts
├── stores/
│   ├── settings-store.ts  # Theme, notification prefs, hasSeenNotificationPrompt
│   ├── subscription-store.ts
│   └── ui-store.ts        # Modal state, prefillData, skipToForm
├── hooks/
│   └── use-ios-pwa-detection.ts
├── lib/
│   └── notification-permission.ts
└── types/
    ├── settings.ts
    ├── subscription.ts
    └── common.ts
```

---

## Bilinen Sorunlar

- Hiçbiri (tüm UX sorunları Epic 2 retrospektifinde çözüldü)

---

## Epic 3 Hazırlık Notları

Epic 3 başlamadan önce:

- `SubscriptionCard` component hazır (2.4'te oluşturuldu)
- `useSubscriptionStore` tüm CRUD işlemleri destekliyor
- `categories.get()` helper ile kategori metadata erişimi
- `formatCurrency()` utility hazır
