# Sistem Kalıpları (System Patterns) - SubTracker

## Mimari Yaklaşım

SubTracker, **Client-Side Only PWA** mimarisini kullanır. Sunucu bağımlılığı yoktur, tüm veriler `localStorage` (Zustand persist) üzerinde tutulur.

## Katmanlı Yapı

- **Layouts (`src/components/layout`)**: Uygulama şablonu, header, navigasyon ve root layout.
- **Features (`src/components/features`)**: Abonelik formu, liste, bildirim ayarları gibi domain-specific bileşenler.
- **Stores (`src/stores`)**: Zustand ile yönetilen global state (Subscription, Settings, UI, NotificationSchedule).
- **Services (`src/services`)**: Business logic (Bildirim dispatcher, scheduling).
- **Hooks (`src/hooks`)**: Paylaşılan mantık (Lifecycle, PWA detection, imminent payments).
- **Router (`src/router`)**: React Router v7 ile sayfa yönetimi ve lazy loading.

## Kritik Tasarım Desenleri

### 1. Notification Lifecycle Pattern

Uygulama açıldığında ve görünürlük değiştiğinde (`visibilitychange`) çalışan bir döngü:

1. `runRecovery()`: Kaçırılan bildirimleri kontrol et ve toast göster.
2. `checkAndDispatchNotifications()`: Gelecek bildirimleri tetikle.
3. `syncNotificationPermissions()`: Sistem izinlerini store ile eşitle.

### 2. Multi-Date Filtering logic

`SubscriptionList` bileşeni, birden fazla tarihe göre filtreleme desteği sunar (virgülle ayrılmış string formatında `ui-store` üzerinden).

### 3. Graceful Degradation (Kademeli Azalma)

Bildirim izinleri reddedildiyse veya desteklenmiyorsa:

- `ImminentPaymentsBadge` gösterilir.
- `CountdownHero` üzerindeki uyarı ikonları değişir.
- Kullanıcıya bilgi verilir (iOS PWA guidance veya Toast).

### 4. skipToForm Pattern

`EmptyState` gibi alanlardan kullanıcıyı direkt aksiyona (Örn: Manuel form) yönlendirmek için `prefillData` içindeki flagleri kullanır.

## Veri Akışı

- Kullanıcı İşlemi → Store Action → LocalStorage Update → React Hook Trigger → UI Re-render.
- Background Process (Service Worker) → Web Push (Gelecek plan).
