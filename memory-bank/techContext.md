# Teknik Bağlam (Tech Context) - SubTracker

## Teknolojiler

- **Frontend Framework:** React 18+
- **Build Tool:** Vite
- **Styling:** Vanilla CSS (Modern CSS özellikleri: Layers, OKLCH, Container Queries)
- **State Management:** Zustand (v5 patterns, persist middleware)
- **Routing:** React Router v7 (HashRouter for PWA compatibility)
- **Time Manipulation:** date-fns
- **UI Components:** Radix UI primitives + Custom styled components
- **Testing:** Vitest + React Testing Library
- **Icons:** Lucide React
- **Notifications/Toasts:** Sonner

## Geliştirme Ortamı

- **OS:** macOS
- **Node Version:** Latest LTS recommended
- **PackageManager:** npm
- **Linting:** ESLint with TypeScript focus
- **Build Command:** `npm run build`
- **Test Command:** `npm run test`

## Teknik Kısıtlamalar ve Kararlar

- **Hash Routing:** PWA'ların farklı platformlarda (özellikle iOS manifest) sorun yaşamaması için `createHashRouter` tercih edildi.
- **Client-Side Persistence:** Veriler tamamen tarayıcıda tutulur (No Backend).
- **OKLCH Colors:** Renk sistemi, daha geniş gam ve doğal parlaklık kontrolü için OKLCH formatındadır.
- **Foreground Recovery:** Tarayıcı kısıtlamaları nedeniyle bildirimler uygulama ön plandayken veya açıldığında kontrol edilir.

## Bağımlılıklar (Önemli Paketler)

- `react-router`: Sayfa navigasyonu.
- `zustand`: Global state.
- `date-fns`: Tarih işlemleri.
- `sonner`: Toast mesajları.
- `@tanstack/react-virtual`: Uzun abonelik listelerinde performans.
