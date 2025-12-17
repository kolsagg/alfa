# SubTracker — Subscription Tracking Dashboard

> **Beyin Fırtınası Tarihi:** 2025-12-16  
> **Fasilitatör:** Carson (Brainstorming Coach)  
> **Kullanıcı:** kolsag

---

## 📋 Ürün Özeti

**SubTracker**, kişisel abonelik takip dashboard'udur. Hangi karttan ne çekileceğini bilmek, yaklaşan ödemeleri görmek ve "bu neydi?" şoklarını önlemek için basit, görsel bir araç.

### Temel Problem

- Abonelikler "arka planda" kaybolup unutuluyor (iCloud+, Adobe, vb.)
- "Bu kesinti ne?" şokları yaşanıyor
- Hangi karttan ne çekiliyor takip edilemiyor
- Toplam aylık maliyet bilinmiyor

### Hedef Kullanıcı

- Şimdilik kişisel kullanım
- Gelecekte aile ve freelancer modları eklenebilir

---

## 🎯 Özellik Yol Haritası

### MVP (v0.1) — Hafta Sonu Projesi

| Özellik           | Detay                           |
| ----------------- | ------------------------------- |
| Subscription CRUD | Ekle, düzenle, sil              |
| Kart Eşleştirme   | Her subscription → 1 kart       |
| Yaklaşan Ödemeler | Sonraki 7-30 gün görünümü       |
| Toplam Maliyet    | Aylık + Yıllık hesaplama        |
| Kategoriler       | TV, Eğlence, Kod, İş tagları    |
| Periyot Desteği   | Aylık / Yıllık / Özel           |
| Countdown Hero    | En yakın ödeme büyük gösterimde |
| Basit Bildirim    | Browser Notification API        |

### v0.2 — Nice to Have

| Özellik            | Detay                         |
| ------------------ | ----------------------------- |
| Kullanım Takibi    | Manuel "son kullandım" butonu |
| Zombie Dedektör    | 30+ gün kullanılmayan = uyarı |
| Alternatif Önerisi | "Netflix yerine şunu dene"    |
| İptal Linki        | Quick action                  |
| ROI Hesaplama      | ₺/kullanım oranı              |

### v1.0+ — Hayal

| Özellik            | Detay                                         |
| ------------------ | --------------------------------------------- |
| Aile Modu          | Paylaşılan subscriptionlar, kişi başı maliyet |
| Freelancer Modu    | İş gideri tagleme, rapor export               |
| Banka Entegrasyonu | Otomatik tespit (çok ileride)                 |

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────┐
│  📦 SUBTRACKER — Tech Stack                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ⚛️  Framework:    React 18 + Vite                  │
│  🎨  Styling:      TailwindCSS v4                   │
│  🧩  Components:   shadcn/ui                        │
│  💾  Storage:      localStorage + JSON              │
│  📅  Dates:        date-fns                         │
│  🎭  Icons:        Lucide React                     │
│  🔔  Notif:        Browser Notification API         │
│  🚀  Deploy:       Vercel / Netlify (free)          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### shadcn/ui Componentleri

- Card, Button, Dialog, Input, Select
- Badge, Tabs, Collapsible, Progress
- Separator, Tooltip, DropdownMenu
- Calendar, Switch, Toast/Sonner

---

## 🎨 UI/UX Design Spec

### Tema

- **Primary:** Light + Minimal (Apple-esque)
- **Dark Mode:** System Follow (CSS variables ile)
- **Accent:** Emerald (#10b981)

### Typography

| Rol             | Font           |
| --------------- | -------------- |
| Display/Hero    | Outfit         |
| Body            | DM Sans        |
| Mono (rakamlar) | JetBrains Mono |

```css
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@500&display=swap");
```

### Color Palette

```css
:root {
  /* Light Mode */
  --bg-primary: #f8fafb;
  --bg-secondary: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;

  /* Emerald Accent */
  --accent-primary: #10b981;
  --accent-secondary: #059669;

  /* Status Colors */
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #22c55e;

  /* Card Colors (banks) */
  --card-garanti: #1e3a5f;
  --card-yapikredi: #004990;
  --card-qnb: #6b21a8;
  --card-akbank: #e31e24;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0a0f1a;
    --bg-secondary: #111827;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
  }
}
```

### Layout

- **Structure:** Sidebar + Content
- **Sidebar:** Navigation icons (Home, Subscriptions, Cards, Settings)
- **Hero:** Countdown widget (en yakın ödeme)
- **Stats:** Kart bazlı toplam özet
- **List:** Kompakt satırlar → click ile expand

### Subscription Card Style

- Kompakt liste görünümü (default)
- Click/tap ile genişleme
- Genişletilmiş görünümde: kategori, iptal linki, düzenle/sil butonları

---

## 📐 Sayfa Yapısı

```
┌─────────────────────────────────────────────────────┐
│  📊 ANA SAYFA (Dashboard)                           │
├─────────────────────────────────────────────────────┤
│  ⏰ Hero Countdown: En yakın ödeme                   │
│  💳 Kart Özet Kartları: Banka başına toplam         │
│  📋 Yaklaşan Ödemeler Listesi (kısa)                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📦 ABONELİKLER                                     │
├─────────────────────────────────────────────────────┤
│  🏷️ Filtreler: Kategori, Kart, Periyot              │
│  📋 Tüm Abonelik Listesi (expandable)               │
│  ➕ Yeni Abonelik Ekle butonu                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📊 KULLANIM (v0.2)                                 │
├─────────────────────────────────────────────────────┤
│  • Son kullanım tarihi                              │
│  • Kullanım sıklığı                                 │
│  • ROI skoru (₺/kullanım)                          │
│  • Zombie Alert sistemi                             │
└─────────────────────────────────────────────────────┘
```

---

## 💾 Data Model

```typescript
interface Subscription {
  id: string;
  name: string;
  logo?: string; // Emoji veya URL
  amount: number; // TL cinsinden
  currency: "TRY";
  billingCycle: "monthly" | "yearly" | "custom";
  billingDay: number; // Ayın kaçında
  customDays?: number; // Custom cycle için gün sayısı
  nextBillingDate: Date;
  card: Card;
  category: Category;
  cancelUrl?: string;
  notes?: string;
  lastUsed?: Date; // v0.2 için
  createdAt: Date;
  updatedAt: Date;
}

interface Card {
  id: string;
  name: string; // "Garanti BONUS"
  lastFourDigits?: string;
  color: string; // UI için renk kodu
  bank: string; // Banka adı
}

type Category = "tv" | "entertainment" | "code" | "work" | "other";

interface Settings {
  theme: "light" | "dark" | "system";
  notificationDays: number; // Kaç gün önce uyar
  currency: "TRY";
}

interface AppState {
  subscriptions: Subscription[];
  cards: Card[];
  settings: Settings;
  version: number; // Migration için
}
```

---

## 📁 Proje Yapısı

```
subtracker/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── dashboard/
│   │   │   ├── CountdownHero.tsx
│   │   │   ├── CardSummary.tsx
│   │   │   └── UpcomingPayments.tsx
│   │   ├── subscriptions/
│   │   │   ├── SubscriptionList.tsx
│   │   │   ├── SubscriptionItem.tsx
│   │   │   ├── SubscriptionDialog.tsx
│   │   │   └── SubscriptionBadge.tsx
│   │   └── shared/
│   │       ├── ThemeToggle.tsx
│   │       └── EmptyState.tsx
│   ├── hooks/
│   │   ├── useSubscriptions.ts
│   │   ├── useCards.ts
│   │   ├── useLocalStorage.ts
│   │   └── useTheme.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── storage.ts
│   │   └── calculations.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── components.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## ⚡ Setup Komutları

```bash
# 1. Proje oluştur
npm create vite@latest subtracker -- --template react-ts
cd subtracker

# 2. Tailwind kur
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. shadcn/ui init
npx shadcn@latest init

# 4. Componentleri ekle
npx shadcn@latest add button card dialog input select badge collapsible progress tabs separator tooltip dropdown-menu calendar switch

# 5. Ek kütüphaneler
npm install date-fns sonner

# 6. Çalıştır
npm run dev
```

---

## 📋 MVP Checklist

- [ ] Vite + React + TypeScript setup
- [ ] Tailwind + shadcn/ui config
- [ ] TypeScript types tanımla
- [ ] localStorage hook
- [ ] Subscription CRUD
- [ ] Card yönetimi
- [ ] Dashboard ana sayfa
- [ ] Countdown hero widget
- [ ] Kart bazlı filtre
- [ ] Kategori tagleri
- [ ] JSON export/import
- [ ] Responsive design
- [ ] Theme toggle (system follow)
- [ ] Browser notifications
- [ ] Deploy to Vercel

---

## 🎯 Beyin Fırtınası Teknikleri Kullanıldı

1. **Role Playing** — 3 farklı perspektiften analiz (Para Kaybeden, Organize, Sinirli Ben)
2. **SCAMPER** — Sistematik özellik keşfi
3. **Resource Constraints** — MVP scope belirleme

---

## 📝 Notlar

- Para birimi: TL (₺)
- Dijital + fiziksel subscriptionlar desteklenir
- Şimdilik backend yok, pure frontend
- Gelecekte multi-device sync için Supabase eklenebilir

---

_Bu döküman SubTracker projesi için temel referans görevi görmektedir._
