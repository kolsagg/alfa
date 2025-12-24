# İlerleme Durumu - SubTracker

## Tamamlanan İşler

### Epic 1: Project Foundation ✅

### Epic 2: Subscription Management ✅

### Epic 3: Dashboard & Analytics ✅

- [x] 3.1 Spending Summary
- [x] 3.2 Timeline View
- [x] 3.3 Countdown Hero Widget
- [x] 3.4 Subscription List View
- [x] 3.5 Category Breakdown

### Epic 4: Notification System ✅

- [x] 4.1 Permission Flow
- [x] 4.2 Permission Stub
- [x] 4.3 Scheduling Logic
- [x] 4.4 Display & Dispatching
- [x] 4.5 Grouped Notifications
- [x] 4.6 iOS PWA Install Prompt logic
- [x] 4.7 Graceful Degradation
- [x] 4.8 Missed Notifications Recovery
- [x] Epic 4 Retrospective

### Epic 8: Navigation & Settings (Devam Ediyor)

- [x] 8.1 React Router Setup
- [x] 8.2 Settings Page Layout & Route
- [x] 8.3 BottomNav Integration
- [x] 8.4 Theme Section

---

## Mevcut Durum

**Son Güncelleme:** 2025-12-24

| Metrik          | Değer           |
| --------------- | --------------- |
| Tamamlanan Epic | 4/8             |
| Test Durumu     | ✅ %100 Geçiyor |
| Build Durumu    | ✅ Geçiyor      |

---

## Karar Geçmişi

### Epic 8 Mimari Kararları (2025-12-23)

1. **React Router v7:** En son router versiyonu kullanıldı.
2. **Hash Router:** PWA uyumluluğu için path routing yerine hash routing seçildi.
3. **Dynamic Versioning:** `package.json`'daki versiyon bilgisi Global variable olarak Vite'tan çekildi.

### Epic 4 Adversarial Review Kararları (2025-12-24)

1. **Periodic Recovery:** `runRecovery` 60s aralıklarla foreground'da çalışacak şekilde lifecycle'a eklendi.
2. **Mount Optimization:** Store senkronizasyonu ile recovery arasındaki race condition testlerle kontrol altına alındı.
3. **Zod Datetime:** `lastNotificationCheck` için strict datetime validation eklendi.
