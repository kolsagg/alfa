# Aktif Bağlam - SubTracker

## Mevcut Odak

**Son Güncelleme:** 2025-12-24

### Tamamlanan Epic'ler

- ✅ **Epic 1:** Project Foundation & Core Infrastructure
- ✅ **Epic 2:** Subscription Management + Onboarding
- ✅ **Epic 3:** Dashboard & Analytics (Summary, Timeline, CountdownHero, SubscriptionList)
- ✅ **Epic 4:** Notification System (Scheduling, Grouping, iOS PWA, Recovery)

### Mevcut Çalışma (Epic 8: Navigation & Settings)

- ✅ **8.1:** React Router Setup (v7, HashRouter)
- ✅ **8.2:** Settings Page Layout (View, Notifications, Data, About)
- ✅ **8.3:** BottomNav Route Integration
- ✅ **8.4:** Settings Theme Section (Segmented Control, i18n, System Indicator)

---

## Son Yapılan Değişiklikler

### Story 4.8: Missed Notifications Recovery (Tamamlandı)

- `useMissedNotificationsRecovery` hook'u eklendi.
- Uygulama açıkken (periodic) veya açıldığında (mount) kaçırılan bildirimlerin tespiti ve gösterimi sağlandı.
- Geçmişte kalan (stale) ödemelerin temizlenmesi mantığı entegre edildi.
- `useNotificationLifecycle` hook'u ile tüm bildirim döngüsü RootLayout'a bağlandı.

### Epic 8 Navigasyon Altyapısı (Tamamlandı)

- React Router v7 kurulumu yapıldı.
- `RootLayout` oluşturuldu ve paylaşılan bileşenler (Header, BottomNav, Notifications) buraya taşındı.
- Settings sayfası placeholder olmaktan çıkarıldı ve gerçek bileşenlerle (Theme, Notifications) donatıldı.
- `ThemeSelector` bileşeni (Segmented Control) implement edildi ve i18n altyapısına bağlandı.
- Vite üzerinden uygulama versiyonu (`__APP_VERSION__`) dinamik olarak çekildi.

---

## Önemli Kalıplar ve Tercihler

### 1. Foreground Recovery Pattern (Story 4.8)

Bildirimlerin sadece uygulama açıldığında değil, her 60 saniyede bir (foreground'da kalsa bile) kontrol edilmesi garantilendi. Bu, tarayıcının timer'ları kısması durumunda bile veri bütünlüğünü korur.

### 2. Router-First Layout (Epic 8)

Artık modal bazlı navigasyon yerine URL bazlı navigasyona geçildi. `Header` ve `BottomNav`, URL'e göre aktiflik durumlarını günceller.

---

## Test Durumu

- **Toplam Test:** Tüm testler geçiyor (Epic 4 ve Epic 8 testleri dahil).
- **Kritik Testler:** `router.test.tsx`, `use-notification-lifecycle.test.tsx`, `use-missed-notifications-recovery.test.tsx`.

---

## Bilinen Sorunlar

- Hiçbiri (Son adversarial review ile 4.8'deki race condition ve interval sorunları giderildi).

---

## Sonraki Adımlar

1. **8.5 Settings Notification Section:** Bildirim ayarlarının detaylandırılması.
2. **Epic 5 (Data Management):** Veri yedekleme özelliklerine giriş.
