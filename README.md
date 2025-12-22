<div align="center">

# 💳 SubTracker

**Aboneliklerinizi Akıllıca Takip Edin**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

[Demo](#demo) • [Özellikler](#-özellikler) • [Kurulum](#-kurulum) • [Teknolojiler](#-teknolojiler)

</div>

---

## 📱 Demo

<div align="center">
  <img src="docs/assets/screenshot.png" alt="SubTracker Screenshot" width="300" />
</div>

> **Not:** Uygulama tamamen tarayıcı tabanlıdır ve verileriniz cihazınızda (localStorage) güvenle saklanır.

---

## ✨ Özellikler

### 🎯 Temel Özellikler

- **Abonelik Yönetimi** - Netflix, Spotify, YouTube ve daha fazlasını ekleyin
- **Akıllı Geri Sayım** - Bir sonraki ödemeye kalan süreyi dramatik bir şekilde görün
- **Kategori Sistemi** - Eğlence, Yazılım, Bulut ve daha fazlası
- **Harcama Özeti** - Aylık ve yıllık harcamalarınızı görüntüleyin

### 🚀 Gelişmiş Özellikler

- **Crescendo Urgency System** - Ödeme yaklaştıkça renk ve animasyon değişir
- **Timeline View** - Yaklaşan ödemelerinizi kronolojik sırada görün
- **Quick-Add Grid** - Popüler servisleri tek tıkla ekleyin
- **Özel Periyot** - Haftalık, aylık, yıllık veya özel döngüler

### 📱 Mobil-First

- **PWA Desteği** - Telefonunuza yükleyebilirsiniz
- **Responsive Design** - Her ekran boyutunda mükemmel
- **Dark/Light Mode** - Göz dostu temalar
- **Türkçe Arayüz** - Tamamen Türkçe kullanıcı deneyimi

---

## 🛠 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya pnpm

### Adımlar

```bash
# Repo'yu klonla
git clone https://github.com/yourusername/subtracker.git
cd subtracker

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda açın: `http://localhost:5173`

### Diğer Komutlar

```bash
npm run build      # Production build
npm run preview    # Build'i önizle
npm run lint       # Lint kontrolü
npm run test       # Testleri çalıştır
npm run test:ui    # Test UI'ını aç
```

---

## 🧪 Test Coverage

| Kategori        | Testler         |
| --------------- | --------------- |
| Unit Tests      | 250+            |
| Component Tests | 50+             |
| Total           | **284 passing** |

---

## 🏗 Teknolojiler

| Kategori          | Teknoloji                |
| ----------------- | ------------------------ |
| **Framework**     | React 19                 |
| **Language**      | TypeScript 5.9           |
| **Build Tool**    | Vite 7                   |
| **Styling**       | TailwindCSS 4            |
| **State**         | Zustand 5                |
| **UI Components** | Radix UI                 |
| **Icons**         | Lucide React             |
| **Date Utils**    | date-fns                 |
| **Validation**    | Zod 4                    |
| **Testing**       | Vitest + Testing Library |
| **PWA**           | vite-plugin-pwa          |

---

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── dashboard/      # Countdown Hero, Spending Summary
│   ├── features/       # Subscription, Timeline, Quick-Add
│   ├── forms/          # Form components
│   ├── layout/         # Header, BottomNav, Layout
│   └── ui/             # Base UI components (Button, Dialog, etc.)
├── lib/                # Utilities, formatters, utils
├── stores/             # Zustand stores (subscription, settings)
├── types/              # TypeScript types
└── tests/              # Test files
```

---

## 🎨 Tasarım Sistemi

- **Renk Paleti:** OKLCH tabanlı modern renk sistemi
- **Urgency Colors:** Subtle → Attention → Urgent → Critical
- **Animasyonlar:** `prefers-reduced-motion` desteği
- **Font:** Plus Jakarta Sans

---

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit'leyin (`git commit -m 'feat: add amazing feature'`)
4. Push'layın (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

<div align="center">

**SubTracker ile aboneliklerinizi kontrol altına alın! 💪**

Made with ❤️ by [Emre Kölunsağ](https://github.com/emrekolunsag)

</div>
