# SubTracker - Abonelik Takip PWA

**Proje Tipi:** Greenfield PWA  
**Durum:** Aktif Geliştirme (Epic 1 - Story 1.1 Tamamlandı)  
**Başlangıç:** 2025-12-16  
**Son Güncelleme:** 2025-12-17

## Proje Özeti

SubTracker, kullanıcıların dijital aboneliklerini (Netflix, Spotify, vb.) tek bir yerde yönetmelerine, harcamalarını takip etmelerine ve ödeme tarihlerini hatırlamalarına yardımcı olan bir PWA (Progressive Web App) uygulamasıdır.

## Temel Gereksinimler

### Fonksiyonel Özellikler

1. **Abonelik Yönetimi** - Abonelik ekleme, düzenleme, silme, kategorizasyon
2. **Maliyet Takibi** - Aylık/yıllık toplam hesaplama, döviz desteği (TRY, USD, EUR)
3. **Bildirimler** - Web push notifications ile ödeme hatırlatıcıları
4. **Veri Yönetimi** - localStorage tabanlı, export/import, yedekleme
5. **PWA Özellikleri** - Offline çalışma, iOS/Android kurulabilir

### Teknik Kısıtlar

- **Veri Depolama:** Sadece localStorage (backend yok)
- **Offline-First:** Service worker ile tam offline destek
- **Platform:** iOS Safari ve modern browserlar
- **Framework:** React 19 + Vite 7 + Zustand

## Aktif Kararlar

### Epic 1: Foundation & Core Infrastructure

- ✅ Story 1.1: Zustand Store Infrastructure - **TAMAMLANDI**
- ⏳ Story 1.2: PWA Manifest & Service Worker - Backlog
- ⏳ Story 1.3: Theme System - Backlog
- ⏳ Story 1.4: iOS PWA Detection - Backlog

### Teknoloji Stack

- **Frontend:** React 19.0.0, TypeScript
- **Build:** Vite 7.0.5
- **State:** Zustand 5.0.9 (persist + devtools + validation)
- **UI:** shadcn/ui + Tailwind CSS v4
- **Validation:** Zod 3.24.1
- **Testing:** Vitest 4.0.16 + Testing Library
- **PWA:** vite-plugin-pwa (sonraki story)

## Mimari Kararlar

### State Management Pattern

- **Store Factory:** Merkezi `createStore` factory ile tüm store'lar oluşturuluyor
- **Persistence:** Zustand persist middleware, environment-aware naming (`subtracker-{domain}-dev`)
- **Validation:** Zod ile rehydration sırasında veri doğrulama
- **Migration:** Schema versioning desteği (v1 şu anda)

### Dizin Yapısı

```
src/
├── stores/          # Zustand store'lar (settings, ui)
├── types/           # Zod şemaları ve TypeScript tipleri
├── hooks/           # Custom React hooks
├── components/      # React bileşenleri
│   └── ui/         # shadcn (READ-ONLY)
└── tests/          # Test setup
```

### Kod Standartları

- **Dosya Adlandırma:** kebab-case (`settings-store.ts`)
- **Hook Prefix:** `use` (`useSettingsStore`)
- **Test Co-location:** Store testleri store dosyasının yanında
- **Type Safety:** Strict TypeScript, no `any` (Zod'dan türetilen tipler)

## Önemli Pattern'ler

### Store Creation Pattern

```typescript
// Tüm store'lar createStore factory kullanır
export const useMyStore = createStore<MyState>(
  (set) => ({
    /* state + actions */
  }),
  {
    name: "MyStore",
    version: 1,
    partialize, // selective persistence
    migrate, // version migration
    onRehydrateStorage, // validation
  }
);
```

### Environment-Aware Storage

- Dev: `subtracker-settings-dev`
- Prod: `subtracker-settings`
- DevTools: Sadece development'ta aktif

## Devam Eden Sorunlar

Yok - Story 1.1 code review'den geçti, tüm HIGH/MEDIUM issues düzeltildi.

## Sonraki Adımlar

1. **Story 1.2:** PWA Manifest + Service Worker kurulumu
2. **Story 1.3:** Tema sistemi implementasyonu (dark/light/system)
3. **Epic 2:** Subscription management slice
