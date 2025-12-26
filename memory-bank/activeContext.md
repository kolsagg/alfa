# Aktif Bağlam - SubTracker

## Mevcut Odak

**Son Güncelleme:** 2025-12-24

### Tamamlanan Epic'ler

- ✅ **Epic 1:** Project Foundation & Core Infrastructure
- ✅ **Epic 2:** Subscription Management + Onboarding
- ✅ **Epic 3:** Dashboard & Analytics (Summary, Timeline, CountdownHero, SubscriptionList)
- ✅ **Epic 4:** Notification System (Scheduling, Grouping, iOS PWA, Recovery)

### Mevcut Çalışma (UI/UX İyileştirmeleri & Hata Düzeltmeleri)

- ✅ **Icon Picker Refactor:** Select yerine Popover+Grid, arama/filtreleme altyapısı (hazırlık), gelişmiş kategori ikonları.
- ✅ **Countdown Hero Polish:** Dolar işaretinin sabitlenmesi, döviz kuru entegrasyonu, tasarım sadeleştirmesi (ikon -> harf revert).
- ✅ **Localization:** Tarih seçici ve ikon isimlerinin Türkçeleştirilmesi.
- ✅ **Card Visual Fixes:** Abonelik kartlarında layout taşmalarının giderilmesi.

---

## Son Yapılan Değişiklikler

### UI/UX Polish (2025-12-26)

- **Subscription Card:** Layout "wrap" yapısına geri döndürüldü. Varsayılan kredi kartı ikonu sorunu, ikon tipi kontrolü gevşetilerek çözüldü.
- **Countdown Widget:** Toplam tutar alanı `useFXStore` kullanılarak döviz kurlarıyla TL'ye çevrildi. "Bugün" ve "Yaklaşan" görünümleri sadeleştirildi (harf avatarları).
- **Icon Picker:** `Popover` ve Grid yapısına geçildi. İkon isimleri kategori yerine şekil bazlı (Kutu, Çanta vb.) olarak Türkçeleştirildi.
- **Localization:** `SubscriptionForm` içindeki takvim bileşenine `tr` locale eklendi.

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
