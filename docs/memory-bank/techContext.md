# Teknoloji Bağlamı

## Çekirdek Stack

- **Framework:** React 19 (RC/Latest)
- **Build Tool:** Vite 7
- **Language:** TypeScript 5.7+
- **Styling:** Tailwind CSS 4.0 (Beta/Latest) + PostCSS
- **State Management:** Zustand (ile `persist` middleware)
- **Validation:** Zod
- **Date Library:** date-fns

## UI Kütüphanesi

- **Base:** Shadcn/UI (Radix Primitives üzerine kurulu)
- **Icons:** Lucide React
- **Toast:** Sonner
- **Gestures:** (Henüz eklenmedi, gerekirse `use-gesture`)

## Test Stack

- **Unit:** Vitest
- **Environment:** jsdom
- **Tools:** @testing-library/react, @testing-library/user-event

## Altyapı

- **Hosting:** Static Hosting (Vercel/Netlify uyumlu)
- **Database:** Yok (LocalStorage IDB wrapper şimdilik yok, direkt LocalStorage string)
- **PWA:** vite-plugin-pwa (Offline support, manifest gen)

## Kısıtlamalar

- **LocalStorage Limiti:** Genellikle 5MB. Resim saklanmaz, sadece text verisi.
- **Browser Uyumluluğu:** Modern tarayıcılar (ESModules desteği şart).
